import React, { useState, useMemo } from 'react';
import { X, CheckCircle2, Search } from 'lucide-react';

interface UnansweredModalProps {
  unansweredList: number[];
  onJumpTo: (qNum: number) => void;
  onClose: () => void;
}

export const UnansweredModal: React.FC<UnansweredModalProps> = ({
  unansweredList,
  onJumpTo,
  onClose,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  const filtered = useMemo(() => {
    if (!filterQuery.trim()) return unansweredList;
    return unansweredList.filter((num) => num.toString().includes(filterQuery.trim()));
  }, [unansweredList, filterQuery]);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-750 w-full max-w-xl max-h-[85vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Unanswered Questions
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {unansweredList.length} Left
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Tap any question number to jump directly to it
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

        {/* Filter input */}
        {unansweredList.length > 15 && (
          <div className="p-3 border-b border-slate-800 bg-slate-950/60">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Search question number..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Modal Content / Numbers Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {unansweredList.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-emerald-400">
                All Questions Answered!
              </h3>
              <p className="text-sm text-slate-400 mt-1 max-w-xs">
                You have recorded answers for every single question in this range.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No unanswered questions match "{filterQuery}".
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-2.5">
              {filtered.map((qNum) => (
                <button
                  key={qNum}
                  onClick={() => {
                    onJumpTo(qNum);
                    onClose();
                  }}
                  className="h-14 sm:h-16 rounded-xl bg-slate-800 hover:bg-amber-600/30 border border-slate-700 hover:border-amber-400/60 text-amber-300 hover:text-amber-200 font-black text-lg sm:text-xl flex items-center justify-center transition active:scale-95 shadow-xs"
                >
                  {qNum}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
