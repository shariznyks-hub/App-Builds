import React, { useEffect } from 'react';
import { Check, FastForward } from 'lucide-react';
import { MCQOption } from '../types';

interface AnswerPadProps {
  optionsCount?: number;
  currentAnswer?: MCQOption;
  onSelectOption: (option: MCQOption) => void;
  onSkip: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

const ALL_OPTIONS: MCQOption[] = ['A', 'B', 'C', 'D'];

export const AnswerPad: React.FC<AnswerPadProps> = ({
  currentAnswer,
  onSelectOption,
  onSkip,
  onPrevious,
  onNext,
}) => {
  const options = ALL_OPTIONS;

  // Tablet keyboard support (physical keyboard or Bluetooth remote)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if an input is focused
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const key = e.key.toUpperCase();
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
      } else if (key === 'ARROWLEFT') {
        e.preventDefault();
        onPrevious();
      } else if (key === 'ARROWRIGHT') {
        e.preventDefault();
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectOption, onSkip, onPrevious, onNext]);

  return (
    <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto px-4 py-2 select-none justify-between min-h-0">
      {/* Primary A, B, C, D Answer Buttons - Occupy majority of vertical space */}
      <div className="flex-1 flex flex-col gap-2.5 sm:gap-3 justify-stretch py-1">
        {options.map((option) => {
          const isSelected = currentAnswer === option;

          return (
            <button
              key={option}
              id={`option-btn-${option}`}
              onClick={() => onSelectOption(option)}
              className={`flex-1 min-h-[58px] sm:min-h-[68px] md:min-h-[76px] rounded-2xl flex items-center justify-between px-6 sm:px-8 border-2 transition-all active:scale-[0.98] ${
                isSelected
                  ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/30'
                  : 'bg-slate-900 hover:bg-slate-850 hover:border-slate-600 border-slate-750 text-slate-100 active:bg-slate-800'
              }`}
              aria-label={`Option ${option}`}
              style={{ touchAction: 'manipulation' }}
            >
              {/* Option Letter (Very large & bold for low-vision & tablet viewing) */}
              <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-wider flex items-center gap-3">
                {option}
                {isSelected && (
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-700/80 text-blue-100 border border-blue-400/40">
                    Selected
                  </span>
                )}
              </span>

              {/* Visual indicator on right side of button */}
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border-2 transition-all ${
                  isSelected
                    ? 'bg-white border-white text-blue-600'
                    : 'border-slate-700 bg-slate-950/60 text-slate-500'
                }`}
              >
                {isSelected ? (
                  <Check className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3]" />
                ) : (
                  <span className="text-sm font-bold text-slate-400">{option}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Large SKIP Button (One tap, leaves blank, advances to next question) */}
      <div className="pt-2 pb-1">
        <button
          id="skip-btn"
          onClick={onSkip}
          className="w-full h-14 sm:h-16 rounded-2xl bg-amber-950/30 hover:bg-amber-950/50 border-2 border-amber-500/70 hover:border-amber-400 text-amber-300 active:bg-amber-900/40 active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-black text-xl sm:text-2xl tracking-widest shadow-md"
          aria-label="Skip question"
          style={{ touchAction: 'manipulation' }}
        >
          <FastForward className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 stroke-[2.5]" />
          <span>SKIP QUESTION</span>
        </button>
      </div>
    </div>
  );
};
