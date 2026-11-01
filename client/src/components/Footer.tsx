import React from 'react';
import { Search, Shield, Cpu, Database, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-noir-700/80 bg-noir-950/80 py-10 mt-20 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gold-500" />
              <span className="font-serif text-base font-bold text-slate-200">
                AI Mystery Room
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              An AI-powered procedural detective game where players analyze suspects, uncover sealed forensic clues, and test their deductive prowess against the clock.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border border-noir-600 bg-noir-850 text-slate-300">
                <Cpu className="w-3 h-3 text-gold-400" /> Google GenAI
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border border-noir-600 bg-noir-850 text-slate-300">
                <Database className="w-3 h-3 text-emerald-400" /> MongoDB Atlas
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border border-noir-600 bg-noir-850 text-slate-300">
                <Shield className="w-3 h-3 text-blue-400" /> Zero-Leak Security
              </span>
            </div>
          </div>

          {/* Quick Rules */}
          <div>
            <h4 className="font-serif text-slate-200 font-semibold mb-3 text-xs uppercase tracking-wider">
              Investigation Rules
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• Clue discovery awards +5 bonus points</li>
              <li>• Progressive hints incur -10 point penalty</li>
              <li>• Solved mystery base: Easy 100, Med 150, Hard 200</li>
              <li>• Single final accusation per investigation</li>
            </ul>
          </div>

          {/* Architecture info */}
          <div>
            <h4 className="font-serif text-slate-200 font-semibold mb-3 text-xs uppercase tracking-wider">
              Deduction Engine
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every mystery is generated dynamically with guaranteed logical consistency, mutually exclusive timelines, and verified physical evidence.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-noir-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} AI Mystery Room. Designed for portfolio demonstration.</p>
          <p className="flex items-center gap-1">
            Built with React, Express, TypeScript & Google Gemini
          </p>
        </div>
      </div>
    </footer>
  );
};
