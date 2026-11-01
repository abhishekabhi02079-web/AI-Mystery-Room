import React, { useState } from 'react';
import { IPublicHint } from '../types/case.ts';
import { Lightbulb, AlertTriangle, Key, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface HintDrawerProps {
  hints: IPublicHint[];
  hintsRemaining: number;
  totalHints: number;
  onRequestHint: () => Promise<void>;
  disabled?: boolean;
}

export const HintDrawer: React.FC<HintDrawerProps> = ({
  hints,
  hintsRemaining,
  totalHints,
  onRequestHint,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequest = async () => {
    if (hintsRemaining <= 0 || disabled || isRequesting) return;
    setIsRequesting(true);
    try {
      await onRequestHint();
    } finally {
      setIsRequesting(false);
    }
  };

  const revealedHints = hints.filter((h) => h.revealed);

  return (
    <div className="rounded-xl border border-noir-700 bg-noir-850/80 overflow-hidden shadow-noir-card">
      {/* Accordion Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-noir-800/60 transition-colors select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-slate-100 flex items-center gap-2">
              Investigative Hints & Intuition
              <span className="text-[11px] font-sans px-2 py-0.5 rounded-full bg-noir-700 text-gold-400 font-semibold">
                {hintsRemaining} remaining of {totalHints}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Cryptic observations to assist when the deduction grows cold.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hintsRemaining > 0 && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRequest();
              }}
              disabled={isRequesting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-noir-800 hover:bg-noir-750 text-gold-400 border border-gold-500/40 hover:border-gold-400 transition-all shadow-sm disabled:opacity-50"
            >
              {isRequesting ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" /> Deciphering...
                </>
              ) : (
                <>
                  <Key className="w-3.5 h-3.5" /> Unlock Hint (-10 pts)
                </>
              )}
            </button>
          )}

          <div className="text-slate-400">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Accordion Body */}
      {isOpen && (
        <div className="px-5 pb-5 pt-2 border-t border-noir-700/60 space-y-3">
          {revealedHints.length === 0 ? (
            <div className="rounded-lg border border-dashed border-noir-700 p-4 text-center">
              <p className="text-xs text-slate-400">
                No hints unlocked yet. Solve the mystery without hints for maximum score!
              </p>
              <p className="text-[11px] text-amber-400/80 mt-1 flex items-center justify-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Each unlocked hint costs -10 points.
              </p>
            </div>
          ) : (
            revealedHints.map((hint) => (
              <div
                key={hint.id}
                className="rounded-lg border border-gold-500/20 bg-noir-900/60 p-3.5 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 text-xs font-serif font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  #{hint.order}
                </div>
                <div>
                  <h5 className="text-[11px] uppercase tracking-wider text-gold-400/80 font-mono font-semibold">
                    Deductive Hint #{hint.order}
                  </h5>
                  <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
                    {hint.text}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
