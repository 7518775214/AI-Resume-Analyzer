import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import { mockInterviewQuestions, mockInterviewFeedback } from '../utils/mockData';

const Interview = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [mode, setMode] = useState('voice'); // 'voice' | 'text'

  const currentQ = mockInterviewQuestions[currentQuestionIndex];

  const handleNext = () => {
    if (currentQuestionIndex < mockInterviewQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setIsRecording(false);
    } else {
      setShowFeedbackModal(true);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setUserAnswer('For our micro-frontend architecture, we implemented Webpack Module Federation combined with a centralized Zustand store for authentication state across sub-teams...');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="AI Interactive Mock Interview Coach"
        subtitle="Practice answering real technical & behavioral questions tailored to your target software role with instant AI evaluation."
        breadcrumbs={['Dashboard', 'AI Interview Coach']}
        badge="Live Audio & AI Analysis"
      />

      {/* Main Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left / Center: Question & Answer Workspace */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question Card */}
          <Card className="border-indigo-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                Question {currentQuestionIndex + 1} of {mockInterviewQuestions.length} • {currentQ.category}
              </span>
              <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                {currentQ.difficulty}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
              "{currentQ.question}"
            </h2>

            <div className="pt-2 flex flex-wrap gap-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider self-center mr-2">Expected Key Concepts:</span>
              {currentQ.expectedKeywords.map((kw, i) => (
                <span key={i} className="text-xs font-medium text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                  {kw}
                </span>
              ))}
            </div>
          </Card>

          {/* Answer Workspace */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Button
                  variant={mode === 'voice' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setMode('voice')}
                  icon={<Icon name="mic" className="w-4 h-4" />}
                >
                  Voice Mode
                </Button>
                <Button
                  variant={mode === 'text' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setMode('text')}
                  icon={<Icon name="fileText" className="w-4 h-4" />}
                >
                  Text Response
                </Button>
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                <Icon name="clock" className="w-4 h-4 text-indigo-400" />
                <span>Timer: 01:45</span>
              </div>
            </div>

            {mode === 'voice' ? (
              <div className="py-10 text-center space-y-6">
                {/* Simulated Audio Visualizer Wave */}
                <div className="flex items-center justify-center space-x-1.5 h-16">
                  {[40, 75, 30, 90, 60, 100, 45, 80, 55, 95, 35, 70, 50].map((h, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 rounded-full transition-all duration-300 ${
                        isRecording ? 'bg-indigo-500 animate-pulse' : 'bg-slate-800'
                      }`}
                      style={{ height: isRecording ? `${h}%` : '20%' }}
                    />
                  ))}
                </div>

                <div className="space-y-2">
                  <Button
                    variant={isRecording ? 'danger' : 'emerald'}
                    size="lg"
                    onClick={toggleRecording}
                    icon={<Icon name="mic" className="w-5 h-5" />}
                  >
                    {isRecording ? 'Stop Recording' : 'Start Speech Answer'}
                  </Button>
                  <p className="text-xs text-slate-400">
                    {isRecording ? 'Recording active... Speak clearly into your microphone.' : 'Click to start recording your response.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  rows={6}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your structured answer using the STAR method (Situation, Task, Action, Result)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {/* Answer Preview transcript if voice recorded */}
            {userAnswer && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="text-xs font-semibold text-indigo-400">Transcribed Answer:</div>
                <p className="text-xs text-slate-300 italic">"{userAnswer}"</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setUserAnswer('')}>
                Clear
              </Button>
              <Button variant="primary" size="md" onClick={handleNext} icon={<Icon name="arrowRight" className="w-4 h-4" />}>
                {currentQuestionIndex < mockInterviewQuestions.length - 1 ? 'Submit & Next Question' : 'Finish Session & See Evaluation'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: AI Live Assistant Tips */}
        <div className="space-y-6">
          <Card className="bg-slate-900/60 space-y-4">
            <Card.Title className="flex items-center space-x-2 text-indigo-400 text-base">
              <Icon name="sparkles" className="w-4 h-4" />
              <span>STAR Method Checklist</span>
            </Card.Title>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-bold text-indigo-400">S - Situation:</span> Set the scene &amp; context.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-bold text-indigo-400">T - Task:</span> Describe your core responsibility.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-bold text-indigo-400">A - Action:</span> Detail the exact tech solutions you built.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-bold text-indigo-400">R - Result:</span> Share quantified metrics &amp; outcomes.
              </div>
            </div>
          </Card>

          <Card className="space-y-3">
            <Card.Title className="text-sm text-slate-200">Suggested Key Hint</Card.Title>
            <p className="text-xs text-slate-400 leading-relaxed">
              {currentQ.suggestedAnswer}
            </p>
          </Card>
        </div>
      </div>

      {/* AI Evaluation Result Modal */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="AI Interview Performance Evaluation"
        size="lg"
        footer={
          <Button variant="primary" onClick={() => setShowFeedbackModal(false)}>
            Close Report
          </Button>
        }
      >
        <div className="space-y-6">
          <div className="flex items-center justify-around bg-slate-950 p-6 rounded-2xl border border-slate-800">
            <div className="text-center">
              <div className="text-3xl font-black text-emerald-400">{mockInterviewFeedback.score} / 100</div>
              <div className="text-xs text-slate-400 mt-1">Overall AI Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-indigo-400">{mockInterviewFeedback.clarity}</div>
              <div className="text-xs text-slate-400 mt-1">Speech Clarity</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-cyan-400">{mockInterviewFeedback.technicalAccuracy}</div>
              <div className="text-xs text-slate-400 mt-1">Technical Accuracy</div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-200">Strengths &amp; Highlights:</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {mockInterviewFeedback.keyHighlights.map((h, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <Icon name="checkCircle" className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-200">Areas For Practice:</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {mockInterviewFeedback.areasToImprove.map((a, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <Icon name="alertTriangle" className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Interview;
