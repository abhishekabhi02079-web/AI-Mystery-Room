import React, { useState } from 'react';
import { ISuspect, IPublicClue } from '../types/case.ts';
import { SuspectCard } from './SuspectCard.tsx';
import { ShieldAlert, X, AlertOctagon, Sparkles, CheckSquare, Square } from 'lucide-react';

interface AccusationModalProps {
  isOpen: boolean;
  onClose: () => void;
  suspects: ISuspect[];
  clues: IPublicClue[];
  onConfirmAccusation: (suspectId: string) => Promise<void>;
}

export const AccusationModal: React.FC<AccusationModalProps> = ({
  isOpen,
  onClose,
  suspects,
  clues,
  onConfirmAccusation,
}) => {
  const [selectedSuspectId, setSelectedSuspectId] = useState<string>('');
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const discoveredClues = clues.filter((c) => c.discovered);

  const handleSubmit = async () => {
    if (!selectedSuspectId) {
      setError('You must select one suspect to accuse.');
      return;
    }
    if (!isConfirmed) {
      setError('Please check the confirmation box before submitting your accusation.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onConfirmAccusation(selectedSuspectId);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to submit accusation.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-noir-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl rounded-2xl border border-gold-500/40 bg-noir-900 shadow-2xl p-6 sm:p-8 animate-fade-in my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-noir-700/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">
                The Accusation Tribunal
              </h2>
              <p className="text-xs text-slate-400">
                Identify the sole culprit responsible for this mystery.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-noir-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 py-5 space-y-6 pr-1">
          {/* Permanent Warning */}
          <div className="rounded-lg border border-amber-500/30 bg-amber-950/30 p-3.5 flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <strong>Caution, Detective:</strong> Rendering an accusation will permanently close this investigation. The backend will evaluate your deduction against the secret solution. Once submitted, no further clues can be discovered.
            </div>
          </div>

          {/* Evidence Recap Pill */}
          <div className="rounded-lg bg-noir-850 p-3 border border-noir-700 flex items-center justify-between text-xs">
            <span className="text-slate-300">
              Evidence Gathered: <strong className="text-gold-400">{discoveredClues.length} of {clues.length} clues discovered</strong>
            </span>
            {discoveredClues.length < clues.length && (
              <span className="text-[11px] text-amber-400/90">
                (Uncovering more clues before accusing improves bonus points)
              </span>
            )}
          </div>

          {/* Suspect Selection Grid */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-slate-200 mb-3 flex items-center justify-between">
              <span>Select the Culprit:</span>
              <span className="text-xs font-sans text-slate-400 font-normal">
                {selectedSuspectId ? '1 suspect selected' : 'None selected'}
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {suspects.map((suspect) => (
                <SuspectCard
                  key={suspect.id}
                  suspect={suspect}
                  selectable
                  isSelected={selectedSuspectId === suspect.id}
                  onSelect={() => {
                    setSelectedSuspectId(suspect.id);
                    setError(null);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <div
            onClick={() => setIsConfirmed(!isConfirmed)}
            className="flex items-start gap-3 p-3.5 rounded-lg border border-noir-700 bg-noir-850/60 cursor-pointer hover:border-noir-600 select-none"
          >
            <div className="text-gold-400 mt-0.5 flex-shrink-0">
              {isConfirmed ? (
                <CheckSquare className="w-5 h-5 fill-gold-500/20 text-gold-400" />
              ) : (
                <Square className="w-5 h-5 text-slate-500" />
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              I am confident in my investigative reasoning and ready to submit my final verdict. I understand this action is irreversible.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/40 text-xs text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-noir-700/80 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-slate-100 hover:bg-noir-800 transition-colors"
          >
            Return to Crime Scene
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedSuspectId || !isConfirmed || isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-gradient-to-r from-red-600 via-red-500 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" /> Rendering Verdict...
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4" /> Final Accusation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
