import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ClearConfirmModalProps {
  answeredCount: number;
  onConfirm: () => void;
  onClose: () => void;
}

export const ClearConfirmModal: React.FC<ClearConfirmModalProps> = ({
  answeredCount,
  onConfirm,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-750 w-full max-w-md rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-lg font-bold">Clear All Answers?</h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 text-slate-200 text-sm leading-relaxed">
          <p>
            Are you sure you want to delete all{' '}
            <strong className="text-rose-400 font-bold">{answeredCount} answered questions</strong>?
          </p>
          <p className="mt-2 text-slate-400 text-xs">
            This will wipe all saved answers and return to Question 1. This action cannot be undone.
          </p>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition"
          >
            Cancel
          </button>
          <button
            id="confirm-clear-all-btn"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition shadow-md"
          >
            Yes, Clear All
          </button>
        </div>
      </div>
    </div>
  );
};
