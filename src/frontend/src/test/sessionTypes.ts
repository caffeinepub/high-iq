import type { QuestionDTO } from '../backend';

export interface TestSession {
  currentQuestionIndex: number;
  currentDifficulty: number;
  attempts: TestAttempt[];
  startTime: number;
  currentQuestion: QuestionDTO | null;
}

export interface TestAttempt {
  questionId: string;
  questionText: string;
  chosenAnswerIndex: number;
  isCorrect: boolean;
  responseTime: number;
  difficulty: number;
  answers: string[];
}

export interface StoredTestResult {
  id: string;
  timestamp: number;
  finalIQScore: number;
  correctAnswers: number;
  totalQuestions: number;
  elapsedTime: number;
  averageDifficulty: number;
  resultSummary: string;
  attempts: TestAttempt[];
}
