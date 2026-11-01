import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { caseApi, extractErrorMessage } from '../services/api.ts';
import { DifficultyLevel } from '../types/case.ts';
import { LoadingScreen } from '../components/LoadingScreen.tsx';
import { ErrorBanner } from '../components/ErrorBanner.tsx';
import {
  Search,
  Sparkles,
  Shuffle,
  Layers,
  Palette,
  Cpu,
  CheckCircle2,
} from 'lucide-react';

const RANDOM_PREMISES = [
  'A priceless diamond disappears from a locked museum room during an exclusive gala.',
  'A detective discovers a mysterious coded letter inside the library of an old gothic mansion.',
  'A valuable renaissance oil painting vanishes without a trace during a private billionaire party.',
  'A scientist’s confidential synthetic research drive goes missing from a secure bio-laboratory.',
  'A suspicious poisoning incident occurs inside the dining car aboard a luxury alpine express train.',
  'A rare vintage mechanical watch vanishes from the display case of an eccentric clockmaker.',
  'A top-secret chess grandmaster playbook disappears from the tournament green room before the finals.',
];

const THEMES = [
  'Classic Noir',
  'Victorian Gothic',
  'Luxury Train',
  'High Society Art Heist',
  'Lab / Sci-Fi Mystery',
  'Midnight Casino',
];

export const CreateMysteryPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const generationInFlight = useRef(false);

  const [premise, setPremise] = useState<string>('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [theme, setTheme] = useState<string>('Classic Noir');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize from router state if coming from preset cards on Home page
  useEffect(() => {
    if (location.state) {
      const state = location.state as { premise?: string; difficulty?: DifficultyLevel; theme?: string };
      if (state.premise) setPremise(state.premise);
      if (state.difficulty) setDifficulty(state.difficulty);
      if (state.theme) setTheme(state.theme);
    }
  }, [location.state]);

  const handleRandomize = () => {
    const randomIndex = Math.floor(Math.random() * RANDOM_PREMISES.length);
    setPremise(RANDOM_PREMISES[randomIndex]);
    setError(null);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (generationInFlight.current) return;

    const cleanPremise = premise.trim() || RANDOM_PREMISES[0];

    if (cleanPremise.length < 5) {
      setError('Please provide a mystery premise with at least 5 characters.');
      return;
    }

    if (cleanPremise.length > 500) {
      setError('Premise cannot exceed 500 characters.');
      return;
    }

    setError(null);
    generationInFlight.current = true;
    setIsLoading(true);

    try {
      const response = await caseApi.createCase(cleanPremise, difficulty, theme);
      if (response.success && response.case?.caseId) {
        // Navigate to investigation room after token is saved to sessionStorage
        navigate(`/case/${response.case.caseId}`);
      } else {
        throw new Error('Case creation did not return a valid case identifier.');
      }
    } catch (err: unknown) {
      console.error('Case generation failed:', err);
      const serverMessage = extractErrorMessage(
        err,
        'The mystery generation engine encountered a temporary delay. Please try again.'
      );
      setError(serverMessage);
      setIsLoading(false);
    } finally {
      generationInFlight.current = false;
    }
  };

  if (isLoading) {
    return (
      <LoadingScreen
        message="Generating Your Mystery Case"
        subtext={`Synthesizing ${difficulty.toUpperCase()} difficulty crime scene in ${theme} atmosphere...`}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gold-500/30 bg-noir-850 text-gold-400 text-xs font-semibold">
          <Cpu className="w-3.5 h-3.5" /> AI Case Synthesizer
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-100">
          Commission a New Investigation
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          Specify a crime scenario, select your desired difficulty level, and let Gemini craft an original, solvable fictional case with full logical consistency.
        </p>
      </div>

      {error && (
        <ErrorBanner
          title="Case Generation Halted"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Main Form */}
      <form onSubmit={handleGenerate} className="rounded-2xl border border-noir-700 bg-noir-850 p-6 sm:p-8 space-y-8 shadow-noir-card">
        {/* 1. Mystery Premise Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="premise" className="font-serif text-sm font-bold text-slate-200 flex items-center gap-2">
              <Search className="w-4 h-4 text-gold-500" />
              The Crime Premise
            </label>

            <button
              type="button"
              onClick={handleRandomize}
              className="inline-flex items-center gap-1.5 text-xs text-gold-400 hover:text-gold-300 font-semibold transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5" /> Surprise Me / Random
            </button>
          </div>

          <div className="relative">
            <textarea
              id="premise"
              rows={4}
              value={premise}
              onChange={(e) => setPremise(e.target.value)}
              placeholder="e.g. A priceless diamond disappears from a locked museum room during an exclusive gala..."
              className="w-full rounded-xl border border-noir-700 bg-noir-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 transition-colors"
              maxLength={500}
            />
            <div className="absolute bottom-3 right-3 text-[11px] font-mono text-slate-500">
              {premise.length}/500 chars
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Leave blank or click &quot;Surprise Me&quot; to automatically launch a mystery with our default signature premise.
          </p>
        </div>

        {/* 2. Theme Selection */}
        <div className="space-y-3">
          <label className="font-serif text-sm font-bold text-slate-200 flex items-center gap-2">
            <Palette className="w-4 h-4 text-gold-500" />
            Atmospheric Theme
          </label>

          <div className="flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setTheme(t)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  theme === t
                    ? 'border-gold-400 bg-gold-500/20 text-gold-300 shadow-sm'
                    : 'border-noir-700 bg-noir-900/60 text-slate-400 hover:border-noir-600 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Difficulty Tier Selection */}
        <div className="space-y-3">
          <label className="font-serif text-sm font-bold text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-gold-500" />
            Investigation Complexity
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Easy */}
            <div
              onClick={() => setDifficulty('easy')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                difficulty === 'easy'
                  ? 'border-emerald-500 bg-noir-800 shadow-md ring-1 ring-emerald-500/50'
                  : 'border-noir-700 bg-noir-900/60 hover:border-noir-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-400">EASY</span>
                <span className="text-[11px] text-gold-400 font-mono">100 Base Pts</span>
              </div>
              <h4 className="font-serif text-sm font-bold text-slate-100">Apprentice</h4>
              <ul className="mt-3 space-y-1 text-[11px] text-slate-400">
                <li>• 3 Suspects</li>
                <li>• 5 Clues</li>
                <li>• 2 Hints</li>
              </ul>
            </div>

            {/* Medium */}
            <div
              onClick={() => setDifficulty('medium')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                difficulty === 'medium'
                  ? 'border-gold-400 bg-noir-800 shadow-gold-glow ring-1 ring-gold-400/50'
                  : 'border-noir-700 bg-noir-900/60 hover:border-noir-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gold-400">MEDIUM</span>
                <span className="text-[11px] text-gold-400 font-mono">150 Base Pts</span>
              </div>
              <h4 className="font-serif text-sm font-bold text-slate-100">Senior Detective</h4>
              <ul className="mt-3 space-y-1 text-[11px] text-slate-400">
                <li>• 4 Suspects</li>
                <li>• 7 Clues</li>
                <li>• 3 Hints</li>
              </ul>
            </div>

            {/* Hard */}
            <div
              onClick={() => setDifficulty('hard')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                difficulty === 'hard'
                  ? 'border-red-500 bg-noir-800 shadow-md ring-1 ring-red-500/50'
                  : 'border-noir-700 bg-noir-900/60 hover:border-noir-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-red-400">HARD</span>
                <span className="text-[11px] text-gold-400 font-mono">200 Base Pts</span>
              </div>
              <h4 className="font-serif text-sm font-bold text-slate-100">Superintendent</h4>
              <ul className="mt-3 space-y-1 text-[11px] text-slate-400">
                <li>• 5 Suspects</li>
                <li>• 9 Clues</li>
                <li>• 3 Hints</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-noir-700/80">
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-noir-950 font-bold text-base transition-all shadow-lg hover:shadow-gold-glow"
          >
            <Sparkles className="w-5 h-5 text-noir-950" />
            Generate Mystery
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMysteryPage;
