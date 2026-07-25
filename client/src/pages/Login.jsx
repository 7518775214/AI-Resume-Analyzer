import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import Icon from '../components/Icon';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 800);
  };

  const handleFillDemo = () => {
    setEmail('alex.morgan@example.com');
    setPassword('demoPass123!');
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mb-2">
            <Icon name="sparkles" className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-400">Sign in to your ResuPulse AI workspace</p>
        </div>

        <Card className="shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Icon name="mail" className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Icon name="lock" className="w-4 h-4" />}
              required
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input type="checkbox" className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-0" />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-indigo-400 hover:underline">Forgot password?</a>
            </div>

            <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
              Sign In to Account
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center space-y-4">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={handleFillDemo}
              icon={<Icon name="user" className="w-4 h-4 text-indigo-400" />}
            >
              Fill Demo User Credentials
            </Button>

            <p className="text-xs text-slate-400">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-indigo-400 font-semibold hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
