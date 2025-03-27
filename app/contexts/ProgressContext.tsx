'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProgress } from '../lib/types';

interface ProgressContextType {
  progress: UserProgress;
  updateConversationProgress: (conversationId: string, score: number) => void;
  getConversationProgress: (conversationId: string) => {
    completed: boolean;
    score: number;
    lastAttempt: number;
  } | null;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>({
    conversations: {},
    statistics: {
      totalConversations: 0,
      totalPracticeTime: 0,
      averageScore: 0,
      completedScenarios: 0,
      currentStreak: 0,
      longestStreak: 0
    },
    achievements: []
  });

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem('userProgress');
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, []);

  const updateConversationProgress = (conversationId: string, score: number) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        conversations: {
          ...prev.conversations,
          [conversationId]: {
            completed: true,
            score,
            lastAttempt: Date.now()
          }
        }
      };
      localStorage.setItem('userProgress', JSON.stringify(newProgress));
      return newProgress;
    });
  };

  const getConversationProgress = (conversationId: string) => {
    const conversationProgress = progress.conversations[conversationId];
    if (!conversationProgress) {
      return null;
    }
    return {
      completed: conversationProgress.completed,
      score: conversationProgress.score || 0,
      lastAttempt: conversationProgress.lastAttempt || Date.now()
    };
  };

  return (
    <ProgressContext.Provider
      value={{
        progress,
        updateConversationProgress,
        getConversationProgress
      }}
    >
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