import type { Concept, Problem } from '../types/types';
import { useState } from 'react';
import { ConceptCard } from './ConceptCard';
import { Input } from '@/components/react/ui/input';
import { Button } from '@/components/react/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/react/ui/select';
import { Plus } from 'lucide-react';

type ConceptsListProps = {
  concepts: Concept[];
  problems: Problem[];
  onUpdateConfidence: (id: number, confidence: number) => void;
  onUpdateStatus: (id: number, status: Concept['status']) => void;
  onEdit: (concept: Concept) => void;
  onDelete: (id: number) => void;
  onAddConcept: () => void;
};

export const ConceptsList = (props: ConceptsListProps) => {
  const { concepts, problems, onUpdateConfidence, onUpdateStatus, onEdit, onDelete, onAddConcept } = props;
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const categories = Array.from(new Set(concepts.map((c) => c.category)));

  const filteredConcepts = concepts.filter((concept) => {
    const matchesSearch =
      concept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concept.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concept.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'all' || concept.category === categoryFilter;

    const matchesStatus = statusFilter === 'all' || concept.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getQuestionCount = (conceptId: number) => {
    return problems.filter((p) => p.concepts?.includes(conceptId)).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 w-full">

          <Input
            placeholder="Search concepts, tags, or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-8 border-gray-300 relative z-0"
          />

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="learning">Learning</SelectItem>
              <SelectItem value="practicing">Practicing</SelectItem>
              <SelectItem value="mastered">Mastered</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={onAddConcept} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Concept
          </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredConcepts.map((concept) => (
          <ConceptCard
            key={concept.id}
            concept={concept}
            onUpdateConfidence={onUpdateConfidence}
            onUpdateStatus={onUpdateStatus}
            onEdit={onEdit}
            onDelete={onDelete}
            questionCount={getQuestionCount(concept.id)}
          />
        ))}
      </div>

      {filteredConcepts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No concepts found matching your filters.</p>
          <Button
            variant="link"
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setStatusFilter('all');
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
};
