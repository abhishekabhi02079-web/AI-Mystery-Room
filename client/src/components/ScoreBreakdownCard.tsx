import React from 'react';
import { IVerdict } from '../types/case.ts';
import { Award, Plus, Minus, Equal, CheckCircle2, XCircle } from 'lucide-react';

interface ScoreBreakdownCardProps {
  verdict: IVerdict;
}

export const ScoreBreakdownCard: React.FC<ScoreBreakdownCardProps> = ({ verdict }) => {
  return (
    <div className="rounded-xl border border-gold-500/30 bg-noir-850 p-6 shadow-noir-card">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-noir-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-base font-bold text-slate-100">
              Detective Performance Evaluation
            </h4>
            <p className="text-xs text-slate-400">
              Official score calculation determined by the backend scoring engine.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
            Final Score
          </span>
          <span className="font-serif text-3xl font-extrabold text-gold-400">
            {verdict.finalScore}
          </span>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center text-center">
        {/* Base Accusation Score */}
        <div className="p-4 rounded-lg bg-noir-900 border border-noir-700/80">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            {verdict.isCorrect ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400" />
            )}
            <span className="text-xs font-semibold text-slate-200">
              {verdict.isCorrect ? 'Correct Culprit' : 'Wrong Culprit'}
            </span>
          </div>
          <p className="font-serif text-2xl font-bold text-slate-100">
            {verdict.baseScore}
          </p>
          <span className="text-[10px] text-slate-500">Base Accusation Points</span>
        </div>

        {/* Clue Discovery Bonus */}
        <div className="p-4 rounded-lg bg-noir-900 border border-noir-700/80">
          <div className="flex items-center justify-center gap-1.5 mb-1 text-emerald-400">
            <Plus className="w-4 h-4" />
            <span className="text-xs font-semibold">Evidence Bonus</span>
          </div>
          <p className="font-serif text-2xl font-bold text-emerald-400">
            +{verdict.clueBonus}
          </p>
          <span className="text-[10px] text-slate-500">
            {verdict.discoveredCluesCount} clues × 5 pts
          </span>
        </div>

        {/* Hint Penalties */}
        <div className="p-4 rounded-lg bg-noir-900 border border-noir-700/80">
          <div className="flex items-center justify-center gap-1.5 mb-1 text-amber-400">
            <Minus className="w-4 h-4" />
            <span className="text-xs font-semibold">Hint Penalty</span>
          </div>
          <p className="font-serif text-2xl font-bold text-amber-400">
            -{verdict.hintPenalty}
          </p>
          <span className="text-[10px] text-slate-500">
            {verdict.revealedHintsCount} hints × 10 pts
          </span>
        </div>

        {/* Total Result */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-gold-500/20 to-noir-900 border border-gold-500/40">
          <div className="flex items-center justify-center gap-1.5 mb-1 text-gold-400">
            <Equal className="w-4 h-4" />
            <span className="text-xs font-semibold">Total Verified</span>
          </div>
          <p className="font-serif text-2xl font-bold text-gold-300">
            {verdict.finalScore}
          </p>
          <span className="text-[10px] text-gold-500/80">Max(0, Formula)</span>
        </div>
      </div>
    </div>
  );
};
