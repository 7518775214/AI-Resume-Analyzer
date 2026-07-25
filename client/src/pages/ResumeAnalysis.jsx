import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { mockAnalysisDetails } from '../utils/mockData';

const ResumeAnalysis = () => {
  const details = mockAnalysisDetails;

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="ATS Analysis & Match Report"
        subtitle={`Detailed breakdown for "${details.fileName}" target matched against ${details.targetJobTitle}.`}
        breadcrumbs={['Dashboard', 'Analysis', details.id]}
        action={
          <div className="flex items-center space-x-3">
            <Button variant="outline" icon={<Icon name="download" className="w-4 h-4" />}>
              Export PDF Report
            </Button>
            <Link to="/interview">
              <Button variant="emerald" icon={<Icon name="mic" className="w-4 h-4" />}>
                Practice AI Mock Interview
              </Button>
            </Link>
          </div>
        }
      />

      {/* Top Banner Score Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-slate-950 border-4 border-emerald-500/80 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-3xl font-black text-emerald-400">{details.overallScore}</span>
            </div>
            <span className="absolute -bottom-1 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
              Excellent
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">ATS Readiness Band</span>
            <h2 className="text-2xl font-bold text-white">Target Match Rate: 94%</h2>
            <p className="text-xs text-slate-300">Scanned on {new Date(details.scannedAt).toLocaleDateString()} • Workday &amp; Lever ATS Compliant</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-center px-4 py-2 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">Keywords Found</div>
            <div className="text-lg font-bold text-indigo-400">28 / 31</div>
          </div>
          <div className="text-center px-4 py-2 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">Action Bullets</div>
            <div className="text-lg font-bold text-emerald-400">84% Metric</div>
          </div>
        </div>
      </div>

      {/* Sub-Categories Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card hoverEffect className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Format & Parsing</span>
            <span className="text-xs font-bold text-emerald-400">{details.categories.formatAndParsing.score}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${details.categories.formatAndParsing.score}%` }} />
          </div>
          <p className="text-xs text-slate-400 pt-1">{details.categories.formatAndParsing.detail}</p>
        </Card>

        <Card hoverEffect className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Keyword Match</span>
            <span className="text-xs font-bold text-indigo-400">{details.categories.keywordMatching.score}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${details.categories.keywordMatching.score}%` }} />
          </div>
          <p className="text-xs text-slate-400 pt-1">{details.categories.keywordMatching.detail}</p>
        </Card>

        <Card hoverEffect className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Impact Metrics</span>
            <span className="text-xs font-bold text-cyan-400">{details.categories.impactAndQuantification.score}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${details.categories.impactAndQuantification.score}%` }} />
          </div>
          <p className="text-xs text-slate-400 pt-1">{details.categories.impactAndQuantification.detail}</p>
        </Card>

        <Card hoverEffect className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Competency Match</span>
            <span className="text-xs font-bold text-purple-400">{details.categories.competencyAlignment.score}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${details.categories.competencyAlignment.score}%` }} />
          </div>
          <p className="text-xs text-slate-400 pt-1">{details.categories.competencyAlignment.detail}</p>
        </Card>
      </div>

      {/* Two Columns: Missing Keywords & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Missing Keywords Radar */}
        <Card className="space-y-4">
          <Card.Header>
            <div>
              <Card.Title>Missing Technical Keywords</Card.Title>
              <Card.Description>Terms found in the job description that are missing from your resume</Card.Description>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              4 Keyword Gaps
            </span>
          </Card.Header>

          <Card.Content>
            <div className="space-y-3">
              {details.missingKeywords.map((kw, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold text-slate-100">{kw.word}</div>
                    <div className="text-xs text-slate-400">{kw.category}</div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    kw.priority === 'High'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : kw.priority === 'Medium'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {kw.priority} Priority
                  </span>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        {/* AI Action Recommendations */}
        <Card className="space-y-4">
          <Card.Header>
            <div>
              <Card.Title>AI Bullet Enhancer & Suggestions</Card.Title>
              <Card.Description>Actionable recommendations to boost your match score to 98%+</Card.Description>
            </div>
          </Card.Header>

          <Card.Content>
            <div className="space-y-4">
              {details.recommendations.map((rec, idx) => (
                <div key={idx} className="bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-xl space-y-1.5">
                  <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400">
                    <Icon name="sparkles" className="w-3.5 h-3.5" />
                    <span>{rec.type}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{rec.text}</p>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Strengths & Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-emerald-500/20">
          <Card.Header>
            <Card.Title className="flex items-center space-x-2 text-emerald-400">
              <Icon name="checkCircle" className="w-5 h-5" />
              <span>Key Strengths Identified</span>
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <ul className="space-y-3 text-xs text-slate-300">
              {details.strengths.map((str, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <Icon name="checkCircle" className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </Card.Content>
        </Card>

        <Card className="border-amber-500/20">
          <Card.Header>
            <Card.Title className="flex items-center space-x-2 text-amber-400">
              <Icon name="alertTriangle" className="w-5 h-5" />
              <span>Areas For Improvement</span>
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <ul className="space-y-3 text-xs text-slate-300">
              {details.weaknesses.map((weak, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <Icon name="alertTriangle" className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{weak}</span>
                </li>
              ))}
            </ul>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default ResumeAnalysis;
