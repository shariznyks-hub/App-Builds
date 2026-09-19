import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, XCircle, Search } from 'lucide-react';

interface NavigationControlsProps {
  currentQuestion: number;
  startQuestion: number;
  endQuestion: number;
  hasAnswer: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onClearCurrentAnswer: () => void;
  onJumpTo: (qNum: number) => void;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  currentQuestion,
  startQuestion,
  endQuestion,
  hasAnswer,
  onPrevious,
  onNext,
  onClearCurrentAnswer,
  onJumpTo,
}) => {
  const [showJumpInput, setShowJumpInput] = useState(false);
  const [jumpValue, setJumpValue] = useState('');

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(jumpValue, 10);
    if (!isNaN(parsed) && parsed >= startQuestion && parsed <= endQuestion) {
      onJumpTo(parsed);
      setShowJumpInput(false);
      setJumpValue('');
    }
  };

  return (
    <footer className="w-full bg-slate-900 border-t border-slate-800 px-4 py-2.5 sm:py-3 select-none">
      <div className="max-w-4xl mx-auto flex flex-col gap-2">
        {/* Quick jump form if opened */}
        {showJumpInput && (
          <form
            onSubmit={handleJumpSubmit}
            className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-700"
          >
            <span className="text-xs text-slate-400 font-semibold pl-2">Jump to #:</span>
            <input
              type="number"
              min={startQuestion}
              max={endQuestion}
              value={jumpValue}
              onChange={(e) => setJumpValue(e.target.value)}
              placeholder={`${startQuestion} - ${endQuestion}`}
              autoFocus
              className="flex-1 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm border border-slate-700 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-500"
            >
              Go
            </button>
            <button
              type="button"
              onClick={() => setShowJumpInput(false)}
              className="px-2.5 py-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs"
            >
              Cancel
            </button>
          </form>
        )}

        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Previous Button */}
          <button
            id="prev-question-btn"
            onClick={onPrevious}
            disabled={currentQuestion <= startQuestion}
            className={`flex-1 h-13 sm:h-14 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 font-bold text-base sm:text-lg border transition-all active:scale-[0.98] ${
              currentQuestion <= startQuestion
                ? 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200 hover:text-white'
            }`}
            aria-label="Previous question"
            style={{ touchAction: 'manipulation' }}
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            <span>Prev</span>
          </button>

          {/* Jump trigger */}
          <button
            id="jump-toggle-btn"
            onClick={() => setShowJumpInput((v) => !v)}
            className="h-13 sm:h-14 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition active:scale-[0.98]"
            title="Jump to question number"
            aria-label="Jump to question number"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Clear Current Answer */}
          <button
            id="clear-current-btn"
            onClick={onClearCurrentAnswer}
            disabled={!hasAnswer}
            className={`flex-1 h-13 sm:h-14 rounded-xl flex items-center justify-center gap-1.5 px-3 font-semibold text-xs sm:text-sm border transition-all active:scale-[0.98] ${
              hasAnswer
                ? 'bg-rose-950/30 hover:bg-rose-950/60 border-rose-800/60 text-rose-300'
                : 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
            title="Clear the saved answer for this question"
            aria-label="Clear current answer"
            style={{ touchAction: 'manipulation' }}
          >
            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
            <span className="truncate">Clear Ans</span>
          </button>

          {/* Next Button */}
          <button
            id="next-question-btn"
            onClick={onNext}
            disabled={currentQuestion >= endQuestion}
            className={`flex-1 h-13 sm:h-14 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 font-bold text-base sm:text-lg border transition-all active:scale-[0.98] ${
              currentQuestion >= endQuestion
                ? 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200 hover:text-white'
            }`}
            aria-label="Next question"
            style={{ touchAction: 'manipulation' }}
          >
            <span>Next</span>
            <ChevronRight className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </footer>
  );
};
