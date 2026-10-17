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
import { ImportQuestionsModal } from './components/ImportQuestionsModal';
import { SubmitConfirmModal } from './components/SubmitConfirmModal';
import { ActiveModal } from './types';

export default function App() {
  const {
    startQuestion,
    totalQuestions,
    endQuestion,
    currentQuestion,
    answers,
    currentQuestionItem,
    isSubmitted,
    stats,
    evaluation,
    answerCurrent,
    skipCurrent,
    goToNext,
    goToPrevious,
    jumpToQuestion,
    clearCurrentAnswer,
    clearAllAnswers,
    updateRange,
    loadQuestions,
    submitTest,
    retakeTest,
  } = useMCQState();

  const { isInstallable, install } = usePWAInstall();
  const [activeModal, setActiveModal] = useState<ActiveModal>('none');

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Header with Title, Quick Actions, Counters & Post-Submission Evaluation Banner */}
      <Header
        currentQuestion={currentQuestion}
        startQuestion={startQuestion}
        endQuestion={endQuestion}
        totalQuestions={totalQuestions}
        answeredCount={stats.answeredCount}
        unansweredCount={stats.unansweredCount}
        currentAnswer={stats.currentAnswer}
        isSubmitted={isSubmitted}
        evaluation={evaluation}
        onOpenModal={setActiveModal}
        onSubmitTest={() => setActiveModal('submitConfirm')}
        onRetakeTest={retakeTest}
        isPWAInstallable={isInstallable}
        onInstallPWA={install}
      />

      {/* Primary MCQ Area (Question Text, Options A-D, Evaluation Highlighting & Explanations) */}
      <main className="flex-1 flex flex-col justify-center min-h-0 overflow-hidden">
        <AnswerPad
          currentQuestion={currentQuestion}
          questionItem={currentQuestionItem}
          currentAnswer={stats.currentAnswer}
          isSubmitted={isSubmitted}
          onSelectOption={answerCurrent}
          onSkip={skipCurrent}
          onPrevious={goToPrevious}
          onNext={goToNext}
          onOpenImport={() => setActiveModal('importQuestions')}
        />
      </main>

      {/* Bottom Navigation (Prev, Jump, Clear Ans / Review, Next) */}
      <NavigationControls
        currentQuestion={currentQuestion}
        startQuestion={startQuestion}
        endQuestion={endQuestion}
        hasAnswer={stats.hasAnswer}
        isSubmitted={isSubmitted}
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

      {activeModal === 'importQuestions' && (
        <ImportQuestionsModal
          onLoadQuestions={loadQuestions}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'submitConfirm' && (
        <SubmitConfirmModal
          totalQuestions={totalQuestions}
          answeredCount={stats.answeredCount}
          unansweredCount={stats.unansweredCount}
          onConfirm={submitTest}
          onClose={() => setActiveModal('none')}
        />
      )}
    </div>
  );
}
