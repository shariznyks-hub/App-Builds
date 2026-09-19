import React, { useState } from 'react';
import { useMCQState } from './hooks/useMCQState';
import { usePWAInstall } from './hooks/usePWAInstall';
import { Header } from './components/Header';
import { AnswerPad } from './components/AnswerPad';
import { NavigationControls } from './components/NavigationControls';
import { UnansweredModal } from './components/UnansweredModal';
import { ExportModal } from './components/ExportModal';
import { SetupModal } from './components/SetupModal';
import { ClearConfirmModal } from './components/ClearConfirmModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { ActiveModal } from './types';

export default function App() {
  const {
    startQuestion,
    totalQuestions,
    endQuestion,
    currentQuestion,
    optionsCount,
    answers,
    stats,
    answerCurrent,
    skipCurrent,
    goToNext,
    goToPrevious,
    jumpToQuestion,
    clearCurrentAnswer,
    clearAllAnswers,
    updateRange,
  } = useMCQState();

  const { isInstallable, install } = usePWAInstall();
  const [activeModal, setActiveModal] = useState<ActiveModal>('none');

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Header with Title, Status & Counters */}
      <Header
        currentQuestion={currentQuestion}
        startQuestion={startQuestion}
        endQuestion={endQuestion}
        totalQuestions={totalQuestions}
        answeredCount={stats.answeredCount}
        unansweredCount={stats.unansweredCount}
        currentAnswer={stats.currentAnswer}
        onOpenModal={setActiveModal}
        isPWAInstallable={isInstallable}
        onInstallPWA={install}
      />

      {/* Primary MCQ Buttons & Skip (Dominates vertical height) */}
      <main className="flex-1 flex flex-col justify-center min-h-0 overflow-hidden">
        <AnswerPad
          optionsCount={optionsCount}
          currentAnswer={stats.currentAnswer}
          onSelectOption={answerCurrent}
          onSkip={skipCurrent}
          onPrevious={goToPrevious}
          onNext={goToNext}
        />
      </main>

      {/* Bottom Navigation (Prev, Jump, Clear Ans, Next) */}
      <NavigationControls
        currentQuestion={currentQuestion}
        startQuestion={startQuestion}
        endQuestion={endQuestion}
        hasAnswer={stats.hasAnswer}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onClearCurrentAnswer={clearCurrentAnswer}
        onJumpTo={jumpToQuestion}
      />

      {/* Modals & Dialogs */}
      {activeModal === 'unanswered' && (
        <UnansweredModal
          unansweredList={stats.unansweredList}
          onJumpTo={jumpToQuestion}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'export' && (
        <ExportModal
          startQuestion={startQuestion}
          endQuestion={endQuestion}
          answers={answers}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'setup' && (
        <SetupModal
          currentStart={startQuestion}
          currentTotal={totalQuestions}
          currentOptionsCount={optionsCount}
          onSave={updateRange}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'clearConfirm' && (
        <ClearConfirmModal
          answeredCount={stats.answeredCount}
          onConfirm={clearAllAnswers}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'androidInstall' && (
        <AndroidInstallModal
          isPWAInstallable={isInstallable}
          onInstallPWA={install}
          onClose={() => setActiveModal('none')}
        />
      )}
    </div>
  );
}
