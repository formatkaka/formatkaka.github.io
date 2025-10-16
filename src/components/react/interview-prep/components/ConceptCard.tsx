import type { Concept } from '../types/types';
import { Badge } from '@/components/react/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/react/ui/card';
import {
  BookOpen,
  Video,
  Code,
  GraduationCap,
  FileText,
  ExternalLink,
  CheckCircle2,
  Pencil,
  Trash2,
} from 'lucide-react';
import { ConfidenceStars } from './ConfidenceStars';

type ConceptCardProps = {
  concept: Concept;
  onUpdateConfidence: (id: number, confidence: number) => void;
  onUpdateStatus: (id: number, status: Concept['status']) => void;
  onEdit: (concept: Concept) => void;
  onDelete: (id: number) => void;
  questionCount: number;
};

export const ConceptCard = (props: ConceptCardProps) => {
  const { concept, onUpdateConfidence, onUpdateStatus, onEdit, onDelete, questionCount } = props;

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'project':
        return <Code className="w-4 h-4" />;
      case 'course':
        return <GraduationCap className="w-4 h-4" />;
      case 'documentation':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Concept['status']) => {
    switch (status) {
      case 'learning':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      case 'practicing':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case 'mastered':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
    }
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${concept.name}"?`)) {
      onDelete(concept.id);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">{concept.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{concept.category}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(concept)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
              title="Edit concept"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
              title="Delete concept"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <Badge className={getStatusColor(concept.status)}>{concept.status}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{concept.description}</p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Confidence</p>
            <ConfidenceStars
              confidence={concept.confidence}
              onUpdate={(conf) => onUpdateConfidence(concept.id, conf)}
            />
          </div>
          <div className="flex gap-2">
            {['learning', 'practicing', 'mastered'].map((status) => (
              <button
                key={status}
                onClick={() => onUpdateStatus(concept.id, status as Concept['status'])}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  concept.status === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {concept.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {concept.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {concept.resources.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Resources</p>
            <div className="space-y-1.5">
              {concept.resources.map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm p-2 rounded-md
                    hover:bg-muted transition-colors group"
                >
                  <span className="text-muted-foreground">{getResourceIcon(resource.type)}</span>
                  <span className="flex-1 group-hover:text-primary">{resource.title}</span>
                  {resource.completedAt && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  <ExternalLink
                    className="w-3 h-3 text-muted-foreground
                    opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1 text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center justify-between">
            <span>
              {questionCount} related {questionCount === 1 ? 'question' : 'questions'}
            </span>
            {concept.lastReviewed && (
              <span>Last: {new Date(concept.lastReviewed).toLocaleDateString()}</span>
            )}
          </div>
          {concept.nextReview && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Next Review:</span>
              <span className="text-blue-600 font-semibold">
                {new Date(concept.nextReview).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
