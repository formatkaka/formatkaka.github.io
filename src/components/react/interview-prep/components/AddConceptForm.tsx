import type { Concept, Resource } from '../types/types';
import { useState, useEffect } from 'react';
import { Button } from '@/components/react/ui/button';
import { Input } from '@/components/react/ui/input';
import { Label } from '@/components/react/ui/label';
import { Textarea } from '@/components/react/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/react/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/react/ui/select';
import { Badge } from '@/components/react/ui/badge';
import { X, Plus } from 'lucide-react';

type AddConceptFormProps = {
  open: boolean;
  onClose: () => void;
  editingConcept: Concept | null;
  onSave: (concept: {
    name: string;
    category: string;
    description: string;
    resources: Resource[];
    tags: string[];
    status: Concept['status'];
  }) => void;
  onUpdate: (id: number, concept: {
    name: string;
    category: string;
    description: string;
    resources: Resource[];
    tags: string[];
    status: Concept['status'];
  }) => void;
  categories: string[];
};

export const AddConceptForm = (props: AddConceptFormProps) => {
  const { open, onClose, editingConcept, onSave, onUpdate, categories } = props;
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Concept['status']>('learning');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceForm, setResourceForm] = useState({
    type: 'article' as Resource['type'],
    title: '',
    link: '',
    notes: '',
  });

  useEffect(() => {
    if (editingConcept) {
      setName(editingConcept.name);
      setCategory(editingConcept.category);
      setDescription(editingConcept.description);
      setStatus(editingConcept.status);
      setTags(editingConcept.tags);
      setResources(editingConcept.resources);
    } else {
      clearForm();
    }
  }, [editingConcept]);

  const clearForm = () => {
    setName('');
    setCategory('');
    setDescription('');
    setStatus('learning');
    setTags([]);
    setTagInput('');
    setResources([]);
    setResourceForm({ type: 'article', title: '', link: '', notes: '' });
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleAddResource = () => {
    if (resourceForm.title.trim() && resourceForm.link.trim()) {
      setResources([
        ...resources,
        {
          type: resourceForm.type,
          title: resourceForm.title.trim(),
          link: resourceForm.link.trim(),
          notes: resourceForm.notes.trim() || undefined,
          completedAt: null,
        },
      ]);
      setResourceForm({ type: 'article', title: '', link: '', notes: '' });
    }
  };

  const handleRemoveResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim() || !category.trim() || !description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const conceptData = {
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      resources,
      tags,
      status,
    };

    if (editingConcept) {
      onUpdate(editingConcept.id, conceptData);
    } else {
      onSave(conceptData);
    }

    clearForm();
    onClose();
  };

  const handleClose = () => {
    clearForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col w-[95vw]">
        <DialogHeader className="pb-3 border-b shrink-0">
          <DialogTitle>{editingConcept ? 'Edit Concept' : 'Add New Concept'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto overflow-x-hidden flex-1 pr-2">
          <div className="space-y-2">
            <Label htmlFor="concept-name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="concept-name"
              placeholder="e.g., Compound Component Pattern"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="concept-category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Input
              id="concept-category"
              placeholder="e.g., React Patterns, DSA Patterns"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              list="categoriesList"
            />
            <datalist id="categoriesList">
              {categories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <Label htmlFor="concept-description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="concept-description"
              placeholder="Brief description of the concept..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="concept-status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as Concept['status'])}>
              <SelectTrigger id="concept-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="learning">Learning</SelectItem>
                <SelectItem value="practicing">Practicing</SelectItem>
                <SelectItem value="mastered">Mastered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag (press Enter)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t">
            <Label>Resources</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Select
                  value={resourceForm.type}
                  onValueChange={(v) =>
                    setResourceForm({ ...resourceForm, type: v as Resource['type'] })
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="course">Course</SelectItem>
                    <SelectItem value="documentation">Docs</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Title"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                  className="flex-1"
                />
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="URL"
                  value={resourceForm.link}
                  onChange={(e) => setResourceForm({ ...resourceForm, link: e.target.value })}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddResource}
                  className="shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <Input
                placeholder="Notes (optional)"
                value={resourceForm.notes}
                onChange={(e) => setResourceForm({ ...resourceForm, notes: e.target.value })}
              />
            </div>

            {resources.length > 0 && (
              <div className="space-y-2 mt-3">
                {resources.map((resource, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{resource.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {resource.type} • {resource.link}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveResource(idx)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-4 border-t shrink-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {editingConcept ? 'Update Concept' : 'Save Concept'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
