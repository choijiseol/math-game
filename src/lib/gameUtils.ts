import type { Bubble, Puzzle, StageConfig } from '@/types/game';

// ─── Constants ────────────────────────────────────────────────────────────────

const BUBBLE_COLORS = [
  'from-pink-400 to-rose-600',
  'from-blue-400 to-blue-600',
  'from-emerald-400 to-green-600',
  'from-amber-400 to-orange-500',
  'from-violet-400 to-purple-600',
  'from-cyan-400 to-teal-600',
  'from-red-400 to-pink-600',
  'from-indigo-400 to-blue-700',
];

/** Bubbles are distributed across this percentage of screen width. */
const BUBBLE_X_SPREAD = 76;
/** Max random horizontal jitter per bubble (%). */
const BUBBLE_X_JITTER = 6;
/** Seconds before the first bubble appears. */
const FIRST_BUBBLE_DELAY = 1.0;
/** Range (seconds) of the gap between consecutive bubbles. */
const BUBBLE_GAP: [number, number] = [2.5, 4.0];
/** Probability that a value gets a '-' operator when the stage allows negatives. */
const NEGATIVE_PROBABILITY = 0.4;
/** How many times to retry solution/value generation before giving up. */
const MAX_ATTEMPTS = 100;
/**
 * Max allowed consecutive solution bubbles in the fall sequence.
 * Prevents winning by just clicking the first N bubbles in order.
 */
const MAX_CONSECUTIVE_SOLUTIONS = 2;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Generates a random signed value within the config's value range,
 * guaranteed NOT to equal `exclude` (prevents single-bubble instant-win).
 */
function safeValue(config: StageConfig, hasNeg: boolean, exclude: number): number {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const v = randomInt(config.valueMin, config.valueMax);
    const signed = hasNeg && Math.random() < NEGATIVE_PROBABILITY ? -v : v;
    if (signed !== exclude) return signed;
  }
  // Fallback: nudge the boundary value away from exclude
  const v = config.valueMin === exclude ? config.valueMin + 1 : config.valueMin;
  return v;
}

/**
 * Merges solution and decoy values into a single ordered array, shuffled such
 * that solution bubbles never appear more than MAX_CONSECUTIVE_SOLUTIONS times
 * in a row. This prevents the player from winning simply by clicking bubbles
 * in the order they appear.
 *
 * Retries the shuffle up to 20 times; statistically sufficient since the
 * probability of violating the constraint is low per attempt.
 */
function buildBubbleOrder(solutionValues: number[], decoyValues: number[]): number[] {
  type Tagged = { v: number; isSol: boolean };

  const unshuffled: Tagged[] = [
    ...solutionValues.map((v) => ({ v, isSol: true })),
    ...decoyValues.map((v) => ({ v, isSol: false })),
  ];

  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = shuffle(unshuffled);

    let maxRun = 0;
    let run = 0;
    for (const t of candidate) {
      run = t.isSol ? run + 1 : 0;
      if (run > maxRun) maxRun = run;
    }

    if (maxRun <= MAX_CONSECUTIVE_SOLUTIONS) {
      return candidate.map((t) => t.v);
    }
  }

  // Last resort: return a plain shuffle (should virtually never reach here)
  return shuffle(unshuffled).map((t) => t.v);
}

// ─── Puzzle generation ────────────────────────────────────────────────────────

export function generatePuzzle(config: StageConfig): Puzzle {
  const totalBubbles = randomInt(config.bubbleRange[0], config.bubbleRange[1]);
  // Always leave at least one decoy bubble
  const solutionCount = Math.min(
    randomInt(config.solutionRange[0], config.solutionRange[1]),
    totalBubbles - 1
  );
  const decoyCount = totalBubbles - solutionCount;
  const hasNeg = config.operators.includes('-');

  // ── Step 1: Generate solution values ──────────────────────────────────────
  // Requirements:
  //   • Sum must fall within [targetMin, targetMax]
  //   • No single value may equal the sum (instant-win prevention)
  let solutionValues: number[] = [];
  let target = 0;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const vals = Array.from({ length: solutionCount }, () => {
      const v = randomInt(config.valueMin, config.valueMax);
      return hasNeg && Math.random() < NEGATIVE_PROBABILITY ? -v : v;
    });
    const sum = vals.reduce((a, b) => a + b, 0);
    const inRange = sum >= config.targetMin && sum <= config.targetMax;
    const noInstantWin = vals.every((v) => v !== sum);
    if (inRange && noInstantWin) {
      solutionValues = vals;
      target = sum;
      break;
    }
  }

  // Fallback A: relax the range constraint, keep instant-win prevention
  if (solutionValues.length === 0) {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const vals = Array.from({ length: solutionCount }, () => {
        const v = randomInt(config.valueMin, config.valueMax);
        return hasNeg && Math.random() < NEGATIVE_PROBABILITY ? -v : v;
      });
      const sum = vals.reduce((a, b) => a + b, 0);
      if (vals.every((v) => v !== sum)) {
        solutionValues = vals;
        target = sum;
        break;
      }
    }
  }

  // Fallback B: last resort — puzzle is still solvable, instant-win not guaranteed
  if (solutionValues.length === 0) {
    solutionValues = Array.from({ length: solutionCount }, () => {
      const v = randomInt(config.valueMin, config.valueMax);
      return hasNeg && Math.random() < NEGATIVE_PROBABILITY ? -v : v;
    });
    target = solutionValues.reduce((a, b) => a + b, 0);
  }

  // ── Step 2: Generate decoy values ─────────────────────────────────────────
  // Each decoy is guaranteed not to equal the target (no solo-click win).
  const decoyValues = Array.from({ length: decoyCount }, () =>
    safeValue(config, hasNeg, target)
  );

  // ── Step 3: Order bubbles so solutions aren't clustered at the start ───────
  const allValues = buildBubbleOrder(solutionValues, decoyValues);
  const colors = shuffle([...BUBBLE_COLORS]);

  let cumulativeDelay = FIRST_BUBBLE_DELAY;
  const bubbles: Bubble[] = allValues.map((v, i) => {
    if (i > 0) cumulativeDelay += randomFloat(BUBBLE_GAP[0], BUBBLE_GAP[1]);
    return {
      id: crypto.randomUUID(),
      operator: v >= 0 ? '+' : '-',
      value: Math.abs(v),
      x: Math.floor((i / allValues.length) * BUBBLE_X_SPREAD + randomInt(1, BUBBLE_X_JITTER)),
      duration: randomInt(config.fallRange[0], config.fallRange[1]),
      delay: parseFloat(cumulativeDelay.toFixed(2)),
      color: colors[i % colors.length],
    };
  });

  return { target, bubbles };
}
