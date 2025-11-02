import { useState } from 'react';
import { useInterviewPrep } from './hooks/useInterviewPrep';
import { InterviewPrepTable } from './components/InterviewPrepTable';
import { AddProblemForm } from './components/AddProblemForm';
import { StatsCards } from './components/StatsCards';
import { ConceptsList } from './components/ConceptsList';
import { AddConceptForm } from './components/AddConceptForm';
import type { Problem, Concept } from './types/types';

export const InterviewPrepTracker = () => {
  const {
    problems,
    allProblems,
    concepts,
    currentTab,
    currentTopicFilter,
    itemTypeFilter,
    searchQuery,
    topics,
    itemTypes,
    categories,
    stats,
    isOverdue,
    setCurrentTab,
    setCurrentTopicFilter,
    setItemTypeFilter,
    setSearchQuery,
    addProblem,
    updateProblem,
    updateProblemStatus,
    updateConfidence,
    setManualReviewDate,
    deleteProblem,
    exportToJSON,
    importFromJSON,
    addConcept,
    updateConcept,
    updateConceptConfidence,
    updateConceptStatus,
    deleteConcept,
    redistributeReviewDates,
    addNote,
  } = useInterviewPrep();

  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [editingConcept, setEditingConcept] = useState<Concept | null>(null);
  const [showAddConcept, setShowAddConcept] = useState(false);

  const handleTabChange = (tab: 'all' | 'due' | 'concepts') => {
    setCurrentTab(tab);
    setItemTypeFilter('all');
  };

  const handleEdit = (problem: Problem) => {
    setEditingProblem(problem);
  };

  const handleCancelEdit = () => {
    setEditingProblem(null);
  };

  const handleEditConcept = (concept: Concept) => {
    setEditingConcept(concept);
    setShowAddConcept(true);
  };

  const handleCloseConcept = () => {
    setShowAddConcept(false);
    setEditingConcept(null);
  };

  const handleRedistribute = () => {
    const confirmed = confirm(
      'This will redistribute all review dates to ensure max 3 items per day.\n\n' +
        'Priority: Overdue → Today → Future\n\n' +
        'Do you want to continue?'
    );

    if (confirmed) {
      redistributeReviewDates();
      alert('✅ Review dates have been redistributed successfully!');
    }
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
              onClick={() => handleTabChange('all')}
            >
              All Items
            </button>
            <button
              className={`px-5 py-2 font-semibold text-sm rounded-lg transition-all cursor-pointer ${
                currentTab === 'due'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handleTabChange('due')}
            >
              Due Today
            </button>
            <button
              className={`px-5 py-2 font-semibold text-sm rounded-lg transition-all cursor-pointer ${
                currentTab === 'concepts'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handleTabChange('concepts')}
            >
              Concepts
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
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Item Type Filters - Shown on Due Today tab */}
        {currentTab === 'due' && (
          <div className="px-8 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">Quick Filter:</span>
              <button
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  itemTypeFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
                onClick={() => setItemTypeFilter('all')}
              >
                All
              </button>
              {itemTypes.map((type) => (
                <button
                  key={type}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    itemTypeFilter === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                  onClick={() => setItemTypeFilter(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content - Table or Concepts List */}
        {currentTab === 'concepts' ? (
          <div className="p-8">
            <ConceptsList
              concepts={concepts}
              problems={allProblems}
              onUpdateConfidence={updateConceptConfidence}
              onUpdateStatus={updateConceptStatus}
              onEdit={handleEditConcept}
              onDelete={deleteConcept}
              onAddConcept={() => setShowAddConcept(true)}
            />
          </div>
        ) : (
          <InterviewPrepTable
            problems={problems}
            concepts={concepts}
            currentTab={currentTab}
            isOverdue={isOverdue}
            onUpdateStatus={updateProblemStatus}
            onUpdateConfidence={updateConfidence}
            onSetReviewDate={setManualReviewDate}
            onEdit={handleEdit}
            onDelete={deleteProblem}
            onAddNote={addNote}
          />
        )}

        {/* Add Concept Dialog */}
        <AddConceptForm
          open={showAddConcept}
          onClose={handleCloseConcept}
          editingConcept={editingConcept}
          onSave={addConcept}
          onUpdate={(id, data) => {
            updateConcept(id, data);
            handleCloseConcept();
          }}
          categories={categories}
        />

        {/* Export/Import */}
        <div className="px-8 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <p className="text-gray-600 text-xs">
            Your data is saved locally in your browser. Export regularly to back up your progress!
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleRedistribute}
              className="px-4 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors cursor-pointer text-sm"
            >
              🔄 Redistribute Reviews
            </button>
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
