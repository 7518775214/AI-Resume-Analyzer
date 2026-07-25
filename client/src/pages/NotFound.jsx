import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Icon from '../components/Icon';

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center p-4 text-center space-y-6">
      <div className="relative">
        <h1 className="text-8xl sm:text-9xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent opacity-30 select-none">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 backdrop-blur-md">
            <Icon name="alertTriangle" className="w-10 h-10" />
          </div>
        </div>
      </div>

      <div className="max-w-md space-y-2">
        <h2 className="text-2xl font-bold text-white tracking-tight">Page Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          The page or analysis report you are looking for might have been moved, renamed, or does not exist in your workspace.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <Link to="/dashboard">
          <Button variant="primary" icon={<Icon name="layoutDashboard" className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline">
            Go to Landing Page
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
