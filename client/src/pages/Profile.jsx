import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Icon from '../components/Icon';
import { mockUser } from '../utils/mockData';

const Profile = () => {
  const [user, setUser] = useState(mockUser);
  const [newSkill, setNewSkill] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !user.skills.includes(newSkill.trim())) {
      setUser({ ...user, skills: [...user.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setUser({ ...user, skills: user.skills.filter(s => s !== skillToRemove) });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Career Profile & Preferences"
        subtitle="Manage your professional background, target tech stack skills, and career focus settings."
        breadcrumbs={['Dashboard', 'Profile']}
        action={
          <Button
            variant={isEditing ? 'emerald' : 'primary'}
            onClick={() => setIsEditing(!isEditing)}
            icon={<Icon name="settings" className="w-4 h-4" />}
          >
            {isEditing ? 'Save Profile Changes' : 'Edit Profile Details'}
          </Button>
        }
      />

      {/* Main Profile Info Card */}
      <Card className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-slate-800">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-24 h-24 rounded-2xl border-2 border-indigo-500/40 object-cover shadow-xl"
          />

          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {user.targetRole}
              </span>
            </div>
            <p className="text-xs text-slate-400">{user.email} • {user.location}</p>
            <p className="text-xs text-slate-300 pt-1 leading-relaxed max-w-2xl">{user.bio}</p>
          </div>
        </div>

        {/* Editable Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Full Name"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            disabled={!isEditing}
            icon={<Icon name="user" className="w-4 h-4" />}
          />
          <Input
            label="Target Job Role"
            value={user.targetRole}
            onChange={(e) => setUser({ ...user, targetRole: e.target.value })}
            disabled={!isEditing}
            icon={<Icon name="target" className="w-4 h-4" />}
          />
          <Input
            label="Experience Band"
            value={user.experienceLevel}
            onChange={(e) => setUser({ ...user, experienceLevel: e.target.value })}
            disabled={!isEditing}
            icon={<Icon name="award" className="w-4 h-4" />}
          />
          <Input
            label="Location / Mobility"
            value={user.location}
            onChange={(e) => setUser({ ...user, location: e.target.value })}
            disabled={!isEditing}
            icon={<Icon name="folder" className="w-4 h-4" />}
          />
        </div>
      </Card>

      {/* Skills Tag Management */}
      <Card className="space-y-4">
        <Card.Header>
          <div>
            <Card.Title>Core Technical Stack &amp; Competencies</Card.Title>
            <Card.Description>These skills are highlighted when matching against job postings</Card.Description>
          </div>
        </Card.Header>

        <Card.Content className="space-y-4">
          {/* Add skill input */}
          <form onSubmit={handleAddSkill} className="flex space-x-3 max-w-md">
            <Input
              placeholder="Add new skill (e.g. Docker, GraphQL)..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
            />
            <Button type="submit" variant="secondary" size="sm" className="shrink-0">
              Add Skill
            </Button>
          </form>

          {/* Tags cloud */}
          <div className="flex flex-wrap gap-2 pt-2">
            {user.skills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-950 text-indigo-300 border border-slate-800"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Icon name="x" className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default Profile;
