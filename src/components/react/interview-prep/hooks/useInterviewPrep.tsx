import { useState, useEffect } from 'react';
import type { Problem, TabType, Concept } from '../types/types';
import { sampleProblems, sampleConcepts } from '../data/sampleData';

const STORAGE_KEY = 'leetcodeProblems';
const CONCEPTS_STORAGE_KEY = 'interviewPrepConcepts';

export const useInterviewPrep = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [currentTab, setCurrentTab] = useState<TabType>('all');
  const [currentTopicFilter, setCurrentTopicFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Load problems from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const loadedProblems = stored ? JSON.parse(stored) : [];

    if (loadedProblems.length === 0) {
      setProblems(sampleProblems);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleProblems));
    } else {
      setProblems(loadedProblems);
    }
  }, []);

  // Save to localStorage whenever problems change
  useEffect(() => {
    if (problems.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(problems));
    }
  }, [problems]);

  // Load concepts from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CONCEPTS_STORAGE_KEY);
    const loadedConcepts = stored ? JSON.parse(stored) : [];

    if (loadedConcepts.length === 0) {
      setConcepts(sampleConcepts);
      localStorage.setItem(CONCEPTS_STORAGE_KEY, JSON.stringify(sampleConcepts));
    } else {
      setConcepts(loadedConcepts);
    }
  }, []);

  // Save to localStorage whenever concepts change
  useEffect(() => {
    if (concepts.length > 0) {
      localStorage.setItem(CONCEPTS_STORAGE_KEY, JSON.stringify(concepts));
    }
  }, [concepts]);

  const getTodayNormalized = (): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const getReviewLoadByDate = (dateString: string): number => {
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return problems.filter((p) => {
      if (!p.nextReview) return false;
      const reviewDate = new Date(p.nextReview);
      reviewDate.setHours(0, 0, 0, 0);
      return reviewDate.getTime() === date.getTime();
    }).length;
  };

  const findLeastLoadedDay = (minDays: number, maxDays: number): string => {
    let leastLoadDay = minDays;
    let leastLoad = Infinity;

    for (let i = minDays; i <= maxDays; i++) {
      const testDate = new Date();
      testDate.setDate(testDate.getDate() + i);
      testDate.setHours(0, 0, 0, 0);
      const load = getReviewLoadByDate(testDate.toISOString());

      if (load < leastLoad) {
        leastLoad = load;
        leastLoadDay = i;
      }
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + leastLoadDay);
    nextReview.setHours(0, 0, 0, 0);
    return nextReview.toISOString();
  };

  const calculateNextReview = (confidence: number): string => {
    if (confidence <= 2) {
      return findLeastLoadedDay(3, 5);
    } else if (confidence <= 4) {
      return findLeastLoadedDay(7, 14);
    } else {
      return findLeastLoadedDay(14, 21);
    }
  };

  const isDueToday = (problem: Problem): boolean => {
    if (!problem.nextReview) return false;
    const reviewDate = new Date(problem.nextReview);
    const today = getTodayNormalized();
    reviewDate.setHours(0, 0, 0, 0);
    return reviewDate <= today;
  };

  const isOverdue = (problem: Problem): boolean => {
    if (!problem.nextReview) return false;
    const reviewDate = new Date(problem.nextReview);
    const today = getTodayNormalized();
    reviewDate.setHours(0, 0, 0, 0);
    return reviewDate < today;
  };

  const getFilteredProblems = (): Problem[] => {
    let filtered = currentTab === 'due' ? problems.filter(isDueToday) : problems;

    if (currentTopicFilter !== 'all') {
      filtered = filtered.filter((p) => p.topic === currentTopicFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.topic.toLowerCase().includes(query) ||
          p.company.toLowerCase().includes(query) ||
          p.itemType.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const getUniqueTopics = (): string[] => {
    const topics = problems.map((p) => p.topic).filter(Boolean);
    return Array.from(new Set(topics)).sort();
  };

  const addProblem = (
    newProblem: Omit<
      Problem,
      'id' | 'created' | 'attempts' | 'confidence' | 'status' | 'lastSolved' | 'nextReview'
    >
  ) => {
    const problem: Problem = {
      ...newProblem,
      id: Date.now(),
      confidence: 0,
      status: 'not-started',
      attempts: 0,
      lastSolved: null,
      nextReview: null,
      created: new Date().toISOString(),
    };
    setProblems((prev) => [...prev, problem]);
  };

  const updateProblem = (
    id: number,
    updatedData: Omit<
      Problem,
      'id' | 'created' | 'attempts' | 'confidence' | 'status' | 'lastSolved' | 'nextReview'
    >
  ) => {
    setProblems((prev) => prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p)));
  };

  const updateProblemStatus = (id: number, newStatus: string) => {
    setProblems((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        const updated = { ...p, status: newStatus, lastSolved: new Date().toISOString() };

        if (newStatus === 'completed' || newStatus === 'needs-review') {
          updated.nextReview = calculateNextReview(p.confidence);
          updated.attempts = p.attempts + 1;
        }

        return updated;
      })
    );
  };

  const updateConfidence = (id: number, confidence: number) => {
    setProblems((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        const getStatusFromConfidence = (conf: number): string => {
          if (conf >= 4) return 'mastered';
          if (conf >= 3) return 'completed';
          if (conf >= 1) return 'in-progress';
          return 'not-started';
        };

        const updated = {
          ...p,
          confidence,
          lastSolved: new Date().toISOString(),
          status: getStatusFromConfidence(confidence),
        };

        if (confidence >= 1) {
          updated.nextReview = calculateNextReview(confidence);
          updated.attempts = p.attempts + 1;
        }

        return updated;
      })
    );
  };

  const setManualReviewDate = (id: number, dateString: string) => {
    setProblems((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const reviewDate = new Date(dateString + 'T00:00:00');
        return { ...p, nextReview: reviewDate.toISOString() };
      })
    );
  };

  const deleteProblem = (id: number) => {
    setProblems((prev) => prev.filter((p) => p.id !== id));
  };

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(problems, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leetcode-progress.json';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const importFromJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedProblems = JSON.parse(content);

        if (!Array.isArray(importedProblems)) {
          alert('Invalid JSON format. Expected an array of problems.');
          return;
        }

        const message = `This will import ${importedProblems.length} items. Do you want to replace existing data or merge?

Click OK to REPLACE all existing data
Click Cancel to keep existing data and cancel import`;

        const confirmed = confirm(message);

        if (confirmed) {
          setProblems(importedProblems);
          alert(`Successfully imported ${importedProblems.length} items!`);
        }
      } catch (error) {
        alert("Error parsing JSON file. Please ensure it's a valid JSON file.");
        console.error('Import error:', error);
      }
    };

    reader.readAsText(file);
  };

  const addConcept = (
    newConcept: Omit<
      Concept,
      'id' | 'created' | 'confidence' | 'relatedQuestions' | 'lastReviewed' | 'nextReview'
    >
  ) => {
    const concept: Concept = {
      ...newConcept,
      id: Date.now(),
      confidence: 0,
      relatedQuestions: [],
      created: new Date().toISOString(),
      lastReviewed: null,
      nextReview: null,
    };
    setConcepts((prev) => [...prev, concept]);
  };

  const updateConceptConfidence = (id: number, confidence: number) => {
    setConcepts((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              confidence,
              lastReviewed: new Date().toISOString(),
              nextReview: confidence >= 1 ? calculateNextReview(confidence) : null,
            }
          : c
      )
    );
  };

  const updateConceptStatus = (id: number, status: Concept['status']) => {
    setConcepts((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status,
              lastReviewed: new Date().toISOString(),
              nextReview: c.confidence >= 1 ? calculateNextReview(c.confidence) : null,
            }
          : c
      )
    );
  };

  const updateConcept = (
    id: number,
    updatedData: Omit<
      Concept,
      'id' | 'created' | 'confidence' | 'relatedQuestions' | 'lastReviewed' | 'nextReview'
    >
  ) => {
    setConcepts((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, ...updatedData, lastReviewed: new Date().toISOString() } : c
      )
    );
  };

  const deleteConcept = (id: number) => {
    setConcepts((prev) => prev.filter((c) => c.id !== id));
    setProblems((prev) =>
      prev.map((p) => ({
        ...p,
        concepts: p.concepts?.filter((cId) => cId !== id),
      }))
    );
  };

  const getUniqueCategories = (): string[] => {
    const categories = concepts.map((c) => c.category).filter(Boolean);
    return Array.from(new Set(categories)).sort();
  };

  const stats = {
    total: problems.length,
    completed: problems.filter((p) => p.status === 'completed' || p.status === 'mastered').length,
    dueToday: problems.filter(isDueToday).length,
    mastered: problems.filter((p) => p.status === 'mastered').length,
    conceptsLearning: concepts.filter((c) => c.status === 'learning').length,
    conceptsPracticing: concepts.filter((c) => c.status === 'practicing').length,
    conceptsMastered: concepts.filter((c) => c.status === 'mastered').length,
  };

  return {
    problems: getFilteredProblems(),
    allProblems: problems,
    concepts,
    currentTab,
    currentTopicFilter,
    searchQuery,
    topics: getUniqueTopics(),
    categories: getUniqueCategories(),
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
    addConcept,
    updateConcept,
    updateConceptConfidence,
    updateConceptStatus,
    deleteConcept,
  };
};
