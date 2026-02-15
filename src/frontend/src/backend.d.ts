import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface IQTestScoreReport {
    finalIQScore: bigint;
    attempts: Array<SessionAttempt>;
    normalizedIQScore: number;
    correctAnswers: bigint;
    elapsedTime: bigint;
    averageDifficulty: number;
    resultSummary: string;
}
export interface AnswerDTO {
    answerText: string;
}
export interface Answer {
    isCorrect: boolean;
    answerText: string;
}
export interface QuestionDTO {
    id: string;
    answers: Array<AnswerDTO>;
    difficulty: number;
    explanation: string;
    questionText: string;
}
export interface UserProfile {
    name: string;
}
export interface SessionAttempt {
    difficulty: number;
    chosenAnswerIndex: bigint;
    isCorrect: boolean;
    questionId: string;
    responseTime: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addQuestion(difficulty: number, questionText: string, answers: Array<Answer>, explanation: string): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    calculateIQScore(attempts: Array<SessionAttempt>, elapsedTime: bigint): Promise<IQTestScoreReport>;
    deleteQuestion(questionId: string): Promise<void>;
    getCachedScore(user: Principal): Promise<IQTestScoreReport | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getQuestionCount(): Promise<bigint>;
    getQuestionsInRange(minDiff: number, maxDiff: number): Promise<Array<QuestionDTO>>;
    getRecommendedQuestions(difficulty: number, tolerance: number, count: bigint): Promise<Array<QuestionDTO>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchByText(searchText: string): Promise<Array<QuestionDTO>>;
    submitAnswer(questionId: string, chosenAnswerIndex: bigint, responseTime: bigint): Promise<boolean>;
    updateQuestion(questionId: string, difficulty: number, questionText: string, answers: Array<Answer>, explanation: string): Promise<void>;
}
