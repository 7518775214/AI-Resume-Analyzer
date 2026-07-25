import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { mockUser, mockResumes } from '../utils/mockData';

const Dashboard = () => {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title={`Welcome back, ${mockUser.name.split(' ')[0]}! 👋`}
        subtitle="Track your resume ATS scores, keyword match targets, and upcoming AI interview sessions."
        badge="Pro Workspace"
        breadcrumbs={['Workspace', 'Dashboard']}
        action={
          <Link to="/upload">
            <Button variant="primary" icon={<Icon name="upload" className="w-4 h-4" />}>
              Upload New Resume
            </Button>
          </Link>
        }
      />

      {/* Top Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card hoverEffect className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Resumes Analyzed</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Icon name="fileText" className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">{mockUser.metrics.resumesAnalyzed}</span>
            <span className="text-xs font-medium text-emerald-400">+2 this week</span>
          </div>
        </Card>

        <Card hoverEffect className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Avg. ATS Score</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Icon name="checkCircle" className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-emerald-400">{mockUser.metrics.avgAtsScore} / 100</span>
            <span className="text-xs font-medium text-emerald-400">Top 5% Band</span>
          </div>
        </Card>

        <Card hoverEffect className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Interviews Practiced</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Icon name="mic" className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">{mockUser.metrics.interviewsPracticed}</span>
            <span className="text-xs font-medium text-cyan-400">87% Avg Score</span>
          </div>
        </Card>

        <Card hoverEffect className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Overall Readiness</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Icon name="award" className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-purple-300">{mockUser.metrics.overallReadiness}</span>
            <span className="text-xs font-medium text-purple-400">Interview Ready</span>
          </div>
        </Card>
      </div>

      {/* Two Column Section: Quick Actions & Recommended Session */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Upload Widget */}
        <Card className="lg:col-span-2 space-y-4">
          <Card.Header>
            <div>
              <Card.Title>Quick Resume Scan</Card.Title>
              <Card.Description>Match your resume directly against target job descriptions</Card.Description>
            </div>
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              Instant AI Scan
            </span>
          </Card.Header>

          <Card.Content>
            <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-8 text-center bg-slate-950/40 transition-colors cursor-pointer space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center border border-indigo-500/20">
                <Icon name="upload" className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Drag & drop your resume PDF / DOCX file here</p>
                <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX up to 10MB</p>
              </div>
              <Link to="/upload">
                <Button variant="secondary" size="sm">Browse Files</Button>
              </Link>
            </div>
          </Card.Content>
        </Card>

        {/* AI Interview Launch Card */}
        <Card className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border-indigo-500/30 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Icon name="sparkles" className="w-4 h-4" />
              <span>Recommended Next Step</span>
            </div>
            <h3 className="text-xl font-bold text-white">System Design & React AI Mock Interview</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Practice 3 realistic questions tailored for Stripe Senior Frontend Engineer specs with audio speech analysis.
            </p>
          </div>

          <div className="pt-6 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
              <span>Estimated Time: 15 mins</span>
              <span className="text-emerald-400 font-medium">3 Questions</span>
            </div>
            <Link to="/interview">
              <Button variant="primary" fullWidth icon={<Icon name="play" className="w-4 h-4" />}>
                Start AI Interview Practice
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Resumes Table */}
      <Card>
        <Card.Header>
          <div>
            <Card.Title>Recent Resumes & Match Reports</Card.Title>
            <Card.Description>View your past uploaded resume versions and their ATS metrics</Card.Description>
          </div>
          <Link to="/reports">
            <Button variant="ghost" size="sm" icon={<Icon name="chevronRight" className="w-4 h-4" />}>
              View All Reports
            </Button>
          </Link>
        </Card.Header>

        <Card.Content>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Resume File</th>
                  <th className="py-3 px-4">Target Job</th>
                  <th className="py-3 px-4">ATS Score</th>
                  <th className="py-3 px-4">Match Rate</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {mockResumes.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-100 flex items-center space-x-2">
                      <Icon name="fileText" className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="truncate max-w-[200px]">{res.fileName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{res.targetJob}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                        res.atsScore >= 90
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : res.atsScore >= 80
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {res.atsScore} / 100
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">{res.matchPercentage}% Match</td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link to="/analysis">
                        <Button variant="outline" size="sm">
                          View Analysis
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default Dashboard;
