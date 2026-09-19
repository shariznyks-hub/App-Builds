import { useState, useEffect, useMemo, useCallback } from 'react';
import { MCQOption } from '../types';

const STORAGE_KEY_ANSWERS = 'mcq_answer_pad_answers_v1';
const STORAGE_KEY_CONFIG = 'mcq_answer_pad_config_v1';

export function useMCQState() {
  // Load initial settings
  const [startQuestion, setStartQuestion] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        return typeof parsed.startQuestion === 'number' && parsed.startQuestion >= 1 ? parsed.startQuestion : 1;
      }
    } catch {
      // ignore
    }
    return 1;
  });

  const [totalQuestions, setTotalQuestions] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        return typeof parsed.totalQuestions === 'number' && parsed.totalQuestions >= 1 ? Math.min(parsed.totalQuestions, 500) : 500;
      }
    } catch {
      // ignore
    }
    return 500;
  });

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

  // End question calculation
  const endQuestion = useMemo(() => {
    return startQuestion + totalQuestions - 1;
  }, [startQuestion, totalQuestions]);

  // Keep currentQuestion within valid range if range changes
  useEffect(() => {
    if (currentQuestion < startQuestion) {
      setCurrentQuestion(startQuestion);
    } else if (currentQuestion > endQuestion) {
      setCurrentQuestion(endQuestion);
    }
  }, [startQuestion, endQuestion, currentQuestion]);

  // Persist config to localStorage
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

  // Persist answers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ANSWERS, JSON.stringify(answers));
    } catch {
      // ignore
    }
  }, [answers]);

  // Haptic feedback for tactile tablet feeling
  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25);
      } catch {
        // ignore
      }
    }
  }, []);

  // Answer current question and advance
  const answerCurrent = useCallback(
    (option: MCQOption) => {
      triggerHaptic();
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion]: option,
      }));

      // Automatically move to the next question if not at the end
      if (currentQuestion < endQuestion) {
        setCurrentQuestion((prev) => prev + 1);
      }
    },
    [currentQuestion, endQuestion, triggerHaptic]
  );

  // Skip current question (leaves blank, does NOT save skip as answer) and advance
  const skipCurrent = useCallback(() => {
    triggerHaptic();
    // Do not set any answer, question remains blank
    if (currentQuestion < endQuestion) {
      setCurrentQuestion((prev) => prev + 1);
    }
  }, [currentQuestion, endQuestion, triggerHaptic]);

  // Navigation: Next
  const goToNext = useCallback(() => {
    triggerHaptic();
    if (currentQuestion < endQuestion) {
      setCurrentQuestion((prev) => prev + 1);
    }
  }, [currentQuestion, endQuestion, triggerHaptic]);

  // Navigation: Previous
  const goToPrevious = useCallback(() => {
    triggerHaptic();
    if (currentQuestion > startQuestion) {
      setCurrentQuestion((prev) => prev - 1);
    }
  }, [currentQuestion, startQuestion, triggerHaptic]);

  // Jump directly to specific question
  const jumpToQuestion = useCallback(
    (qNum: number) => {
      triggerHaptic();
      const clamped = Math.max(startQuestion, Math.min(qNum, endQuestion));
      setCurrentQuestion(clamped);
    },
    [startQuestion, endQuestion, triggerHaptic]
  );

  // Clear answer for current question
  const clearCurrentAnswer = useCallback(() => {
    triggerHaptic();
    setAnswers((prev) => {
      const updated = { ...prev };
      delete updated[currentQuestion];
      return updated;
    });
  }, [currentQuestion, triggerHaptic]);

  // Clear all answers
  const clearAllAnswers = useCallback(() => {
    triggerHaptic();
    setAnswers({});
    setCurrentQuestion(startQuestion);
  }, [startQuestion, triggerHaptic]);

  // Update question range
  const updateRange = useCallback(
    (newStart: number, newTotal: number, _newOptions?: number) => {
      const validStart = Math.max(1, Math.min(newStart, 1000));
      const validTotal = Math.max(1, Math.min(newTotal, 500));
      setStartQuestion(validStart);
      setTotalQuestions(validTotal);
      setOptionsCount(4);
      setCurrentQuestion(validStart);
    },
    []
  );

  // Statistics
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
    const validCurrentAnswer = currentRaw === 'A' || currentRaw === 'B' || currentRaw === 'C' || currentRaw === 'D' ? currentRaw : undefined;

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

  return {
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
    setOptionsCount,
  };
}
