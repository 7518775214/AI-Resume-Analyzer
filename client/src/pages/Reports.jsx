import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Icon from '../components/Icon';
import EmptyState from '../components/EmptyState';
import { mockReports } from '../utils/mockData';

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const filteredReports = mockReports.filter((rep) => {
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
        badge={`${mockReports.length} Saved Reports`}
      />

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
      {filteredReports.length > 0 ? (
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
                      <Link to="/analysis">
                        <Button variant="outline" size="sm" icon={<Icon name="eye" className="w-3.5 h-3.5" />}>
                          View
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" icon={<Icon name="download" className="w-3.5 h-3.5" />}>
                        PDF
                      </Button>
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
