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
    body: "Quick walkthrough of every major surface in the app. You can skip anytime — and re-enable / replay from Settings → Tutorial.",
    placement: 'right',
  },
  {
    target: 'data-tour="new-release"',
    title: 'New Release',
    body: 'The single most-used button. Upload audio + artwork, fill metadata, mint ISRC/UPC, and queue for distribution to all DSPs in one shot.',
    placement: 'right',
  },
  {
    target: 'data-tour="nav-prerelease"',
    title: 'Pre-Release',
    body: 'Plan the rollout BEFORE the song goes live. Hook timing, creator seeding, "Invasion Mode" coordinated drop. Get it right here and the launch does itself.',
    placement: 'right',
  },
  {
    target: 'data-tour="nav-campaigns"',
    title: 'Campaigns',
    body: 'Active and draft campaigns for every release. AI generates 30-day rollout plans with influencer matches and budget allocation.',
    placement: 'right',
  },
  {
    target: 'data-tour="nav-influencers"',
    title: 'Influencers',
    body: 'Verified creator roster. Match by genre + reach, send paid campaign briefs, track posts and verify with one click.',
    placement: 'right',
  },
  {
    target: 'data-tour="nav-promo"',
    title: 'Promo Packs',
    body: 'AI-generated meme + TikTok asset bundles for any release. Spin one up, then push it straight into a campaign.',
    placement: 'right',
  },
  {
    target: 'data-tour="nav-ugc"',
    title: 'UGC Studio',
    body: 'Generate lipsync videos, lyric clips, and short-form templates that creators can remix.',
    placement: 'right',
  },
  {
    target: 'data-tour="nav-djs"',
    title: 'DJ Packs',
    body: 'Curate stems, edits, and instrumentals for the DJ network. First-look access for trusted DJs builds chart momentum.',
    placement: 'right',
  },
  {
    target: 'data-tour="nav-reactions"',
    title: 'Reactions',
    body: 'Track first-listen reactions across YouTube, TikTok, podcasts. Real ear-test feedback before mainstream rollout.',
    placement: 'right',
  },
  {
    target: 'data-tour="nav-social"',
    title: 'Social Ads',
    body: 'Meta + TikTok + YouTube ad campaigns, all from one panel. Tied to your campaign budget for unified ROAS.',
    placement: 'right',
  },
  {
    target: 'data-tour="nav-splits"',
    title: 'Split Sheets',
    body: 'Define royalty splits per track. When earnings land, splits pay out automatically via Stripe Connect (Phase 3).',
    placement: 'right',
  },
  {
    target: 'data-tour="nav-anr"',
    title: 'A&R Feedback',
    body: 'Submit a track for a real critique from Claude — score 1-10, hook strength, lyrical themes, comp artists, and the #1 thing to fix.',
    placement: 'right',
  },
  {
    target: 'data-tour="nav-analytics"',
    title: 'Analytics',
    body: 'Plays, clicks, influencer posts, total reach. Per-release deep-dive available — chat with the AI to interpret numbers.',
    placement: 'right',
  },
  {
    target: 'data-tour="nav-earnings"',
    title: 'Treasury',
    body: 'Streaming royalties, campaign payouts, and ad earnings. Stripe Connect handles the actual transfers when configured.',
    placement: 'right',
  },
  {
    target: 'data-tour="nav-assets"',
    title: 'Assets',
    body: 'Cover art, video teasers, mood boards. AI generates them; you pick the model from /ai-providers.',
    placement: 'right',
  },
  {
    target: 'data-tour="nav-ai-providers"',
    title: 'AI Models',
    body: 'Tier list of every text/image/video AI model — free, freemium, and paid. Wire the keys you want, switch providers per chat.',
    placement: 'right',
  },
  {
    target: 'data-tour="ai-assistant"',
    title: 'AI Assistant',
    body: "Floating chat. Claude has live tool access — ask 'how is my last release doing?' and it pulls real numbers. Switch model from the dropdown in the header.",
    placement: 'left',
  },
  {
    target: 'data-tour="navbar-bell"',
    title: 'Notifications',
    body: 'Persistent inbox + transient toasts. Pings when a release goes live, an influencer posts, or a DJ submits feedback.',
    placement: 'bottom',
  },
  {
    target: 'data-tour="navbar-academy"',
    title: 'DropKast Academy',
    body: 'Mini-course on releasing, A&R skills, campaign planning, and how to use the platform. Open anytime to level up.',
    placement: 'bottom',
  },
  {
    target: 'data-tour="navbar-profile"',
    title: 'Profile',
    body: 'Your identity, avatar, bio, linked portals. Click your name or avatar to open it.',
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
