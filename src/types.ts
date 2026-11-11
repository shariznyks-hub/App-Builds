/**
 * Core types for MCQ Answer Pad
 */

export type MCQOption = 'A' | 'B' | 'C' | 'D';

export interface MCQQuestionItem {
  id: number;
  questionNumber: number;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: MCQOption;
  explanation?: string;
}

export interface EvaluationSummary {
  total: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  score: number;
  percentage: number;
}

export type ActiveModal =
  | 'none'
  | 'setup'
  | 'unanswered'
  | 'export'
  | 'clearConfirm'
  | 'androidInstall'
  | 'importQuestions'
  | 'submitConfirm'
  | 'targetCompleted'
  | 'performanceDashboard'
  | 'achievements';

export interface AppSettings {
  baseTimePerQuestion: number; // in seconds, default 60
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

export interface QuestionTimingRecord {
  timeSpentSeconds: number;
  awardedBaseTime: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface QuestionHistoryItem {
  wasIncorrect: boolean;
  isFixed: boolean;
  attempts: number;
}

export interface GamificationState {
  totalXP: number;
  sessionXP: number;
  level: number;
  currentStreak: number;
  personalBestStreak: number;
  bestSessionQuestions: number;
  unlockedAchievements: string[];
  questionHistory: Record<string, QuestionHistoryItem>;
  totalLifetimeAnswered: number;
  totalLifetimeCorrect: number;
}

export interface SessionTargetState {
  targetCount: number;
  processedQuestions: number[];
  isCompleted: boolean;
  dismissed: boolean;
}
