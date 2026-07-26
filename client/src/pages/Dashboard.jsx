import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { AuthContext } from '../context/AuthContext';
import dashboardService from '../services/dashboardService';
import resumeService from '../services/resumeService';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isMountedRef = useRef(true);

  // Metrics State
  const [stats, setStats] = useState({
    totalResumes: 0,
    totalAnalyses: 0,
    totalInterviewSessions: 0,
    avgAtsScore: null,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Resume History & Pagination State
  const [resumes, setResumes] = useState([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResumesCount, setTotalResumesCount] = useState(0);

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('uploadDate');
  const [sortOrder, setSortOrder] = useState('desc');

  // Delete Modal & Action State
  const [deleteResumeTarget, setDeleteResumeTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Global & Operation Error States
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // Track component mounting lifecycle
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch Dashboard Stats
  const fetchDashboardStats = useCallback(async () => {
    if (!isMountedRef.current) return;
    setIsLoadingStats(true);
    try {
      const response = await dashboardService.getDashboardData();
      if (isMountedRef.current && response.status === 'success' && response.data?.stats) {
        setStats(response.data.stats);
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error('[DASHBOARD ERROR] Failed to load dashboard stats:', err);
        const msg = err.response?.data?.message || 'Failed to load dashboard metrics.';
        setError(msg);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingStats(false);
      }
    }
  }, []);

  // Fetch Resumes with Pagination, Search, Filter and Sorting
  const fetchResumes = useCallback(async (
    currentPage = 1,
    search = searchQuery,
    status = statusFilter,
    sort = sortBy,
    order = sortOrder
  ) => {
    if (!isMountedRef.current) return;
    setIsLoadingResumes(true);
    setError(null);
    try {
      const response = await resumeService.getUserResumes(currentPage, limit, search, status, sort, order);
      if (isMountedRef.current && response.status === 'success' && response.data) {
        setResumes(response.data.resumes || []);
        setPage(response.data.page || currentPage);
        setTotalPages(response.data.totalPages || 1);
        setTotalResumesCount(response.data.total || 0);
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error('[DASHBOARD ERROR] Failed to load resumes history:', err);
        const msg = err.response?.data?.message || 'Failed to load resume history.';
        setError(msg);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingResumes(false);
      }
    }
  }, [limit, searchQuery, statusFilter, sortBy, sortOrder]);

  // Load initial statistics on mount
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Load history list whenever page, search, status, or sorting changes
  useEffect(() => {
    fetchResumes(page, searchQuery, statusFilter, sortBy, sortOrder);
  }, [fetchResumes, page, searchQuery, statusFilter, sortBy, sortOrder]);

  // Filter & Search Handlers
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e) => {
    const [newSortBy, newSortOrder] = e.target.value.split(':');
    setSortBy(newSortBy || 'uploadDate');
    setSortOrder(newSortOrder || 'desc');
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setSortBy('uploadDate');
    setSortOrder('desc');
    setPage(1);
  };

  // Handle Delete Confirmation Modal Opening
  const handleOpenDeleteModal = (resume) => {
    setDeleteResumeTarget(resume);
    setDeleteError(null);
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) return;
    setDeleteResumeTarget(null);
    setDeleteError(null);
  };

  // Perform Resume Deletion
  const handleConfirmDelete = async () => {
    if (!deleteResumeTarget) return;

    setIsDeleting(true);
    setDeleteError(null);

    const targetId = deleteResumeTarget._id || deleteResumeTarget.id;

    try {
      const response = await resumeService.deleteResume(targetId);
      if (response.status === 'success') {
        if (isMountedRef.current) {
          setDeleteResumeTarget(null);
        }
        // Refresh dashboard statistics and history list
        await fetchDashboardStats();
        
        const isLastItemOnPage = resumes.length === 1 && page > 1;
        const targetPage = isLastItemOnPage ? page - 1 : page;
        if (isLastItemOnPage) setPage(targetPage);
        await fetchResumes(targetPage, searchQuery, statusFilter, sortBy, sortOrder);
      } else {
        throw new Error(response.message || 'Failed to delete resume');
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error('[DASHBOARD ERROR] Failed to delete resume:', err);
        const msg = err.response?.data?.message || err.message || 'An error occurred while deleting the resume.';
        setDeleteError(msg);
      }
    } finally {
      if (isMountedRef.current) {
        setIsDeleting(false);
      }
    }
  };

  const userName = user?.fullName ? user.fullName.split(' ')[0] : 'User';

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title={`Welcome back, ${userName}! 👋`}
        subtitle="Track your resume ATS scores, keyword match targets, and AI interview practice history."
        badge="Dashboard Overview"
        breadcrumbs={['Workspace', 'Dashboard']}
        action={
          <Link to="/upload">
            <Button variant="primary" icon={<Icon name="upload" className="w-4 h-4" />}>
              Upload New Resume
            </Button>
          </Link>
        }
      />

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start space-x-3">
          <Icon name="alertCircle" className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-semibold text-rose-200">Dashboard Request Error</p>
            <p className="text-xs text-rose-300/90 leading-relaxed">{error}</p>
          </div>
          <button
            onClick={() => {
              setError(null);
              fetchDashboardStats();
              fetchResumes(page);
            }}
            className="text-xs font-semibold text-rose-400 underline hover:text-rose-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Top Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Resumes */}
        <Card hoverEffect className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Uploaded Resumes</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Icon name="fileText" className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            {isLoadingStats ? (
              <div className="h-8 bg-slate-800 rounded w-16 animate-pulse" />
            ) : (
              <span className="text-3xl font-bold text-white">{stats.totalResumes}</span>
            )}
            <span className="text-xs font-medium text-slate-400">Files Uploaded</span>
          </div>
        </Card>

        {/* Card 2: Total AI Analyses */}
        <Card hoverEffect className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total AI Analyses</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Icon name="sparkles" className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            {isLoadingStats ? (
              <div className="h-8 bg-slate-800 rounded w-16 animate-pulse" />
            ) : (
              <span className="text-3xl font-bold text-emerald-400">{stats.totalAnalyses}</span>
            )}
            <span className="text-xs font-medium text-emerald-400">Completed Scans</span>
          </div>
        </Card>

        {/* Card 3: Total Interview Sessions */}
        <Card hoverEffect className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Interview Sessions</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Icon name="mic" className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            {isLoadingStats ? (
              <div className="h-8 bg-slate-800 rounded w-16 animate-pulse" />
            ) : (
              <span className="text-3xl font-bold text-cyan-300">{stats.totalInterviewSessions}</span>
            )}
            <span className="text-xs font-medium text-cyan-400">Sessions Generated</span>
          </div>
        </Card>

        {/* Card 4: Avg ATS Score */}
        <Card hoverEffect className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Avg ATS Score</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Icon name="award" className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            {isLoadingStats ? (
              <div className="h-8 bg-slate-800 rounded w-16 animate-pulse" />
            ) : (
              <span className="text-3xl font-bold text-purple-300">
                {stats.avgAtsScore !== null && stats.avgAtsScore !== undefined
                  ? `${stats.avgAtsScore} / 100`
                  : 'N/A'}
              </span>
            )}
            <span className="text-xs font-medium text-purple-400">Overall Match</span>
          </div>
        </Card>
      </div>

      {/* Quick Action Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-4">
          <Card.Header>
            <div>
              <Card.Title>Quick Resume Scan</Card.Title>
              <Card.Description>Upload and analyze a new resume to get immediate AI feedback</Card.Description>
            </div>
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              Instant AI Audit
            </span>
          </Card.Header>

          <Card.Content>
            <div
              onClick={() => navigate('/upload')}
              className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 text-center bg-slate-950/40 transition-colors cursor-pointer space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center border border-indigo-500/20">
                <Icon name="upload" className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Upload a new PDF / DOCX resume file</p>
                <p className="text-xs text-slate-400 mt-1">Get ATS scores, keyword gap reports, and tailored interview prep</p>
              </div>
              <Button variant="secondary" size="sm">Browse Files</Button>
            </div>
          </Card.Content>
        </Card>

        {/* AI Mock Interview Practice Launch Card */}
        <Card className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border-indigo-500/30 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Icon name="sparkles" className="w-4 h-4" />
              <span>AI Interview Coach</span>
            </div>
            <h3 className="text-lg font-bold text-white">Generate Tailored Interview Questions</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Generate role-specific technical, HR, and project questions based on your parsed resume content.
            </p>
          </div>

          <div className="pt-4 space-y-3">
            <Link to="/interview">
              <Button variant="primary" fullWidth icon={<Icon name="play" className="w-4 h-4" />}>
                Practice Interview Questions
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Resume History Table Section */}
      <Card>
        <Card.Header>
          <div>
            <Card.Title>Resume Analysis History</Card.Title>
            <Card.Description>View, analyze, or delete your uploaded resumes and past evaluation records</Card.Description>
          </div>
          <div className="text-xs text-slate-400">
            Total: <span className="font-bold text-slate-200">{totalResumesCount}</span> resumes
          </div>
        </Card.Header>

        <Card.Content>
          {/* Controls Bar: Search, Status Filter, Sort */}
          <div className="mb-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
            {/* Search Input */}
            <div className="relative flex-1">
              <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by filename or job title..."
                aria-label="Search resumes"
                className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setPage(1); }}
                  aria-label="Clear search query"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter & Sort Controls Group */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter Dropdown */}
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                aria-label="Filter by analysis status"
                className="bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 py-2 px-3 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="completed">Analyzed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              {/* Sort By Dropdown */}
              <select
                value={`${sortBy}:${sortOrder}`}
                onChange={handleSortChange}
                aria-label="Sort resumes by"
                className="bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 py-2 px-3 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                <option value="uploadDate:desc">Newest First</option>
                <option value="uploadDate:asc">Oldest First</option>
                <option value="atsScore:desc">Highest ATS Score</option>
                <option value="atsScore:asc">Lowest ATS Score</option>
                <option value="fileName:asc">File Name (A-Z)</option>
              </select>

              {/* Reset Filters Button (shown if non-default state) */}
              {(searchQuery || statusFilter || sortBy !== 'uploadDate' || sortOrder !== 'desc') && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 px-2 py-1 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Loading Skeleton */}
          {isLoadingResumes ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-12 bg-slate-900/80 rounded-xl animate-pulse flex items-center px-4 space-x-4">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-slate-800 rounded w-1/4" />
                    <div className="h-2 bg-slate-800/60 rounded w-1/6" />
                  </div>
                  <div className="w-16 h-6 bg-slate-800 rounded-full" />
                  <div className="w-24 h-8 bg-slate-800 rounded-xl" />
                </div>
              ))}
            </div>
          ) : resumes.length === 0 ? (
            /* Empty State */
            searchQuery || statusFilter ? (
              <EmptyState
                icon="fileText"
                title="No Matching Resumes Found"
                description={`No resumes match your current search "${searchQuery || statusFilter}". Try resetting filters.`}
                actionLabel="Reset Filters"
                onAction={handleClearFilters}
                actionIcon="rotateCcw"
                className="my-4"
              />
            ) : (
              <EmptyState
                icon="fileText"
                title="No Resumes Uploaded Yet"
                description="Upload your first resume in PDF or DOCX format to see analysis history and ATS metrics here."
                actionLabel="Upload Resume Now"
                onAction={() => navigate('/upload')}
                actionIcon="upload"
                className="my-4"
              />
            )
          ) : (
            /* History Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Resume File</th>
                    <th className="py-3.5 px-4">Target Job</th>
                    <th className="py-3.5 px-4">Uploaded Date</th>
                    <th className="py-3.5 px-4">ATS Score</th>
                    <th className="py-3.5 px-4">AI Analysis</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {resumes.map((res) => {
                    const resumeId = res._id || res.id;
                    const atsScore = res.analysis?.atsScore;
                    const isAnalyzed = res.analysisStatus === 'completed';

                    return (
                      <tr key={resumeId} className="hover:bg-slate-800/30 transition-colors">
                        {/* File Name */}
                        <td className="py-3.5 px-4 font-medium text-slate-100 flex items-center space-x-2.5">
                          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                            <Icon name="fileText" className="w-4 h-4" />
                          </div>
                          <div className="truncate max-w-[200px]" title={res.originalFileName}>
                            <p className="font-semibold text-slate-100 truncate">{res.originalFileName}</p>
                            <p className="text-[10px] text-slate-400 uppercase">{(res.fileSize / 1024).toFixed(1)} KB</p>
                          </div>
                        </td>

                        {/* Target Job Title */}
                        <td className="py-3.5 px-4 text-slate-300">
                          {res.jobTitle ? (
                            <span className="font-medium text-slate-200">{res.jobTitle}</span>
                          ) : (
                            <span className="text-slate-500 italic">Not specified</span>
                          )}
                        </td>

                        {/* Upload Date */}
                        <td className="py-3.5 px-4 text-slate-400">
                          {new Date(res.uploadDate || res.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>

                        {/* ATS Score */}
                        <td className="py-3.5 px-4">
                          {isAnalyzed && typeof atsScore === 'number' ? (
                            <span
                              className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                                atsScore >= 85
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : atsScore >= 70
                                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              {atsScore} / 100
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-800 text-slate-400">
                              Not Scored
                            </span>
                          )}
                        </td>

                        {/* Analysis Status */}
                        <td className="py-3.5 px-4">
                          {res.analysisStatus === 'completed' ? (
                            <span className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold">
                              <Icon name="checkCircle" className="w-3.5 h-3.5" />
                              <span>Analyzed</span>
                            </span>
                          ) : res.analysisStatus === 'pending' ? (
                            <span className="inline-flex items-center space-x-1.5 text-xs text-indigo-400 font-semibold animate-pulse">
                              <Icon name="loader" className="w-3.5 h-3.5 animate-spin" />
                              <span>Analyzing...</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-xs text-slate-400">
                              <span>Pending</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {/* View Button */}
                          <Link to={`/analysis?id=${resumeId}`}>
                            <Button variant="outline" size="sm" icon={<Icon name="eye" className="w-3.5 h-3.5" />}>
                              View
                            </Button>
                          </Link>

                          {/* Delete Button */}
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleOpenDeleteModal(res)}
                            icon={<Icon name="trash" className="w-3.5 h-3.5" />}
                            title="Delete resume"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {!isLoadingResumes && totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-800/80 mt-4">
              <div className="text-xs text-slate-400">
                Page <span className="font-semibold text-slate-200">{page}</span> of{' '}
                <span className="font-semibold text-slate-200">{totalPages}</span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1 || isLoadingResumes}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  icon={<Icon name="chevronLeft" className="w-4 h-4" />}
                >
                  Previous
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages || isLoadingResumes}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  icon={<Icon name="chevronRight" className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteResumeTarget}
        onClose={handleCloseDeleteModal}
        title="Confirm Resume Deletion"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCloseDeleteModal}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              icon={isDeleting ? <Icon name="loader" className="w-4 h-4 animate-spin" /> : <Icon name="trash" className="w-4 h-4" />}
            >
              {isDeleting ? 'Deleting...' : 'Delete Resume'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {deleteError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
              <Icon name="alertCircle" className="w-4 h-4 shrink-0" />
              <span>{deleteError}</span>
            </div>
          )}

          <p className="text-sm text-slate-300 leading-relaxed">
            Are you sure you want to permanently delete{' '}
            <strong className="text-slate-100">{deleteResumeTarget?.originalFileName}</strong>?
          </p>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-1">
            <p className="font-semibold">⚠️ Irreversible Action</p>
            <p>
              This will remove the uploaded resume file from server storage along with all stored Gemini AI analyses and generated interview questions.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
