import { logger } from './_logger.js';
import { eventBus } from './_event-bus.js';
import { atomicWriteJson, safeReadJson } from './_atomic-io.js';
import { join } from 'path';
import { randomBytes } from 'crypto';

export type TaskStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
export type TaskSchedule = { type: 'cron'; expression: string } | { type: 'once'; at: Date } | { type: 'interval'; seconds: number } | { type: 'event'; eventType: string };

export interface ScheduledTask {
  id: string;
  name: string;
  description?: string;
  schedule: TaskSchedule;
  action: string;
  params: Record<string, unknown>;
  status: TaskStatus;
  lastRun?: Date;
  nextRun?: Date;
  runCount: number;
  maxRuns?: number;
  enabled: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskRun {
  id: string;
  taskId: string;
  status: TaskStatus;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  result?: unknown;
  error?: string;
}

const tasks = new Map<string, ScheduledTask>();
const runHistory: TaskRun[] = [];
const MAX_RUN_HISTORY = 500;
let cronInterval: ReturnType<typeof setInterval> | null = null;
let lastSecondCheck = 0;

function generateId(): string {
  return `task-${Date.now()}-${randomBytes(4).toString('hex')}`;
}

const cronHandlers: Record<string, (params: Record<string, unknown>) => Promise<unknown>> = {};

export function registerCronAction(name: string, handler: (params: Record<string, unknown>) => Promise<unknown>): void {
  cronHandlers[name] = handler;
  logger.info({ action: name }, 'scheduler: registered cron action');
}

function _scheduleTask(input: Omit<ScheduledTask, 'id' | 'status' | 'runCount' | 'createdAt' | 'updatedAt' | 'nextRun'>): ScheduledTask {
  const task: ScheduledTask = {
    ...input,
    id: generateId(),
    status: 'pending',
    runCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    nextRun: computeNextRun(input.schedule),
  };
  tasks.set(task.id, task);
  eventBus.emit('task.scheduled', 'scheduler', { taskId: task.id, name: task.name, schedule: task.schedule });
  logger.info({ taskId: task.id, name: task.name }, 'scheduler: task scheduled');
  return task;
}

export function scheduleTask(input: Omit<ScheduledTask, 'id' | 'status' | 'runCount' | 'createdAt' | 'updatedAt' | 'nextRun'>): ScheduledTask {
  const task = _scheduleTask(input);
  subscribeTaskToEvent(task);
  return task;
}

function _cancelTask(id: string): boolean {
  const task = tasks.get(id);
  if (!task) return false;
  task.status = 'cancelled';
  task.enabled = false;
  task.updatedAt = new Date();
  eventBus.emit('task.cancelled', 'scheduler', { taskId: id });
  return true;
}

export function cancelTask(id: string): boolean {
  unsubscribeTaskFromEvent(id);
  return _cancelTask(id);
}

export function getTask(id: string): ScheduledTask | undefined {
  return tasks.get(id);
}

export function listTasks(): ScheduledTask[] {
  return Array.from(tasks.values());
}

export function getRuns(taskId?: string, limit = 50): TaskRun[] {
  const filtered = taskId ? runHistory.filter((r) => r.taskId === taskId) : runHistory;
  return filtered.slice(-limit).reverse();
}

function computeNextRun(schedule: TaskSchedule): Date | undefined {
  if (schedule.type === 'once') {
    return schedule.at > new Date() ? schedule.at : undefined;
  }
  if (schedule.type === 'interval') {
    return new Date(Date.now() + schedule.seconds * 1000);
  }
  if (schedule.type === 'cron') {
    return parseCronNext(schedule.expression);
  }
  return undefined;
}

function parseCronNext(expression: string): Date | undefined {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return undefined;
  const [min, hour, dom, mon, dow] = parts;
  const now = new Date();
  for (let m = 0; m < 60 * 24 * 31 * 2; m++) {
    const candidate = new Date(now.getTime() + m * 60 * 1000);
    if (matchesCronField(min, candidate.getMinutes(), 0, 59) &&
        matchesCronField(hour, candidate.getHours(), 0, 23) &&
        matchesCronField(dom, candidate.getDate(), 1, 31) &&
        matchesCronField(mon, candidate.getMonth() + 1, 1, 12) &&
        matchesCronField(dow, candidate.getDay(), 0, 6)) {
      return candidate;
    }
  }
  return undefined;
}

function matchesCronField(pattern: string, value: number, min: number, max: number): boolean {
  if (pattern === '*') return true;
  for (const part of pattern.split(',')) {
    if (part.includes('/')) {
      const [range, step] = part.split('/');
      const stepNum = parseInt(step, 10);
      if (range === '*') { if (value % stepNum === 0) return true; }
      else {
        const [rmin, rmax] = range.split('-').map(Number);
        if (value >= rmin && value <= rmax && (value - rmin) % stepNum === 0) return true;
      }
    } else if (part.includes('-')) {
      const [rmin, rmax] = part.split('-').map(Number);
      if (value >= rmin && value <= rmax) return true;
    } else if (parseInt(part, 10) === value) return true;
  }
  return false;
}

async function executeTask(task: ScheduledTask): Promise<void> {
  const handler = cronHandlers[task.action];
  if (!handler) {
    logger.error({ taskId: task.id, action: task.action }, 'scheduler: no handler registered');
    return;
  }

  const run: TaskRun = {
    id: generateId(),
    taskId: task.id,
    status: 'running',
    startedAt: new Date(),
  };
  runHistory.push(run);
  if (runHistory.length > MAX_RUN_HISTORY) runHistory.shift();

  task.status = 'running';
  task.lastRun = new Date();
  task.runCount += 1;

  const t0 = Date.now();
  try {
    const result = await handler(task.params);
    run.status = 'success';
    run.completedAt = new Date();
    run.durationMs = Date.now() - t0;
    run.result = result;
    task.status = 'success';
    eventBus.emit('task.completed', 'scheduler', { taskId: task.id, name: task.name, durationMs: run.durationMs });
  } catch (err: any) {
    run.status = 'failed';
    run.completedAt = new Date();
    run.durationMs = Date.now() - t0;
    run.error = err.message?.slice(0, 500) || String(err);
    task.status = 'failed';
    eventBus.emit('task.failed', 'scheduler', { taskId: task.id, name: task.name, error: run.error });
    logger.error({ taskId: task.id, error: run.error }, 'scheduler: task failed');
  }

  task.updatedAt = new Date();

  if (task.enabled && (!task.maxRuns || task.runCount < task.maxRuns)) {
    task.nextRun = computeNextRun(task.schedule);
    task.status = 'pending';
  } else {
    task.nextRun = undefined;
  }
}

function tick(): void {
  const now = Date.now();
  if (now - lastSecondCheck < 1000) return;
  lastSecondCheck = now;

  for (const task of tasks.values()) {
    if (!task.enabled || task.status === 'running' || task.status === 'cancelled') continue;
    if (task.nextRun && task.nextRun.getTime() <= now) {
      if (task.maxRuns && task.runCount >= task.maxRuns) {
        task.enabled = false;
        continue;
      }
      executeTask(task).catch((err) => logger.error({ err, taskId: task.id }, 'scheduler: execute error'));
    }
  }
}

export function startScheduler(intervalMs = 1000): void {
  if (cronInterval) return;
  cronInterval = setInterval(tick, intervalMs);
  logger.info({ intervalMs }, 'scheduler: started');
}

export function stopScheduler(): void {
  if (cronInterval) {
    clearInterval(cronInterval);
    cronInterval = null;
  }
  logger.info('scheduler: stopped');
}

/**
 * Event-triggered task subscriptions — one listener per event-type task
 * instead of a wildcard handler that could be exploited.
 */
const eventUnsubscribers = new Map<string, () => void>();

function subscribeTaskToEvent(task: ScheduledTask): void {
  if (task.schedule.type !== 'event') return;
  const eventType = task.schedule.eventType;
  if (eventUnsubscribers.has(task.id)) return;

  const unsub = eventBus.on(eventType, (event) => {
    const current = tasks.get(task.id);
    if (!current || !current.enabled || current.status === 'running') return;
    executeTask(current).catch((err) => logger.error({ err, taskId: task.id }, 'scheduler: event-triggered execute error'));
  });
  eventUnsubscribers.set(task.id, unsub);
}

export function unsubscribeTaskFromEvent(taskId: string): void {
  const unsub = eventUnsubscribers.get(taskId);
  if (unsub) {
    unsub();
    eventUnsubscribers.delete(taskId);
  }
}


