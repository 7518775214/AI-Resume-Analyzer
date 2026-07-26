import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Icon from '../components/Icon';

const ServerError = ({ error, onRetry }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    if (onRetry) onRetry();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="relative">
        <h1 className="text-8xl sm:text-9xl font-black bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 bg-clip-text text-transparent opacity-30 select-none">
          500
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="p-4 rounded-2xl bg-rose-600/10 border border-rose-500/20 text-rose-400 backdrop-blur-md">
            <Icon name="alertCircle" className="w-10 h-10" />
          </div>
        </div>
      </div>

      <div className="max-w-md space-y-2">
        <h2 className="text-2xl font-bold text-white tracking-tight">System Exception</h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          {error?.message || 'Something went wrong on our server while processing your request. Please try again or return to the dashboard.'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        {onRetry && (
          <Button
            variant="primary"
            onClick={onRetry}
            icon={<Icon name="refreshCw" className="w-4 h-4" />}
          >
            Try Again
          </Button>
        )}

        <Button
          variant="outline"
          onClick={handleGoHome}
          icon={<Icon name="layoutDashboard" className="w-4 h-4" />}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default ServerError;
