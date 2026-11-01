import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, FolderOpen, RotateCw } from 'lucide-react';
import { ErrorBanner } from './ErrorBanner.tsx';
import { CaseClientService } from '../services/caseService.ts';
import { ICaseDossierEntry } from '../types/case.ts';

export const CaseDossier: React.FC = () => {
  const [cases, setCases] = useState<ICaseDossierEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await CaseClientService.fetchCaseDossier();
      setCases(response.cases);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load saved investigations.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCases();
  }, [loadCases]);

  return (
    <section aria-labelledby="case-dossier-heading" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-gold-500">
            Your investigations
          </span>
          <h2 id="case-dossier-heading" className="font-serif text-2xl sm:text-3xl font-bold text-slate-100 mt-1">
            Cases Dossier
          </h2>
        </div>
        <button
          type="button"
          onClick={() => void loadCases()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-2 rounded-md border border-noir-700 bg-noir-850 text-sm text-slate-300 hover:text-gold-400 disabled:opacity-60"
        >
          <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh dossiers
        </button>
      </div>

      {error && (
        <ErrorBanner
          title="Unable to retrieve case dossiers"
          message={error}
          onRetry={() => void loadCases()}
        />
      )}

      {isLoading ? (
        <div role="status" className="rounded-xl border border-noir-700 bg-noir-850 p-8 text-center text-sm text-slate-400">
          Loading saved investigations...
        </div>
      ) : error ? null : cases.length === 0 ? (
        <div className="rounded-xl border border-dashed border-noir-700 bg-noir-850/60 p-8 text-center">
          <FolderOpen className="w-8 h-8 mx-auto text-gold-500/80" />
          <p className="mt-3 font-serif text-lg font-semibold text-slate-200">No investigations saved yet</p>
          <p className="mt-1 text-sm text-slate-400">New cases will appear here as soon as they are generated.</p>
          <Link
            to="/create"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gold-400 hover:text-gold-300"
          >
            Start an investigation <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cases.map((savedCase) => {
            const completed = savedCase.status === 'completed';
            const destination = completed
              ? `/case/${savedCase.caseId}/result`
              : `/case/${savedCase.caseId}`;

            return (
              <article
                key={savedCase.caseId}
                className="rounded-xl border border-noir-700 bg-noir-850 p-5 shadow-noir-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-wider text-gold-500">
                      {savedCase.caseId} · {savedCase.difficulty}
                    </p>
                    <h3 className="mt-1 font-serif text-lg font-bold text-slate-100">{savedCase.title}</h3>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${
                    completed
                      ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : 'border border-amber-500/30 bg-amber-500/10 text-amber-300'
                  }`}>
                    {savedCase.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-y-2 text-xs text-slate-400">
                  <span>Clues discovered</span>
                  <span className="text-right text-slate-200">
                    {savedCase.discoveredClueCount}/{savedCase.totalClues}
                  </span>
                  <span>Hints unlocked</span>
                  <span className="text-right text-slate-200">
                    {savedCase.revealedHintCount}/{savedCase.totalHints}
                  </span>
                  {completed && (
                    <>
                      <span>Final score</span>
                      <span className="text-right font-semibold text-gold-300">{savedCase.finalScore ?? 0}</span>
                      {savedCase.selectedSuspectName && (
                        <>
                          <span>Accused</span>
                          <span className="text-right text-slate-200">{savedCase.selectedSuspectName}</span>
                        </>
                      )}
                    </>
                  )}
                  {!completed && (
                    <>
                      <span>Current score</span>
                      <span className="text-right text-slate-200">{savedCase.currentScore}</span>
                    </>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-noir-700/70 pt-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {new Date(completed ? savedCase.updatedAt : savedCase.createdAt).toLocaleDateString()}
                  </span>
                  <Link
                    to={destination}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-400 hover:text-gold-300"
                  >
                    {completed ? 'View results' : 'Resume investigation'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
