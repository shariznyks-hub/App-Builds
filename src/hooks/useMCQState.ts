import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  MCQOption,
  MCQQuestionItem,
  EvaluationSummary,
  AppSettings,
  GamificationState,
  SessionTargetState,
  QuestionHistoryItem,
} from '../types';
import { parseMCQInput, SAMPLE_MCQ_INPUT } from '../utils/mcqParser';
import { soundManager } from '../utils/soundEffects';

const STORAGE_KEY_ANSWERS = 'mcq_answer_pad_answers_v1';
const STORAGE_KEY_CONFIG = 'mcq_answer_pad_config_v1';
const STORAGE_KEY_QUESTIONS = 'mcq_answer_pad_questions_v1';
const STORAGE_KEY_SUBMITTED = 'mcq_answer_pad_submitted_v1';
const STORAGE_KEY_SETTINGS = 'mcq_answer_pad_settings_v2';
const STORAGE_KEY_TIMING = 'mcq_answer_pad_timing_v2';
const STORAGE_KEY_TARGET = 'mcq_answer_pad_target_v2';
const STORAGE_KEY_GAMIFICATION = 'mcq_answer_pad_gamification_v2';

// Question unique key generator for history tracking
export function getQuestionKey(item: MCQQuestionItem): string {
  const cleanText = item.questionText.trim().toLowerCase().slice(0, 80);
  return `${cleanText}_${item.correctAnswer}`;
}

export function useMCQState() {
  // App Settings (Base time, sound, haptic)
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          baseTimePerQuestion: Math.max(5, typeof parsed.baseTimePerQuestion === 'number' ? parsed.baseTimePerQuestion : 60),
          soundEnabled: parsed.soundEnabled ?? true,
          hapticEnabled: parsed.hapticEnabled ?? true,
        };
      }
    } catch {
      // ignore
    }
    return {
      baseTimePerQuestion: 60,
      soundEnabled: true,
      hapticEnabled: true,
    };
  });

  // Sync sound manager with preferences
  useEffect(() => {
    soundManager.setPreferences(settings.soundEnabled, settings.hapticEnabled);
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Questions list (parsed from [Q1] ... [/Q1] format)
  const [questions, setQuestions] = useState<MCQQuestionItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUESTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return parseMCQInput(SAMPLE_MCQ_INPUT);
  });

  // Submission / Evaluation status
  const [isSubmitted, setIsSubmitted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUBMITTED);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // Start question number
  const [startQuestion, setStartQuestion] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.startQuestion === 'number' && parsed.startQuestion >= 1) {
          return parsed.startQuestion;
        }
      }
    } catch {
      // ignore
    }
    return 1;
  });

  // Total questions count
  const [totalQuestions, setTotalQuestions] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.totalQuestions === 'number' && parsed.totalQuestions >= 1) {
          return Math.min(parsed.totalQuestions, 500);
        }
      }
    } catch {
      // ignore
    }
    return 3;
  });

  // Current active question
  const [currentQuestion, setCurrentQuestion] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.currentQuestion === 'number' && parsed.currentQuestion >= 1) {
          return parsed.currentQuestion;
        }
      }
    } catch {
      // ignore
    }
    return 1;
  });

  const [optionsCount, setOptionsCount] = useState<4>(4);

  // Answers map: { [questionNumber]: 'A' | 'B' | 'C' | 'D' }
  const [answers, setAnswers] = useState<Record<number, MCQOption>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ANSWERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        const sanitized: Record<number, MCQOption> = {};
        for (const [k, v] of Object.entries(parsed)) {
          if (v === 'A' || v === 'B' || v === 'C' || v === 'D') {
            sanitized[Number(k)] = v as MCQOption;
          }
        }
        return sanitized;
      }
    } catch {
      // ignore
    }
    return {};
  });

  // ----------------------------------------------------
  // FEATURE 1: ADAPTIVE TIME BANK TIMER
  // ----------------------------------------------------
  // Stored seconds spent per question: { [qNum]: seconds }
  const [questionTimings, setQuestionTimings] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TIMING);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.questionTimings && typeof parsed.questionTimings === 'object') {
          return parsed.questionTimings;
        }
      }
    } catch {
      // ignore
    }
    return {};
  });

  // Unique questions that have been visited/allocated base time
  const [visitedQuestions, setVisitedQuestions] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TIMING);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.visitedQuestions)) {
          return parsed.visitedQuestions;
        }
      }
    } catch {
      // ignore
    }
    return [1];
  });

  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  // Current in-memory elapsed milliseconds for the active question visit
  const [activeElapsedMs, setActiveElapsedMs] = useState<number>(0);
  const visitStartRef = useRef<number>(Date.now());

  // Save timing state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_TIMING,
        JSON.stringify({
          questionTimings,
          visitedQuestions,
        })
      );
    } catch {
      // ignore
    }
  }, [questionTimings, visitedQuestions]);

  // Ensure current question is added to visitedQuestions
  useEffect(() => {
    setVisitedQuestions((prev) => {
      if (!prev.includes(currentQuestion)) {
        return [...prev, currentQuestion];
      }
      return prev;
    });
    // Reset visit start reference whenever current question changes
    visitStartRef.current = Date.now();
    setActiveElapsedMs(0);
  }, [currentQuestion]);

  // Timer Tick Interval using Date.now() delta tracking to prevent drift
  useEffect(() => {
    if (isSubmitted || isTimerPaused) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - visitStartRef.current;
      setActiveElapsedMs(Math.max(0, delta));
    }, 250);

    return () => clearInterval(interval);
  }, [isSubmitted, isTimerPaused]);

  // Commit active visit time to questionTimings
  const commitCurrentQuestionTime = useCallback(() => {
    const elapsedSec = Math.round(activeElapsedMs / 1000);
    if (elapsedSec > 0) {
      setQuestionTimings((prev) => ({
        ...prev,
        [currentQuestion]: (prev[currentQuestion] || 0) + elapsedSec,
      }));
    }
    visitStartRef.current = Date.now();
    setActiveElapsedMs(0);
  }, [activeElapsedMs, currentQuestion]);

  // Time Bank calculation
  // Total base time allocated = (count of visited questions) * baseTimePerQuestion
  // Total time consumed = sum of all questionTimings + activeElapsedMs
  const timeBankStats = useMemo(() => {
    const baseTime = settings.baseTimePerQuestion;
    const currentQSpentPrior = questionTimings[currentQuestion] || 0;
    const currentQSpentTotal = currentQSpentPrior + Math.floor(activeElapsedMs / 1000);

    // Sum of time spent on all other questions
    let otherQuestionsSpent = 0;
    for (const [qStr, sec] of Object.entries(questionTimings)) {
      const qNum = Number(qStr);
      if (qNum !== currentQuestion) {
        otherQuestionsSpent += sec;
      }
    }

    // Number of other questions that were visited
    const otherVisitedCount = visitedQuestions.filter((q) => q !== currentQuestion).length;
    // Bank balance carried over from previous questions
    const carriedOverBankBalance = otherVisitedCount * baseTime - otherQuestionsSpent;

    // Available for current question = baseTime + carriedOverBankBalance - currentQSpentTotal
    const available = baseTime + carriedOverBankBalance - currentQSpentTotal;
    const isOvertime = available < 0;
    const countdownSeconds = Math.max(0, available);
    const overtimeSeconds = Math.max(0, -available);

    // Global overall bank balance right now
    const globalBankBalance = visitedQuestions.length * baseTime - (otherQuestionsSpent + currentQSpentTotal);

    return {
      baseTime,
      carriedOverBankBalance,
      currentQSpentTotal,
      countdownSeconds,
      isOvertime,
      overtimeSeconds,
      globalBankBalance,
    };
  }, [settings.baseTimePerQuestion, questionTimings, currentQuestion, activeElapsedMs, visitedQuestions]);

  // Toggle timer pause
  const toggleTimerPause = useCallback(() => {
    commitCurrentQuestionTime();
    setIsTimerPaused((prev) => !prev);
  }, [commitCurrentQuestionTime]);

  // ----------------------------------------------------
  // FEATURE 2 & 9: CUSTOM SESSION TARGET
  // ----------------------------------------------------
  const [targetState, setTargetState] = useState<SessionTargetState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TARGET);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          targetCount: typeof parsed.targetCount === 'number' && parsed.targetCount >= 1 ? parsed.targetCount : 10,
          processedQuestions: Array.isArray(parsed.processedQuestions) ? parsed.processedQuestions : [],
          isCompleted: Boolean(parsed.isCompleted),
          dismissed: Boolean(parsed.dismissed),
        };
      }
    } catch {
      // ignore
    }
    return {
      targetCount: 10,
      processedQuestions: [],
      isCompleted: false,
      dismissed: false,
    };
  });

  // Persist target state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TARGET, JSON.stringify(targetState));
    } catch {
      // ignore
    }
  }, [targetState]);

  // Update target on the fly
  const updateTargetCount = useCallback((newCount: number) => {
    const valid = Math.max(1, newCount);
    setTargetState((prev) => ({
      ...prev,
      targetCount: valid,
      isCompleted: prev.processedQuestions.length >= valid,
      dismissed: false,
    }));
  }, []);

  // Continue target with another target
  const continueWithNewTarget = useCallback((newCount: number) => {
    const valid = Math.max(targetState.processedQuestions.length + 1, newCount);
    setTargetState((prev) => ({
      ...prev,
      targetCount: valid,
      isCompleted: false,
      dismissed: false,
    }));
  }, [targetState.processedQuestions.length]);

  const dismissTargetModal = useCallback(() => {
    setTargetState((prev) => ({ ...prev, dismissed: true }));
  }, []);

  // ----------------------------------------------------
  // FEATURE 3, 4, 5, 6, 12: GAMIFICATION & LEARNING ANALYTICS
  // ----------------------------------------------------
  const [gamification, setGamification] = useState<GamificationState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GAMIFICATION);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          totalXP: parsed.totalXP || 0,
          sessionXP: parsed.sessionXP || 0,
          level: parsed.level || 1,
          currentStreak: parsed.currentStreak || 0,
          personalBestStreak: parsed.personalBestStreak || 0,
          bestSessionQuestions: parsed.bestSessionQuestions || 0,
          unlockedAchievements: Array.isArray(parsed.unlockedAchievements) ? parsed.unlockedAchievements : [],
          questionHistory: parsed.questionHistory && typeof parsed.questionHistory === 'object' ? parsed.questionHistory : {},
          totalLifetimeAnswered: parsed.totalLifetimeAnswered || 0,
          totalLifetimeCorrect: parsed.totalLifetimeCorrect || 0,
        };
      }
    } catch {
      // ignore
    }
    return {
      totalXP: 0,
      sessionXP: 0,
      level: 1,
      currentStreak: 0,
      personalBestStreak: 0,
      bestSessionQuestions: 0,
      unlockedAchievements: [],
      questionHistory: {},
      totalLifetimeAnswered: 0,
      totalLifetimeCorrect: 0,
    };
  });

  // Persist gamification
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_GAMIFICATION, JSON.stringify(gamification));
    } catch {
      // ignore
    }
  }, [gamification]);

  // Record a processed question (answer or skip) for target & streak & XP
  const recordQuestionProcessed = useCallback(
    (qNum: number, _isSkip: boolean) => {
      // Check if already processed in this session
      const alreadyProcessedInSession = targetState.processedQuestions.includes(qNum);

      let newProcessedList = targetState.processedQuestions;
      if (!alreadyProcessedInSession) {
        newProcessedList = [...targetState.processedQuestions, qNum];
      }

      // Target completion check
      const willCompleteTarget =
        newProcessedList.length >= targetState.targetCount && !targetState.isCompleted;

      if (!alreadyProcessedInSession) {
        setTargetState((prev) => ({
          ...prev,
          processedQuestions: newProcessedList,
          isCompleted: prev.isCompleted || willCompleteTarget,
        }));
      }

      if (willCompleteTarget) {
        soundManager.playTargetCompleted();
        soundManager.triggerHaptic([50, 100, 50]);
      }

      // Streak & XP (Only award on first processing in this session)
      if (!alreadyProcessedInSession) {
        setGamification((prev) => {
          const newStreak = prev.currentStreak + 1;
          const newBestStreak = Math.max(prev.personalBestStreak, newStreak);
          const xpGain = 5; // +5 XP for processing
          const newTotalXP = prev.totalXP + xpGain;
          const newSessionXP = prev.sessionXP + xpGain;
          const newLevel = 1 + Math.floor(newTotalXP / 100);

          // Check streak milestones (5, 10, 20, 50)
          if ([5, 10, 20, 50].includes(newStreak)) {
            soundManager.playMilestone();
            soundManager.triggerHaptic(40);
          }

          // Check Achievements
          const achievements = [...prev.unlockedAchievements];
          if (newProcessedList.length >= 5 && !achievements.includes('first_5')) {
            achievements.push('first_5');
          }
          if (newProcessedList.length >= 25 && !achievements.includes('session_25')) {
            achievements.push('session_25');
          }
          if (newBestStreak >= 10 && !achievements.includes('streak_10')) {
            achievements.push('streak_10');
          }

          return {
            ...prev,
            totalXP: newTotalXP,
            sessionXP: newSessionXP,
            level: newLevel,
            currentStreak: newStreak,
            personalBestStreak: newBestStreak,
            bestSessionQuestions: Math.max(prev.bestSessionQuestions, newProcessedList.length),
            unlockedAchievements: achievements,
          };
        });
      }
    },
    [targetState]
  );

  // ----------------------------------------------------
  // NAVIGATION & ANSWER ACTIONS
  // ----------------------------------------------------
  const endQuestion = useMemo(() => {
    return startQuestion + totalQuestions - 1;
  }, [startQuestion, totalQuestions]);

  // Keep currentQuestion within valid range
  useEffect(() => {
    if (currentQuestion < startQuestion) {
      setCurrentQuestion(startQuestion);
    } else if (currentQuestion > endQuestion) {
      setCurrentQuestion(endQuestion);
    }
  }, [startQuestion, endQuestion, currentQuestion]);

  // Persist config
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_CONFIG,
        JSON.stringify({
          startQuestion,
          totalQuestions,
          currentQuestion,
          optionsCount,
        })
      );
    } catch {
      // ignore
    }
  }, [startQuestion, totalQuestions, currentQuestion, optionsCount]);

  // Persist answers
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ANSWERS, JSON.stringify(answers));
    } catch {
      // ignore
    }
  }, [answers]);

  // Persist questions
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_QUESTIONS, JSON.stringify(questions));
    } catch {
      // ignore
    }
  }, [questions]);

  // Persist isSubmitted
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SUBMITTED, String(isSubmitted));
    } catch {
      // ignore
    }
  }, [isSubmitted]);

  // Answer current question
  const answerCurrent = useCallback(
    (option: MCQOption) => {
      if (isSubmitted) return;

      commitCurrentQuestionTime();
      soundManager.playSelect();
      soundManager.triggerHaptic(20);

      setAnswers((prev) => ({
        ...prev,
        [currentQuestion]: option,
      }));

      recordQuestionProcessed(currentQuestion, false);

      // Advance
      if (currentQuestion < endQuestion) {
        setCurrentQuestion((prev) => prev + 1);
      }
    },
    [isSubmitted, commitCurrentQuestionTime, currentQuestion, endQuestion, recordQuestionProcessed]
  );

  // Skip current question
  const skipCurrent = useCallback(() => {
    commitCurrentQuestionTime();
    soundManager.playClick();
    soundManager.triggerHaptic(15);

    recordQuestionProcessed(currentQuestion, true);

    if (currentQuestion < endQuestion) {
      setCurrentQuestion((prev) => prev + 1);
    }
  }, [commitCurrentQuestionTime, currentQuestion, endQuestion, recordQuestionProcessed]);

  // Navigation: Next
  const goToNext = useCallback(() => {
    commitCurrentQuestionTime();
    soundManager.playClick();
    soundManager.triggerHaptic(15);
    if (currentQuestion < endQuestion) {
      setCurrentQuestion((prev) => prev + 1);
    }
  }, [commitCurrentQuestionTime, currentQuestion, endQuestion]);

  // Navigation: Previous
  const goToPrevious = useCallback(() => {
    commitCurrentQuestionTime();
    soundManager.playClick();
    soundManager.triggerHaptic(15);
    if (currentQuestion > startQuestion) {
      setCurrentQuestion((prev) => prev - 1);
    }
  }, [commitCurrentQuestionTime, currentQuestion, startQuestion]);

  // Jump directly to specific question
  const jumpToQuestion = useCallback(
    (qNum: number) => {
      commitCurrentQuestionTime();
      soundManager.playClick();
      soundManager.triggerHaptic(15);
      const clamped = Math.max(startQuestion, Math.min(qNum, endQuestion));
      setCurrentQuestion(clamped);
    },
    [commitCurrentQuestionTime, startQuestion, endQuestion]
  );

  // Clear answer for current question
  const clearCurrentAnswer = useCallback(() => {
    if (isSubmitted) return;
    soundManager.playClick();
    soundManager.triggerHaptic(25);
    setAnswers((prev) => {
      const updated = { ...prev };
      delete updated[currentQuestion];
      return updated;
    });
  }, [currentQuestion, isSubmitted]);

  // Clear all answers & restart session
  const clearAllAnswers = useCallback(() => {
    commitCurrentQuestionTime();
    soundManager.playClick();
    soundManager.triggerHaptic(35);
    setAnswers({});
    setCurrentQuestion(startQuestion);
    setIsSubmitted(false);
    setQuestionTimings({});
    setVisitedQuestions([startQuestion]);
    setTargetState((prev) => ({
      ...prev,
      processedQuestions: [],
      isCompleted: false,
      dismissed: false,
    }));
    setGamification((prev) => ({
      ...prev,
      currentStreak: 0,
      sessionXP: 0,
    }));
  }, [commitCurrentQuestionTime, startQuestion]);

  // Update question range manually
  const updateRange = useCallback(
    (newStart: number, newTotal: number, _newOptions?: number) => {
      commitCurrentQuestionTime();
      const validStart = Math.max(1, Math.min(newStart, 1000));
      const validTotal = Math.max(1, Math.min(newTotal, 500));
      setStartQuestion(validStart);
      setTotalQuestions(validTotal);
      setOptionsCount(4);
      setCurrentQuestion(validStart);
      setIsSubmitted(false);
    },
    [commitCurrentQuestionTime]
  );

  // Load imported questions
  const loadQuestions = useCallback(
    (rawText: string): boolean => {
      const parsed = parseMCQInput(rawText);
      if (parsed.length === 0) {
        return false;
      }
      commitCurrentQuestionTime();
      const start = parsed[0]?.questionNumber || 1;
      const total = parsed.length;

      setQuestions(parsed);
      setStartQuestion(start);
      setTotalQuestions(total);
      setCurrentQuestion(start);
      setAnswers({});
      setIsSubmitted(false);
      setQuestionTimings({});
      setVisitedQuestions([start]);
      setTargetState((prev) => ({
        ...prev,
        processedQuestions: [],
        isCompleted: false,
        dismissed: false,
      }));
      return true;
    },
    [commitCurrentQuestionTime]
  );

  const loadSampleQuestions = useCallback(() => {
    loadQuestions(SAMPLE_MCQ_INPUT);
  }, [loadQuestions]);

  // Current question object
  const currentQuestionItem = useMemo(() => {
    return questions.find((q) => q.questionNumber === currentQuestion);
  }, [questions, currentQuestion]);

  // ----------------------------------------------------
  // SUBMISSION, EVALUATION & MISTAKE TRACKING
  // ----------------------------------------------------
  const submitTest = useCallback(() => {
    commitCurrentQuestionTime();
    soundManager.playMilestone();
    soundManager.triggerHaptic([40, 60, 80]);
    setIsSubmitted(true);
    setCurrentQuestion(startQuestion);

    // Calculate evaluation and update mistake tracking & XP
    let additionalXP = 0;
    let mistakesFixedThisRun = 0;
    let sessionCorrect = 0;

    setGamification((prev) => {
      const newHistory: Record<string, QuestionHistoryItem> = { ...prev.questionHistory };

      questions.forEach((q) => {
        const userAns = answers[q.questionNumber];
        if (!userAns) return;

        const key = getQuestionKey(q);
        const prevRecord = newHistory[key];
        const isCorrect = userAns === q.correctAnswer;

        if (isCorrect) {
          sessionCorrect++;
          additionalXP += 5; // +5 for correct answer post-evaluation

          if (prevRecord && prevRecord.wasIncorrect && !prevRecord.isFixed) {
            // Mistake fixed!
            mistakesFixedThisRun++;
            additionalXP += 10; // +10 bonus for fixing mistake
            newHistory[key] = {
              wasIncorrect: true,
              isFixed: true,
              attempts: (prevRecord.attempts || 1) + 1,
            };
          } else {
            newHistory[key] = {
              wasIncorrect: false,
              isFixed: false,
              attempts: (prevRecord?.attempts || 0) + 1,
            };
          }
        } else {
          // Incorrect
          newHistory[key] = {
            wasIncorrect: true,
            isFixed: false,
            attempts: (prevRecord?.attempts || 0) + 1,
          };
        }
      });

      const updatedTotalXP = prev.totalXP + additionalXP;
      const updatedSessionXP = prev.sessionXP + additionalXP;
      const updatedLevel = 1 + Math.floor(updatedTotalXP / 100);

      // Achievements on submit
      const achievements = [...prev.unlockedAchievements];
      const answeredCount = Object.keys(answers).length;
      if (answeredCount >= 5 && sessionCorrect === answeredCount && !achievements.includes('perfect_session')) {
        achievements.push('perfect_session');
      }

      // Count total mistakes fixed
      const totalFixed = Object.values(newHistory).filter((item) => item.wasIncorrect && item.isFixed).length;
      if (totalFixed >= 10 && !achievements.includes('mistakes_10')) {
        achievements.push('mistakes_10');
      }

      return {
        ...prev,
        totalXP: updatedTotalXP,
        sessionXP: updatedSessionXP,
        level: updatedLevel,
        unlockedAchievements: achievements,
        questionHistory: newHistory,
        totalLifetimeAnswered: prev.totalLifetimeAnswered + answeredCount,
        totalLifetimeCorrect: prev.totalLifetimeCorrect + sessionCorrect,
      };
    });
  }, [commitCurrentQuestionTime, startQuestion, questions, answers]);

  // Retake test
  const retakeTest = useCallback(() => {
    commitCurrentQuestionTime();
    soundManager.playClick();
    soundManager.triggerHaptic(20);
    setAnswers({});
    setIsSubmitted(false);
    setCurrentQuestion(startQuestion);
    setQuestionTimings({});
    setVisitedQuestions([startQuestion]);
    setTargetState((prev) => ({
      ...prev,
      processedQuestions: [],
      isCompleted: false,
      dismissed: false,
    }));
  }, [commitCurrentQuestionTime, startQuestion]);

  const resumeAttempt = useCallback(() => {
    commitCurrentQuestionTime();
    soundManager.playClick();
    soundManager.triggerHaptic(20);
    setIsSubmitted(false);
  }, [commitCurrentQuestionTime]);

  // Statistics for progress bar & counters
  const stats = useMemo(() => {
    let answeredCount = 0;
    const unansweredList: number[] = [];

    for (let q = startQuestion; q <= endQuestion; q++) {
      const ans = answers[q];
      if (ans && (ans === 'A' || ans === 'B' || ans === 'C' || ans === 'D')) {
        answeredCount++;
      } else {
        unansweredList.push(q);
      }
    }

    const unansweredCount = unansweredList.length;
    const currentRaw = answers[currentQuestion];
    const validCurrentAnswer =
      currentRaw === 'A' || currentRaw === 'B' || currentRaw === 'C' || currentRaw === 'D'
        ? currentRaw
        : undefined;

    return {
      answeredCount,
      unansweredCount,
      unansweredList,
      currentAnswer: validCurrentAnswer,
      hasAnswer: Boolean(validCurrentAnswer),
      isFirst: currentQuestion <= startQuestion,
      isLast: currentQuestion >= endQuestion,
    };
  }, [answers, currentQuestion, startQuestion, endQuestion]);

  // Evaluation summary
  const evaluation = useMemo<EvaluationSummary>(() => {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    for (let q = startQuestion; q <= endQuestion; q++) {
      const userAns = answers[q];
      const qItem = questions.find((item) => item.questionNumber === q);
      const correctAns = qItem ? qItem.correctAnswer : undefined;

      if (!userAns) {
        unattempted++;
      } else if (correctAns && userAns === correctAns) {
        correct++;
      } else {
        incorrect++;
      }
    }

    const total = totalQuestions > 0 ? totalQuestions : 1;
    const score = correct;
    const percentage = Math.round((correct / total) * 100);

    return {
      total,
      correct,
      incorrect,
      unattempted,
      score,
      percentage,
    };
  }, [answers, questions, startQuestion, endQuestion, totalQuestions]);

  // Calculated learning analytics
  const analytics = useMemo(() => {
    const historyValues = Object.values(gamification.questionHistory);
    const mistakesFixedCount = historyValues.filter((item) => item.wasIncorrect && item.isFixed).length;
    const totalMistakesLogged = historyValues.filter((item) => item.wasIncorrect).length;

    // Session accuracy (answered questions only)
    const sessionAccuracy =
      stats.answeredCount > 0
        ? Math.round((evaluation.correct / stats.answeredCount) * 100)
        : 0;

    // Overall lifetime accuracy
    const lifetimeAccuracy =
      gamification.totalLifetimeAnswered > 0
        ? Math.round((gamification.totalLifetimeCorrect / gamification.totalLifetimeAnswered) * 100)
        : 0;

    const levelProgress = gamification.totalXP % 100;

    return {
      mistakesFixedCount,
      totalMistakesLogged,
      sessionAccuracy,
      lifetimeAccuracy,
      levelProgress,
    };
  }, [gamification, stats.answeredCount, evaluation.correct]);

  // Has unfinished session for resume banner
  const hasUnfinishedSession = useMemo(() => {
    return !isSubmitted && (stats.answeredCount > 0 || currentQuestion > startQuestion);
  }, [isSubmitted, stats.answeredCount, currentQuestion, startQuestion]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  return {
    startQuestion,
    totalQuestions,
    endQuestion,
    currentQuestion,
    optionsCount,
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
    setOptionsCount,
    loadQuestions,
    loadSampleQuestions,
    submitTest,
    retakeTest,
    resumeAttempt,
  };
}
