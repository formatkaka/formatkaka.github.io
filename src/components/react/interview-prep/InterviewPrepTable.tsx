import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import type { Problem, TabType } from './types';
import { ConfidenceStars } from './ConfidenceStars';

type InterviewPrepTableProps = {
  problems: Problem[];
  currentTab: TabType;
  isOverdue: (problem: Problem) => boolean;
  onUpdateStatus: (id: number, status: string) => void;
  onUpdateConfidence: (id: number, confidence: number) => void;
  onSetReviewDate: (id: number, date: string) => void;
  onEdit: (problem: Problem) => void;
  onDelete: (id: number) => void;
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
  currentTab,
  isOverdue,
  onUpdateStatus,
  onUpdateConfidence,
  onSetReviewDate,
  onEdit,
  onDelete,
}: InterviewPrepTableProps) => {
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
            <TableHead className="py-2">Confidence</TableHead>
            <TableHead className="py-2">Status</TableHead>
            <TableHead className="py-2">Last Reviewed</TableHead>
            <TableHead className="py-2">Next Review</TableHead>
            <TableHead className="py-2">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {problems.map(problem => (
            <TableRow
              key={problem.id}
              className={`text-sm ${
                isOverdue(problem) && currentTab === 'due'
                  ? 'bg-red-50 hover:bg-red-100'
                  : ''
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
