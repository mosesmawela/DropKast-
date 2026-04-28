import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useTheme } from './ThemeContext';

export interface TutorialStep {
  /** CSS selector or `data-tour` attribute value to spotlight */
  target: string;
  title: string;
  body: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const ARTIST_TOUR: TutorialStep[] = [
  {
    target: 'data-tour="sidebar-logo"',
    title: 'Welcome to DropKast',
    body: "Quick tour to show you the ropes. You can skip anytime — re-enable from Settings.",
    placement: 'right',
  },
  {
    target: 'data-tour="new-release"',
    title: 'New Release',
    body: 'Upload audio + artwork, mint ISRC/UPC, and queue for distribution. Start a campaign right after.',
    placement: 'right',
  },
  {
    target: 'data-tour="nav-campaigns"',
    title: 'Campaigns',
    body: 'AI-generated rollout plans, influencer matching, real performance numbers.',
    placement: 'right',
  },
  {
    target: 'data-tour="nav-anr"',
    title: 'A&R Feedback',
    body: 'Submit a track for a no-BS critique from Claude — score, hooks, positioning, and what to fix.',
    placement: 'right',
  },
  {
    target: 'data-tour="ai-assistant"',
    title: 'AI Assistant',
    body: "Chat with Claude. It has live access to your releases, analytics, and roster — ask anything.",
    placement: 'left',
  },
  {
    target: 'data-tour="navbar-bell"',
    title: 'Notifications',
    body: 'Alerts when releases go live, influencers post, or DJs ship feedback. Click the bell to read.',
    placement: 'bottom',
  },
];

const INFLUENCER_TOUR: TutorialStep[] = [
  {
    target: 'data-tour="sidebar-logo"',
    title: 'Welcome, Creator',
    body: 'Quick tour of the Creator Relay. Skip anytime — re-enable from Settings.',
    placement: 'right',
  },
  {
    target: 'data-tour="nav-missions"',
    title: 'Missions',
    body: 'Paid campaign missions matched to your audience. Accept, post, and verify your post URL to get paid.',
    placement: 'right',
  },
  {
    target: 'data-tour="nav-earnings"',
    title: 'Earnings',
    body: 'Track everything you have earned and request payouts.',
    placement: 'right',
  },
];

const DJ_TOUR: TutorialStep[] = [
  {
    target: 'data-tour="sidebar-logo"',
    title: 'Welcome, Selecta',
    body: 'Quick tour of the DJ portal. Skip anytime — re-enable from Settings.',
    placement: 'right',
  },
  {
    target: 'data-tour="nav-djpacks"',
    title: 'DJ Packs',
    body: 'Curated packs from artists — stems, edits, instrumentals delivered first.',
    placement: 'right',
  },
  {
    target: 'data-tour="nav-djfeedback"',
    title: 'A&R Intel',
    body: 'Send feedback on tracks you receive. Your ratings shape chart-readiness signals.',
    placement: 'right',
  },
];

interface TutorialContextType {
  active: boolean;
  step: number;
  steps: TutorialStep[];
  start: () => void;
  next: () => void;
  prev: () => void;
  skip: () => void;
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  maybeAutoStart: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

const ENABLED_KEY = 'dropkast_tutorial_enabled';
const SEEN_KEY = 'dropkast_tutorial_seen';

export function TutorialProvider({ children }: { children: ReactNode }) {
  const { role } = useTheme();
  const steps = role === 'INFLUENCER' ? INFLUENCER_TOUR : role === 'DJ' ? DJ_TOUR : ARTIST_TOUR;

  const [enabled, setEnabledState] = useState<boolean>(() => {
    const v = localStorage.getItem(ENABLED_KEY);
    return v === null ? true : v === 'true';
  });
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  // Note: auto-start is triggered explicitly by Layout via maybeAutoStart()
  // so we know the tutorial targets are mounted before the spotlight fires.

  const setEnabled = useCallback((v: boolean) => {
    setEnabledState(v);
    localStorage.setItem(ENABLED_KEY, String(v));
    if (!v) setActive(false);
  }, []);

  const start = useCallback(() => {
    setStep(0);
    setActive(true);
  }, []);

  const next = useCallback(() => {
    setStep((s) => {
      if (s + 1 >= steps.length) {
        setActive(false);
        localStorage.setItem(SEEN_KEY, 'true');
        return s;
      }
      return s + 1;
    });
  }, [steps.length]);

  const prev = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  const skip = useCallback(() => {
    setActive(false);
    localStorage.setItem(SEEN_KEY, 'true');
  }, []);

  const maybeAutoStart = useCallback(() => {
    if (!enabled) return;
    if (localStorage.getItem(SEEN_KEY) === 'true') return;
    if (active) return;
    setStep(0);
    // Small delay so React commits + layout settles before targeting elements.
    setTimeout(() => setActive(true), 600);
  }, [enabled, active]);

  return (
    <TutorialContext.Provider value={{ active, step, steps, start, next, prev, skip, enabled, setEnabled, maybeAutoStart }}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error('useTutorial must be used inside TutorialProvider');
  return ctx;
}
