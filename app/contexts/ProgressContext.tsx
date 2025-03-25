'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProgress, LessonProgress } from '../lib/types';

interface ProgressContextType {
  progress: UserProgress;
  updateLessonProgress: (lessonId: string, score: number, totalQuestions: number, correctAnswers: number) => void;
  completeLesson: (lessonId: string) => void;
  getLessonProgress: (lessonId: string) => LessonProgress;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>({
    userId: 'anonymous',
    completedLessons: [],
    scores: {},
    streak: 0,
    lastPracticeDate: new Date(),
  });

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem('userProgress');
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, []);

  useEffect(() => {
    // Save progress to localStorage
    localStorage.setItem('userProgress', JSON.stringify(progress));
  }, [progress]);

  const updateLessonProgress = (lessonId: string, score: number, totalQuestions: number, correctAnswers: number) => {
    setProgress(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [lessonId]: {
          lastAttempted: new Date(),
          score,
          totalQuestions,
          correctAnswers,
        },
      },
      lastPracticeDate: new Date(),
    }));
  };

  const completeLesson = (lessonId: string) => {
    setProgress(prev => ({
      ...prev,
      completedLessons: [...prev.completedLessons, lessonId],
    }));
  };

  const getLessonProgress = (lessonId: string): LessonProgress => {
    const lessonScore = progress.scores[lessonId];
    return {
      lessonId,
      completed: progress.completedLessons.includes(lessonId),
      score: lessonScore?.score || 0,
      lastAttempted: lessonScore?.lastAttempted || new Date(),
      audioExamples: {},
    };
  };

  return (
    <ProgressContext.Provider value={{ progress, updateLessonProgress, completeLesson, getLessonProgress }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
} 