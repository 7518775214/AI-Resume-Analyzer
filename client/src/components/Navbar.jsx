import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon';
import Button from './Button';

const Navbar = ({ isAppLayout = false }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white font-black text-base shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
            <Icon name="sparkles" className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-white group-hover:text-indigo-400 transition-colors">
              Resu<span className="text-indigo-400">Pulse</span> AI
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 -mt-1">
              Resume & Interview Coach
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        {!isAppLayout ? (
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link
              to="/"
              className={`transition-colors ${isActive('/') ? 'text-indigo-400 font-semibold' : 'text-slate-300 hover:text-white'}`}
            >
              Features
            </Link>
            <Link
              to="/upload"
              className={`transition-colors ${isActive('/upload') ? 'text-indigo-400 font-semibold' : 'text-slate-300 hover:text-white'}`}
            >
              Analyze Resume
            </Link>
            <Link
              to="/interview"
              className={`transition-colors ${isActive('/interview') ? 'text-indigo-400 font-semibold' : 'text-slate-300 hover:text-white'}`}
            >
              AI Interview
            </Link>
            <Link
              to="/dashboard"
              className={`transition-colors ${isActive('/dashboard') ? 'text-indigo-400 font-semibold' : 'text-slate-300 hover:text-white'}`}
            >
              Dashboard
            </Link>
          </nav>
        ) : (
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <Icon name="search" className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search resumes, jobs..."
                className="bg-slate-900 border border-slate-800 rounded-xl py-1.5 pl-9 pr-4 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 w-64"
              />
            </div>
          </div>
        )}

        {/* Right CTA / Auth Action Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          {!isAppLayout ? (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm" icon={<Icon name="arrowRight" className="w-4 h-4" />}>
                  Get Started
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 relative">
                <Icon name="bell" className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
              </button>
              <Link to="/profile" className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full border border-indigo-500/30 object-cover"
                />
                <span className="text-xs font-semibold text-slate-200">Alex M.</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900"
        >
          <Icon name={mobileMenuOpen ? 'x' : 'menu'} className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 p-4 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
          >
            Home / Landing
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
          >
            Dashboard
          </Link>
          <Link
            to="/upload"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
          >
            Upload Resume
          </Link>
          <Link
            to="/interview"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
          >
            AI Interview
          </Link>
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" size="sm" fullWidth>
                Sign In
              </Button>
            </Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="sm" fullWidth>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
