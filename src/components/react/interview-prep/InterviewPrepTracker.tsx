import { useState } from 'react';
import { useInterviewPrep } from './useInterviewPrep';
import { InterviewPrepTable } from './InterviewPrepTable';
import { AddProblemForm } from './AddProblemForm';
import { StatsCards } from './StatsCards';
import type { Problem } from './types';

export const InterviewPrepTracker = () => {
  const {
    problems,
    currentTab,
    currentTopicFilter,
    searchQuery,
    topics,
    stats,
    isOverdue,
    setCurrentTab,
    setCurrentTopicFilter,
    setSearchQuery,
    addProblem,
    updateProblem,
    updateProblemStatus,
    updateConfidence,
    setManualReviewDate,
    deleteProblem,
    exportToJSON,
    importFromJSON,
  } = useInterviewPrep();

  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);

  const handleEdit = (problem: Problem) => {
    setEditingProblem(problem);
  };

  const handleCancelEdit = () => {
    setEditingProblem(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 p-5">
      <div className="max-w-[1400px] mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-8 py-5 text-center">
          <h1 className="text-2xl font-bold mb-1">🚀 Technical Interview Prep</h1>
          <p className="text-sm opacity-90">
            Track coding problems, concepts, and articles with spaced repetition
          </p>
        </div>

        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Add Problem Form */}
        <AddProblemForm
          topics={topics}
          editingProblem={editingProblem}
          onAddProblem={addProblem}
          onUpdateProblem={(id, data) => {
            updateProblem(id, data);
            setEditingProblem(null);
          }}
          onCancelEdit={handleCancelEdit}
        />

        {/* Tabs and Filter */}
        <div className="flex justify-between items-center px-8 py-4 bg-white border-b border-gray-200">
          <div className="flex gap-2">
            <button
              className={`px-5 py-2 font-semibold text-sm rounded-lg transition-all cursor-pointer ${
                currentTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setCurrentTab('all')}
            >
              All Items
            </button>
            <button
              className={`px-5 py-2 font-semibold text-sm rounded-lg transition-all cursor-pointer ${
                currentTab === 'due'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setCurrentTab('due')}
            >
              Due Today
            </button>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-64"
            />
            <span className="text-sm text-gray-600 font-medium">Topic:</span>
            <select
              value={currentTopicFilter}
              onChange={(e) => setCurrentTopicFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer bg-white"
            >
              <option value="all">All Topics</option>
              {topics.map(topic => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <InterviewPrepTable
          problems={problems}
          currentTab={currentTab}
          isOverdue={isOverdue}
          onUpdateStatus={updateProblemStatus}
          onUpdateConfidence={updateConfidence}
          onSetReviewDate={setManualReviewDate}
          onEdit={handleEdit}
          onDelete={deleteProblem}
        />

        {/* Export/Import */}
        <div className="px-8 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <p className="text-gray-600 text-xs">
            Your data is saved locally in your browser. Export regularly to back up your progress!
          </p>
          <div className="flex gap-3">
            <button
              onClick={exportToJSON}
              className="px-4 py-2 bg-emerald-500 text-white font-medium rounded-md hover:bg-emerald-600 transition-colors cursor-pointer text-sm"
            >
              💾 Export
            </button>
            <label className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors cursor-pointer text-sm">
              📥 Import
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    importFromJSON(file);
                    e.target.value = '';
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
