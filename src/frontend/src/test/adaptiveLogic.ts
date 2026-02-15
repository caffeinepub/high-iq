export const ADAPTIVE_CONFIG = {
  MIN_DIFFICULTY: 1.0,
  MAX_DIFFICULTY: 10.0,
  INITIAL_DIFFICULTY: 5.0,
  INITIAL_TOLERANCE: 2.0,
  STEP_UP: 1.0,
  STEP_DOWN: 0.5,
  MAX_QUESTIONS: 20,
  MIN_QUESTIONS: 5,
};

export function getNextDifficulty(currentDifficulty: number, wasCorrect: boolean): number {
  let nextDifficulty = currentDifficulty;

  if (wasCorrect) {
    nextDifficulty += ADAPTIVE_CONFIG.STEP_UP;
  } else {
    nextDifficulty -= ADAPTIVE_CONFIG.STEP_DOWN;
  }

  // Clamp to bounds
  return Math.max(
    ADAPTIVE_CONFIG.MIN_DIFFICULTY,
    Math.min(ADAPTIVE_CONFIG.MAX_DIFFICULTY, nextDifficulty)
  );
}

export function getTolerance(questionNumber: number): number {
  // Start with wider tolerance, narrow as test progresses
  const progress = questionNumber / ADAPTIVE_CONFIG.MAX_QUESTIONS;
  return ADAPTIVE_CONFIG.INITIAL_TOLERANCE * (1 - progress * 0.5);
}
