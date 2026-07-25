import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon';

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: 'layoutDashboard' },
  { label: 'Upload Resume', path: '/upload', icon: 'upload' },
  { label: 'ATS Analysis', path: '/analysis', icon: 'fileText' },
  { label: 'AI Interview', path: '/interview', icon: 'mic' },
  { label: 'Reports & History', path: '/reports', icon: 'barChart' },
  { label: 'My Profile', path: '/profile', icon: 'user' },
  { label: 'Settings', path: '/settings', icon: 'settings' }
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-slate-950/60 border-r border-slate-800/80 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-1 flex-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Main Workspace
        </div>
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
              }`}
            >
              <Icon
                name={item.icon}
                className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-400'}`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Sidebar Footer Info Card */}
      <div className="pt-4 border-t border-slate-800/80 mt-auto space-y-3">
        <div className="bg-gradient-to-br from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-xl p-3.5 text-xs">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold mb-1">
            <Icon name="sparkles" className="w-3.5 h-3.5" />
            <span>PRO Plan Active</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-snug">
            Unlimited ATS parsing & 50 AI interview practice sessions left.
          </p>
        </div>

        <Link
          to="/login"
          className="flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <Icon name="logOut" className="w-4 h-4" />
          <span>Sign Out</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
