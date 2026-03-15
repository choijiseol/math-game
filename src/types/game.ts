export interface Bubble {
  id: string;
  operator: '+' | '-';
  value: number;
  x: number;
  duration: number;
  delay: number;
  color: string;
}

export type GameResult = 'success' | 'fail' | null;

export interface Puzzle {
  target: number;
  bubbles: Bubble[];
}

export interface StageConfig {
  stage: number;
  operators: ('+' | '-')[];
  valueMin: number;
  valueMax: number;
  targetMin: number;
  targetMax: number;
  solutionRange: [number, number];
  bubbleRange: [number, number];
  fallRange: [number, number];
}
