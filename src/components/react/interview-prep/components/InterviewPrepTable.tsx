import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/react/ui/table';
import { Pencil, Trash2, StickyNote } from 'lucide-react';
import type { Problem, TabType, Concept } from '../types/types';
import { ConfidenceStars } from './ConfidenceStars';
import { useState } from 'react';

type InterviewPrepTableProps = {
  problems: Problem[];
  concepts?: Concept[];
  currentTab: TabType;
  isOverdue: (problem: Problem) => boolean;
  onUpdateStatus: (id: number, status: string) => void;
  onUpdateConfidence: (id: number, confidence: number) => void;
  onSetReviewDate: (id: number, date: string) => void;
  onEdit: (problem: Problem) => void;
  onDelete: (id: number) => void;
  onAddNote: (id: number, noteText: string) => void;
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
  return `In ${diffDays} days`;
};

const getDateClass = (dateString: string | null): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'text-red-600 font-semibold';
  if (diffDays <= 2) return 'text-orange-500 font-semibold';
  return 'text-gray-600';
};

const getDifficultyBadgeClass = (difficulty: string): string => {
  const base = 'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide';
  if (difficulty === 'Easy') return `${base} bg-green-100 text-green-700`;
  if (difficulty === 'Medium') return `${base} bg-yellow-100 text-yellow-800`;
  if (difficulty === 'Hard') return `${base} bg-red-100 text-red-700`;
  return base;
};

export const InterviewPrepTable = ({
  problems,
  concepts = [],
  currentTab,
  isOverdue,
  onUpdateStatus,
  onUpdateConfidence,
  onSetReviewDate,
  onEdit,
  onDelete,
  onAddNote,
}: InterviewPrepTableProps) => {
  const [expandedNotes, setExpandedNotes] = useState<number | null>(null);
  const getConceptNames = (conceptIds?: number[]) => {
    if (!conceptIds || conceptIds.length === 0) return [];
    return conceptIds
      .map((id) => concepts.find((c) => c.id === id))
      .filter((c): c is Concept => c !== undefined);
  };

  const handleSetReviewDate = (id: number, currentDate: string | null) => {
    const dateValue = currentDate
      ? new Date(currentDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const newDate = prompt('Set review date (YYYY-MM-DD):', dateValue);
    if (newDate && newDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      onSetReviewDate(id, newDate);
    } else if (newDate) {
      alert('Please enter date in YYYY-MM-DD format');
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      onDelete(id);
    }
  };

  const handleAddNote = (id: number) => {
    const noteText = prompt('Add note for next iteration:');
    if (noteText && noteText.trim()) {
      onAddNote(id, noteText.trim());
    }
  };

  const toggleNotes = (id: number) => {
    setExpandedNotes(expandedNotes === id ? null : id);
  };

  return (
    <div className="px-8 pb-6">
      <Table>
        <TableHeader>
          <TableRow className="text-xs">
            <TableHead className="w-[250px] py-2">Title</TableHead>
            <TableHead className="py-2">Type</TableHead>
            <TableHead className="py-2">Difficulty</TableHead>
            <TableHead className="py-2">Topic</TableHead>
            <TableHead className="py-2">Company</TableHead>
            <TableHead className="py-2">Concepts</TableHead>
            <TableHead className="py-2">Confidence</TableHead>
            <TableHead className="py-2">Status</TableHead>
            <TableHead className="py-2">Last Reviewed</TableHead>
            <TableHead className="py-2">Next Review</TableHead>
            <TableHead className="py-2">Notes</TableHead>
            <TableHead className="py-2">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {problems.map((problem) => (
            <TableRow
              key={problem.id}
              className={`text-sm ${
                isOverdue(problem) && currentTab === 'due' ? 'bg-red-50 hover:bg-red-100' : ''
              }`}
            >
              <TableCell className="font-medium py-2">
                <a
                  href={problem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-semibold block overflow-hidden text-ellipsis whitespace-nowrap max-w-[250px]"
                  title={problem.name}
                >
                  {problem.name}
                </a>
              </TableCell>
              <TableCell className="py-2">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                  {problem.itemType || 'DSA'}
                </span>
              </TableCell>
              <TableCell className="py-2">
                <span className={getDifficultyBadgeClass(problem.difficulty)}>
                  {problem.difficulty}
                </span>
              </TableCell>
              <TableCell className="py-2 text-sm">{problem.topic}</TableCell>
              <TableCell className="py-2 text-sm">{problem.company}</TableCell>
              <TableCell className="py-2">
                <div className="flex flex-wrap gap-1">
                  {getConceptNames(problem.concepts).length > 0 ? (
                    getConceptNames(problem.concepts).map((concept) => (
                      <span
                        key={concept.id}
                        className="px-2 py-0.5 bg-purple-100 text-purple-700
                          rounded text-xs font-medium"
                        title={concept.description}
                      >
                        {concept.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-2">
                <ConfidenceStars
                  confidence={problem.confidence}
                  onUpdate={(conf) => onUpdateConfidence(problem.id, conf)}
                />
              </TableCell>
              <TableCell className="py-2">
                <select
                  value={problem.status}
                  onChange={(e) => onUpdateStatus(problem.id, e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="needs-review">Needs Review</option>
                  <option value="mastered">Mastered</option>
                </select>
              </TableCell>
              <TableCell className="py-2 text-xs text-gray-600">
                {problem.lastSolved ? new Date(problem.lastSolved).toLocaleDateString() : '-'}
              </TableCell>
              <TableCell
                className={`py-2 text-xs cursor-pointer underline ${getDateClass(problem.nextReview)}`}
                onClick={() => handleSetReviewDate(problem.id, problem.nextReview)}
                title="Click to set custom date"
              >
                {formatDate(problem.nextReview)}
              </TableCell>
              <TableCell className="py-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddNote(problem.id)}
                    className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-md transition-colors cursor-pointer border-0"
                    title="Add note"
                  >
                    <StickyNote className="w-3 h-3" />
                  </button>
                  {problem.notes && problem.notes.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={() => toggleNotes(problem.id)}
                        className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium cursor-pointer border-0 hover:bg-purple-200"
                      >
                        {problem.notes.length}
                      </button>
                      {expandedNotes === problem.id && (
                        <div className="absolute z-10 right-0 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg p-3 max-h-60 overflow-y-auto">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-sm">Notes</h4>
                            <button
                              onClick={() => toggleNotes(problem.id)}
                              className="text-gray-500 hover:text-gray-700 text-xs"
                            >
                              Close
                            </button>
                          </div>
                          <div className="space-y-2">
                            {problem.notes.map((note, idx) => (
                              <div key={idx} className="border-b border-gray-200 pb-2 last:border-b-0">
                                <div className="text-xs text-gray-500 mb-1">
                                  {new Date(note.date).toLocaleDateString()} at{' '}
                                  {new Date(note.date).toLocaleTimeString()}
                                </div>
                                <div className="text-sm text-gray-800">{note.text}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(problem)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer border-0"
                    title="Edit"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(problem.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer border-0"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
