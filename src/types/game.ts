export type Difficulty = "easy" | "medium" | "hard";

export type Operation = "addition" | "subtraction" | "multiplication" | "division";

export interface Question {
  id: string;
  operandA: number;
  operandB: number;
  operation: Operation;
  answer: number;
}

export interface GameState {
  score: number;
  lives: number;
  currentQuestion: Question | null;
  difficulty: Difficulty;
  isGameOver: boolean;
  timeLeft: number;
}

export interface GameResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  difficulty: Difficulty;
  duration: number;
}
