import React from 'react';
import { Send, AlertTriangle, X } from 'lucide-react';

interface SubmitConfirmModalProps {
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  onConfirm: () => void;
  onClose: () => void;
}

export const SubmitConfirmModal: React.FC<SubmitConfirmModalProps> = ({
  totalQuestions,
  answeredCount,
  unansweredCount,
  onConfirm,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-750 w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Submit Test?</h2>
              <p className="text-xs text-slate-400">Ready for evaluation and score</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats summary */}
        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Total Questions:</span>
            <span className="font-bold text-white">{totalQuestions}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Answered:</span>
            <span className="font-bold text-emerald-400">{answeredCount}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Unanswered / Skipped:</span>
            <span className={`font-bold ${unansweredCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              {unansweredCount}
            </span>
          </div>
        </div>

        {unansweredCount > 0 && (
          <div className="flex items-start gap-2.5 bg-amber-950/40 border border-amber-600/40 p-3 rounded-xl text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              You have {unansweredCount} unattempted {unansweredCount === 1 ? 'question' : 'questions'}. They will be marked as <strong>Unattempted</strong> during evaluation.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition"
          >
            Keep Attempting
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-lg shadow-emerald-950/50"
          >
            <Send className="w-4 h-4" />
            <span>Confirm & Submit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
