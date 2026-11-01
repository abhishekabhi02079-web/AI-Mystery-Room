import React, { useState, useEffect } from 'react';
import { Search, Sparkles, FileText, Fingerprint } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  subtext?: string;
}

const detectiveCues = [
  'Dispatching detective unit to the crime scene...',
  'Analyzing forensic footprints and perimeter locks...',
  'Interrogating witnesses and verifying suspect alibis...',
  'Establishing timeline of events and motives...',
  'Sealing physical evidence into encrypted dossiers...',
  'Preparing the case file for investigation...',
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Generating Mystery Investigation',
  subtext,
}) => {
  const [cueIndex, setCueIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCueIndex((prev) => (prev + 1) % detectiveCues.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      {/* Animated magnifying glass and fingerprint icon */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border border-gold-500/30 bg-noir-850 flex items-center justify-center shadow-gold-glow relative z-10 animate-pulse-subtle">
          <Search className="w-10 h-10 text-gold-400 animate-bounce" />
        </div>
        <div className="absolute inset-0 rounded-full border border-gold-400/20 animate-ping opacity-40"></div>
        <div className="absolute -top-2 -right-2 bg-noir-800 p-2 rounded-full border border-gold-500/50 shadow-md">
          <Fingerprint className="w-5 h-5 text-gold-300" />
        </div>
      </div>

      {/* Main Title */}
      <h3 className="font-serif text-2xl font-bold text-slate-100 tracking-wide mb-2">
        {message}
      </h3>

      {/* Dynamic Detective Cues */}
      <div className="h-8 flex items-center justify-center">
        <p className="text-sm text-gold-400 font-mono tracking-wide flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gold-400 animate-spin" />
          {subtext || detectiveCues[cueIndex]}
        </p>
      </div>

      {/* Decorative progress track */}
      <div className="w-64 h-1.5 bg-noir-800 rounded-full mt-6 overflow-hidden border border-noir-700">
        <div className="h-full bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 rounded-full animate-pulse w-full"></div>
      </div>

      <p className="text-xs text-slate-500 mt-4 max-w-xs">
        Powered by Google Gemini generative AI. Synthesizing a logically consistent whodunit.
      </p>
    </div>
  );
};
