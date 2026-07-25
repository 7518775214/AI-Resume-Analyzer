import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Icon from '../components/Icon';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('ai');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [aiSettings, setAiSettings] = useState({
    sensitivity: 'Strict ATS (Exact Term Matches)',
    speechSpeed: 'Normal (1.0x)',
    autoRewriter: true,
    starAnalysis: true
  });

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Workspace Settings"
        subtitle="Manage your AI analysis sensitivity, audio voice preferences, security, and notification triggers."
        breadcrumbs={['Dashboard', 'Settings']}
        action={
          <Button variant="primary" onClick={handleSave} icon={<Icon name="checkCircle" className="w-4 h-4" />}>
            Save Preferences
          </Button>
        }
      />

      {savedSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-4 rounded-xl flex items-center space-x-2">
          <Icon name="checkCircle" className="w-4 h-4 shrink-0" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Tabs Control */}
      <div className="flex border-b border-slate-800 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('ai')}
          className={`pb-3 transition-colors ${activeTab === 'ai' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'}`}
        >
          AI Model &amp; Scanner
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={`pb-3 transition-colors ${activeTab === 'account' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Account Info
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 transition-colors ${activeTab === 'notifications' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 transition-colors ${activeTab === 'security' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Security &amp; API
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <Card className="space-y-6">
            <Card.Header>
              <div>
                <Card.Title>ATS Parser Sensitivity Configuration</Card.Title>
                <Card.Description>Control how strictly the AI matches technical keywords against job descriptions</Card.Description>
              </div>
            </Card.Header>

            <Card.Content className="space-y-4">
              <Input
                label="Scan Strictness Mode"
                type="select"
                value={aiSettings.sensitivity}
                onChange={(e) => setAiSettings({ ...aiSettings, sensitivity: e.target.value })}
                options={[
                  'Strict ATS (Exact Term Matches)',
                  'Semantic AI (Includes Synonyms & Closely Related Terms)',
                  'Lenient (Broad Concept Match)'
                ]}
              />

              <Input
                label="AI Mock Interview Voice Speed"
                type="select"
                value={aiSettings.speechSpeed}
                onChange={(e) => setAiSettings({ ...aiSettings, speechSpeed: e.target.value })}
                options={[
                  'Slow (0.8x)',
                  'Normal (1.0x)',
                  'Fast (1.2x)'
                ]}
              />

              <div className="pt-2 space-y-3">
                <label className="flex items-center space-x-3 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiSettings.autoRewriter}
                    onChange={(e) => setAiSettings({ ...aiSettings, autoRewriter: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-0"
                  />
                  <span>Automatically generate AI metric bullet suggestions for low-scoring experience sections</span>
                </label>

                <label className="flex items-center space-x-3 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiSettings.starAnalysis}
                    onChange={(e) => setAiSettings({ ...aiSettings, starAnalysis: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-0"
                  />
                  <span>Enable real-time STAR method validation during audio mock interviews</span>
                </label>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {activeTab === 'account' && (
        <Card className="space-y-4">
          <Card.Header>
            <Card.Title>General Account Settings</Card.Title>
          </Card.Header>
          <Card.Content className="space-y-4">
            <Input label="Primary Account Email" value="alex.morgan@example.com" disabled />
            <Input label="Timezone" type="select" options={['(UTC-08:00) Pacific Time (US & Canada)', '(UTC-05:00) Eastern Time', '(UTC+00:00) UTC']} />
          </Card.Content>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card className="space-y-4">
          <Card.Header>
            <Card.Title>Email &amp; Alert Notifications</Card.Title>
          </Card.Header>
          <Card.Content className="space-y-3 text-xs text-slate-300">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-0" />
              <span>Email me ATS scan summary reports after each upload</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-0" />
              <span>Weekly career readiness digest &amp; practice reminders</span>
            </label>
          </Card.Content>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card className="space-y-4">
          <Card.Header>
            <Card.Title>Security &amp; API Keys</Card.Title>
          </Card.Header>
          <Card.Content className="space-y-4">
            <Input label="Current Password" type="password" placeholder="••••••••" />
            <Input label="New Password" type="password" placeholder="••••••••" />
            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-200 uppercase mb-2">Personal Developer API Key</h4>
              <div className="flex items-center space-x-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-slate-400">
                <span>rp_live_89127391823719827391283</span>
                <Button variant="ghost" size="sm">Copy</Button>
              </div>
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  );
};

export default Settings;
