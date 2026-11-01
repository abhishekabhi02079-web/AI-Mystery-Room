import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Shield,
  FileSearch,
  Users,
  Award,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Gem,
  Palette,
  FlaskConical,
  Train,
  Scroll,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { CaseDossier } from '../components/CaseDossier.tsx';

export const PRESET_PREMISES = [
  {
    id: 'museum-diamond',
    title: 'The Vault of the Midnight Diamond',
    premise: 'A priceless diamond disappears from a locked museum room during a gala.',
    theme: 'Classic Noir',
    difficulty: 'medium' as const,
    icon: Gem,
    color: 'from-amber-500/20 to-noir-850',
    borderColor: 'border-amber-500/30',
  },
  {
    id: 'old-mansion-letter',
    title: 'The Secret of Blackwood Manor',
    premise: 'A detective discovers a mysterious letter at an old gothic mansion.',
    theme: 'Victorian Gothic',
    difficulty: 'easy' as const,
    icon: Scroll,
    color: 'from-purple-500/20 to-noir-850',
    borderColor: 'border-purple-500/30',
  },
  {
    id: 'private-party-painting',
    title: 'The Vanished Renaissance Masterpiece',
    premise: 'A valuable painting vanishes during a private high-society party.',
    theme: 'High Society',
    difficulty: 'medium' as const,
    icon: Palette,
    color: 'from-blue-500/20 to-noir-850',
    borderColor: 'border-blue-500/30',
  },
  {
    id: 'laboratory-research',
    title: 'Project Chimera: The Lab Breach',
    premise: 'A scientist’s confidential synthetic research goes missing from a secured laboratory.',
    theme: 'Sci-Fi Corporate',
    difficulty: 'hard' as const,
    icon: FlaskConical,
    color: 'from-emerald-500/20 to-noir-850',
    borderColor: 'border-emerald-500/30',
  },
  {
    id: 'luxury-train',
    title: 'The Orient Express Enigma',
    premise: 'A suspicious incident occurs aboard a luxury transcontinental train in the Alps.',
    theme: 'Luxury Train Mystery',
    difficulty: 'hard' as const,
    icon: Train,
    color: 'from-red-500/20 to-noir-850',
    borderColor: 'border-red-500/30',
  },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleLaunchPreset = (premise: string, difficulty: string, theme: string) => {
    navigate('/create', { state: { premise, difficulty, theme } });
  };

  return (
    <div className="space-y-24 py-6">
      {/* 1. Hero Section */}
      <section className="relative text-center py-12 md:py-20 overflow-hidden">
        {/* Ambient atmospheric glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[320px] bg-gold-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gold-500/30 bg-noir-850/80 text-gold-400 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          Interactive AI-Powered Detective Deduction Game
        </div>

        {/* Hero Heading as specified */}
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-100 max-w-4xl mx-auto leading-tight sm:leading-none">
          Every Mystery <span className="gold-gradient-text">Has a Secret.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Step into the detective&apos;s shoes in an AI-powered whodunit. Inspect suspect dossiers, dismantle false alibis, uncover sealed forensic evidence, and render the final accusation.
        </p>

        {/* Action Buttons as specified: Primary "Start Investigating", Secondary "How to Play" */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/create"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-lg bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-noir-950 font-bold text-sm sm:text-base transition-all shadow-lg hover:shadow-gold-glow"
          >
            <Search className="w-5 h-5" />
            Start Investigating
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <a
            href="#how-to-play"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-noir-700 bg-noir-850 hover:bg-noir-800 text-slate-200 text-sm font-semibold transition-colors"
          >
            <BookOpen className="w-4 h-4 text-gold-500" />
            How to Play
          </a>
        </div>

        {/* Quick Trust / Mechanics Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-noir-800 text-left">
          <div className="p-3">
            <span className="font-serif text-xl font-bold text-gold-400 block">100% Solvable</span>
            <span className="text-xs text-slate-400">Strict logical consistency engine</span>
          </div>
          <div className="p-3">
            <span className="font-serif text-xl font-bold text-emerald-400 block">Zero-Leak Guard</span>
            <span className="text-xs text-slate-400">Culprit sealed until verified accusation</span>
          </div>
          <div className="p-3">
            <span className="font-serif text-xl font-bold text-blue-400 block">Deductive Depth</span>
            <span className="text-xs text-slate-400">Forensics, alibis & physical clues</span>
          </div>
          <div className="p-3">
            <span className="font-serif text-xl font-bold text-purple-400 block">Backend Scoring</span>
            <span className="text-xs text-slate-400">Clue bonuses & hint penalties</span>
          </div>
        </div>
      </section>

      <CaseDossier />

      {/* 2. Three Feature Cards as explicitly required */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-gold-500">
            Core Mechanics
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100 mt-1">
            The Three Pillars of Deduction
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Every case is built on watertight logic. Follow the procedure to separate truth from deception.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Card 1: Investigate the Evidence */}
          <div className="rounded-xl border border-noir-700 bg-noir-850 p-6 space-y-4 hover:border-gold-500/40 transition-all shadow-noir-card">
            <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <FileSearch className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-100">
              Investigate the Evidence
            </h3>
            <p className="text-xs text-slate-300/90 leading-relaxed">
              Uncover sealed forensic files, analyze digital security logs, examine physical footprints, and cross-reference witness depositions. Each uncovered clue awards +5 bonus points toward your final evaluation.
            </p>
          </div>

          {/* Card 2: Interrogate the Possibilities */}
          <div className="rounded-xl border border-noir-700 bg-noir-850 p-6 space-y-4 hover:border-blue-500/40 transition-all shadow-noir-card">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-100">
              Interrogate the Possibilities
            </h3>
            <p className="text-xs text-slate-300/90 leading-relaxed">
              Scrutinize suspect dossiers, dismantle conflicting alibis, and discover hidden motives. Innocent suspects may harbor personal secrets or red herrings, but their alibis are conclusively validated by the evidence.
            </p>
          </div>

          {/* Card 3: Reveal the Truth */}
          <div className="rounded-xl border border-noir-700 bg-noir-850 p-6 space-y-4 hover:border-emerald-500/40 transition-all shadow-noir-card">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-100">
              Reveal the Truth
            </h3>
            <p className="text-xs text-slate-300/90 leading-relaxed">
              Present your formal accusation before the tribunal. The backend unlocks the secret solution, evaluates your verdict against cryptographic records, and delivers a complete forensic breakdown with your final verified score.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Difficulty Previews (Easy, Medium, Hard) as specified */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-gold-500">
            Case Complexity
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100 mt-1">
            Difficulty Levels
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Tailor the investigation challenge to your deductive experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Easy */}
          <div className="rounded-xl border border-noir-700 bg-noir-850 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                EASY
              </span>
              <span className="text-xs text-gold-400 font-semibold">100 Base Pts</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-100">Apprentice Detective</h3>
            <p className="text-xs text-slate-400">
              Straightforward crime scenes with clear motives, direct alibi contradictions, and obvious forensic traces.
            </p>
            <div className="pt-4 border-t border-noir-700/60 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Suspects:</span>
                <strong className="text-slate-100">3 Suspects</strong>
              </div>
              <div className="flex justify-between">
                <span>Evidence Clues:</span>
                <strong className="text-slate-100">5 Clues</strong>
              </div>
              <div className="flex justify-between">
                <span>Cryptic Hints:</span>
                <strong className="text-slate-100">2 Hints</strong>
              </div>
            </div>
          </div>

          {/* Medium */}
          <div className="rounded-xl border border-gold-500/40 bg-noir-850 p-6 space-y-4 shadow-gold-glow relative">
            <div className="absolute -top-3 right-4 bg-gold-500 text-noir-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow">
              Recommended
            </div>
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-950/60 text-amber-400 border border-amber-500/30">
                MEDIUM
              </span>
              <span className="text-xs text-gold-400 font-semibold">150 Base Pts</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-100">Senior Detective</h3>
            <p className="text-xs text-slate-400">
              Plausible red herrings, multi-layered alibis, and timeline subtleties requiring careful deduction.
            </p>
            <div className="pt-4 border-t border-noir-700/60 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Suspects:</span>
                <strong className="text-slate-100">4 Suspects</strong>
              </div>
              <div className="flex justify-between">
                <span>Evidence Clues:</span>
                <strong className="text-slate-100">7 Clues</strong>
              </div>
              <div className="flex justify-between">
                <span>Cryptic Hints:</span>
                <strong className="text-slate-100">3 Hints</strong>
              </div>
            </div>
          </div>

          {/* Hard */}
          <div className="rounded-xl border border-noir-700 bg-noir-850 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-red-950/60 text-red-400 border border-red-500/30">
                HARD
              </span>
              <span className="text-xs text-gold-400 font-semibold">200 Base Pts</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-100">Superintendent</h3>
            <p className="text-xs text-slate-400">
              Complex premeditated schemes, conflicting witness testimonies, digital overrides, and subtle alibi fractures.
            </p>
            <div className="pt-4 border-t border-noir-700/60 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Suspects:</span>
                <strong className="text-slate-100">5 Suspects</strong>
              </div>
              <div className="flex justify-between">
                <span>Evidence Clues:</span>
                <strong className="text-slate-100">9 Clues</strong>
              </div>
              <div className="flex justify-between">
                <span>Cryptic Hints:</span>
                <strong className="text-slate-100">3 Hints</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Concise Explanation of the Gameplay / How to Play */}
      <section id="how-to-play" className="rounded-2xl border border-noir-700 bg-noir-850/60 p-8 sm:p-12 shadow-noir-card">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-gold-500">
            Investigative Protocol
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100 mt-1">
            How Gameplay Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Four disciplined steps from briefing to verdict.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-xl border border-noir-700/80 bg-noir-900/60 space-y-3">
            <div className="w-8 h-8 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 font-serif font-bold text-sm">
              1
            </div>
            <h3 className="font-serif text-sm font-bold text-slate-200">
              1. Commission Case
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose your preferred difficulty and enter a custom premise or pick a classic detective trope.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-noir-700/80 bg-noir-900/60 space-y-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-serif font-bold text-sm">
              2
            </div>
            <h3 className="font-serif text-sm font-bold text-slate-200">
              2. Examine Dossiers
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Read the crime briefing, scrutinize suspect motives, and evaluate declared alibis against the timeline.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-noir-700/80 bg-noir-900/60 space-y-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-serif font-bold text-sm">
              3
            </div>
            <h3 className="font-serif text-sm font-bold text-slate-200">
              3. Uncover Evidence
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click sealed clues to reveal forensics (+5 pts each). Request sequential cryptic hints if stuck (-10 pts each).
            </p>
          </div>

          <div className="p-5 rounded-xl border border-noir-700/80 bg-noir-900/60 space-y-3">
            <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 font-serif font-bold text-sm">
              4
            </div>
            <h3 className="font-serif text-sm font-bold text-slate-200">
              4. Submit Accusation
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Accuse the true perpetrator. Your score and the full forensic solution narrative are unsealed permanently.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Signature Mystery Scenarios */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-gold-500">
              Curated Crime Dossiers
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100 mt-1">
              Signature Mystery Scenarios
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md">
            Click any signature preset to preload the case generator or craft your own original mystery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRESET_PREMISES.map((preset) => {
            const Icon = preset.icon;
            return (
              <div
                key={preset.id}
                className={`rounded-xl border ${preset.borderColor} bg-gradient-to-b ${preset.color} p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] shadow-noir-card`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-noir-900/80 border border-noir-700 flex items-center justify-center text-gold-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded border border-noir-600 bg-noir-900 text-slate-300">
                      {preset.difficulty}
                    </span>
                  </div>

                  <h3 className="font-serif text-base font-bold text-slate-100 mb-2">
                    {preset.title}
                  </h3>
                  <p className="text-xs text-slate-300/90 leading-relaxed mb-4">
                    {preset.premise}
                  </p>
                </div>

                <div className="pt-4 border-t border-noir-700/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {preset.theme}
                  </span>
                  <button
                    onClick={() => handleLaunchPreset(preset.premise, preset.difficulty, preset.theme)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-400 hover:text-gold-300 transition-colors"
                  >
                    Investigate <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
