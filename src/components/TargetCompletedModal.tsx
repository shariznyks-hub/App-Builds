import React, { useState } from 'react';
import { Target, CheckCircle2, FastForward, Flame, Zap, Clock, ArrowRight, Pause, StopCircle } from 'lucide-react';

interface TargetCompletedModalProps {
  processedCount: number;
  answeredCount: number;
  targetCount: number;
  sessionXP: number;
  currentStreak: number;
  timeBankBalance: number;
  onContinueWithNewTarget: (newTarget: number) => void;
  onPauseAndSave: () => void;
  onEndSession: () => void;
}

export const TargetCompletedModal: React.FC<TargetCompletedModalProps> = ({
  processedCount,
  answeredCount,
  targetCount,
  sessionXP,
  currentStreak,
  timeBankBalance,
  onContinueWithNewTarget,
  onPauseAndSave,
  onEndSession,
}) => {
  const [newTargetInput, setNewTargetInput] = useState<string>((targetCount + 10).toString());
  const skippedCount = Math.max(0, processedCount - answeredCount);

  // Format time bank (+01:15 or -00:30)
  const formatTimeBank = (totalSeconds: number) => {
    const isNeg = totalSeconds < 0;
    const abs = Math.abs(totalSeconds);
    const mins = Math.floor(abs / 60);
    const secs = abs % 60;
    const sign = isNeg ? '-' : '+';
    return `${sign}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(newTargetInput, 10);
    if (!isNaN(val) && val > processedCount) {
      onContinueWithNewTarget(val);
    } else {
      onContinueWithNewTarget(processedCount + 10);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-emerald-500/40 w-full max-w-lg rounded-3xl flex flex-col shadow-2xl shadow-emerald-950/40 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/60 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Target Completed!</h2>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Goal Reached
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              You processed {processedCount} questions in this practice run.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-5 sm:p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* Processed */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Processed</span>
              <span className="text-lg font-black text-slate-100">{processedCount} Qs</span>
            </div>

            {/* Answered */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Answered</span>
              </div>
              <span className="text-lg font-black text-emerald-300">{answeredCount}</span>
            </div>

            {/* Skipped */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                <FastForward className="w-3.5 h-3.5" />
                <span>Skipped</span>
              </div>
              <span className="text-lg font-black text-amber-300">{skippedCount}</span>
            </div>

            {/* XP Earned */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                <span>Session XP</span>
              </div>
              <span className="text-lg font-black text-blue-300">+{sessionXP} XP</span>
            </div>

            {/* Streak */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5" />
                <span>Current Streak</span>
              </div>
              <span className="text-lg font-black text-amber-300">{currentStreak}</span>
            </div>

            {/* Time Bank Balance */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                <span>Time Bank</span>
              </div>
              <span
                className={`text-lg font-black font-mono tabular-nums ${
                  timeBankBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatTimeBank(timeBankBalance)}
              </span>
            </div>
          </div>

          {/* Form to continue with new target */}
          <form onSubmit={handleContinue} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5">
            <label className="text-xs font-bold text-slate-300">
              Continue with a new question target:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={processedCount + 1}
                max={500}
                value={newTargetInput}
                onChange={(e) => setNewTargetInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-white font-bold text-base focus:outline-none"
                placeholder={(processedCount + 10).toString()}
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition shadow-md shrink-0 active:scale-95"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Choices: Pause & Save or End Session */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={onPauseAndSave}
              className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold border border-slate-700 transition active:scale-95"
            >
              <Pause className="w-4 h-4 text-amber-400" />
              <span>Pause & Save</span>
            </button>

            <button
              type="button"
              onClick={onEndSession}
              className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold border border-slate-700 transition active:scale-95"
            >
              <StopCircle className="w-4 h-4 text-rose-400" />
              <span>End Session</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
