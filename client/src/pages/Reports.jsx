import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Icon from '../components/Icon';
import EmptyState from '../components/EmptyState';
import resumeService from '../services/resumeService';
import { mockReports } from '../utils/mockData';
import { downloadPdfReport, parseApiErrorMessage } from '../utils/downloadHelper';

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [userResumes, setUserResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [exportingId, setExportingId] = useState(null);
  const [pdfError, setPdfError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await resumeService.getUserResumes(1, 50);
      if (response.status === 'success' && response.data?.resumes) {
        setUserResumes(response.data.resumes);
      }
    } catch (err) {
      console.error('[REPORTS PAGE ERROR] Failed to fetch resumes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async (id, fileName) => {
    setExportingId(id);
    setPdfError(null);

    try {
      const blobData = await resumeService.exportResumePdf(id);
      downloadPdfReport(blobData, fileName);
    } catch (err) {
      console.error('[PDF EXPORT ERROR]', err);
      const msg = await parseApiErrorMessage(err, 'Failed to download PDF report. Ensure analysis is complete.');
      setPdfError(msg);
    } finally {
      setExportingId(null);
    }
  };

  // Combine real user resumes with mock items if userResumes is empty
  const displayReports = userResumes.length > 0
    ? userResumes.map((res) => ({
        id: res._id || res.id,
        title: res.jobTitle ? `${res.jobTitle} Scan` : res.originalFileName,
        originalFileName: res.originalFileName,
        date: new Date(res.uploadDate || res.createdAt).toLocaleDateString(),
        type: 'Resume Scan',
        atsScore: res.analysis?.atsScore || 0,
        status: res.analysisStatus === 'completed' ? 'Completed' : res.analysisStatus || 'Pending',
        isReal: true,
        hasAnalysis: res.analysisStatus === 'completed',
      }))
    : mockReports.map((r) => ({ ...r, isReal: false, hasAnalysis: true }));

  const filteredReports = displayReports.filter((rep) => {
    const matchesSearch = rep.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || rep.type.toLowerCase().includes(selectedType.toLowerCase());
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Reports & Historical Scans"
        subtitle="Access all past ATS resume scans, keyword gap analysis, and AI mock interview score summaries."
        breadcrumbs={['Dashboard', 'Reports']}
        badge={`${displayReports.length} Saved Reports`}
      />

      {pdfError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="alertCircle" className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{pdfError}</span>
          </div>
          <button onClick={() => setPdfError(null)} className="text-rose-400 font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Controls Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search reports by job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Icon name="search" className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-semibold uppercase">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Types</option>
              <option value="Resume">Resume Scans</option>
              <option value="Interview">AI Interviews</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Reports Table / List */}
      {isLoading ? (
        <Card className="p-6 space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-12 bg-slate-900 rounded-xl animate-pulse" />
          ))}
        </Card>
      ) : filteredReports.length > 0 ? (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Target Role / Scan Title</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Report Type</th>
                  <th className="py-3.5 px-4">ATS / AI Score</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredReports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          <Icon name={rep.type.includes('Interview') ? 'mic' : 'fileText'} className="w-4 h-4" />
                        </div>
                        <span>{rep.title}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-400">{rep.date}</td>
                    <td className="py-4 px-4 font-medium text-slate-300">{rep.type}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full font-bold text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {rep.atsScore} / 100
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs font-semibold text-indigo-400">{rep.status}</span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <Link to={rep.isReal ? `/analysis?id=${rep.id}` : '/analysis'}>
                        <Button variant="outline" size="sm" icon={<Icon name="eye" className="w-3.5 h-3.5" />}>
                          View
                        </Button>
                      </Link>
                      {rep.isReal && rep.hasAnalysis && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={exportingId === rep.id}
                          onClick={() => handleDownloadPdf(rep.id, rep.originalFileName)}
                          icon={
                            exportingId === rep.id ? (
                              <Icon name="loader" className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Icon name="download" className="w-3.5 h-3.5" />
                            )
                          }
                        >
                          {exportingId === rep.id ? 'PDF...' : 'PDF'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState
          icon="search"
          title="No Matching Reports Found"
          description="Try adjusting your search keywords or filter settings."
          actionLabel="Reset Search Filters"
          onAction={() => { setSearchTerm(''); setSelectedType('All'); }}
          actionIcon="x"
        />
      )}
    </div>
  );
};

export default Reports;

