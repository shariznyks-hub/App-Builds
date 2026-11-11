import React from 'react';
import {
  Settings,
  Share2,
  Trash2,
  ListOrdered,
  Download,
  FileCode,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  RotateCcw,
  Send,
  Clock,
  Pause,
  Play,
  Target,
  Flame,
  PlayCircle,
} from 'lucide-react';
import { ActiveModal, EvaluationSummary, GamificationState } from '../types';

interface HeaderProps {
  currentQuestion: number;
  startQuestion: number;
  endQuestion: number;
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  currentAnswer?: string;
  isSubmitted: boolean;
  evaluation: EvaluationSummary;
  timeBankStats: {
    baseTime: number;
    carriedOverBankBalance: number;
    currentQSpentTotal: number;
    countdownSeconds: number;
    isOvertime: boolean;
    overtimeSeconds: number;
    globalBankBalance: number;
  };
  isTimerPaused: boolean;
  onToggleTimerPause: () => void;
  targetCount: number;
  processedCount: number;
  gamification: GamificationState;
  onOpenModal: (modal: ActiveModal) => void;
  onSubmitTest: () => void;
  onRetakeTest: () => void;
  isPWAInstallable: boolean;
  onInstallPWA: () => void;
  hasUnfinishedSession: boolean;
  onResumeSession: () => void;
  onStartFreshSession: () => void;
}

// Helpers for timer display
function formatSeconds(totalSec: number): string {
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatBankBalance(totalSec: number): string {
  const isNeg = totalSec < 0;
  const abs = Math.abs(totalSec);
  const mins = Math.floor(abs / 60);
  const secs = abs % 60;
  const sign = isNeg ? '-' : '+';
  return `${sign}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const Header: React.FC<HeaderProps> = ({
  currentQuestion,
  startQuestion,
  endQuestion,
  totalQuestions,
  answeredCount,
  unansweredCount,
  currentAnswer,
  isSubmitted,
  evaluation,
  timeBankStats,
  isTimerPaused,
  onToggleTimerPause,
  targetCount,
  processedCount,
  gamification,
  onOpenModal,
  onSubmitTest,
  onRetakeTest,
  isPWAInstallable,
  onInstallPWA,
  hasUnfinishedSession,
  onResumeSession,
  onStartFreshSession,
}) => {
  const percent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 px-3 sm:px-4 py-2 sm:py-2.5 select-none">
      {/* Top row: App title + Header action controls */}
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Brand identity & Level */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-sm">
            M
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-bold tracking-tight text-white truncate">
              MCQ Answer Pad
            </h1>
            <p className="text-[11px] text-slate-400 font-medium hidden md:block">
              {isSubmitted ? 'Evaluation & Test Review Mode' : 'Adaptive Time Bank & Study Companion'}
            </p>
          </div>
        </div>

        {/* Action icons & Primary Submit/Retake for Desktop (sm+) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Submit/Retake Button (Desktop) */}
          <div className="hidden sm:flex items-center">
            {!isSubmitted ? (
              <button
                id="submit-test-btn"
                onClick={onSubmitTest}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl transition shadow-md shadow-emerald-950/40 active:scale-95"
                title="Submit Test for Evaluation"
              >
                <Send className="w-4 h-4" />
                <span>Submit Test</span>
              </button>
            ) : (
              <button
                id="retake-test-btn"
                onClick={onRetakeTest}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl transition shadow-md active:scale-95"
                title="Retake Quiz / Clear Answers"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Test</span>
              </button>
            )}
          </div>

          {/* Import / Load Questions Modal Button (Desktop) */}
          <button
            id="open-import-btn"
            onClick={() => onOpenModal('importQuestions')}
            className="hidden sm:flex items-center gap-1.5 text-amber-300 hover:text-white bg-slate-800 hover:bg-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-amber-500/40 transition active:scale-95 shadow-sm"
            title="Import or Edit Questions in [Q1]...[/Q1] format"
          >
            <FileCode className="w-4 h-4 text-amber-400" />
            <span>Questions</span>
          </button>

          {/* Analytics / Performance Dashboard Trigger */}
          <button
            id="open-dashboard-btn"
            onClick={() => onOpenModal('performanceDashboard')}
            className="flex items-center gap-1 text-purple-300 hover:text-white bg-slate-800 hover:bg-slate-700 text-xs font-semibold px-2 py-1.5 rounded-lg border border-purple-500/30 transition active:scale-95"
            title="Performance Dashboard & Achievements"
          >
            <Award className="w-4 h-4 text-purple-400" />
            <span className="hidden md:inline">Analytics</span>
          </button>

          {isPWAInstallable && (
            <button
              id="install-pwa-btn"
              onClick={onInstallPWA}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-2 py-1.5 rounded-lg border border-slate-700 transition active:scale-95"
              title="Install on Tablet"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span className="hidden xs:inline">Install</span>
            </button>
          )}

          <button
            id="open-export-btn"
            onClick={() => onOpenModal('export')}
            className="flex items-center gap-1 p-1.5 sm:px-2.5 text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition active:scale-95 text-xs font-semibold"
            title="Export TXT / CSV / Mistakes"
          >
            <Share2 className="w-4 h-4 text-blue-400" />
            <span className="hidden md:inline">Export</span>
          </button>

          <button
            id="open-setup-btn"
            onClick={() => onOpenModal('setup')}
            className="p-1.5 sm:p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition active:scale-95"
            title="Timer, Target, Range & Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {!isSubmitted && (
            <button
              id="open-clear-all-btn"
              onClick={() => onOpenModal('clearConfirm')}
              className="p-1.5 sm:p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 bg-slate-800 rounded-lg border border-slate-700 transition active:scale-95"
              title="Clear all answers"
              aria-label="Clear all answers"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* MOBILE-ONLY DEDICATED ACTION BAR (Ensures Paste Questions & Submit Test are 100% prominent & visible) */}
      <div className="sm:hidden max-w-4xl mx-auto mt-2 grid grid-cols-2 gap-2">
        <button
          id="open-import-btn-mobile"
          onClick={() => onOpenModal('importQuestions')}
          className="flex items-center justify-center gap-1.5 bg-slate-800 active:bg-slate-700 border border-amber-500/50 hover:border-amber-400 text-amber-300 py-1.5 px-2 rounded-xl text-xs font-bold shadow-sm transition active:scale-95 min-w-0"
        >
          <FileCode className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="truncate">Paste Questions</span>
        </button>

        {!isSubmitted ? (
          <button
            id="submit-test-btn-mobile"
            onClick={onSubmitTest}
            className="flex items-center justify-center gap-1.5 bg-emerald-600 active:bg-emerald-500 text-white py-1.5 px-2 rounded-xl text-xs font-bold shadow-sm shadow-emerald-950/50 transition active:scale-95 min-w-0"
          >
            <Send className="w-4 h-4 shrink-0" />
            <span className="truncate">Submit Test</span>
          </button>
        ) : (
          <button
            id="retake-test-btn-mobile"
            onClick={onRetakeTest}
            className="flex items-center justify-center gap-1.5 bg-blue-600 active:bg-blue-500 text-white py-1.5 px-2 rounded-xl text-xs font-bold shadow-sm transition active:scale-95 min-w-0"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span className="truncate">Retake Test</span>
          </button>
        )}
      </div>

      {/* RESUME SESSION PROMPT BANNER */}
      {hasUnfinishedSession && !isSubmitted && (
        <div className="max-w-4xl mx-auto mt-2 bg-blue-950/80 border border-blue-500/40 rounded-xl p-2 sm:px-3 flex items-center justify-between gap-2 shadow-sm animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 min-w-0">
            <PlayCircle className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-[11px] sm:text-xs text-blue-200 truncate">
              <strong>Continue Session:</strong> Question {currentQuestion} / {endQuestion} ({answeredCount} answered)
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onResumeSession}
              className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-lg transition active:scale-95"
            >
              Resume
            </button>
            <button
              onClick={onStartFreshSession}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] sm:text-xs font-medium px-2 py-1 rounded-lg transition"
            >
              Start Fresh
            </button>
          </div>
        </div>
      )}

      {/* EVALUATION SUMMARY BANNER (Shown at top after submission) */}
      {isSubmitted ? (
        <div className="max-w-4xl mx-auto mt-2.5 bg-slate-950 rounded-2xl p-3.5 sm:p-4 border-2 border-emerald-500/40 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                <Award className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
                  Evaluation Summary
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    {evaluation.score} / {evaluation.total}
                  </span>
                  <span className="text-base font-bold text-slate-400">
                    ({evaluation.percentage}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm w-full sm:w-auto">
              <div className="flex-1 sm:flex-initial flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Correct:</span>
                <strong className="text-white text-base">{evaluation.correct}</strong>
              </div>

              <div className="flex-1 sm:flex-initial flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 font-bold">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Incorrect:</span>
                <strong className="text-white text-base">{evaluation.incorrect}</strong>
              </div>

              <div className="flex-1 sm:flex-initial flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Unattempted:</span>
                <strong className="text-white text-base">{evaluation.unattempted}</strong>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ATTEMPT MODE: Primary Status Card with Adaptive Time Bank & Goals */
        <div className="max-w-4xl mx-auto mt-2 bg-slate-950/90 rounded-2xl p-2.5 sm:p-3.5 border border-slate-800 shadow-inner">
          {/* Upper Row: Question index, Adaptive Timer & Target & Streak Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Current Question Display */}
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-[11px] sm:text-xs uppercase tracking-wider font-bold text-slate-400 shrink-0">
                Question
              </span>
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {currentQuestion}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-400 shrink-0">
                / {endQuestion}
              </span>
            </div>

            {/* ADAPTIVE TIME BANK DUAL BADGE */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 shrink-0">
              {/* Play/Pause Button */}
              <button
                type="button"
                onClick={onToggleTimerPause}
                className="text-slate-400 hover:text-white transition p-0.5"
                title={isTimerPaused ? 'Resume Timer' : 'Pause Timer'}
              >
                {isTimerPaused ? (
                  <Play className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Pause className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {/* Question Countdown (Soft Timer with Overtime Warning) */}
              <div className="flex items-center gap-1 font-mono tabular-nums text-xs font-bold">
                {timeBankStats.isOvertime ? (
                  <span
                    className="text-rose-400 flex items-center gap-0.5 animate-pulse"
                    title="Overtime: Extra time consumed reduces future allowance"
                  >
                    <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>+{formatSeconds(timeBankStats.overtimeSeconds)}</span>
                  </span>
                ) : (
                  <span
                    className="text-slate-100 flex items-center gap-0.5"
                    title="Remaining countdown for this question"
                  >
                    <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{formatSeconds(timeBankStats.countdownSeconds)}</span>
                  </span>
                )}
              </div>

              <span className="text-slate-700 text-[10px]">|</span>

              {/* Time Bank Balance (+/-) */}
              <span
                className={`text-[11px] font-mono tabular-nums font-bold ${
                  timeBankStats.globalBankBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
                title="Time Bank Balance (surplus rolls forward, deficit carries to future questions)"
              >
                {formatBankBalance(timeBankStats.globalBankBalance)}
              </span>
            </div>

            {/* Badges: Target, Streak, Selected Answer */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Session Target Pill */}
              <button
                type="button"
                onClick={() => onOpenModal('setup')}
                className="flex items-center gap-1 bg-slate-900 hover:bg-slate-850 px-2 py-1 rounded-xl border border-slate-800 text-[11px] sm:text-xs font-bold text-slate-300 transition"
                title="Custom Session Target: Click to change"
              >
                <Target className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>
                  {processedCount}/{targetCount}
                </span>
              </button>

              {/* Streak */}
              <button
                type="button"
                onClick={() => onOpenModal('performanceDashboard')}
                className="flex items-center gap-1 bg-slate-900 hover:bg-slate-850 px-2 py-1 rounded-xl border border-slate-800 text-[11px] sm:text-xs font-bold text-amber-300 transition"
                title="Current Question Streak: Click for Performance Dashboard"
              >
                <Flame className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{gamification.currentStreak}</span>
              </button>

              {/* Saved Answer Badge */}
              {currentAnswer ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-950/80 border border-blue-500/50 text-blue-300 text-xs font-bold whitespace-nowrap">
                  <span>Ans: <strong className="text-white font-black">{currentAnswer}</strong></span>
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 text-[11px] font-medium whitespace-nowrap">
                  Unanswered
                </span>
              )}
            </div>
          </div>

          {/* Lower Row: Answered / Unanswered triggers & Progress bar */}
          <div className="mt-2 flex items-center justify-between text-xs gap-2">
            <div className="flex items-center flex-wrap gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                <span className="text-slate-400 font-medium text-[11px]">Answered:</span>
                <strong className="text-blue-400 font-bold">{answeredCount}</strong>
              </div>

              <button
                id="unanswered-btn"
                onClick={() => onOpenModal('unanswered')}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-950/40 hover:bg-amber-950/70 border border-amber-600/40 text-amber-300 font-bold transition active:scale-95 text-[11px] whitespace-nowrap"
                title="View all unanswered questions"
              >
                <ListOrdered className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Unanswered:</span>
                <strong className="text-amber-400 font-black">{unansweredCount}</strong>
              </button>
            </div>

            <span className="text-slate-400 font-medium text-[11px] whitespace-nowrap shrink-0">
              {percent}% done
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-1.5 w-full bg-slate-800 rounded-full h-1 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-200 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}
    </header>
  );
};
