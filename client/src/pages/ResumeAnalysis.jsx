import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import resumeService from '../services/resumeService';

const ResumeAnalysis = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const resumeIdParam = searchParams.get('id');

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(resumeIdParam || '');
  const [activeResume, setActiveResume] = useState(null);

  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch all user resumes on component mount
  useEffect(() => {
    fetchUserResumes();
  }, []);

  // 2. Fetch specific resume details whenever selectedResumeId changes
  useEffect(() => {
    if (selectedResumeId) {
      fetchResumeDetails(selectedResumeId);
    } else {
      setActiveResume(null);
    }
  }, [selectedResumeId]);

  const fetchUserResumes = async () => {
    setIsLoadingResumes(true);
    try {
      const response = await resumeService.getUserResumes();
      if (response.status === 'success' && response.data?.resumes) {
        const list = response.data.resumes;
        setResumes(list);

        // If no URL param, default to the most recent resume
        if (!selectedResumeId && list.length > 0) {
          const firstId = list[0]._id || list[0].id;
          setSelectedResumeId(firstId);
          setSearchParams({ id: firstId });
        }
      }
    } catch (err) {
      console.error('[RESUME ANALYSIS] Failed to fetch user resumes:', err);
    } finally {
      setIsLoadingResumes(false);
    }
  };

  const fetchResumeDetails = async (id) => {
    setError(null);
    try {
      const response = await resumeService.getResumeById(id);
      if (response.status === 'success' && response.data?.resume) {
        const resumeData = response.data.resume;
        setActiveResume(resumeData);
      }
    } catch (err) {
      console.error('[RESUME ANALYSIS] Failed to fetch resume by ID:', err);
      const errMsg = err.response?.data?.message || 'Failed to load resume details.';
      setError(errMsg);
    }
  };

  // 3. Trigger Gemini AI Analysis via backend API
  const handleAnalyzeResume = async () => {
    if (!selectedResumeId) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await resumeService.analyzeResume(selectedResumeId);
      if (response.status === 'success' && response.data) {
        // Refresh resume details to display updated analysis
        await fetchResumeDetails(selectedResumeId);
      } else {
        throw new Error(response.message || 'AI Analysis failed to generate');
      }
    } catch (err) {
      console.error('[RESUME ANALYSIS ERROR]', err);
      const apiMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to generate Gemini AI Resume Analysis. Please check server logs and API configuration.';
      setError(apiMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectChange = (e) => {
    const newId = e.target.value;
    setSelectedResumeId(newId);
    if (newId) {
      setSearchParams({ id: newId });
    } else {
      setSearchParams({});
    }
  };

  const analysis = activeResume?.analysis;
  const hasAnalysis = activeResume?.analysisStatus === 'completed' && analysis;

  return (
    <div className="space-y-8 relative">
      {/* Fullscreen / Full Page Loader during AI Generation */}
      {isAnalyzing && (
        <Loader
          type="fullscreen"
          text="Gemini AI is analyzing resume structure, ATS keywords, and job alignment..."
        />
      )}

      {/* Page Header */}
      <PageHeader
        title="Gemini AI Resume Analysis"
        subtitle="Comprehensive ATS breakdown, key strengths, skill gaps, role alignment, and improvement suggestions."
        breadcrumbs={['Workspace', 'Analysis']}
        action={
          <div className="flex items-center space-x-3">
            <Link to="/upload">
              <Button variant="outline" icon={<Icon name="upload" className="w-4 h-4" />}>
                Upload New Resume
              </Button>
            </Link>
          </div>
        }
      />

      {/* Resume Selection Bar & Control Header */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 flex-1 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Select Uploaded Resume
            </label>
            <select
              value={selectedResumeId}
              onChange={handleSelectChange}
              disabled={isLoadingResumes || isAnalyzing}
              className="w-full sm:max-w-md bg-slate-900 border border-slate-800 text-sm text-slate-100 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
            >
              {resumes.length === 0 ? (
                <option value="">No uploaded resumes found</option>
              ) : (
                resumes.map((res) => (
                  <option key={res._id || res.id} value={res._id || res.id}>
                    {res.originalFileName} {res.jobTitle ? `(${res.jobTitle})` : ''} - {new Date(res.uploadDate).toLocaleDateString()}
                  </option>
                ))
              )}
            </select>
          </div>

          {selectedResumeId && (
            <div className="w-full sm:w-auto flex justify-end">
              <Button
                variant="primary"
                onClick={handleAnalyzeResume}
                disabled={isAnalyzing || isLoadingResumes}
                icon={<Icon name="sparkles" className="w-4 h-4" />}
              >
                {hasAnalysis ? 'Re-Analyze with Gemini AI' : 'Run Gemini AI Analysis'}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Error Alert Message */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start space-x-3">
          <Icon name="alertCircle" className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-semibold text-rose-200">Analysis Error</p>
            <p className="text-xs text-rose-300/90 leading-relaxed">{error}</p>
            <button
              onClick={handleAnalyzeResume}
              className="mt-2 text-xs font-semibold text-rose-400 underline hover:text-rose-200"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Content State: No Resumes Uploaded */}
      {!isLoadingResumes && resumes.length === 0 && (
        <EmptyState
          icon="fileText"
          title="No Resumes Uploaded Yet"
          description="Upload your resume in PDF or DOCX format to get an instant AI ATS score and actionable recommendations."
          actionLabel="Upload Resume Now"
          onAction={() => (window.location.href = '/upload')}
          actionIcon="upload"
        />
      )}

      {/* Content State: Resume selected but not yet analyzed */}
      {activeResume && !hasAnalysis && !isAnalyzing && (
        <Card className="p-8 text-center space-y-4 bg-slate-900/60 border-dashed border-2 border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center border border-indigo-500/20">
            <Icon name="sparkles" className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold text-white">Ready for Gemini AI Evaluation</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Click the button below to send your resume text to Google Gemini for a complete ATS audit, skill match, and improvement breakdown.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={handleAnalyzeResume}
            icon={<Icon name="sparkles" className="w-5 h-5" />}
          >
            Start Gemini AI Resume Analysis
          </Button>
        </Card>
      )}

      {/* Main Analysis Display Dashboard */}
      {hasAnalysis && (
        <div className="space-y-8">
          {/* Top Banner: Overall Score & Target Job Summary */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
              <div className="relative flex items-center justify-center">
                <div
                  className={`w-28 h-28 rounded-full bg-slate-950 border-4 flex items-center justify-center shadow-lg ${
                    analysis.atsScore >= 85
                      ? 'border-emerald-500 text-emerald-400 shadow-emerald-500/20'
                      : analysis.atsScore >= 70
                      ? 'border-indigo-500 text-indigo-400 shadow-indigo-500/20'
                      : 'border-amber-500 text-amber-400 shadow-amber-500/20'
                  }`}
                >
                  <span className="text-4xl font-black">{analysis.atsScore}</span>
                </div>
                <span
                  className={`absolute -bottom-2 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    analysis.atsScore >= 85
                      ? 'bg-emerald-500 text-slate-950'
                      : analysis.atsScore >= 70
                      ? 'bg-indigo-500 text-white'
                      : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {analysis.atsScore >= 85 ? 'Top Match' : analysis.atsScore >= 70 ? 'Good Match' : 'Needs Work'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                  Overall ATS Score
                </span>
                <h2 className="text-2xl font-bold text-white">
                  {activeResume.jobTitle ? `Target Role: ${activeResume.jobTitle}` : activeResume.originalFileName}
                </h2>
                <p className="text-xs text-slate-300">
                  Evaluated on {new Date(analysis.analyzedAt || activeResume.updatedAt).toLocaleDateString()} • Powered by Gemini AI
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-center px-4 py-3 bg-slate-950/60 rounded-2xl border border-slate-800">
                <div className="text-xs text-slate-400">Strengths</div>
                <div className="text-lg font-bold text-emerald-400">{analysis.strengths?.length || 0}</div>
              </div>
              <div className="text-center px-4 py-3 bg-slate-950/60 rounded-2xl border border-slate-800">
                <div className="text-xs text-slate-400">Missing Skills</div>
                <div className="text-lg font-bold text-rose-400">{analysis.missingSkills?.length || 0}</div>
              </div>
              <div className="text-center px-4 py-3 bg-slate-950/60 rounded-2xl border border-slate-800">
                <div className="text-xs text-slate-400">Action Items</div>
                <div className="text-lg font-bold text-indigo-400">{analysis.improvements?.length || 0}</div>
              </div>
            </div>
          </div>

          {/* Executive Summary Card */}
          {analysis.summary && (
            <Card className="bg-indigo-950/20 border-indigo-500/30">
              <Card.Header>
                <Card.Title className="text-indigo-300 flex items-center space-x-2">
                  <Icon name="sparkles" className="w-5 h-5 text-indigo-400" />
                  <span>Executive AI Summary</span>
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  {analysis.summary}
                </p>
              </Card.Content>
            </Card>
          )}

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Strengths */}
            <Card className="border-emerald-500/20">
              <Card.Header>
                <Card.Title className="flex items-center space-x-2 text-emerald-400">
                  <Icon name="checkCircle" className="w-5 h-5 shrink-0" />
                  <span>Key Strengths Identified</span>
                </Card.Title>
                <Card.Description>Core technical capabilities and strong areas in your resume</Card.Description>
              </Card.Header>
              <Card.Content>
                <ul className="space-y-3">
                  {analysis.strengths && analysis.strengths.length > 0 ? (
                    analysis.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start space-x-3 text-xs text-slate-200 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                        <Icon name="checkCircle" className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{str}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No specific strengths returned.</p>
                  )}
                </ul>
              </Card.Content>
            </Card>

            {/* Weaknesses */}
            <Card className="border-amber-500/20">
              <Card.Header>
                <Card.Title className="flex items-center space-x-2 text-amber-400">
                  <Icon name="alertTriangle" className="w-5 h-5 shrink-0" />
                  <span>Weaknesses &amp; Gaps</span>
                </Card.Title>
                <Card.Description>Areas needing more clarity, formatting, or metric evidence</Card.Description>
              </Card.Header>
              <Card.Content>
                <ul className="space-y-3">
                  {analysis.weaknesses && analysis.weaknesses.length > 0 ? (
                    analysis.weaknesses.map((weak, idx) => (
                      <li key={idx} className="flex items-start space-x-3 text-xs text-slate-200 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                        <Icon name="alertTriangle" className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{weak}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No specific weaknesses flagged.</p>
                  )}
                </ul>
              </Card.Content>
            </Card>
          </div>

          {/* Missing Skills & Role Match Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Missing Skills */}
            <Card className="border-rose-500/20">
              <Card.Header>
                <Card.Title className="flex items-center space-x-2 text-rose-400">
                  <Icon name="alertCircle" className="w-5 h-5 shrink-0" />
                  <span>Missing Skills &amp; Keywords</span>
                </Card.Title>
                <Card.Description>Important skills or keywords recommended to add</Card.Description>
              </Card.Header>
              <Card.Content>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills && analysis.missingSkills.length > 0 ? (
                    analysis.missingSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold flex items-center space-x-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        <span>{skill}</span>
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No missing skills detected.</p>
                  )}
                </div>
              </Card.Content>
            </Card>

            {/* Role Match */}
            <Card className="border-cyan-500/20">
              <Card.Header>
                <Card.Title className="flex items-center space-x-2 text-cyan-400">
                  <Icon name="target" className="w-5 h-5 shrink-0" />
                  <span>Role Match &amp; Alignment</span>
                </Card.Title>
                <Card.Description>Evaluation of how well experience matches position requirements</Card.Description>
              </Card.Header>
              <Card.Content>
                <ul className="space-y-3">
                  {analysis.roleMatch && analysis.roleMatch.length > 0 ? (
                    analysis.roleMatch.map((match, idx) => (
                      <li key={idx} className="flex items-start space-x-3 text-xs text-slate-200 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                        <Icon name="checkCircle" className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{match}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No specific role match notes.</p>
                  )}
                </ul>
              </Card.Content>
            </Card>
          </div>

          {/* Actionable Improvements List */}
          <Card className="border-indigo-500/20">
            <Card.Header>
              <Card.Title className="flex items-center space-x-2 text-indigo-400">
                <Icon name="sparkles" className="w-5 h-5 shrink-0" />
                <span>Actionable Resume Improvements</span>
              </Card.Title>
              <Card.Description>Step-by-step suggestions to boost your ATS match score</Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="space-y-3">
                {analysis.improvements && analysis.improvements.length > 0 ? (
                  analysis.improvements.map((imp, idx) => (
                    <div
                      key={idx}
                      className="bg-indigo-950/30 border border-indigo-500/20 p-4 rounded-2xl flex items-start space-x-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">{imp}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No specific improvements recommended.</p>
                )}
              </div>
            </Card.Content>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalysis;
