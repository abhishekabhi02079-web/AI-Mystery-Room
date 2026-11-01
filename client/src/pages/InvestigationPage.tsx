import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { caseApi, extractErrorMessage } from '../services/api.ts';
import { IPublicCase } from '../types/case.ts';
import { SuspectCard } from '../components/SuspectCard.tsx';
import { ClueCard } from '../components/ClueCard.tsx';
import { HintDrawer } from '../components/HintDrawer.tsx';
import { LoadingScreen } from '../components/LoadingScreen.tsx';
import { ErrorBanner } from '../components/ErrorBanner.tsx';
import { tokenStorage } from '../utils/tokenStorage.ts';
import {
  Search,
  ShieldAlert,
  FileText,
  Users,
  Award,
  Layers,
  Sparkles,
  ArrowRight,
  Clock,
  Compass,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export const InvestigationPage: React.FC = () => {
  const params = useParams<{ caseId?: string; id?: string }>();
  const caseId = params.caseId || params.id;
  const navigate = useNavigate();

  const [currentCase, setCurrentCase] = useState<IPublicCase | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch case data
  const loadCase = async () => {
    if (!caseId) return;
    setError(null);
    try {
      const data = await caseApi.getCase(caseId);
      // If already completed, redirect directly to result
      if (data.status === 'completed') {
        navigate(`/case/${caseId}/result`, { replace: true });
        return;
      }
      setCurrentCase(data);
    } catch (err: unknown) {
      console.error('Failed to load case:', err);
      const msg = extractErrorMessage(
        err,
        'Unable to load investigation records for this case ID.'
      );
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCase();
  }, [caseId]);

  // Handler for discovering a clue
  const handleDiscoverClue = async (clueId: string) => {
    if (!caseId || !currentCase) return;
    try {
      const response = await caseApi.discoverClue(caseId, clueId);
      if (response.success && response.case) {
        setCurrentCase(response.case);
      }
    } catch (err: unknown) {
      console.error('Discover clue error:', err);
      const msg = extractErrorMessage(err, 'Failed to examine clue.');
      setError(msg);
    }
  };

  // Handler for requesting a hint
  const handleRequestHint = async () => {
    if (!caseId || !currentCase) return;
    try {
      const response = await caseApi.requestHint(caseId);
      if (response.success && response.case) {
        setCurrentCase(response.case);
      }
    } catch (err: unknown) {
      console.error('Request hint error:', err);
      const msg = extractErrorMessage(err, 'Failed to unlock hint.');
      setError(msg);
    }
  };

  const handleNavigateToAccusation = () => {
    if (!caseId) return;
    navigate(`/case/${caseId}/accuse`);
  };

  if (isLoading) {
    return <LoadingScreen message="Accessing Crime Scene Files..." subtext="Retrieving sealed dossiers..." />;
  }

  if (error || !currentCase) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-6">
        <ErrorBanner
          title="Case Retrieval Interrupted"
          message={error || 'The requested case file is unavailable or has expired.'}
          onRetry={loadCase}
        />
        <div className="text-center">
          <button
            onClick={() => navigate('/create')}
            className="px-6 py-2.5 rounded-lg bg-gold-500 text-noir-950 font-bold text-xs"
          >
            Commission a New Case
          </button>
        </div>
      </div>
    );
  }

  const discoveredCount = currentCase.discoveredClueIds.length;
  const progressPercent = Math.round((discoveredCount / currentCase.totalClues) * 100);

  return (
    <div className="space-y-10 py-4 animate-fade-in">
      {/* 1. Header Bar: Case Title, Difficulty, Score, and Accuse CTA */}
      <div className="rounded-2xl border border-noir-700 bg-noir-850 p-6 shadow-noir-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-gold-400 bg-noir-900 px-2.5 py-0.5 rounded border border-noir-700">
                {currentCase.caseId}
              </span>
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded border border-noir-700 bg-noir-900 text-slate-300">
                {currentCase.difficulty} Level
              </span>
              <span className="text-xs font-medium text-slate-400">
                {currentCase.theme}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-semibold">
                Status: Active Investigation
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-100">
              {currentCase.title}
            </h1>
          </div>

          {/* Stats & Accusation Button */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-noir-700">
            {/* Clues progress */}
            <div className="text-center sm:text-right">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                Evidence Uncovered
              </span>
              <span className="font-serif text-lg font-bold text-slate-100">
                {discoveredCount} / {currentCase.totalClues} ({progressPercent}%)
              </span>
            </div>

            {/* Provisional score */}
            <div className="text-center sm:text-right">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                Provisional Bonus
              </span>
              <span
                className={`font-serif text-lg font-bold ${
                  currentCase.provisionalScore >= 0 ? 'text-gold-400' : 'text-red-400'
                }`}
              >
                {currentCase.provisionalScore > 0 ? `+${currentCase.provisionalScore}` : currentCase.provisionalScore} pts
              </span>
            </div>

            {/* Accuse CTA Button */}
            <button
              onClick={handleNavigateToAccusation}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-red-500/20"
            >
              <ShieldAlert className="w-4 h-4" />
              Make Accusation
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Track */}
        <div className="w-full h-1.5 bg-noir-900 rounded-full mt-6 overflow-hidden border border-noir-700/80">
          <div
            className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 2. Story Briefing / Scene Setting */}
      <section className="rounded-xl border border-noir-700/80 bg-noir-850/60 p-6 space-y-3">
        <h2 className="font-serif text-base font-bold text-gold-400 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          The Incident Briefing
        </h2>
        <p className="text-sm text-slate-200 leading-relaxed font-sans">
          {currentCase.story}
        </p>
      </section>

      {/* 3. Persons of Interest / Suspects Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-gold-500" />
              Persons of Interest ({currentCase.suspects.length})
            </h2>
            <p className="text-xs text-slate-400">
              Scrutinize motives and verify claimed alibis against forensic evidence. Exactly one is the culprit.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentCase.suspects.map((suspect) => (
            <SuspectCard key={suspect.id} suspect={suspect} />
          ))}
        </div>
      </section>

      {/* 4. Evidence Board / Clues Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-slate-100 flex items-center gap-2">
              <Search className="w-5 h-5 text-gold-500" />
              Evidence Board ({discoveredCount}/{currentCase.totalClues} Discovered)
            </h2>
            <p className="text-xs text-slate-400">
              Click &quot;Examine&quot; on sealed files to reveal critical forensics, documents, and witness statements (+5 pts each).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentCase.clues.map((clue, idx) => (
            <ClueCard
              key={clue.id}
              clue={clue}
              index={idx}
              onDiscover={handleDiscoverClue}
            />
          ))}
        </div>
      </section>

      {/* 5. Progressive Hints Section */}
      <section className="space-y-4">
        <HintDrawer
          hints={currentCase.hints}
          hintsRemaining={currentCase.hintsRemaining}
          totalHints={currentCase.totalHints}
          onRequestHint={handleRequestHint}
        />
      </section>

      {/* 6. Accusation Callout Banner at bottom of room */}
      <div className="rounded-xl border border-red-500/30 bg-gradient-to-r from-red-950/40 via-noir-850 to-noir-850 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-serif text-base font-bold text-slate-100 flex items-center justify-center sm:justify-start gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" /> Ready to Crack the Case?
          </h3>
          <p className="text-xs text-slate-400">
            Submitting a final accusation permanently seals this investigation and calculates your score.
          </p>
        </div>
        <button
          onClick={handleNavigateToAccusation}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-red-500/20 flex-shrink-0"
        >
          Proceed to Accusation Tribunal
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default InvestigationPage;
