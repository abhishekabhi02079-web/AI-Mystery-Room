import React, { useState } from 'react';
import { IPublicClue, ClueCategory } from '../types/case.ts';
import { Lock, Unlock, FileText, Search, Sparkles, Check, Shield } from 'lucide-react';

interface ClueCardProps {
  clue: IPublicClue;
  index: number;
  onDiscover: (clueId: string) => Promise<void>;
  disabled?: boolean;
}

const categoryColors: Record<ClueCategory, { bg: string; text: string; border: string }> = {
  Physical: { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-500/30' },
  Document: { bg: 'bg-indigo-950/40', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  Forensics: { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  Witness: { bg: 'bg-cyan-950/40', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  Digital: { bg: 'bg-purple-950/40', text: 'text-purple-400', border: 'border-purple-500/30' },
};

export const ClueCard: React.FC<ClueCardProps> = ({
  clue,
  index,
  onDiscover,
  disabled = false,
}) => {
  const [isDiscovering, setIsDiscovering] = useState(false);

  const handleDiscoverClick = async () => {
    if (clue.discovered || disabled || isDiscovering) return;
    setIsDiscovering(true);
    try {
      await onDiscover(clue.id);
    } finally {
      setIsDiscovering(false);
    }
  };

  const style = categoryColors[clue.category] || categoryColors.Physical;

  return (
    <div
      className={`rounded-xl border p-5 transition-all duration-300 relative flex flex-col justify-between ${
        clue.discovered
          ? 'border-noir-700 bg-noir-850/90 shadow-md'
          : 'border-dashed border-gold-500/30 bg-noir-900/60 hover:border-gold-500/60'
      }`}
    >
      {/* Top Header: Category & Discovery Status */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${style.bg} ${style.text} ${style.border}`}
        >
          <FileText className="w-3 h-3" />
          {clue.category}
        </span>

        {clue.discovered ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
            <Check className="w-3.5 h-3.5" /> Discovered (+5)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gold-400/80">
            <Lock className="w-3.5 h-3.5" /> Sealed Dossier
          </span>
        )}
      </div>

      {/* Clue Content */}
      <div className="flex-1 my-2">
        <h4
          className={`font-serif text-sm font-bold mb-2 ${
            clue.discovered ? 'text-slate-100' : 'text-slate-400 italic'
          }`}
        >
          {clue.title}
        </h4>
        <p
          className={`text-xs leading-relaxed ${
            clue.discovered ? 'text-slate-300' : 'text-slate-500 italic'
          }`}
        >
          {clue.description}
        </p>
      </div>

      {/* Action footer */}
      <div className="pt-4 border-t border-noir-700/60 flex items-center justify-between">
        <span className="text-[11px] font-mono text-slate-500">
          Clue #{index + 1}
        </span>

        {!clue.discovered && (
          <button
            onClick={handleDiscoverClick}
            disabled={disabled || isDiscovering}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-noir-950 transition-all shadow-sm hover:shadow-gold-glow disabled:opacity-50"
          >
            {isDiscovering ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" /> Uncovering...
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" /> Examine (+5 pts)
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
