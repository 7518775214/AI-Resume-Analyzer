import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Loader from '../components/Loader';
import resumeService from '../services/resumeService';
import useAuth from '../hooks/useAuth';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

const ResumeUpload = () => {
  const { isAuthenticated } = useAuth();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [uploadedResume, setUploadedResume] = useState(null);

  /**
   * Client-side File Validation
   */
  const validateFile = (file) => {
    setError(null);

    if (!file) {
      return false;
    }

    // 1. Validate File Extension & MIME Type
    const fileName = file.name.toLowerCase();
    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
    const hasValidMime = ALLOWED_MIME_TYPES.includes(file.type);

    if (!hasValidExt || (file.type && !hasValidMime)) {
      setError('Invalid file format. Please upload a PDF (.pdf) or Word document (.docx, .doc).');
      return false;
    }

    // 2. Validate File Size (Max 5MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setError(`File size exceeds 5 MB limit. Selected file is ${fileSizeMB} MB.`);
      return false;
    }

    return true;
  };

  const handleFileSelection = (file) => {
    setSuccessMessage(null);
    setUploadedResume(null);
    if (validateFile(file)) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  // Drag and Drop Event Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  /**
   * Form Submission to upload resume to backend
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!isAuthenticated) {
      setError('Authentication required. Please log in to upload a resume.');
      return;
    }

    if (!selectedFile) {
      setError('Please select a valid PDF or DOCX resume document to upload.');
      return;
    }

    if (!validateFile(selectedFile)) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);
      if (jobTitle) formData.append('jobTitle', jobTitle);
      if (jobDescription) formData.append('jobDescription', jobDescription);

      const res = await resumeService.uploadResume(formData, (progress) => {
        setUploadProgress(progress);
      });

      if (res.status === 'success' && res.data?.resume) {
        setSuccessMessage(res.message || 'Resume uploaded successfully!');
        setUploadedResume(res.data.resume);
        setSelectedFile(null);
      } else {
        throw new Error(res.message || 'Resume upload failed');
      }
    } catch (err) {
      console.error('[RESUME UPLOAD ERROR]', err);
      const apiMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to upload resume. Please check server connection.';
      setError(apiMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {isUploading && uploadProgress === 100 && (
        <Loader type="fullscreen" text="Finalizing upload & storing metadata in MongoDB..." />
      )}

      <PageHeader
        title="Upload Resume"
        subtitle="Upload your PDF or DOCX resume to securely store and process your resume metadata."
        breadcrumbs={['Dashboard', 'Upload Resume']}
      />

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start space-x-3">
          <Icon name="alertCircle" className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-200">Upload Validation Error</p>
            <p className="text-xs text-rose-300/90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Success Alert & Uploaded Metadata Card */}
      {successMessage && uploadedResume && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-start space-x-3">
            <Icon name="checkCircle" className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-200">Upload Successful!</p>
              <p className="text-xs text-emerald-300/90 mt-0.5">{successMessage}</p>
            </div>
          </div>

          <Card className="bg-slate-900/80 border-emerald-500/30">
            <Card.Header>
              <Card.Title className="text-emerald-400 flex items-center space-x-2">
                <Icon name="fileText" className="w-5 h-5" />
                <span>Uploaded Resume Details</span>
              </Card.Title>
              <Card.Description>Resume metadata successfully registered in database</Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Original File Name:</span>
                  <p className="font-semibold text-slate-100">{uploadedResume.originalFileName}</p>
                </div>
                <div>
                  <span className="text-slate-400">File Type:</span>
                  <p className="font-semibold text-slate-100">{uploadedResume.fileType}</p>
                </div>
                <div>
                  <span className="text-slate-400">File Size:</span>
                  <p className="font-semibold text-slate-100">
                    {(uploadedResume.fileSize / (1024 * 1024)).toFixed(2)} MB ({uploadedResume.fileSize} bytes)
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Upload Date:</span>
                  <p className="font-semibold text-slate-100">
                    {new Date(uploadedResume.uploadDate).toLocaleString()}
                  </p>
                </div>
                {uploadedResume.jobTitle && (
                  <div className="md:col-span-2">
                    <span className="text-slate-400">Target Job Profile:</span>
                    <p className="font-semibold text-indigo-300">{uploadedResume.jobTitle}</p>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end">
                <Link to={`/analysis?id=${uploadedResume.id || uploadedResume._id}`}>
                  <Button variant="primary" icon={<Icon name="sparkles" className="w-4 h-4" />}>
                    Analyze Resume with Gemini AI
                  </Button>
                </Link>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Upload Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <Card>
            <Card.Header>
              <div>
                <Card.Title>1. Select Resume Document</Card.Title>
                <Card.Description>Supported formats: PDF, DOCX (Strict Max 5MB)</Card.Description>
              </div>
            </Card.Header>
            <Card.Content>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                  isDragging
                    ? 'border-indigo-400 bg-indigo-950/40 scale-[1.01]'
                    : selectedFile
                    ? 'border-emerald-500/50 bg-emerald-950/20'
                    : 'border-slate-700 hover:border-indigo-500 bg-slate-950/50'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                />
                <div className="space-y-3 pointer-events-none">
                  <div
                    className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border ${
                      selectedFile
                        ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20'
                        : isDragging
                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                        : 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20'
                    }`}
                  >
                    <Icon name={selectedFile ? 'checkCircle' : 'upload'} className="w-7 h-7" />
                  </div>
                  {selectedFile ? (
                    <div>
                      <p className="text-sm font-semibold text-emerald-400 flex items-center justify-center space-x-2">
                        <span>{selectedFile.name}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB - Valid format ready for upload
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        {isDragging ? 'Drop resume file here...' : 'Click or drag resume file to upload'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">PDF or DOCX formatted files up to 5 MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Real-time Upload Progress Bar */}
              {isUploading && (
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-indigo-300">Uploading resume to server...</span>
                    <span className="text-indigo-400">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <div>
                <Card.Title>2. Optional Target Job Details</Card.Title>
                <Card.Description>Provide target job title or role context to associate with this upload</Card.Description>
              </div>
            </Card.Header>
            <Card.Content className="space-y-4">
              <Input
                label="Target Job Title"
                placeholder="e.g. Senior Full Stack Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                disabled={isUploading}
                icon={<Icon name="target" className="w-4 h-4" />}
              />

              <Input
                label="Job Description / Key Requirements"
                type="textarea"
                rows={4}
                placeholder="Optional: Paste the target job posting details or requirements..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={isUploading}
              />
            </Card.Content>
          </Card>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={isUploading || !selectedFile}
            icon={<Icon name="upload" className="w-5 h-5" />}
          >
            {isUploading ? `Uploading (${uploadProgress}%)...` : 'Upload Resume'}
          </Button>
        </form>

        {/* Sidebar Info & Guidance */}
        <div className="space-y-6">
          <Card className="bg-slate-900/60 space-y-4">
            <Card.Title className="text-base flex items-center space-x-2 text-indigo-400">
              <Icon name="checkCircle" className="w-4 h-4" />
              <span>Resume Upload Guidelines</span>
            </Card.Title>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start space-x-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>Supported file types are strictly PDF (.pdf) and Microsoft Word (.docx, .doc).</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>Maximum allowed document file size is 5 MB.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>Ensure your document is readable and not password-protected.</span>
              </li>
            </ul>
          </Card>

          <Card className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase">
              <Icon name="shield" className="w-4 h-4 text-emerald-400" />
              <span>Privacy & Storage</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your uploaded resume document is stored securely under your protected user session with metadata saved in MongoDB.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
