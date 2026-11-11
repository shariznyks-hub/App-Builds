import React, { useState, useMemo } from 'react';
import { X, Copy, Download, Check, Share2, FileText, Table, AlertTriangle, ShieldCheck } from 'lucide-react';
import { MCQOption, MCQQuestionItem } from '../types';
import {
  generateTxtExport,
  generateCsvExport,
  generateIncorrectQuestionsOnlyTxt,
  downloadFile,
  copyToClipboard,
} from '../utils/exportUtils';

interface ExportModalProps {
  startQuestion: number;
  endQuestion: number;
  answers: Record<number, MCQOption>;
  questions?: MCQQuestionItem[];
  isSubmitted: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  startQuestion,
  endQuestion,
  answers,
  questions = [],
  isSubmitted,
  onClose,
}) => {
  const [format, setFormat] = useState<'TXT' | 'CSV' | 'INCORRECT_ONLY'>('TXT');
  const [copied, setCopied] = useState(false);

  // Count incorrect answers
  const incorrectCount = useMemo(() => {
    let count = 0;
    questions.forEach((q) => {
      const userAns = answers[q.questionNumber];
      if (userAns && q.correctAnswer && userAns !== q.correctAnswer) {
        count++;
      }
    });
    return count;
  }, [questions, answers]);

  const exportText = useMemo(() => {
    if (format === 'TXT') {
      return generateTxtExport(startQuestion, endQuestion, answers, isSubmitted, questions);
    } else if (format === 'CSV') {
      return generateCsvExport(startQuestion, endQuestion, answers, isSubmitted, questions);
    } else {
      return generateIncorrectQuestionsOnlyTxt(questions, answers);
    }
  }, [format, startQuestion, endQuestion, answers, isSubmitted, questions]);

  const handleCopy = async () => {
    const success = await copyToClipboard(exportText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (format === 'TXT') {
      downloadFile(exportText, `mcq-answers-${startQuestion}-to-${endQuestion}.txt`, 'text/plain');
    } else if (format === 'CSV') {
      downloadFile(exportText, `mcq-answers-${startQuestion}-to-${endQuestion}.csv`, 'text/csv');
    } else {
      downloadFile(exportText, `mcq-incorrect-questions-${startQuestion}-to-${endQuestion}.txt`, 'text/plain');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `MCQ Export (${startQuestion}-${endQuestion})`,
          text: exportText,
        });
      } catch {
        // user cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-750 w-full max-w-2xl max-h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Export Answers & Practice Decks
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isSubmitted
                ? 'Evaluation results with actual answer keys, results, and mistake revision decks'
                : 'Attempt mode export (answer keys remain strictly hidden until submitted)'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selectors */}
        <div className="p-3 sm:px-5 bg-slate-950/60 border-b border-slate-800 flex flex-wrap sm:flex-nowrap items-center gap-2">
          {/* TXT Format */}
          <button
            id="format-txt-btn"
            onClick={() => setFormat('TXT')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl font-bold text-xs sm:text-sm border transition ${
              format === 'TXT'
                ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span className="truncate">TXT Format</span>
          </button>

          {/* CSV Format */}
          <button
            id="format-csv-btn"
            onClick={() => setFormat('CSV')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl font-bold text-xs sm:text-sm border transition ${
              format === 'CSV'
                ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Table className="w-4 h-4 shrink-0" />
            <span className="truncate">CSV (Excel)</span>
          </button>

          {/* Mistakes Only (TXT) */}
          <button
            id="format-incorrect-btn"
            onClick={() => setFormat('INCORRECT_ONLY')}
            disabled={!isSubmitted}
            title={!isSubmitted ? 'Submit test first to export incorrect questions' : undefined}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl font-bold text-xs sm:text-sm border transition ${
              format === 'INCORRECT_ONLY'
                ? 'bg-amber-600 border-amber-500 text-white shadow-sm'
                : isSubmitted
                ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                : 'bg-slate-950 border-slate-850 text-slate-600 cursor-not-allowed opacity-50'
            }`}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="truncate">
              Mistakes Only {isSubmitted ? `(${incorrectCount})` : ''}
            </span>
          </button>
        </div>

        {/* Privacy Note / Info */}
        {!isSubmitted ? (
          <div className="bg-blue-950/40 border-b border-blue-800/40 px-4 py-2 flex items-center gap-2 text-xs text-blue-300">
            <ShieldCheck className="w-4 h-4 shrink-0 text-blue-400" />
            <span>
              <strong>Attempt Mode Active:</strong> Correct answers are hidden to protect exam integrity. Submit test to export answer keys and mistake decks.
            </span>
          </div>
        ) : format === 'INCORRECT_ONLY' ? (
          <div className="bg-amber-950/40 border-b border-amber-800/40 px-4 py-2 flex items-center gap-2 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              <strong>Mistakes Revision Deck:</strong> This TXT is in exact <code>[Q1]...[/Q1]</code> format. You can paste it directly back into &quot;Paste Questions&quot; to re-attempt your errors!
            </span>
          </div>
        ) : null}

        {/* Code / Text Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">
              Preview (
              {format === 'TXT'
                ? isSubmitted
                  ? 'Extended Results TXT'
                  : 'Standard 1-A format'
                : format === 'CSV'
                ? isSubmitted
                  ? 'Question, Selected, Correct, Result, Explanation'
                  : 'Question, Answer'
                : `Incorrect Questions Only — ${incorrectCount} questions`}
              ):
            </span>
          </div>

          <div className="relative">
            {format === 'INCORRECT_ONLY' && incorrectCount === 0 ? (
              <div className="w-full h-56 bg-slate-950 rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-slate-800">
                <Check className="w-8 h-8 text-emerald-400 mb-2" />
                <h4 className="text-white font-bold text-sm">No Incorrect Questions!</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  You did not answer any questions incorrectly in this session.
                </p>
              </div>
            ) : (
              <pre className="w-full h-56 sm:h-64 bg-slate-950 rounded-2xl p-4 font-mono text-xs sm:text-sm text-slate-200 border border-slate-800 overflow-y-auto whitespace-pre leading-relaxed select-text">
                {exportText}
              </pre>
            )}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold border border-slate-700 transition"
              >
                <Share2 className="w-4 h-4 text-blue-400" />
                <span>Share</span>
              </button>
            )}

            <button
              id="copy-export-btn"
              onClick={handleCopy}
              disabled={format === 'INCORRECT_ONLY' && incorrectCount === 0}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-sm ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-emerald-400" />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>
          </div>

          <button
            id="download-export-file-btn"
            onClick={handleDownload}
            disabled={format === 'INCORRECT_ONLY' && incorrectCount === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition shadow-md disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>
              Download .{format === 'CSV' ? 'csv' : 'txt'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
