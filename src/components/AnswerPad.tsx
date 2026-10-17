import React, { useEffect } from 'react';
import { Check, X, FastForward, CheckCircle2, XCircle, AlertCircle, HelpCircle, FileCode } from 'lucide-react';
import { MCQOption, MCQQuestionItem } from '../types';

interface AnswerPadProps {
  currentQuestion: number;
  questionItem?: MCQQuestionItem;
  currentAnswer?: MCQOption;
  isSubmitted: boolean;
  onSelectOption: (option: MCQOption) => void;
  onSkip: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onOpenImport?: () => void;
}

const ALL_OPTIONS: MCQOption[] = ['A', 'B', 'C', 'D'];

export const AnswerPad: React.FC<AnswerPadProps> = ({
  currentQuestion,
  questionItem,
  currentAnswer,
  isSubmitted,
  onSelectOption,
  onSkip,
  onPrevious,
  onNext,
  onOpenImport,
}) => {
  const options = ALL_OPTIONS;

  // Tablet keyboard support (physical keyboard or Bluetooth remote)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if an input or textarea is focused
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const key = e.key.toUpperCase();

      // Keyboard navigation is always available
      if (key === 'ARROWLEFT') {
        e.preventDefault();
        onPrevious();
        return;
      } else if (key === 'ARROWRIGHT') {
        e.preventDefault();
        onNext();
        return;
      }

      // Option selection only in Attempt Mode (before submission)
      if (!isSubmitted) {
        if (key === 'A' || key === '1') {
          e.preventDefault();
          onSelectOption('A');
        } else if (key === 'B' || key === '2') {
          e.preventDefault();
          onSelectOption('B');
        } else if (key === 'C' || key === '3') {
          e.preventDefault();
          onSelectOption('C');
        } else if (key === 'D' || key === '4') {
          e.preventDefault();
          onSelectOption('D');
        } else if (key === 'S' || key === ' ' || key === 'TAB') {
          e.preventDefault();
          onSkip();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitted, onSelectOption, onSkip, onPrevious, onNext]);

  // Evaluation helpers
  const isAttempted = Boolean(currentAnswer);
  const isCorrect = isSubmitted && questionItem && currentAnswer === questionItem.correctAnswer;
  const isIncorrect = isSubmitted && questionItem && currentAnswer && currentAnswer !== questionItem.correctAnswer;
  const isUnattempted = isSubmitted && !currentAnswer;

  return (
    <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto px-4 py-2 select-none justify-between min-h-0 overflow-y-auto">
      {/* Quick Paste Questions Notice if no question text is loaded yet */}
      {!questionItem && !isSubmitted && onOpenImport && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-3 mb-2 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <FileCode className="w-4 h-4 text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">Want question text & auto-grading?</p>
              <p className="text-[11px] text-slate-400 truncate">Paste questions in [Q1]...[/Q1] format with hidden key</p>
            </div>
          </div>
          <button
            id="paste-questions-banner-btn"
            onClick={onOpenImport}
            className="shrink-0 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm transition active:scale-95"
          >
            Paste Questions
          </button>
        </div>
      )}

      {/* Question Text Header Card (if question text is provided) */}
      {questionItem && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-2.5 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Question {currentQuestion}
            </span>

            {/* Evaluation mode status badge for current question */}
            {isSubmitted && (
              <div>
                {isCorrect && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs sm:text-sm font-bold shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Correct
                  </span>
                )}
                {isIncorrect && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500 text-rose-300 text-xs sm:text-sm font-bold shadow-sm">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    Incorrect
                  </span>
                )}
                {isUnattempted && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500 text-amber-300 text-xs sm:text-sm font-bold shadow-sm">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    Unattempted
                  </span>
                )}
              </div>
            )}
          </div>

          <h2 className="text-base sm:text-lg md:text-xl font-medium text-slate-100 leading-snug">
            {questionItem.questionText}
          </h2>
        </div>
      )}

      {/* Options A, B, C, D */}
      <div className="flex-1 flex flex-col gap-2.5 sm:gap-3 justify-stretch py-1">
        {options.map((option) => {
          const isSelected = currentAnswer === option;
          const optionText = questionItem?.options?.[option];
          const isThisOptionCorrect = isSubmitted && questionItem && questionItem.correctAnswer === option;
          const isThisOptionWrongSelected = isSubmitted && isSelected && !isThisOptionCorrect;

          // Styling logic depending on Attempt Mode vs Evaluation Mode
          let buttonClass = 'bg-slate-900 border-slate-750 text-slate-100';

          if (!isSubmitted) {
            // ATTEMPT MODE: Never reveal correct/incorrect or answer key
            if (isSelected) {
              buttonClass = 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/30';
            } else {
              buttonClass = 'bg-slate-900 hover:bg-slate-850 hover:border-slate-600 border-slate-750 text-slate-100 active:bg-slate-800';
            }
          } else {
            // EVALUATION MODE:
            // Highlight correct option in green
            // If user's answer is wrong, highlight their selected option in red
            if (isThisOptionCorrect) {
              buttonClass = 'bg-emerald-950/85 border-emerald-500 text-white shadow-md shadow-emerald-950/50 ring-1 ring-emerald-500';
            } else if (isThisOptionWrongSelected) {
              buttonClass = 'bg-rose-950/85 border-rose-500 text-white shadow-md shadow-rose-950/50 ring-1 ring-rose-500';
            } else {
              buttonClass = 'bg-slate-900/60 border-slate-800 text-slate-400 opacity-65';
            }
          }

          return (
            <button
              key={option}
              id={`option-btn-${option}`}
              onClick={() => {
                if (!isSubmitted) {
                  onSelectOption(option);
                }
              }}
              disabled={isSubmitted}
              className={`flex-1 min-h-[56px] sm:min-h-[64px] md:min-h-[72px] rounded-2xl flex items-center justify-between px-5 sm:px-7 border-2 transition-all ${buttonClass} ${
                !isSubmitted ? 'active:scale-[0.98]' : 'cursor-default'
              }`}
              aria-label={`Option ${option}`}
              style={{ touchAction: 'manipulation' }}
            >
              {/* Option Letter + Optional Text */}
              <div className="flex items-center gap-3 sm:gap-4 text-left pr-2 py-1 flex-1">
                <span className="text-2xl sm:text-3xl md:text-4xl font-black tracking-wider shrink-0">
                  {option}
                </span>

                {optionText && (
                  <span className="text-sm sm:text-base font-normal leading-tight text-slate-100">
                    {optionText}
                  </span>
                )}
              </div>

              {/* Status Indicator Badges */}
              <div className="shrink-0 flex items-center gap-2">
                {!isSubmitted ? (
                  // Attempt Mode Indicator
                  <div
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border-2 transition-all ${
                      isSelected
                        ? 'bg-white border-white text-blue-600'
                        : 'border-slate-700 bg-slate-950/60 text-slate-500'
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
                    ) : (
                      <span className="text-xs sm:text-sm font-bold text-slate-400">{option}</span>
                    )}
                  </div>
                ) : (
                  // Evaluation Mode Badges
                  <div className="flex items-center gap-2">
                    {isThisOptionCorrect && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm shadow-sm">
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Correct Answer</span>
                      </span>
                    )}
                    {isThisOptionWrongSelected && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500 text-white font-bold text-xs sm:text-sm shadow-sm">
                        <X className="w-4 h-4 stroke-[3]" />
                        <span>Your Choice</span>
                      </span>
                    )}
                    {isSelected && isThisOptionCorrect && (
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-900 border border-emerald-400 text-emerald-200 text-xs font-semibold">
                        Your Choice
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* POST-SUBMISSION EVALUATION BOX */}
      {isSubmitted && questionItem && (
        <div className="mt-3 bg-slate-900/95 border border-slate-750 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col gap-3">
          {/* Header Row: Correct Answer & User's Selection */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Evaluation:
              </span>
              <span className="text-sm sm:text-base font-extrabold text-white">
                Correct Answer:{' '}
                <strong className="text-emerald-400 text-base sm:text-lg">
                  {questionItem.correctAnswer}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="text-slate-400 font-medium">Your Selected Answer:</span>
              {isAttempted ? (
                <span
                  className={`font-black px-2 py-0.5 rounded-md ${
                    isCorrect
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                      : 'bg-rose-950 text-rose-300 border border-rose-600'
                  }`}
                >
                  {currentAnswer} ({isCorrect ? 'Correct' : 'Wrong'})
                </span>
              ) : (
                <span className="font-semibold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-700/60">
                  Unattempted
                </span>
              )}
            </div>
          </div>

          {/* Explanation if provided */}
          {questionItem.explanation ? (
            <div className="flex flex-col gap-1 text-slate-200 text-xs sm:text-sm leading-relaxed bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Explanation:
              </span>
              <p className="text-slate-300 pl-5.5">{questionItem.explanation}</p>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">
              No detailed explanation provided for this question.
            </div>
          )}
        </div>
      )}

      {/* SKIP BUTTON (Only visible in Attempt Mode) */}
      {!isSubmitted && (
        <div className="pt-2 pb-1">
          <button
            id="skip-btn"
            onClick={onSkip}
            className="w-full h-13 sm:h-15 rounded-2xl bg-amber-950/30 hover:bg-amber-950/50 border-2 border-amber-500/70 hover:border-amber-400 text-amber-300 active:bg-amber-900/40 active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-black text-lg sm:text-xl tracking-wider shadow-md"
            aria-label="Skip question"
            style={{ touchAction: 'manipulation' }}
          >
            <FastForward className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 stroke-[2.5]" />
            <span>SKIP QUESTION</span>
          </button>
        </div>
      )}
    </div>
  );
};
