import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import resumeService from '../services/resumeService';

const Interview = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const resumeIdParam = searchParams.get('id');

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(resumeIdParam || '');
  const [activeResume, setActiveResume] = useState(null);

  const [targetRoleInput, setTargetRoleInput] = useState('');
  const [activeTab, setActiveTab] = useState('technical'); // 'technical' | 'hr' | 'project' | 'tips'

  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch user resumes on mount
  useEffect(() => {
    fetchUserResumes();
  }, []);

  // 2. Fetch specific resume details whenever selectedResumeId changes
  useEffect(() => {
    if (selectedResumeId) {
      fetchResumeDetails(selectedResumeId);
    } else {
      setActiveResume(null);
      setTargetRoleInput('');
    }
  }, [selectedResumeId]);

  const fetchUserResumes = async () => {
    setIsLoadingResumes(true);
    try {
      const response = await resumeService.getUserResumes();
      if (response.status === 'success' && response.data?.resumes) {
        const list = response.data.resumes;
        setResumes(list);

        if (!selectedResumeId && list.length > 0) {
          const firstId = list[0]._id || list[0].id;
          setSelectedResumeId(firstId);
          setSearchParams({ id: firstId });
        }
      }
    } catch (err) {
      console.error('[INTERVIEW PAGE] Failed to fetch resumes:', err);
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
        setTargetRoleInput(resumeData.jobTitle || '');

        if (resumeData.interviewQuestionsStatus === 'failed') {
          setError('Previous AI interview question generation for this resume encountered an error. Click "Generate Questions" to retry.');
        }
      }
    } catch (err) {
      console.error('[INTERVIEW PAGE] Failed to fetch resume details:', err);
      const errMsg = err.response?.data?.message || 'Failed to load resume details.';
      setError(errMsg);
    }
  };

  // 3. Trigger Gemini AI Interview Question Generation
  const handleGenerateQuestions = async () => {
    if (!selectedResumeId) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await resumeService.generateInterviewQuestions(
        selectedResumeId,
        targetRoleInput
      );

      if (response.status === 'success' && response.data) {
        await fetchResumeDetails(selectedResumeId);
      } else {
        throw new Error(response.message || 'Failed to generate interview questions.');
      }
    } catch (err) {
      console.error('[INTERVIEW PAGE ERROR]', err);
      const apiMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to generate interview questions with Gemini AI. Please try again.';
      setError(apiMessage);
    } finally {
      setIsGenerating(false);
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

  const questions = activeResume?.interviewQuestions;
  const hasQuestions = activeResume?.interviewQuestionsStatus === 'completed' && questions;

  return (
    <div className="space-y-8 relative">
      {/* Fullscreen Loader during AI Question Generation */}
      {isGenerating && (
        <Loader
          type="fullscreen"
          text="Gemini AI is generating custom technical, behavioral, and project-based interview questions..."
        />
      )}

      {/* Header */}
      <PageHeader
        title="AI Interview Question Generator"
        subtitle="Tailored technical, behavioral, and project-based interview questions built from your parsed resume & AI analysis."
        breadcrumbs={['Workspace', 'Interview Generator']}
        action={
          <Link to="/analysis">
            <Button variant="outline" icon={<Icon name="sparkles" className="w-4 h-4" />}>
              View Resume Analysis
            </Button>
          </Link>
        }
      />

      {/* Control Bar: Resume Selector & Target Role Input */}
      <Card className="p-6 space-y-4 sm:space-y-0 sm:flex sm:items-end sm:justify-between sm:gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
          {/* Resume Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Select Candidate Resume
            </label>
            <select
              value={selectedResumeId}
              onChange={handleSelectChange}
              disabled={isLoadingResumes || isGenerating}
              className="w-full bg-slate-900 border border-slate-800 text-sm text-slate-100 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
            >
              {resumes.length === 0 ? (
                <option value="">No uploaded resumes found</option>
              ) : (
                resumes.map((res) => (
                  <option key={res._id || res.id} value={res._id || res.id}>
                    {res.originalFileName} {res.jobTitle ? `(${res.jobTitle})` : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Target Role Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Target Job Role / Title
            </label>
            <input
              type="text"
              value={targetRoleInput}
              onChange={(e) => setTargetRoleInput(e.target.value)}
              placeholder="e.g. Senior Full Stack Engineer"
              disabled={isLoadingResumes || isGenerating || !selectedResumeId}
              className="w-full bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        {/* Generate / Regenerate Button */}
        {selectedResumeId && (
          <div className="shrink-0 pt-2 sm:pt-0">
            <Button
              variant="primary"
              size="md"
              onClick={handleGenerateQuestions}
              disabled={isGenerating || isLoadingResumes}
              icon={<Icon name="sparkles" className="w-4 h-4" />}
            >
              {hasQuestions ? 'Regenerate Questions' : 'Generate Questions'}
            </Button>
          </div>
        )}
      </Card>

      {/* Error Alert Display */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start space-x-3">
          <Icon name="alertCircle" className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-semibold text-rose-200">Question Generation Error</p>
            <p className="text-xs text-rose-300/90 leading-relaxed">{error}</p>
            <button
              onClick={handleGenerateQuestions}
              className="mt-2 text-xs font-semibold text-rose-400 underline hover:text-rose-200"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Empty State: No Resumes */}
      {!isLoadingResumes && resumes.length === 0 && (
        <EmptyState
          icon="fileText"
          title="No Uploaded Resumes Found"
          description="Upload your resume first to automatically generate tailored interview questions and tips."
          actionLabel="Upload Resume Now"
          onAction={() => (window.location.href = '/upload')}
          actionIcon="upload"
        />
      )}

      {/* Empty State: Resume selected but no questions generated yet */}
      {activeResume && !hasQuestions && !isGenerating && (
        <Card className="p-8 text-center space-y-4 bg-slate-900/60 border-dashed border-2 border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center border border-indigo-500/20">
            <Icon name="sparkles" className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold text-white">Generate Custom Interview Questions</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Gemini AI will analyze candidate background, technical skills, and target job role to generate targeted interview questions categorized by difficulty and type.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={handleGenerateQuestions}
            icon={<Icon name="sparkles" className="w-5 h-5" />}
          >
            Generate Interview Questions with AI
          </Button>
        </Card>
      )}

      {/* Display Generated Questions Dashboard */}
      {hasQuestions && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                Target Role: {activeResume.jobTitle || 'Software Engineer'}
              </span>
              <h2 className="text-2xl font-bold text-white">
                Custom AI Interview Question Set
              </h2>
              <p className="text-xs text-slate-300">
                Generated for {activeResume.originalFileName} on {new Date(questions.generatedAt || activeResume.updatedAt).toLocaleDateString()}
              </p>
            </div>

            {/* Category Counter Badges */}
            <div className="flex flex-wrap justify-center gap-3">
              <div className="text-center px-4 py-2 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Technical</div>
                <div className="text-base font-bold text-indigo-400">
                  {(questions.technical?.easy?.length || 0) + (questions.technical?.medium?.length || 0) + (questions.technical?.hard?.length || 0)}
                </div>
              </div>
              <div className="text-center px-4 py-2 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">HR / Behavioral</div>
                <div className="text-base font-bold text-cyan-400">{questions.hr?.length || 0}</div>
              </div>
              <div className="text-center px-4 py-2 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Project-Based</div>
                <div className="text-base font-bold text-amber-400">{questions.projectBased?.length || 0}</div>
              </div>
              <div className="text-center px-4 py-2 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Prep Tips</div>
                <div className="text-base font-bold text-purple-400">{questions.tips?.length || 0}</div>
              </div>
            </div>
          </div>

          {/* Navigation Category Tabs */}
          <div className="flex border-b border-slate-800 overflow-x-auto no-scrollbar space-x-2">
            <button
              onClick={() => setActiveTab('technical')}
              className={`px-5 py-3 text-xs font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center space-x-2 border-b-2 ${
                activeTab === 'technical'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon name="cpu" className="w-4 h-4" />
              <span>Technical Questions</span>
            </button>

            <button
              onClick={() => setActiveTab('hr')}
              className={`px-5 py-3 text-xs font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center space-x-2 border-b-2 ${
                activeTab === 'hr'
                  ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon name="user" className="w-4 h-4" />
              <span>HR &amp; Behavioral</span>
            </button>

            <button
              onClick={() => setActiveTab('project')}
              className={`px-5 py-3 text-xs font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center space-x-2 border-b-2 ${
                activeTab === 'project'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon name="target" className="w-4 h-4" />
              <span>Project-Based</span>
            </button>

            <button
              onClick={() => setActiveTab('tips')}
              className={`px-5 py-3 text-xs font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center space-x-2 border-b-2 ${
                activeTab === 'tips'
                  ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon name="sparkles" className="w-4 h-4" />
              <span>Interview Preparation Tips</span>
            </button>
          </div>

          {/* Tab 1: Technical Questions Grouped by Difficulty */}
          {activeTab === 'technical' && (
            <div className="space-y-8">
              {/* Easy Questions */}
              <Card className="border-emerald-500/20">
                <Card.Header>
                  <div className="flex items-center justify-between">
                    <Card.Title className="text-emerald-400 flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span>Easy / Core Fundamentals</span>
                    </Card.Title>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      Easy Level
                    </span>
                  </div>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-3">
                    {questions.technical?.easy?.length > 0 ? (
                      questions.technical.easy.map((q, idx) => (
                        <div key={idx} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-start space-x-3">
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded shrink-0">
                            Q{idx + 1}
                          </span>
                          <p className="text-xs text-slate-200 leading-relaxed font-medium">{q}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400">No easy technical questions generated.</p>
                    )}
                  </div>
                </Card.Content>
              </Card>

              {/* Medium Questions */}
              <Card className="border-indigo-500/20">
                <Card.Header>
                  <div className="flex items-center justify-between">
                    <Card.Title className="text-indigo-400 flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                      <span>Medium / System Design &amp; Architecture</span>
                    </Card.Title>
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                      Medium Level
                    </span>
                  </div>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-3">
                    {questions.technical?.medium?.length > 0 ? (
                      questions.technical.medium.map((q, idx) => (
                        <div key={idx} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-start space-x-3">
                          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded shrink-0">
                            Q{idx + 1}
                          </span>
                          <p className="text-xs text-slate-200 leading-relaxed font-medium">{q}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400">No medium technical questions generated.</p>
                    )}
                  </div>
                </Card.Content>
              </Card>

              {/* Hard Questions */}
              <Card className="border-rose-500/20">
                <Card.Header>
                  <div className="flex items-center justify-between">
                    <Card.Title className="text-rose-400 flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      <span>Hard / Advanced Edge Cases &amp; Scalability</span>
                    </Card.Title>
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                      Hard Level
                    </span>
                  </div>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-3">
                    {questions.technical?.hard?.length > 0 ? (
                      questions.technical.hard.map((q, idx) => (
                        <div key={idx} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-start space-x-3">
                          <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded shrink-0">
                            Q{idx + 1}
                          </span>
                          <p className="text-xs text-slate-200 leading-relaxed font-medium">{q}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400">No hard technical questions generated.</p>
                    )}
                  </div>
                </Card.Content>
              </Card>
            </div>
          )}

          {/* Tab 2: HR & Behavioral Questions */}
          {activeTab === 'hr' && (
            <Card className="border-cyan-500/20">
              <Card.Header>
                <Card.Title className="text-cyan-400 flex items-center space-x-2">
                  <Icon name="user" className="w-5 h-5" />
                  <span>HR &amp; Behavioral Questions</span>
                </Card.Title>
                <Card.Description>Evaluates teamwork, communication, STAR framework, and cultural alignment</Card.Description>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  {questions.hr?.length > 0 ? (
                    questions.hr.map((q, idx) => (
                      <div key={idx} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-start space-x-3">
                        <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded shrink-0">
                          Q{idx + 1}
                        </span>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">{q}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No HR questions generated.</p>
                  )}
                </div>
              </Card.Content>
            </Card>
          )}

          {/* Tab 3: Project-Based Questions */}
          {activeTab === 'project' && (
            <Card className="border-amber-500/20">
              <Card.Header>
                <Card.Title className="text-amber-400 flex items-center space-x-2">
                  <Icon name="target" className="w-5 h-5" />
                  <span>Project-Based &amp; Experience Deep Dive</span>
                </Card.Title>
                <Card.Description>Questions probing past project contributions, trade-offs, and metrics</Card.Description>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  {questions.projectBased?.length > 0 ? (
                    questions.projectBased.map((q, idx) => (
                      <div key={idx} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-start space-x-3">
                        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded shrink-0">
                          Q{idx + 1}
                        </span>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">{q}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No project-based questions generated.</p>
                  )}
                </div>
              </Card.Content>
            </Card>
          )}

          {/* Tab 4: Preparation Tips */}
          {activeTab === 'tips' && (
            <Card className="border-purple-500/20">
              <Card.Header>
                <Card.Title className="text-purple-400 flex items-center space-x-2">
                  <Icon name="sparkles" className="w-5 h-5" />
                  <span>Actionable Preparation Strategy &amp; Tips</span>
                </Card.Title>
                <Card.Description>Tips tailored to address your specific missing skills and resume weaknesses</Card.Description>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  {questions.tips?.length > 0 ? (
                    questions.tips.map((tip, idx) => (
                      <div key={idx} className="bg-purple-950/20 border border-purple-500/20 p-4 rounded-xl flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">{tip}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No preparation tips generated.</p>
                  )}
                </div>
              </Card.Content>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Interview;
