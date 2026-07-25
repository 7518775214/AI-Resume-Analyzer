import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              AI
            </div>
            <span className="font-semibold text-lg tracking-tight text-white">
              AI Resume Analyzer <span className="text-indigo-400 font-normal">& Interview Coach</span>
            </span>
          </div>
          <nav className="flex items-center space-x-6 text-sm font-medium text-slate-300">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              System Ready
            </span>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-800 py-6 bg-slate-900/30 text-center text-xs text-slate-500">
        AI Resume Analyzer &amp; Interview Coach &copy; {new Date().getFullYear()} - Project Initialized
      </footer>
    </div>
  );
};

export default MainLayout;
