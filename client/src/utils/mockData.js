// Comprehensive Mock Data for Frontend UI Foundation

export const mockUser = {
  id: 'usr_101',
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  targetRole: 'Senior Full Stack Developer',
  experienceLevel: 'Senior (5-8 Years)',
  industry: 'Software & Technology',
  location: 'San Francisco, CA (Remote)',
  bio: 'Passionate developer building scalable web applications with React, Node.js, and Cloud Infrastructure.',
  skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Tailwind CSS', 'AWS', 'Docker', 'MongoDB', 'System Design'],
  metrics: {
    resumesAnalyzed: 14,
    avgAtsScore: 88,
    interviewsPracticed: 9,
    overallReadiness: 'High (89%)'
  }
};

export const mockResumes = [
  {
    id: 'res_001',
    fileName: 'Alex_Morgan_Senior_FullStack_2026.pdf',
    fileSize: '1.4 MB',
    uploadedAt: '2026-07-24T14:30:00Z',
    targetJob: 'Senior Frontend Engineer - Stripe',
    atsScore: 92,
    matchPercentage: 94,
    status: 'Analyzed',
    badgeColor: 'emerald'
  },
  {
    id: 'res_002',
    fileName: 'Alex_Morgan_Software_Architect.pdf',
    fileSize: '1.1 MB',
    uploadedAt: '2026-07-20T10:15:00Z',
    targetJob: 'Lead Systems Architect - Vercel',
    atsScore: 84,
    matchPercentage: 86,
    status: 'Analyzed',
    badgeColor: 'indigo'
  },
  {
    id: 'res_003',
    fileName: 'Alex_Morgan_FullStack_Generic.pdf',
    fileSize: '980 KB',
    uploadedAt: '2026-07-15T09:00:00Z',
    targetJob: 'Full Stack Engineer - General',
    atsScore: 78,
    matchPercentage: 79,
    status: 'Needs Improvement',
    badgeColor: 'amber'
  }
];

export const mockAnalysisDetails = {
  id: 'res_001',
  fileName: 'Alex_Morgan_Senior_FullStack_2026.pdf',
  targetJobTitle: 'Senior Frontend Engineer at Stripe',
  overallScore: 92,
  scannedAt: '2026-07-24T14:32:00Z',
  categories: {
    formatAndParsing: { score: 96, status: 'Excellent', detail: 'Clean PDF layout, ATS parsed all 4 sections with 100% text accuracy.' },
    keywordMatching: { score: 91, status: 'Strong Match', detail: 'Contains 28 of 31 key skill terms from the target job posting.' },
    impactAndQuantification: { score: 88, status: 'Good', detail: '84% of bullet points contain quantifiable metric achievements.' },
    competencyAlignment: { score: 93, status: 'Exceptional', detail: 'Demonstrates clear leadership, architectural decisions, and frontend performance tuning.' }
  },
  missingKeywords: [
    { word: 'Webpack/Vite Plugins', priority: 'High', category: 'Build Tooling' },
    { word: 'E2E Testing (Cypress/Playwright)', priority: 'Medium', category: 'Quality Assurance' },
    { word: 'Web Vitals Optimization', priority: 'High', category: 'Performance' },
    { word: 'CI/CD Pipeline Configuration', priority: 'Low', category: 'DevOps' }
  ],
  strengths: [
    'Strong use of action verbs at the start of experience bullet points.',
    'Clear section headers (Experience, Technical Skills, Education, Projects).',
    'Quantified metrics present in 8+ accomplishments (e.g., "Reduced bundle size by 35%").',
    'Modern tech stack tags aligned perfectly with Stripe requirements.'
  ],
  weaknesses: [
    'Missing explicit mention of End-to-End testing toolchain (Playwright or Cypress).',
    'Summary section is slightly long (5 lines); ideal length is 2-3 impact-focused sentences.',
    'Two project bullets lack explicit metric outcomes.'
  ],
  recommendations: [
    {
      type: 'Formatting Tip',
      text: 'Trim profile summary to 3 concise sentences emphasizing high-scale React & performance wins.'
    },
    {
      type: 'Keyword Boost',
      text: 'Add a bullet in your current role mentioning "Implemented Playwright E2E testing to increase release confidence by 40%".'
    },
    {
      type: 'Action Verb Upgrade',
      text: 'Replace "Worked on GraphQL services" with "Engineered high-throughput GraphQL APIs supporting 2M+ daily requests".'
    }
  ]
};

export const mockInterviewQuestions = [
  {
    id: 'q_1',
    category: 'System Design & Architecture',
    question: 'How would you architect a high-throughput micro-frontend application with shared state across sub-teams?',
    difficulty: 'Hard',
    expectedKeywords: ['Module Federation', 'State Management', 'Single SPA', 'CI/CD', 'Performance Budget'],
    suggestedAnswer: 'Discuss Module Federation for runtime dependency sharing, isolate domain state with Zustand/Redux, set up independent CI/CD build pipelines, and enforce strict Web Vitals performance budgets.'
  },
  {
    id: 'q_2',
    category: 'React & Performance Tuning',
    question: 'Explain how you diagnose and fix unnecessary re-renders in a large-scale React component tree.',
    difficulty: 'Medium',
    expectedKeywords: ['React DevTools Profiler', 'useMemo/useCallback', 'Context Splitting', 'Component Composition'],
    suggestedAnswer: 'Identify re-render triggers using React Profiler, apply context splitting to isolate frequent state changes, hoist static subtrees, and memoize expensive calculations.'
  },
  {
    id: 'q_3',
    category: 'Behavioral & Leadership',
    question: 'Describe a situation where you had a technical disagreement with a Senior Staff Engineer. How did you resolve it?',
    difficulty: 'Medium',
    expectedKeywords: ['STAR Method', 'Data-driven proof', 'Benchmarking', 'Consensus', 'Empathy'],
    suggestedAnswer: 'Use the STAR format: Explain the context, your data-backed benchmark POC, active listening to understand their constraints, and reaching a win-win technical standard.'
  }
];

export const mockInterviewFeedback = {
  score: 87,
  clarity: '90%',
  technicalAccuracy: '88%',
  communicationStyle: 'Confident & Structured',
  keyHighlights: [
    'Articulated the STAR method clearly in the behavioral response.',
    'Mentioned metric-based performance profiling techniques.',
    'Demonstrated deep knowledge of React state virtualization.'
  ],
  areasToImprove: [
    'Elaborate more on error handling strategies during system design questions.',
    'Pace speaking speed slightly during complex architectural trade-off descriptions.'
  ]
};

export const mockReports = [
  {
    id: 'rep_101',
    date: '2026-07-24',
    title: 'Senior Frontend Engineer - Stripe',
    atsScore: 92,
    matchRate: '94%',
    type: 'Full Resume Scan',
    status: 'Passed ATS'
  },
  {
    id: 'rep_102',
    date: '2026-07-20',
    title: 'Lead Systems Architect - Vercel',
    atsScore: 84,
    matchRate: '86%',
    type: 'Full Resume Scan',
    status: 'Passed ATS'
  },
  {
    id: 'rep_103',
    date: '2026-07-18',
    title: 'Frontend Architecture Mock Interview',
    atsScore: 87,
    matchRate: '88%',
    type: 'AI Mock Interview',
    status: 'High Performance'
  },
  {
    id: 'rep_104',
    date: '2026-07-15',
    title: 'Full Stack Engineer - General',
    atsScore: 78,
    matchRate: '79%',
    type: 'Full Resume Scan',
    status: 'Optimization Recommended'
  }
];
