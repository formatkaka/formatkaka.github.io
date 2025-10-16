import { useState, useEffect } from 'react';
import type { Problem } from '../types/types';

type AddProblemFormProps = {
  topics: string[];
  editingProblem: Problem | null;
  onAddProblem: (problem: {
    name: string;
    link: string;
    difficulty: string;
    itemType: string;
    topic: string;
    company: string;
  }) => void;
  onUpdateProblem: (
    id: number,
    problem: {
      name: string;
      link: string;
      difficulty: string;
      itemType: string;
      topic: string;
      company: string;
    }
  ) => void;
  onCancelEdit: () => void;
};

export const AddProblemForm = ({
  topics,
  editingProblem,
  onAddProblem,
  onUpdateProblem,
  onCancelEdit,
}: AddProblemFormProps) => {
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [itemType, setItemType] = useState('DSA');
  const [topic, setTopic] = useState('');
  const [company, setCompany] = useState('');

  useEffect(() => {
    if (editingProblem) {
      setName(editingProblem.name);
      setLink(editingProblem.link);
      setDifficulty(editingProblem.difficulty);
      setItemType(editingProblem.itemType);
      setTopic(editingProblem.topic);
      setCompany(editingProblem.company);
    } else {
      clearForm();
    }
  }, [editingProblem]);

  const clearForm = () => {
    setName('');
    setLink('');
    setDifficulty('Easy');
    setItemType('DSA');
    setTopic('');
    setCompany('');
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Please enter a title');
      return;
    }

    const problemData = {
      name: name.trim(),
      link: link.trim() || '#',
      difficulty,
      itemType,
      topic: topic.trim() || 'General',
      company: company.trim(),
    };

    if (editingProblem) {
      onUpdateProblem(editingProblem.id, problemData);
    } else {
      onAddProblem(problemData);
    }

    clearForm();
  };

  const handleCancel = () => {
    clearForm();
    onCancelEdit();
  };

  return (
    <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
      <div className="space-y-3">
        <div className="grid grid-cols-12 gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Title (e.g., Two Sum, React Hooks)"
            className="col-span-3 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="URL (LeetCode, article, etc.)"
            className="col-span-3 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="col-span-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
            className="col-span-2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="DSA">DSA</option>
            <option value="Concept">Concept</option>
            <option value="Article">Article</option>
            <option value="System Design">System Design</option>
            <option value="Frontend">Frontend</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            list="topicsList"
            placeholder="Topic"
            className="col-span-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <datalist id="topicsList">
            {topics.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company"
            className="col-span-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <div className="col-span-1 flex gap-2">
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors cursor-pointer text-sm border-0"
            >
              {editingProblem ? 'Update' : 'Add'}
            </button>
            {editingProblem && (
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 transition-colors cursor-pointer text-sm border-0"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
