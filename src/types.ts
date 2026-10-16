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
  | 'submitConfirm';
