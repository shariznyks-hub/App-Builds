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
import { TargetCompletedModal } from './components/TargetCompletedModal';
import { PerformanceDashboardModal } from './components/PerformanceDashboardModal';
import { CelebrationEffects } from './components/CelebrationEffects';
import { ActiveModal } from './types';

export default function App() {
  const {
    startQuestion,
    totalQuestions,
    endQuestion,
    currentQuestion,
    answers,
    questions,
    currentQuestionItem,
    isSubmitted,
    stats,
    evaluation,
    timeBankStats,
    isTimerPaused,
    toggleTimerPause,
    targetState,
    updateTargetCount,
    continueWithNewTarget,
    dismissTargetModal,
    gamification,
    analytics,
    settings,
    updateSettings,
    hasUnfinishedSession,
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
  const [resumeBannerDismissed, setResumeBannerDismissed] = useState<boolean>(false);

  // Auto trigger target modal when target is reached
  const showTargetCompleted = targetState.isCompleted && !targetState.dismissed;

  const handleResumeSession = () => {
    setResumeBannerDismissed(true);
  };

  const handleStartFreshSession = () => {
    setActiveModal('clearConfirm');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Visual Celebration Overlays (Target reached, streak milestone) */}
      <CelebrationEffects
        trigger={showTargetCompleted}
        title="🎯 Session Target Completed!"
        subtitle={`${targetState.processedQuestions.length} Questions Processed (+${gamification.sessionXP} XP)`}
      />

      {/* Header with Title, Quick Actions, Adaptive Time Bank & Goals */}
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
        timeBankStats={timeBankStats}
        isTimerPaused={isTimerPaused}
        onToggleTimerPause={toggleTimerPause}
        targetCount={targetState.targetCount}
        processedCount={targetState.processedQuestions.length}
        gamification={gamification}
        onOpenModal={setActiveModal}
        onSubmitTest={() => setActiveModal('submitConfirm')}
        onRetakeTest={retakeTest}
        isPWAInstallable={isInstallable}
        onInstallPWA={install}
        hasUnfinishedSession={hasUnfinishedSession && !resumeBannerDismissed}
        onResumeSession={handleResumeSession}
        onStartFreshSession={handleStartFreshSession}
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

      {/* Target Completed Dialog */}
      {showTargetCompleted && (
        <TargetCompletedModal
          processedCount={targetState.processedQuestions.length}
          answeredCount={stats.answeredCount}
          targetCount={targetState.targetCount}
          sessionXP={gamification.sessionXP}
          currentStreak={gamification.currentStreak}
          timeBankBalance={timeBankStats.globalBankBalance}
          onContinueWithNewTarget={(newTarget) => continueWithNewTarget(newTarget)}
          onPauseAndSave={() => {
            if (!isTimerPaused) toggleTimerPause();
            dismissTargetModal();
          }}
          onEndSession={() => {
            if (!isTimerPaused) toggleTimerPause();
            dismissTargetModal();
          }}
        />
      )}

      {/* Performance & Learning Analytics Dashboard */}
      {activeModal === 'performanceDashboard' && (
        <PerformanceDashboardModal
          gamification={gamification}
          analytics={analytics}
          currentSessionStats={{
            answeredCount: stats.answeredCount,
            unansweredCount: stats.unansweredCount,
            totalQuestions: totalQuestions,
          }}
          evaluationScore={{
            correct: evaluation.correct,
            incorrect: evaluation.incorrect,
          }}
          processedCount={targetState.processedQuestions.length}
          onClose={() => setActiveModal('none')}
        />
      )}

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
          questions={questions}
          isSubmitted={isSubmitted}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'setup' && (
        <SetupModal
          currentStart={startQuestion}
          currentTotal={totalQuestions}
          settings={settings}
          currentTargetCount={targetState.targetCount}
          onSave={updateRange}
          onSaveSettings={updateSettings}
          onSaveTarget={updateTargetCount}
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
