import { writeFile, rename, mkdir, constants, access } from 'fs/promises';
import { tmpdir } from 'os';
import { join, dirname, extname } from 'path';
import { randomBytes } from 'crypto';

let _baseDir: string | null = null;

export function setAtomicBaseDir(dir: string): void {
  _baseDir = dir;
}

function getBaseDir(): string {
  return _baseDir || tmpdir();
}

export async function atomicWriteJson(filePath: string, data: unknown): Promise<void> {
  const tmp = join(getBaseDir(), `.tmp-${randomBytes(6).toString('hex')}-${Date.now()}.json`);
  const dir = dirname(filePath);
  await mkdir(dir, { recursive: true });
  await writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8');
  await rename(tmp, filePath);
}

export async function atomicWriteText(filePath: string, data: string): Promise<void> {
  const ext = extname(filePath) || '.txt';
  const tmp = join(getBaseDir(), `.tmp-${randomBytes(6).toString('hex')}-${Date.now()}${ext}`);
  const dir = dirname(filePath);
  await mkdir(dir, { recursive: true });
  await writeFile(tmp, data, 'utf-8');
  await rename(tmp, filePath);
}

export async function atomicWriteBuffer(filePath: string, data: Buffer): Promise<void> {
  const ext = extname(filePath) || '.bin';
  const tmp = join(getBaseDir(), `.tmp-${randomBytes(6).toString('hex')}-${Date.now()}${ext}`);
  const dir = dirname(filePath);
  await mkdir(dir, { recursive: true });
  await writeFile(tmp, data);
  await rename(tmp, filePath);
}

export async function safeReadJson<T = any>(filePath: string, fallback: T): Promise<T> {
  try {
    await access(filePath, constants.R_OK);
    const { readFile } = await import('fs/promises');
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
