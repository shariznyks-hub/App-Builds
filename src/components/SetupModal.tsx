import React, { useState } from 'react';
import { X, Check, Clock, Target, Volume2, Vibrate } from 'lucide-react';
import { AppSettings } from '../types';

interface SetupModalProps {
  currentStart: number;
  currentTotal: number;
  currentOptionsCount?: number;
  settings: AppSettings;
  currentTargetCount: number;
  onSave: (newStart: number, newTotal: number) => void;
  onSaveSettings: (newSettings: Partial<AppSettings>) => void;
  onSaveTarget: (newTarget: number) => void;
  onClose: () => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({
  currentStart,
  currentTotal,
  settings,
  currentTargetCount,
  onSave,
  onSaveSettings,
  onSaveTarget,
  onClose,
}) => {
  const [startNum, setStartNum] = useState<string>(currentStart.toString());
  const [totalNum, setTotalNum] = useState<string>(currentTotal.toString());
  const [baseTime, setBaseTime] = useState<string>(settings.baseTimePerQuestion.toString());
  const [targetNum, setTargetNum] = useState<string>(currentTargetCount.toString());
  const [soundOn, setSoundOn] = useState<boolean>(settings.soundEnabled);
  const [hapticOn, setHapticOn] = useState<boolean>(settings.hapticEnabled);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const s = parseInt(startNum, 10);
    const t = parseInt(totalNum, 10);
    const bTime = parseInt(baseTime, 10);
    const targetVal = parseInt(targetNum, 10);

    if (isNaN(s) || s < 1) {
      setError('Start question number must be at least 1.');
      return;
    }
    if (isNaN(t) || t < 1 || t > 500) {
      setError('Total questions must be between 1 and 500.');
      return;
    }
    if (isNaN(bTime) || bTime < 5) {
      setError('Base time per question must be at least 5 seconds.');
      return;
    }
    if (isNaN(targetVal) || targetVal < 1) {
      setError('Session target must be at least 1 question.');
      return;
    }

    onSave(s, t);
    onSaveSettings({
      baseTimePerQuestion: bTime,
      soundEnabled: soundOn,
      hapticEnabled: hapticOn,
    });
    onSaveTarget(targetVal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-750 w-full max-w-lg max-h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Application Settings</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Timer, targets, sound, and question bounds
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
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex flex-col gap-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Time Bank Base Time Setting */}
          <div className="flex flex-col gap-1.5 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Time Bank: Base Time Per Question (Seconds)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Unused seconds roll into your Time Bank; extra seconds reduce subsequent time.
            </p>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                min="5"
                max="999"
                value={baseTime}
                onChange={(e) => {
                  setBaseTime(e.target.value);
                  setError(null);
                }}
                className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2 text-white text-base font-bold focus:outline-none"
                placeholder="60"
                required
              />
            </div>
            <div className="flex gap-2 mt-1">
              {[30, 45, 60, 90, 120].map((sec) => (
                <button
                  type="button"
                  key={sec}
                  onClick={() => setBaseTime(sec.toString())}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition ${
                    baseTime === sec.toString()
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Custom Session Target Setting */}
          <div className="flex flex-col gap-1.5 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Target className="w-3.5 h-3.5" />
              <span>Session Target (Number of Questions)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Set any custom number of questions to process (answered or skipped) in this run.
            </p>
            <input
              type="number"
              min="1"
              max="500"
              value={targetNum}
              onChange={(e) => {
                setTargetNum(e.target.value);
                setError(null);
              }}
              className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2 text-white text-base font-bold focus:outline-none"
              placeholder="10"
              required
            />
            <div className="flex gap-2 mt-1">
              {[5, 10, 15, 25, 50].map((count) => (
                <button
                  type="button"
                  key={count}
                  onClick={() => setTargetNum(count.toString())}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition ${
                    targetNum === count.toString()
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {count} Qs
                </button>
              ))}
            </div>
          </div>

          {/* Sound & Haptic Feedback Toggles */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSoundOn(!soundOn)}
              className={`p-3 rounded-xl border flex items-center justify-between transition ${
                soundOn
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <span className="text-xs font-bold">Sound Effects</span>
              </div>
              <span className="text-xs font-black">{soundOn ? 'ON' : 'OFF'}</span>
            </button>

            <button
              type="button"
              onClick={() => setHapticOn(!hapticOn)}
              className={`p-3 rounded-xl border flex items-center justify-between transition ${
                hapticOn
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <Vibrate className="w-4 h-4" />
                <span className="text-xs font-bold">Haptic Feedback</span>
              </div>
              <span className="text-xs font-black">{hapticOn ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Start Question Number & Total Questions */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Start Question #
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
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-white text-base font-bold focus:outline-none"
                placeholder="1"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Total Questions
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
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-white text-base font-bold focus:outline-none"
                placeholder="500"
                required
              />
            </div>
          </div>

          {/* Options per question info */}
          <div className="py-2.5 px-3.5 rounded-xl border border-blue-500/30 bg-blue-600/10 text-blue-300 font-bold text-xs flex items-center justify-between">
            <span>Options: A, B, C, D (4 choices)</span>
            <Check className="w-4 h-4 text-blue-400" />
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
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
