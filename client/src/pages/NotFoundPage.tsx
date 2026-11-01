import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center text-center p-8 space-y-6">
      <div className="w-20 h-20 rounded-2xl bg-noir-850 border border-gold-500/30 flex items-center justify-center text-gold-400 shadow-gold-glow">
        <FileQuestion className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="font-mono text-xs text-gold-500 uppercase tracking-widest">
          Error 404 • Missing File
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-100">
          Case Record Not Found
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          The requested investigation docket does not exist in the detective archives. It may have been closed or filed under a different reference number.
        </p>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gold-500 text-noir-950 font-bold text-xs hover:bg-gold-400 transition-colors"
        >
          <Home className="w-4 h-4" /> Return to Home
        </Link>
      </div>
    </div>
  );
};
