import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import Icon from '../components/Icon';
import useAuth from '../hooks/useAuth';

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, error: authError, clearError } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    targetRole: 'Senior Full Stack Developer'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  // Redirect authenticated users away from Register page
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (localError || authError) {
      setLocalError('');
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();
    setIsLoading(true);

    const payload = {
      fullName: formData.name,
      email: formData.email,
      password: formData.password,
    };

    const result = await register(payload);
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setLocalError(result.message || 'Registration failed. Please check your information.');
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mb-2">
            <Icon name="sparkles" className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Free Account</h1>
          <p className="text-xs text-slate-400">Join 45,000+ engineers optimizing their career search</p>
        </div>

        <Card className="shadow-2xl">
          {displayError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start space-x-2">
              <Icon name="alertCircle" className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              placeholder="Alex Morgan"
              value={formData.name}
              onChange={handleChange}
              icon={<Icon name="user" className="w-4 h-4" />}
              required
              disabled={isLoading}
            />

            <Input
              label="Work Email"
              type="email"
              name="email"
              placeholder="alex.morgan@example.com"
              value={formData.email}
              onChange={handleChange}
              icon={<Icon name="mail" className="w-4 h-4" />}
              required
              disabled={isLoading}
            />

            <Input
              label="Target Role Focus"
              type="select"
              name="targetRole"
              value={formData.targetRole}
              onChange={handleChange}
              options={[
                'Senior Full Stack Developer',
                'Frontend Engineer (React / Vue)',
                'Backend Engineer (Node / Go / Python)',
                'Software Architect',
                'DevOps & Cloud Engineer',
                'Data Engineer / AI Specialist'
              ]}
              icon={<Icon name="target" className="w-4 h-4" />}
              disabled={isLoading}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={handleChange}
              icon={<Icon name="lock" className="w-4 h-4" />}
              required
              disabled={isLoading}
            />

            <div className="flex items-start space-x-2 text-xs pt-1">
              <input type="checkbox" required className="mt-0.5 rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-0" />
              <span className="text-slate-400">
                I agree to the <a href="#" className="text-indigo-400 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-400 hover:underline">Privacy Policy</a>.
              </span>
            </div>

            <Button type="submit" variant="primary" fullWidth isLoading={isLoading} icon={<Icon name="arrowRight" className="w-4 h-4" />}>
              Create Free Account
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
