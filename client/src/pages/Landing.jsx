import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Icon from '../components/Icon';

const Landing = () => {
  return (
    <div className="space-y-24 py-12 overflow-hidden">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        {/* Decorative ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-8 animate-fade-in">
          <Icon name="sparkles" className="w-4 h-4 text-indigo-400" />
          <span>Next-Gen AI Resume Scanner & Real-Time Mock Interviewer</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Land 3x More Interviews With <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
            AI-Engineered Resumes & Practice
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Analyze your resume against top ATS screeners, bridge technical keyword gaps, and master behavioral & coding mock interviews with instant AI feedback.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/upload" className="w-full sm:w-auto">
            <Button size="lg" icon={<Icon name="upload" className="w-5 h-5" />} fullWidth>
              Upload Resume Free
            </Button>
          </Link>
          <Link to="/interview" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" icon={<Icon name="mic" className="w-5 h-5" />} fullWidth>
              Try AI Interview Practice
            </Button>
          </Link>
        </div>

        {/* Hero Interactive UI Preview Mockup */}
        <div className="mt-16 relative max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl p-4 sm:p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <span className="text-xs text-slate-500 font-mono">resupulse-ai.workspace/analyzer</span>
            <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              ATS Match: 92%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">ATS Score</div>
              <div className="text-3xl font-extrabold text-emerald-400">92 / 100</div>
              <p className="text-xs text-slate-400 mt-1">Format & keyword syntax compatible with Workday & Lever.</p>
            </div>
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">Keyword Alignment</div>
              <div className="text-3xl font-extrabold text-indigo-400">28 / 31</div>
              <p className="text-xs text-slate-400 mt-1">High overlap with target Senior Fullstack role specs.</p>
            </div>
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">Mock Interview Readiness</div>
              <div className="text-3xl font-extrabold text-cyan-400">High (89%)</div>
              <p className="text-xs text-slate-400 mt-1">STAR method responses validated by AI Coach.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest">Built For Job Seekers & Tech Professionals</span>
          <h2 className="text-3xl font-bold text-white tracking-tight">Everything You Need To Secure Your Next Offer</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card hoverEffect className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Icon name="fileText" className="w-6 h-6" />
            </div>
            <Card.Title>ATS Resume Optimization</Card.Title>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instantly parse PDF/DOCX resumes. Get instant scoring breakdowns across typography, formatting, section headers, and key technical stack matches.
            </p>
          </Card>

          <Card hoverEffect className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Icon name="mic" className="w-6 h-6" />
            </div>
            <Card.Title>Interactive AI Voice Interview Coach</Card.Title>
            <p className="text-xs text-slate-400 leading-relaxed">
              Practice role-tailored technical & behavioral interview questions with real-time AI speech analysis, STAR method scoring, and instant improvement tips.
            </p>
          </Card>

          <Card hoverEffect className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Icon name="barChart" className="w-6 h-6" />
            </div>
            <Card.Title>Keyword Gap Radar & Bullet Rewriter</Card.Title>
            <p className="text-xs text-slate-400 leading-relaxed">
              Identify missing high-priority keywords from job descriptions and generate metric-driven achievement bullets with a single click.
            </p>
          </Card>
        </div>
      </section>

      {/* Social Proof / Stats Section */}
      <section className="bg-slate-900/40 border-y border-slate-800/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white">45,000+</div>
            <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">Resumes Scanned</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-indigo-400">93.4%</div>
            <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">ATS Pass Rate</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-cyan-400">120,000+</div>
            <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">Mock Questions Answered</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400">3.2x</div>
            <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">More Recruiter Callbacks</div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest">Flexible Plans</span>
          <h2 className="text-3xl font-bold text-white tracking-tight">Invest In Your Career Success</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8">
          <Card className="space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Free Starter</span>
              <div className="text-4xl font-black text-white">$0 <span className="text-sm font-normal text-slate-400">/ month</span></div>
              <p className="text-xs text-slate-400">Essential resume scoring for active job applicants.</p>
              <ul className="space-y-3 text-xs text-slate-300 pt-4 border-t border-slate-800">
                <li className="flex items-center space-x-2"><Icon name="checkCircle" className="w-4 h-4 text-indigo-400" /><span>3 ATS Resume Analysis scans / mo</span></li>
                <li className="flex items-center space-x-2"><Icon name="checkCircle" className="w-4 h-4 text-indigo-400" /><span>Basic Keyword Matching Report</span></li>
                <li className="flex items-center space-x-2"><Icon name="checkCircle" className="w-4 h-4 text-indigo-400" /><span>5 AI Mock Interview Practice questions</span></li>
              </ul>
            </div>
            <Link to="/register">
              <Button variant="outline" fullWidth>Get Started Free</Button>
            </Link>
          </Card>

          <Card className="space-y-6 flex flex-col justify-between border-indigo-500/50 shadow-2xl relative">
            <span className="absolute -top-3 right-6 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-[10px] uppercase font-bold px-3 py-0.5 rounded-full">
              Most Popular
            </span>
            <div className="space-y-4">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Pro Career Pass</span>
              <div className="text-4xl font-black text-white">$19 <span className="text-sm font-normal text-slate-400">/ month</span></div>
              <p className="text-xs text-slate-400">Unlimited resume scans & advanced AI voice coaching.</p>
              <ul className="space-y-3 text-xs text-slate-300 pt-4 border-t border-slate-800">
                <li className="flex items-center space-x-2"><Icon name="checkCircle" className="w-4 h-4 text-emerald-400" /><span>Unlimited ATS Resume Scans & Downloads</span></li>
                <li className="flex items-center space-x-2"><Icon name="checkCircle" className="w-4 h-4 text-emerald-400" /><span>AI Bullet Point Rewriter & Metrics Enhancer</span></li>
                <li className="flex items-center space-x-2"><Icon name="checkCircle" className="w-4 h-4 text-emerald-400" /><span>Unlimited AI Voice Mock Interviews & STAR Analysis</span></li>
                <li className="flex items-center space-x-2"><Icon name="checkCircle" className="w-4 h-4 text-emerald-400" /><span>Priority Job Description Target Matching</span></li>
              </ul>
            </div>
            <Link to="/register">
              <Button variant="primary" fullWidth icon={<Icon name="sparkles" className="w-4 h-4" />}>Upgrade to Pro</Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/30 rounded-3xl p-10 sm:p-14 space-y-6 shadow-2xl">
          <h2 className="text-3xl font-extrabold text-white">Ready To Supercharge Your Job Application?</h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Upload your resume now to get your instant ATS score breakdown and start practicing realistic AI mock interviews today.
          </p>
          <div className="pt-4">
            <Link to="/upload">
              <Button size="lg" icon={<Icon name="arrowRight" className="w-5 h-5" />}>
                Upload Resume Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
