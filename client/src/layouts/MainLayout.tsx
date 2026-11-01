import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar.tsx';
import { Footer } from '../components/Footer.tsx';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-noir-900 text-slate-100 selection:bg-gold-500 selection:text-noir-950">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
