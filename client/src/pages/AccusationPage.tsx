import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { caseApi, extractErrorMessage } from '../services/api.ts';
import { IPublicCase, ISuspect } from '../types/case.ts';
import { SuspectCard } from '../components/SuspectCard.tsx';
import { LoadingScreen } from '../components/LoadingScreen.tsx';
import { ErrorBanner } from '../components/ErrorBanner.tsx';
import { tokenStorage } from '../utils/tokenStorage.ts';
import {
  ShieldAlert,
  AlertOctagon,
  ArrowLeft,
  CheckCircle2,
  FileCheck,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';

export const AccusationPage: React.FC = () => {
  const params = useParams<{ caseId?: string; id?: string }>();
  const caseId = params.caseId || params.id;
  const navigate = useNavigate();

  const [currentCase, setCurrentCase] = useState<IPublicCase | null>(null);
  const [selectedSuspectId, setSelectedSuspectId] = useState<string>('');
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caseId) {
      setIsLoading(false);
      return;
    }

    const loadCase = async () => {
      try {
        const data = await caseApi.getCase(caseId);
        // If case is already completed, redirect directly to result
        if (data.status === 'completed') {
          navigate(`/case/${caseId}/result`, { replace: true });
          return;
        }
        setCurrentCase(data);
      } catch (err: unknown) {
        console.error('Failed to load case for accusation:', err);
        setError(extractErrorMessage(err, 'Failed to retrieve case details for the tribunal.'));
      } finally {
        setIsLoading(false);
      }
    };

    loadCase();
  }, [caseId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!caseId) return;

    if (!selectedSuspectId) {
      setError('You must select exactly one suspect before submitting your accusation.');
      return;
    }

    if (!isConfirmed) {
      setError('Please acknowledge the investigation closure confirmation before proceeding.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await caseApi.accuseSuspect(caseId, selectedSuspectId);
      if (response.success) {
        navigate(`/case/${caseId}/result`);
      } else {
        throw new Error('The tribunal was unable to register the verdict.');
      }
    } catch (err: unknown) {
      console.error('Accusation submission error:', err);
      const msg = extractErrorMessage(err, 'Failed to submit accusation.');
      setError(msg);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <LoadingScreen
        message="Convening the Accusation Tribunal..."
        subtext="Gathering all discovered dossiers and suspect testimonies..."
      />
    );
  }

  if (error && !currentCase) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-6">
        <ErrorBanner
          title="Tribunal Session Interrupted"
          message={error || 'Case records could not be found.'}
        />
        <div className="flex justify-center gap-4">
          <Link
            to={caseId ? `/case/${caseId}` : '/'}
            className="px-6 py-2.5 rounded-lg border border-noir-700 bg-noir-850 text-slate-200 text-xs font-semibold"
          >
            Return to Investigation
          </Link>
          <button
            onClick={() => navigate('/create')}
            className="px-6 py-2.5 rounded-lg bg-gold-500 text-noir-950 font-bold text-xs"
          >
            New Investigation
          </button>
        </div>
      </div>
    );
  }

  if (!currentCase) return null;

  const discoveredClues = currentCase.clues.filter((c) => c.discovered);
  const selectedSuspect = currentCase.suspects.find((s) => s.id === selectedSuspectId);

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8 animate-fade-in">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-noir-700/80">
        <Link
          to={`/case/${caseId}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-gold-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Crime Scene Investigation
        </Link>
        <span className="font-mono text-xs text-gold-400 bg-noir-900 px-3 py-1 rounded border border-noir-700">
          Case File: {currentCase.caseId}
        </span>
      </div>

      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-red-500/40 bg-red-950/40 text-red-300 text-xs font-bold">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          The Accusation Tribunal
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-100">
          {currentCase.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Review the evidence you have uncovered and pinpoint the sole perpetrator responsible for this crime.
        </p>
      </div>

      {error && (
        <ErrorBanner
          title="Accusation Issue"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Irreversible Action Warning */}
      <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-5 flex items-start gap-3.5 shadow-md">
        <AlertOctagon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
          <strong className="text-amber-300 block mb-1">Critical Notice:</strong>
          Submitting a formal accusation permanently completes this investigation. The backend scoring engine will verify your accusation against the secret solution, record your final score, and reveal the full narrative. No further clues or hints may be unlocked once confirmed.
        </div>
      </div>

      {/* Evidence Summary Card */}
      <div className="rounded-xl border border-noir-700 bg-noir-850 p-5 space-y-3 shadow-noir-card">
        <div className="flex items-center justify-between pb-3 border-b border-noir-700/80 text-xs">
          <span className="font-serif font-bold text-slate-200 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-gold-500" />
            Discovered Evidence Summary
          </span>
          <span className="font-mono text-gold-400 font-semibold">
            {discoveredClues.length} of {currentCase.totalClues} Clues Uncovered
          </span>
        </div>

        {discoveredClues.length === 0 ? (
          <p className="text-xs text-amber-400/90 italic py-2">
            Warning: You have not uncovered any clues yet. Uncovering clues before accusing provides +5 bonus points per clue and ensures a solid foundation for your verdict.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {discoveredClues.map((clue, idx) => (
              <div
                key={clue.id}
                className="p-2.5 rounded-lg bg-noir-900 border border-noir-750 text-xs text-slate-300 flex items-start gap-2"
              >
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-noir-800 text-gold-400 border border-noir-700 flex-shrink-0">
                  #{idx + 1}
                </span>
                <div className="min-w-0">
                  <span className="font-semibold text-slate-200 block truncate">{clue.title}</span>
                  <span className="text-[11px] text-slate-400 line-clamp-1">{clue.description}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suspect Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-slate-100">
            Select the Culprit
          </h2>
          <span className="text-xs font-mono text-slate-400">
            {selectedSuspect ? `Accusing: ${selectedSuspect.name}` : 'No suspect selected'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentCase.suspects.map((suspect) => (
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

      {/* Confirmation & Submission Form */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-noir-700 bg-noir-850 p-6 space-y-6 shadow-noir-card">
        {/* Checkbox confirmation step */}
        <label
          className="flex items-start gap-3 cursor-pointer select-none group"
          onClick={() => setIsConfirmed(!isConfirmed)}
        >
          <div className="mt-0.5 text-gold-500">
            {isConfirmed ? (
              <CheckSquare className="w-5 h-5 text-gold-400" />
            ) : (
              <Square className="w-5 h-5 text-slate-500 group-hover:text-slate-300" />
            )}
          </div>
          <span className="text-xs sm:text-sm text-slate-300 group-hover:text-slate-100 transition-colors leading-relaxed">
            I confirm that I have evaluated all evidence and wish to accuse{' '}
            <strong className="text-gold-400">
              {selectedSuspect ? selectedSuspect.name : '[Select a suspect above]'}
            </strong>{' '}
            as the true perpetrator. I understand this action permanently closes the investigation.
          </span>
        </label>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-noir-700/80">
          <Link
            to={`/case/${caseId}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-noir-700 bg-noir-900 text-slate-300 hover:text-slate-100 hover:bg-noir-800 text-xs sm:text-sm font-semibold transition-colors"
          >
            Cancel & Return to Evidence
          </Link>

          <button
            type="submit"
            disabled={!selectedSuspectId || !isConfirmed || isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm transition-all shadow-lg hover:shadow-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                Delivering Verdict to Tribunal...
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4" />
                Confirm Accusation
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccusationPage;

