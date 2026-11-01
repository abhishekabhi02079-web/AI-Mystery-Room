import React from 'react';
import { ISuspect } from '../types/case.ts';
import { UserCheck, Clock, AlertCircle, Briefcase, CheckCircle2 } from 'lucide-react';

interface SuspectCardProps {
  suspect: ISuspect;
  isSelected?: boolean;
  onSelect?: () => void;
  selectable?: boolean;
}

export const SuspectCard: React.FC<SuspectCardProps> = ({
  suspect,
  isSelected,
  onSelect,
  selectable = false,
}) => {
  return (
    <div
      onClick={selectable && onSelect ? onSelect : undefined}
      className={`relative rounded-xl border transition-all duration-300 p-5 ${
        selectable ? 'cursor-pointer hover:scale-[1.01]' : ''
      } ${
        isSelected
          ? 'border-gold-400 bg-noir-800 shadow-gold-glow'
          : 'border-noir-700/80 bg-noir-850/80 hover:border-noir-600'
      }`}
    >
      {/* Top Header: Avatar & Name */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border border-gold-500/30 bg-noir-800 flex items-center justify-center text-gold-400 font-serif font-bold text-lg shadow-inner">
            {suspect.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-slate-100 group-hover:text-gold-400">
              {suspect.name}
            </h3>
            {suspect.occupation && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                <Briefcase className="w-3 h-3 text-gold-500/70" />
                {suspect.occupation}
              </span>
            )}
          </div>
        </div>

        {selectable && (
          <div
            className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
              isSelected
                ? 'border-gold-400 bg-gold-500 text-noir-950'
                : 'border-noir-600 bg-noir-800 text-transparent'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 fill-current" />
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3">
        {suspect.description}
      </p>

      {/* Motive & Alibi Dossier sections */}
      <div className="space-y-2.5 pt-3 border-t border-noir-700/60 text-xs">
        {/* Motive */}
        <div className="rounded-md bg-noir-900/60 p-2.5 border border-red-500/20">
          <div className="flex items-center gap-1.5 text-red-400 font-semibold mb-1 text-[11px]">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Alleged Motive</span>
          </div>
          <p className="text-slate-300 leading-tight">{suspect.motive}</p>
        </div>

        {/* Alibi */}
        <div className="rounded-md bg-noir-900/60 p-2.5 border border-blue-500/20">
          <div className="flex items-center gap-1.5 text-blue-400 font-semibold mb-1 text-[11px]">
            <Clock className="w-3.5 h-3.5" />
            <span>Claimed Alibi</span>
          </div>
          <p className="text-slate-300 leading-tight">{suspect.alibi}</p>
        </div>
      </div>
    </div>
  );
};
