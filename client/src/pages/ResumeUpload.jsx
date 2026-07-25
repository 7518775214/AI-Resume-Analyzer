import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Loader from '../components/Loader';

const ResumeUpload = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobTitle, setJobTitle] = useState('Senior Frontend Engineer');
  const [jobDescription, setJobDescription] = useState(
    'We are seeking a Senior Frontend Engineer with 5+ years of React, TypeScript, GraphQL, state management, and performance tuning experience. Familiarity with Web Vitals and CI/CD pipelines is a plus.'
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile && !jobTitle) return;

    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      navigate('/analysis');
    }, 1200);
  };

  return (
    <div className="space-y-8">
      {isUploading && <Loader type="fullscreen" text="Parsing resume structure & matching ATS keywords..." />}

      <PageHeader
        title="Upload Resume for AI Analysis"
        subtitle="Upload your latest PDF/DOCX resume and match it against target job descriptions for instant ATS scoring."
        breadcrumbs={['Dashboard', 'Upload Resume']}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Upload Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <Card>
            <Card.Header>
              <div>
                <Card.Title>1. Select Resume Document</Card.Title>
                <Card.Description>Supported formats: PDF, DOCX (Max 10MB)</Card.Description>
              </div>
            </Card.Header>
            <Card.Content>
              <div className="relative border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-10 text-center bg-slate-950/50 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="space-y-3 pointer-events-none">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-400 mx-auto flex items-center justify-center border border-indigo-500/20">
                    <Icon name="upload" className="w-7 h-7" />
                  </div>
                  {selectedFile ? (
                    <div>
                      <p className="text-sm font-semibold text-emerald-400 flex items-center justify-center space-x-2">
                        <Icon name="checkCircle" className="w-4 h-4" />
                        <span>{selectedFile.name}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB - Ready for scan</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        Click or drag resume file to upload
                      </p>
                      <p className="text-xs text-slate-400 mt-1">PDF or DOCX formatted text files</p>
                    </div>
                  )}
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <div>
                <Card.Title>2. Target Job Profile & Requirements</Card.Title>
                <Card.Description>Paste the job posting details to calculate technical keyword match percentage</Card.Description>
              </div>
            </Card.Header>
            <Card.Content className="space-y-4">
              <Input
                label="Target Job Title"
                placeholder="e.g. Senior Frontend Engineer at Stripe"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                icon={<Icon name="target" className="w-4 h-4" />}
                required
              />

              <Input
                label="Job Description / Key Requirements"
                type="textarea"
                rows={5}
                placeholder="Paste the key responsibilities, required skills, and qualifications..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </Card.Content>
          </Card>

          <Button type="submit" variant="primary" size="lg" fullWidth icon={<Icon name="sparkles" className="w-5 h-5" />}>
            Run AI ATS Analysis
          </Button>
        </form>

        {/* Sidebar Info & Best Practices */}
        <div className="space-y-6">
          <Card className="bg-slate-900/60 space-y-4">
            <Card.Title className="text-base flex items-center space-x-2 text-indigo-400">
              <Icon name="checkCircle" className="w-4 h-4" />
              <span>ATS Optimization Tips</span>
            </Card.Title>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start space-x-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>Use standard bullet points instead of complex multi-column tables.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>Spell out acronyms at least once (e.g. "Application Programming Interface (API)").</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>Quantify achievement impact with concrete numbers &amp; percentages.</span>
              </li>
            </ul>
          </Card>

          <Card className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase">
              <Icon name="shield" className="w-4 h-4 text-emerald-400" />
              <span>Privacy & Security</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your uploaded resume documents are encrypted at rest and processed in memory. We never sell your personal data.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
