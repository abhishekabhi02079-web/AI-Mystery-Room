import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Compass, PlusCircle, ShieldAlert, Menu, X, BookOpen } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isInvestigation = location.pathname.startsWith('/case/');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-noir-700/80 bg-noir-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500/20 to-noir-800 border border-gold-500/40 flex items-center justify-center text-gold-400 group-hover:border-gold-400 transition-colors shadow-gold-glow">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-wide text-slate-100 group-hover:text-gold-400 transition-colors">
                AI MYSTERY <span className="text-gold-500 font-extrabold">ROOM</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-widest text-slate-400 -mt-1 font-mono">
                Detective Deduction Bureau
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-gold-400 ${
                location.pathname === '/' ? 'text-gold-400 font-semibold' : 'text-slate-300'
              }`}
            >
              Cases Dossier
            </Link>

            <a
              href="/#how-to-play"
              className="text-sm font-medium text-slate-300 hover:text-gold-400 transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-gold-500/80" />
              How to Play
            </a>

            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-gold-600 to-gold-500 text-noir-950 text-sm font-semibold hover:from-gold-500 hover:to-gold-400 transition-all shadow-md hover:shadow-gold-glow"
            >
              <PlusCircle className="w-4 h-4" />
              New Investigation
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-slate-200 hover:bg-noir-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-noir-700 bg-noir-850 px-4 pt-2 pb-4 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-noir-800 hover:text-gold-400"
          >
            Cases Dossier
          </Link>
          <a
            href="/#how-to-play"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-noir-800 hover:text-gold-400"
          >
            How to Play
          </a>
          <Link
            to="/create"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium bg-gold-500 text-noir-950 font-semibold"
          >
            Start New Investigation
          </Link>
        </div>
      )}
    </header>
  );
};
