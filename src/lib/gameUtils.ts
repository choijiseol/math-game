import type { Difficulty, Operation, Question } from "@/types/game";

const DIFFICULTY_CONFIG: Record<Difficulty, { min: number; max: number }> = {
  easy: { min: 1, max: 10 },
  medium: { min: 1, max: 50 },
  hard: { min: 1, max: 100 },
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateQuestion(
  difficulty: Difficulty,
  operation: Operation
): Question {
  const { min, max } = DIFFICULTY_CONFIG[difficulty];
  let operandA = randomInt(min, max);
  let operandB = randomInt(min, max);
  let answer: number;

  switch (operation) {
    case "addition":
      answer = operandA + operandB;
      break;
    case "subtraction":
      if (operandA < operandB) [operandA, operandB] = [operandB, operandA];
      answer = operandA - operandB;
      break;
    case "multiplication":
      operandB = randomInt(min, Math.min(max, 12));
      answer = operandA * operandB;
      break;
    case "division":
      answer = operandA;
      operandA = operandA * operandB;
      break;
  }

  return {
    id: crypto.randomUUID(),
    operandA,
    operandB,
    operation,
    answer,
  };
}

export function getOperationSymbol(operation: Operation): string {
  const symbols: Record<Operation, string> = {
    addition: "+",
    subtraction: "-",
    multiplication: "×",
    division: "÷",
  };
  return symbols[operation];
}
