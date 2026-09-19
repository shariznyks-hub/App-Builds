/**
 * Core types for MCQ Answer Pad
 */

export type MCQOption = 'A' | 'B' | 'C' | 'D';

export interface MCQState {
  startQuestion: number;
  totalQuestions: number;
  currentQuestion: number;
  // Map of questionNumber -> selected option (or undefined if unanswered/skipped)
  answers: Record<number, MCQOption>;
  optionsCount: 4 | 5; // Support 4 or 5 options
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

export type ActiveModal = 'none' | 'setup' | 'unanswered' | 'export' | 'clearConfirm' | 'androidInstall';
