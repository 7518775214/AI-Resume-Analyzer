import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
  const [serverStatus, setServerStatus] = useState({ status: 'checking', message: 'Connecting to server...' });

  useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    axios.get(`${apiBaseUrl}/health`)
      .then((res) => {
        setServerStatus({ status: 'online', message: res.data.message });
      })
      .catch((err) => {
        setServerStatus({ status: 'offline', message: 'Backend server offline or unreachable.' });
      });
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-3">
          AI Resume Analyzer &amp; Interview Coach
        </h1>
        <p className="text-slate-400 text-base max-w-2xl">
          Project setup and initialization completed successfully. Frontend and Backend boilerplate configurations are ready.
        </p>

        <div className="mt-6 flex items-center space-x-3 text-sm">
          <span className="text-slate-400">Backend Status:</span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            serverStatus.status === 'online' 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : serverStatus.status === 'checking'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            <span className={`h-2 w-2 rounded-full mr-2 ${
              serverStatus.status === 'online' ? 'bg-emerald-400 animate-pulse' : serverStatus.status === 'checking' ? 'bg-amber-400' : 'bg-rose-400'
            }`} />
            {serverStatus.message}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-indigo-400 mb-2">Frontend Stack</h2>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-center">
              <span className="text-indigo-400 mr-2">✓</span> React (Vite)
            </li>
            <li className="flex items-center">
              <span className="text-indigo-400 mr-2">✓</span> Tailwind CSS
            </li>
            <li className="flex items-center">
              <span className="text-indigo-400 mr-2">✓</span> React Router DOM
            </li>
            <li className="flex items-center">
              <span className="text-indigo-400 mr-2">✓</span> Axios Client
            </li>
          </ul>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-indigo-400 mb-2">Backend Stack</h2>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-center">
              <span className="text-indigo-400 mr-2">✓</span> Node.js &amp; Express.js
            </li>
            <li className="flex items-center">
              <span className="text-indigo-400 mr-2">✓</span> CORS Middleware
            </li>
            <li className="flex items-center">
              <span className="text-indigo-400 mr-2">✓</span> Dotenv Configuration
            </li>
            <li className="flex items-center">
              <span className="text-indigo-400 mr-2">✓</span> Nodemon Dev Server
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
