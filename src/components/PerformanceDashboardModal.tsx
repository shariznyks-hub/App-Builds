import React from 'react';
import { X, Award, Flame, Zap, Target, CheckCircle2, XCircle, FastForward, RotateCcw } from 'lucide-react';
import { GamificationState } from '../types';

interface PerformanceDashboardModalProps {
  gamification: GamificationState;
  analytics: {
    mistakesFixedCount: number;
    totalMistakesLogged: number;
    sessionAccuracy: number;
    lifetimeAccuracy: number;
    levelProgress: number;
  };
  currentSessionStats: {
    answeredCount: number;
    unansweredCount: number;
    totalQuestions: number;
  };
  evaluationScore: {
    correct: number;
    incorrect: number;
  };
  processedCount: number;
  onClose: () => void;
}

const ALL_ACHIEVEMENTS = [
  { id: 'first_5', title: 'First 5 Questions', desc: 'Processed your first 5 questions', icon: '🌱' },
  { id: 'streak_10', title: '10-Streak Master', desc: '10 consecutive questions processed in one run', icon: '🔥' },
  { id: 'session_25', title: 'Endurance 25', desc: 'Processed 25 questions in a single session', icon: '⚡' },
  { id: 'perfect_session', title: 'Flawless Accuracy', desc: '100% accuracy on a test of 5+ questions', icon: '🎯' },
  { id: 'mistakes_10', title: 'Mistake Crusher', desc: 'Corrected 10 previously incorrect questions', icon: '🛡️' },
];

export const PerformanceDashboardModal: React.FC<PerformanceDashboardModalProps> = ({
  gamification,
  analytics,
  currentSessionStats,
  evaluationScore,
  processedCount,
  onClose,
}) => {
  const skippedCount = Math.max(0, processedCount - currentSessionStats.answeredCount);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-750 w-full max-w-2xl max-h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Performance & Learning Analytics</h2>
              <p className="text-xs text-slate-400">Knowledge improvement and personal achievements</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Level & XP Progression Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold uppercase tracking-wider text-blue-400">Level {gamification.level}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  {gamification.totalXP} Total XP
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {analytics.levelProgress} / 100 XP to Level {gamification.level + 1}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500 rounded-full"
                style={{ width: `${analytics.levelProgress}%` }}
              />
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Current Session & Accuracy
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Questions Processed */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <Target className="w-3.5 h-3.5 text-blue-400" />
                  <span>Processed</span>
                </div>
                <div className="text-xl font-bold text-slate-100 mt-1">{processedCount}</div>
                <span className="text-[10px] text-slate-500">{currentSessionStats.answeredCount} answered, {skippedCount} skipped</span>
              </div>

              {/* Session Accuracy */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Session Acc.</span>
                </div>
                <div className="text-xl font-bold text-emerald-400 mt-1">{analytics.sessionAccuracy}%</div>
                <span className="text-[10px] text-slate-500">Correct / Answered</span>
              </div>

              {/* Lifetime Accuracy */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Overall Acc.</span>
                </div>
                <div className="text-xl font-bold text-amber-400 mt-1">{analytics.lifetimeAccuracy}%</div>
                <span className="text-[10px] text-slate-500">{gamification.totalLifetimeAnswered} lifetime Qs</span>
              </div>

              {/* Mistakes Fixed */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                  <span>Mistakes Fixed</span>
                </div>
                <div className="text-xl font-bold text-purple-400 mt-1">{analytics.mistakesFixedCount}</div>
                <span className="text-[10px] text-slate-500">of {analytics.totalMistakesLogged} logged errors</span>
              </div>
            </div>
          </div>

          {/* Personal Bests Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Personal Bests & Records
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Personal Best Streak</span>
                  <div className="text-2xl font-black text-amber-400 flex items-center gap-1.5 mt-0.5">
                    <Flame className="w-5 h-5 text-amber-500" />
                    <span>{gamification.personalBestStreak}</span>
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-medium">Consecutive Qs</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Best Single Session</span>
                  <div className="text-2xl font-black text-blue-400 flex items-center gap-1.5 mt-0.5">
                    <Target className="w-5 h-5 text-blue-500" />
                    <span>{gamification.bestSessionQuestions}</span>
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-medium">Max Processed</span>
              </div>
            </div>
          </div>

          {/* Achievements Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Unlocked Achievements ({gamification.unlockedAchievements.length} / {ALL_ACHIEVEMENTS.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ALL_ACHIEVEMENTS.map((ach) => {
                const isUnlocked = gamification.unlockedAchievements.includes(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                      isUnlocked
                        ? 'bg-slate-950 border-amber-500/30 text-slate-100 shadow-sm'
                        : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{ach.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-bold truncate">{ach.title}</span>
                        {isUnlocked && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-bold">
                            Unlocked
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{ach.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
