import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { caseApi, extractErrorMessage } from '../services/api.ts';
import { ICaseResult } from '../types/case.ts';
import { ScoreBreakdownCard } from '../components/ScoreBreakdownCard.tsx';
import { LoadingScreen } from '../components/LoadingScreen.tsx';
import { ErrorBanner } from '../components/ErrorBanner.tsx';
import {
  Award,
  CheckCircle2,
  XCircle,
  FileCheck,
  RotateCcw,
  Home,
  UserCheck,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Lock,
} from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const params = useParams<{ caseId?: string; id?: string }>();
  const caseId = params.caseId || params.id;
  const navigate = useNavigate();

  const [result, setResult] = useState<ICaseResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadResult = async () => {
    if (!caseId) return;
    setError(null);
    try {
      const data = await caseApi.getCaseResult(caseId);
      setResult(data);
    } catch (err: unknown) {
      console.error('Failed to load result:', err);
      const msg = extractErrorMessage(
        err,
        'Unable to retrieve the case resolution. You may need to submit your accusation first.'
      );
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResult();
  }, [caseId]);

  if (isLoading) {
    return (
      <LoadingScreen
        message="Unsealing Final Verdict Dossier..."
        subtext="Evaluating evidence and verified backend calculations..."
      />
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-6">
        <ErrorBanner
          title="Verdict Resolution Interrupted"
          message={error || 'No completed case records found for this case ID.'}
          onRetry={loadResult}
        />
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate(caseId ? `/case/${caseId}` : '/')}
            className="px-5 py-2.5 rounded-lg border border-noir-700 bg-noir-850 text-slate-200 text-xs font-semibold"
          >
            Return to Case
          </button>
          <button
            onClick={() => navigate('/create')}
            className="px-5 py-2.5 rounded-lg bg-gold-500 text-noir-950 font-bold text-xs"
          >
            New Investigation
          </button>
        </div>
      </div>
    );
  }

  const { verdict, solution } = result;

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8 animate-fade-in">
      {/* 1. Grand Verdict Banner */}
      <div
        className={`rounded-2xl border p-8 text-center relative overflow-hidden shadow-2xl ${
          verdict.isCorrect
            ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/50 via-noir-900 to-noir-950'
            : 'border-red-500/40 bg-gradient-to-b from-red-950/50 via-noir-900 to-noir-950'
        }`}
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border mb-4 shadow-lg mx-auto">
          {verdict.isCorrect ? (
            <div className="w-full h-full rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-full h-full rounded-full bg-red-500/20 border border-red-400 flex items-center justify-center text-red-400">
              <XCircle className="w-10 h-10" />
            </div>
          )}
        </div>

        <span className="font-mono text-xs uppercase tracking-widest block text-slate-400 mb-1">
          Investigation Closed • {result.difficulty.toUpperCase()} Complexity
        </span>

        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-100 mb-3">
          {verdict.isCorrect ? 'Case Solved! Culprit Captured' : 'Wrongful Accusation — Case Cold'}
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          {verdict.isCorrect
            ? `Outstanding deduction, Detective! You successfully identified ${verdict.actualCulpritName} as the true perpetrator.`
            : `Alas, Detective. You accused ${verdict.accusedSuspectName}, but the true mastermind was ${verdict.actualCulpritName}.`}
        </p>

        {/* Accused vs Actual Culprit Comparison Dossier */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className="px-4 py-2 rounded-lg bg-noir-850 border border-noir-700">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Your Accusation</span>
            <span className="font-semibold text-slate-100">{verdict.accusedSuspectName}</span>
          </div>

          <div className="px-4 py-2 rounded-lg bg-noir-850 border border-gold-500/40">
            <span className="text-gold-400 block text-[10px] uppercase font-mono">True Perpetrator</span>
            <span className="font-semibold text-gold-300">{verdict.actualCulpritName}</span>
          </div>
        </div>
      </div>

      {/* 2. Score Breakdown Card */}
      <ScoreBreakdownCard verdict={verdict} />

      {/* 3. Forensic Solution Narrative */}
      <div className="rounded-xl border border-noir-700 bg-noir-850 p-6 sm:p-8 space-y-6 shadow-noir-card">
        <div className="flex items-center gap-3 pb-4 border-b border-noir-700">
          <div className="w-10 h-10 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-slate-100">
              The Unraveling: Solution Narrative
            </h3>
            <p className="text-xs text-slate-400">
              How the crime was executed and how forensic deduction confirms guilt.
            </p>
          </div>
        </div>

        {/* Explanation text */}
        <p className="text-sm text-slate-200 leading-relaxed font-sans bg-noir-900/60 p-5 rounded-lg border border-noir-700/80">
          {solution.explanation}
        </p>

        {/* Evidence Chain */}
        <div className="space-y-3">
          <h4 className="font-serif text-sm font-semibold text-gold-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Chain of Evidence & Forensic Deductions
          </h4>
          <ul className="space-y-2">
            {solution.evidenceReasoning.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-noir-900/50 border border-noir-750 text-xs text-slate-300 leading-relaxed"
              >
                <span className="w-5 h-5 rounded-full bg-gold-500/20 text-gold-400 font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">
                  {idx + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. Action Buttons: "Play Again" and "Return Home" */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-noir-700 bg-noir-850 hover:bg-noir-800 text-slate-200 text-xs sm:text-sm font-semibold transition-colors"
        >
          <Home className="w-4 h-4" /> Return Home
        </Link>

        <button
          onClick={() => navigate('/create')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-noir-950 font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-gold-glow"
        >
          <RotateCcw className="w-4 h-4" /> Play Again / New Case
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;
