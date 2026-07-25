import React from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';

const Footer = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20">
                <Icon name="sparkles" className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">
                ResuPulse <span className="text-indigo-400">AI</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-powered resume optimization and realistic mock interview coaching engineered to land your target software roles faster.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/upload" className="hover:text-white transition-colors">ATS Resume Scanner</Link></li>
              <li><Link to="/interview" className="hover:text-white transition-colors">AI Interview Coach</Link></li>
              <li><Link to="/reports" className="hover:text-white transition-colors">Match Score Reports</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Analytics Dashboard</Link></li>
            </ul>
          </div>

          {/* Account Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">Career Profile</Link></li>
              <li><Link to="/settings" className="hover:text-white transition-colors">Preferences & API</Link></li>
            </ul>
          </div>

          {/* Legal / Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security Overview</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support & Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} ResuPulse AI. All rights reserved. Built with React & Tailwind CSS.</p>
          <div className="flex space-x-4">
            <span className="flex items-center space-x-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>All AI Systems Operational</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
