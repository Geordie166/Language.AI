import { useState, useEffect } from 'react';

interface DashboardState {
  practiceTime: {
    used: number;
    total: number;
  };
  streak: number;
  wordsLearned: number;
  wordOfTheDay: {
    word: string;
    definition: string;
    example: string;
    lastUpdated: string;
  };
}

const STORAGE_KEY = 'myvoicecoach_dashboard';
const DAILY_PRACTICE_LIMIT = 70; // minutes

export function useDashboard() {
  const [state, setState] = useState<DashboardState>({
    practiceTime: {
      used: 0,
      total: DAILY_PRACTICE_LIMIT
    },
    streak: 0,
    wordsLearned: 0,
    wordOfTheDay: {
      word: '',
      definition: '',
      example: '',
      lastUpdated: ''
    }
  });

  useEffect(() => {
    // Load saved state from localStorage
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const parsed = JSON.parse(savedState);
      setState(parsed);
    }

    // Check and update streak
    checkAndUpdateStreak();
    
    // Check and update word of the day
    checkAndUpdateWordOfDay();
  }, []);

  useEffect(() => {
    // Save state to localStorage whenever it changes
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const checkAndUpdateStreak = () => {
    const today = new Date().toLocaleDateString();
    const lastPractice = localStorage.getItem('last_practice_date');

    if (!lastPractice) {
      // First time user
      localStorage.setItem('last_practice_date', today);
      setState(prev => ({ ...prev, streak: 1 }));
    } else {
      const lastDate = new Date(lastPractice);
      const currentDate = new Date(today);
      const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        setState(prev => ({ ...prev, streak: prev.streak + 1 }));
      } else if (diffDays > 1) {
        // Streak broken
        setState(prev => ({ ...prev, streak: 1 }));
      }
      localStorage.setItem('last_practice_date', today);
    }
  };

  const checkAndUpdateWordOfDay = async () => {
    const today = new Date().toLocaleDateString();
    if (state.wordOfTheDay.lastUpdated !== today) {
      try {
        // In a real app, this would fetch from an API
        const newWord = await getRandomWord();
        setState(prev => ({
          ...prev,
          wordOfTheDay: {
            ...newWord,
            lastUpdated: today
          }
        }));
      } catch (error) {
        console.error('Failed to update word of the day:', error);
      }
    }
  };

  const updatePracticeTime = (duration: number) => {
    setState(prev => ({
      ...prev,
      practiceTime: {
        ...prev.practiceTime,
        used: Math.min(prev.practiceTime.used + duration, DAILY_PRACTICE_LIMIT)
      }
    }));
  };

  const addLearnedWords = (count: number) => {
    setState(prev => ({
      ...prev,
      wordsLearned: prev.wordsLearned + count
    }));
  };

  // Temporary function to generate random words
  // In production, this would be replaced with an API call
  const getRandomWord = async () => {
    const words = [
      {
        word: 'Eloquent',
        definition: 'Fluent or persuasive in speaking or writing',
        example: 'She gave an eloquent speech about language learning'
      },
      {
        word: 'Perseverance',
        definition: 'Persistence in doing something despite difficulty',
        example: 'His perseverance in practicing English paid off'
      },
      {
        word: 'Serendipity',
        definition: 'The occurrence and development of events by chance in a happy or beneficial way',
        example: 'By serendipity, she met a native speaker to practice with'
      }
    ];
    return words[Math.floor(Math.random() * words.length)];
  };

  return {
    ...state,
    updatePracticeTime,
    addLearnedWords
  };
} 