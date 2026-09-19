import React, { useState, useMemo } from 'react';
import { X, Copy, Download, Check, Share2, FileText, Table } from 'lucide-react';
import { MCQOption } from '../types';
import { generateTxtExport, generateCsvExport, downloadFile, copyToClipboard } from '../utils/exportUtils';

interface ExportModalProps {
  startQuestion: number;
  endQuestion: number;
  answers: Record<number, MCQOption>;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  startQuestion,
  endQuestion,
  answers,
  onClose,
}) => {
  const [format, setFormat] = useState<'TXT' | 'CSV'>('TXT');
  const [copied, setCopied] = useState(false);

  const exportText = useMemo(() => {
    if (format === 'TXT') {
      return generateTxtExport(startQuestion, endQuestion, answers);
    } else {
      return generateCsvExport(startQuestion, endQuestion, answers);
    }
  }, [format, startQuestion, endQuestion, answers]);

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
    } else {
      downloadFile(exportText, `mcq-answers-${startQuestion}-to-${endQuestion}.csv`, 'text/csv');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `MCQ Answers (${startQuestion}-${endQuestion})`,
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
      <div className="bg-slate-900 border border-slate-750 w-full max-w-xl max-h-[88vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Export Answers
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Usable in Excel and ready to copy/paste into ChatGPT
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
        <div className="p-4 sm:px-5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-3">
          <button
            id="format-txt-btn"
            onClick={() => setFormat('TXT')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm border transition ${
              format === 'TXT'
                ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>TXT Format (1-B)</span>
          </button>

          <button
            id="format-csv-btn"
            onClick={() => setFormat('CSV')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm border transition ${
              format === 'CSV'
                ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>CSV Format (Excel)</span>
          </button>
        </div>

        {/* Code / Text Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">
              Preview ({format === 'TXT' ? 'Exact ChatGPT Format' : 'Comma Separated Values'}):
            </span>
            <span className="text-xs text-slate-500">
              {endQuestion - startQuestion + 1} lines
            </span>
          </div>

          <div className="relative">
            <pre className="w-full h-56 sm:h-64 bg-slate-950 rounded-2xl p-4 font-mono text-sm text-slate-200 border border-slate-800 overflow-y-auto whitespace-pre leading-relaxed select-text">
              {exportText}
            </pre>
          </div>

          <p className="text-xs text-slate-400 mt-2.5">
            Skipped and unanswered questions are left intentionally blank (e.g. <code className="text-amber-400 bg-slate-950 px-1 py-0.5 rounded">2-</code> or <code className="text-amber-400 bg-slate-950 px-1 py-0.5 rounded">2,</code>).
          </p>
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
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Download .{format.toLowerCase()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
