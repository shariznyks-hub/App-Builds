import React from 'react';
import { Settings, Share2, Trash2, ListOrdered, Download, Tablet } from 'lucide-react';
import { ActiveModal } from '../types';

interface HeaderProps {
  currentQuestion: number;
  startQuestion: number;
  endQuestion: number;
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  currentAnswer?: string;
  onOpenModal: (modal: ActiveModal) => void;
  isPWAInstallable: boolean;
  onInstallPWA: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentQuestion,
  startQuestion,
  endQuestion,
  totalQuestions,
  answeredCount,
  unansweredCount,
  currentAnswer,
  onOpenModal,
  isPWAInstallable,
  onInstallPWA,
}) => {
  const percent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 px-4 py-3 select-none">
      {/* Top row: App title + Quick actions */}
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-lg shadow-sm">
            M
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              MCQ Answer Pad
            </h1>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Offline Tablet Companion
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {isPWAInstallable && (
            <button
              id="install-pwa-btn"
              onClick={onInstallPWA}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition active:scale-95"
              title="Install on Tablet"
            >
              <Download className="w-4 h-4" />
              <span className="hidden xs:inline">Install</span>
            </button>
          )}

          <button
            id="open-install-guide-btn"
            onClick={() => onOpenModal('androidInstall')}
            className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-700 transition active:scale-95"
            title="Install APK or PWA on Tablet"
          >
            <Tablet className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Tablet / APK</span>
          </button>

          <button
            id="open-setup-btn"
            onClick={() => onOpenModal('setup')}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition active:scale-95"
            title="Question Range & Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            id="open-export-btn"
            onClick={() => onOpenModal('export')}
            className="flex items-center gap-1.5 p-2 sm:px-3 text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition active:scale-95 text-xs font-semibold"
            title="Export TXT / CSV"
          >
            <Share2 className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            id="open-clear-all-btn"
            onClick={() => onOpenModal('clearConfirm')}
            className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 bg-slate-800 rounded-lg border border-slate-700 transition active:scale-95"
            title="Clear all answers"
            aria-label="Clear all answers"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Status Card */}
      <div className="max-w-4xl mx-auto mt-3 bg-slate-950/80 rounded-2xl p-3.5 sm:p-4 border border-slate-800/80 shadow-inner">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Current Question Display (Huge & High Contrast) */}
          <div className="flex items-baseline gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
              Question
            </span>
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {currentQuestion}
            </span>
            <span className="text-base sm:text-lg font-semibold text-slate-400">
              / {endQuestion}
            </span>
          </div>

          {/* Current saved answer badge */}
          <div>
            {currentAnswer ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-sm sm:text-base font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Saved: <strong className="text-emerald-200 text-lg sm:text-xl font-black">{currentAnswer}</strong>
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-400 text-xs sm:text-sm font-medium">
                Unanswered
              </span>
            )}
          </div>
        </div>

        {/* Stats Row & Unanswered trigger */}
        <div className="mt-3 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-300 font-medium">Answered:</span>
              <strong className="text-emerald-400 font-bold">{answeredCount}</strong>
            </div>

            <button
              id="unanswered-btn"
              onClick={() => onOpenModal('unanswered')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/40 hover:bg-amber-950/70 border border-amber-600/40 text-amber-300 font-bold transition active:scale-95"
              title="Click to view all unanswered questions and jump to them"
            >
              <ListOrdered className="w-3.5 h-3.5 text-amber-400" />
              <span>Unanswered:</span>
              <strong className="text-amber-400 font-black">{unansweredCount}</strong>
            </button>
          </div>

          <span className="text-slate-400 font-medium hidden xs:inline">
            {percent}% done
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-2.5 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-200 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </header>
  );
};
