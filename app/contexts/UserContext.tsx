'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserProgress } from '../lib/types';

interface UserContextType {
  userProfile: UserProfile | null;
  userProgress: UserProgress | null;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateProgress: (progress: Partial<UserProgress>) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    const loadUserData = async () => {
      try {
        // Simulate API call
        const mockProfile: UserProfile = {
          id: '1',
          name: 'Guest User',
          email: 'guest@example.com',
          nativeLanguage: 'Spanish',
          proficiencyLevel: 'beginner',
          learningGoals: ['Improve conversation skills', 'Learn business English'],
          joinedDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          settings: {
            theme: 'light',
            emailNotifications: false,
            practiceReminders: true,
            audioEnabled: true,
            autoPlayPronunciation: false,
            preferredPracticeTime: 30,
            dailyGoal: 3,
            interfaceLanguage: 'en',
            fontSize: 'medium',
            highContrastMode: false,
            keyboardShortcuts: true,
            showProgressChart: true,
            showStreak: true,
            privacyMode: 'private'
          }
        };

        const mockProgress: UserProgress = {
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
        };

        setUserProfile(mockProfile);
        setUserProgress(mockProgress);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const updateProfile = (profile: Partial<UserProfile>) => {
    setUserProfile(prev => {
      if (!prev) return prev;
      return { ...prev, ...profile };
    });
    // TODO: Sync with backend
  };

  const updateProgress = (progress: Partial<UserProgress>) => {
    setUserProgress(prev => {
      if (!prev) return prev;
      return { ...prev, ...progress };
    });
    // TODO: Sync with backend
  };

  return (
    <UserContext.Provider value={{ userProfile, userProgress, updateProfile, updateProgress, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 