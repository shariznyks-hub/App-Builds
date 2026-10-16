import React, { useState, useMemo } from 'react';
import { X, Check, HelpCircle, FileText, Sparkles } from 'lucide-react';
import { parseMCQInput, SAMPLE_MCQ_INPUT } from '../utils/mcqParser';

interface ImportQuestionsModalProps {
  onLoadQuestions: (rawText: string) => boolean;
  onClose: () => void;
}

export const ImportQuestionsModal: React.FC<ImportQuestionsModalProps> = ({
  onLoadQuestions,
  onClose,
}) => {
  const [inputText, setInputText] = useState<string>(SAMPLE_MCQ_INPUT);
  const [error, setError] = useState<string | null>(null);

  // Live parsed count
  const parsedCount = useMemo(() => {
    try {
      const questions = parseMCQInput(inputText);
      return questions.length;
    } catch {
      return 0;
    }
  }, [inputText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedCount === 0) {
      setError('No valid questions found. Please use the [Q1] ... [/Q1] format shown below.');
      return;
    }

    const success = onLoadQuestions(inputText);
    if (success) {
      onClose();
    } else {
      setError('Failed to parse questions. Check option labels A, B, C, D and Correct answer keys.');
    }
  };

  const handleInsertSample = () => {
    setInputText(SAMPLE_MCQ_INPUT);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-750 w-full max-w-2xl max-h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Import Questions & Answer Keys</h2>
              <p className="text-xs text-slate-400">
                Hidden answer key with post-submission evaluation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Quick Action & Format Tip */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              Paste Questions in [Q1] ... [/Q1] Format:
            </span>

            <button
              type="button"
              onClick={handleInsertSample}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load 3 Sample Questions</span>
            </button>
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              rows={12}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setError(null);
              }}
              className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-2xl p-3.5 font-mono text-xs sm:text-sm text-slate-200 focus:outline-none resize-none leading-relaxed"
              placeholder={`[Q1]\nQuestion: Under GFR, which of the following is classified as an Original Work?\nA: Routine maintenance of building fixtures\nB: A new construction and site preparation for a new building\nC: Replacement of a worn-out fixture as part of ordinary maintenance\nD: Minor maintenance work that does not add capital value\nCorrect: B\nExplanation: Original Work includes new construction and site preparation for a new building.\n[/Q1]`}
              required
            />
          </div>

          {/* Format Explanation Helper */}
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl text-xs text-slate-400 flex flex-col gap-1">
            <span className="font-semibold text-slate-300">Format rules:</span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-400">
              <li>Each block must start with <code className="text-blue-300 bg-slate-900 px-1 py-0.5 rounded">[Q1]</code> and end with <code className="text-blue-300 bg-slate-900 px-1 py-0.5 rounded">[/Q1]</code>.</li>
              <li>Include <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded">Correct: [A|B|C|D]</code> to set the hidden answer key.</li>
              <li>Optionally include <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">Explanation: ...</code> to display after submission.</li>
              <li>The answer key is strictly hidden during the attempt mode.</li>
            </ul>
          </div>

          {/* Actions & Detection summary */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800 mt-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-bold text-slate-300">
                {parsedCount} {parsedCount === 1 ? 'question' : 'questions'} detected
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={parsedCount === 0}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold transition shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Load & Start Quiz</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
