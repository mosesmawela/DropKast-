/**
 * Random sentence generator for the landing hero.
 *
 * Pulls templates from a pool, fills each {slot} with a random word
 * from that slot's bank, and animates each word into place with a
 * staggered slide. Cycles every 3.5s with a fresh combo.
 *
 * Mix of slick, cool, and funny copy — feels alive on every reload.
 */
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type Slot = string;
type WordBank = Record<Slot, string[]>;

interface Template {
  /** Tokens — strings starting with `:` are slot keys, anything else is literal */
  tokens: string[];
  /** Tag for analytics / variety throttling */
  tone?: 'slick' | 'cool' | 'funny' | 'wedge' | 'creator';
}

const BANK: WordBank = {
  verb: [
    'ships',
    'rockets',
    'catapults',
    'drops',
    'unleashes',
    'engineers',
    'fires',
    'launches',
    'lobs',
    'beams',
  ],
  noun_target: [
    'your music',
    'your sound',
    'the next viral hit',
    'your catalogue',
    'your rollout',
    'your numbers',
    'your demo',
    'your hook',
  ],
  destination: [
    '165+ DSPs',
    'every store that matters',
    'the whole streaming grid',
    'TikTok, Spotify, Apple — all of them',
    'every platform on Earth',
    'global ears',
    'every chart',
  ],
  speed: [
    'globally',
    'overnight',
    'in 24 hours',
    'while you sleep',
    'before breakfast',
    'with zero friction',
    'at 0.0% royalty cut',
    'on autopilot',
  ],
  competitor_pain: [
    'DistroKid charges $5 per track for AI mastering.',
    'Amuse charges $5.99 per track to master.',
    'TuneCore wants $54.99 for what we do at $19.99.',
    'AWAL takes 15% of your royalties forever.',
    'Repost takes 20%. Forever. Yes, twenty.',
    'CD Baby takes 9% of every dollar you earn.',
  ],
  our_answer: [
    'We bundle every AI tool into the subscription.',
    'We bundle all 10 AI studios into $19.99/year.',
    'We charge zero per-track fees. Ever.',
    'We keep 0% of your royalties on the paid tier.',
    'We give you advances without taking your masters.',
    'We let you keep 100%. Always.',
  ],
  audience: [
    'creators',
    'indie artists',
    'underdogs',
    'bedroom producers',
    'label founders',
    'amapiano makers',
    'hyperpop kids',
    'people who actually finish songs',
  ],
  ai_power: [
    '8 swappable brains',
    '11 industry personas',
    '10 AI studios',
    'real A&R critique',
    'pre-built workflow recipes',
    'AI mastering, mixing, artwork, video — bundled',
  ],
  pricing_quip: [
    'priced for humans',
    'priced for day-one artists',
    'priced for sanity',
    'priced like a sandwich',
    'priced like rent in 1998',
    'priced so cheap your manager will think it\'s a typo',
  ],
  funny_inflate: [
    '— okay, almost',
    '— minus the bullshit',
    '— no asterisk',
    '— we mean it',
    '— really',
    '— pinky promise',
  ],
  origin: [
    'hook',
    'voice memo',
    'rough demo',
    'stem',
    'iPhone recording',
    '3am loop',
  ],
  destination_outcome: [
    'stream',
    'chart placement',
    'sync deal',
    'editorial playlist',
    'TikTok sound',
    'verified profile',
  ],
  reach_word: [
    '165 stores',
    'every TikTok feed',
    'every Apple Music country',
    'every Spotify playlist editor',
  ],
};

const TEMPLATES: Template[] = [
  // 1. Core action statement
  { tone: 'slick', tokens: ['DropKast', ':verb', ':noun_target', 'to', ':destination', ':speed', '.'] },
  // 2. Wedge punch
  { tone: 'wedge', tokens: [':competitor_pain', ' ', ':our_answer'] },
  // 3. Built-for-creators
  { tone: 'creator', tokens: ['Built for', ':audience', '.', ' ', 'Powered by', ':ai_power', '.', ' ', 'And', ':pricing_quip', '.'] },
  // 4. From → to
  { tone: 'cool', tokens: ['From', ':origin', 'to', ':destination_outcome', '—', 'one platform', ':funny_inflate', '.'] },
  // 5. Stack pitch
  { tone: 'cool', tokens: ['Distribute everywhere.', ' ', 'Generate anything.', ' ', 'Get paid faster', ':funny_inflate', '.'] },
  // 6. Anti-fee
  { tone: 'wedge', tokens: ['No per-track fees.', ' ', 'No royalty cuts.', ' ', 'No "creator economy" tax', ':funny_inflate', '.'] },
  // 7. Funny self-aware
  { tone: 'funny', tokens: ['Yes, every', ':ai_power', '.', ' ', 'No, we\'re not', 'kidding', ':funny_inflate', '.'] },
  // 8. Direct
  { tone: 'slick', tokens: [':noun_target', '→', ':reach_word', '→', 'paid', '.'] },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface ResolvedToken {
  text: string;
  /** Whether the token came from a slot (true = animate, false = literal) */
  fromSlot: boolean;
  /** A stable key for re-animation when the value changes */
  key: string;
}

function resolveTemplate(t: Template): ResolvedToken[] {
  return t.tokens.map((tok, i) => {
    if (tok.startsWith(':')) {
      const slot = tok.slice(1);
      const word = pickRandom(BANK[slot] ?? ['']);
      return { text: word, fromSlot: true, key: `${slot}-${i}-${word}` };
    }
    return { text: tok, fromSlot: false, key: `lit-${i}-${tok}` };
  });
}

interface Props {
  /** Cycle interval in ms */
  intervalMs?: number;
  className?: string;
}

export default function RandomSentence({ intervalMs = 3800, className }: Props) {
  const [phaseId, setPhaseId] = useState(0);

  // Pick a fresh template + words each phase
  const tokens = useMemo(() => {
    const t = pickRandom(TEMPLATES);
    return resolveTemplate(t);
    // phaseId in deps so it re-rolls
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseId]);

  useEffect(() => {
    const id = setInterval(() => setPhaseId((p) => p + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return (
    <div
      className={className}
      onClick={() => setPhaseId((p) => p + 1)}
      title="Click to re-roll"
      style={{ cursor: 'pointer' }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={phaseId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex flex-wrap gap-x-2 gap-y-1 justify-center"
        >
          {tokens.map((tok, i) => {
            // Punctuation / spaces shouldn't animate
            const isPunct = /^[.,—→\s]+$/.test(tok.text);
            if (!tok.text) return null;
            if (isPunct) {
              return (
                <span key={tok.key} className="text-current">
                  {tok.text}
                </span>
              );
            }
            return (
              <motion.span
                key={tok.key}
                initial={{
                  y: 24,
                  opacity: 0,
                  rotateX: -45,
                  filter: 'blur(8px)',
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                  rotateX: 0,
                  filter: 'blur(0px)',
                }}
                exit={{
                  y: -24,
                  opacity: 0,
                  filter: 'blur(8px)',
                }}
                transition={{
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                  // Slot words land slightly later than literals — gives the
                  // "filling in the blanks" feel
                  delay: (tok.fromSlot ? 0.18 : 0.05) + i * 0.04,
                }}
                style={{ display: 'inline-block', transformOrigin: 'bottom center' }}
                className={tok.fromSlot ? 'text-primary font-black' : 'text-current'}
              >
                {tok.text}
              </motion.span>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
