import type { StageConfig } from '@/types/game';

/**
 * Stage difficulty progression:
 *
 * Stage  1-5  : + only  │ values 1-9  │ target  5-10  │ 5-6 bubbles  │ very slow fall
 * Stage  6-10 : + only  │ values 1-9  │ target 10-20  │ 5-6 bubbles  │ slow fall
 * Stage 11-15 : + only  │ values 1-9  │ target 10-36  │ 7-10 bubbles │ medium fall
 * Stage 16-20 : + only  │ values 1-19 │ target 15-60  │ 7-10 bubbles │ medium fall
 * Stage 21-30 : +/-     │ values 1-19 │ target -20-76 │ 11-15 bubbles│ faster fall
 */
export const STAGE_CONFIGS: StageConfig[] = [
  ...Array.from({ length: 5 }, (_, i): StageConfig => ({
    stage: i + 1,
    operators: ['+'],
    valueMin: 1, valueMax: 9,
    targetMin: 5,   targetMax: 10,
    solutionRange: [2, 3],
    bubbleRange:   [5, 6],
    fallRange:     [22, 30],
  })),
  ...Array.from({ length: 5 }, (_, i): StageConfig => ({
    stage: i + 6,
    operators: ['+'],
    valueMin: 1, valueMax: 9,
    targetMin: 10, targetMax: 20,
    solutionRange: [2, 4],
    bubbleRange:   [5, 6],
    fallRange:     [20, 27],
  })),
  ...Array.from({ length: 5 }, (_, i): StageConfig => ({
    stage: i + 11,
    operators: ['+'],
    valueMin: 1, valueMax: 9,
    targetMin: 10,  targetMax: 36,  // max achievable: 4 × 9 = 36
    solutionRange: [3, 4],
    bubbleRange:   [7, 10],
    fallRange:     [18, 24],
  })),
  ...Array.from({ length: 5 }, (_, i): StageConfig => ({
    stage: i + 16,
    operators: ['+'],
    valueMin: 1, valueMax: 19,
    targetMin: 15,  targetMax: 60,  // max achievable: 4 × 19 = 76
    solutionRange: [3, 4],
    bubbleRange:   [7, 10],
    fallRange:     [16, 22],
  })),
  ...Array.from({ length: 10 }, (_, i): StageConfig => ({
    stage: i + 21,
    operators: ['+', '-'],
    valueMin: 1, valueMax: 19,
    targetMin: -20, targetMax: 76,  // max achievable: 4 × 19 = 76
    solutionRange: [3, 4],
    bubbleRange:   [11, 15],
    fallRange:     [14, 20],
  })),
];

export const TOTAL_STAGES = STAGE_CONFIGS.length; // 30

export function getStageConfig(stage: number): StageConfig {
  return STAGE_CONFIGS[stage - 1] ?? STAGE_CONFIGS[STAGE_CONFIGS.length - 1];
}
