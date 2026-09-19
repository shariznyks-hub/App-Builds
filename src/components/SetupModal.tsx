import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface SetupModalProps {
  currentStart: number;
  currentTotal: number;
  currentOptionsCount?: number;
  onSave: (newStart: number, newTotal: number) => void;
  onClose: () => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({
  currentStart,
  currentTotal,
  onSave,
  onClose,
}) => {
  const [startNum, setStartNum] = useState<string>(currentStart.toString());
  const [totalNum, setTotalNum] = useState<string>(currentTotal.toString());
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const s = parseInt(startNum, 10);
    const t = parseInt(totalNum, 10);

    if (isNaN(s) || s < 1) {
      setError('Start question number must be at least 1.');
      return;
    }
    if (isNaN(t) || t < 1 || t > 500) {
      setError('Total questions must be between 1 and 500.');
      return;
    }

    onSave(s, t);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-750 w-full max-w-md rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Question Range Setup</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize your test session bounds
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Start Question Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Start Question Number
            </label>
            <input
              type="number"
              min="1"
              max="999"
              value={startNum}
              onChange={(e) => {
                setStartNum(e.target.value);
                setError(null);
              }}
              className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-none"
              placeholder="1"
              required
            />
            <span className="text-xs text-slate-400">
              e.g. 1, or 51 if your test begins on question 51
            </span>
          </div>

          {/* Total Number of Questions */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Total Number of Questions (1 - 500)
            </label>
            <input
              type="number"
              min="1"
              max="500"
              value={totalNum}
              onChange={(e) => {
                setTotalNum(e.target.value);
                setError(null);
              }}
              className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-none"
              placeholder="500"
              required
            />
            <div className="flex gap-2 mt-1">
              {[50, 100, 200, 500].map((quick) => (
                <button
                  type="button"
                  key={quick}
                  onClick={() => setTotalNum(quick.toString())}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition ${
                    totalNum === quick.toString()
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {quick} Qs
                </button>
              ))}
            </div>
          </div>

          {/* Options per question (A, B, C, D) */}
          <div className="flex flex-col gap-1.5 pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Options Per Question
            </label>
            <div className="py-3 px-4 rounded-xl border border-blue-500 bg-blue-600/20 text-blue-300 font-bold text-sm flex items-center justify-between">
              <span>A, B, C, D (4 choices)</span>
              <Check className="w-4 h-4 text-blue-400" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition shadow-md"
            >
              Apply Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
