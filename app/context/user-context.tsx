'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserSettings } from '@/app/lib/types';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserProgress {
  statistics: {
    totalConversations: number;
    totalPracticeTime: number;
    currentStreak: number;
  };
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    earnedDate: string;
  }>;
}

interface UserProfile extends User {
  nativeLanguage: string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
  learningGoals: string[];
  joinedDate: string;
  settings: UserSettings;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  userProfile: UserProfile | null;
  userProgress: UserProgress | null;
  updateProfile: (profile: UserProfile) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Load user profile
          const response = await fetch('/api/profile');
          if (response.ok) {
            const profile = await response.json();
            setUserProfile(profile);
          }

          // Load user progress
          const progressResponse = await fetch('/api/progress');
          if (progressResponse.ok) {
            const progress = await progressResponse.json();
            setUserProgress(progress);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const value = {
    user,
    setUser: (newUser: User | null) => {
      setUser(newUser);
      if (newUser) {
        localStorage.setItem('user', JSON.stringify(newUser));
      } else {
        localStorage.removeItem('user');
        setUserProfile(null);
        setUserProgress(null);
      }
    },
    isLoading,
    userProfile,
    userProgress,
    updateProfile: async (profile: UserProfile) => {
      try {
        const response = await fetch('/api/profile/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profile),
        });

        if (!response.ok) {
          throw new Error('Failed to update profile');
        }

        setUserProfile(profile);
      } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
    }
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (typeof window === 'undefined') {
    // Return a default value during SSR
    return { user: null, setUser: () => {}, isLoading: true, userProfile: null, userProgress: null, updateProfile: async () => {} };
  }
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 