'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SpeechService, ISpeechService } from '../lib/speech-service';

interface SpeechContextType {
  speechService: ISpeechService | null;
  isInitialized: boolean;
  error: string | null;
}

const SpeechContext = createContext<SpeechContextType | undefined>(undefined);

export function SpeechProvider({ children }: { children: React.ReactNode }) {
  const [speechService, setSpeechService] = useState<ISpeechService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const service = new SpeechService();
      setSpeechService(service);
      setIsInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize speech service');
    }

    return () => {
      if (speechService) {
        speechService.dispose();
      }
    };
  }, []);

  const value = {
    speechService,
    isInitialized,
    error
  };

  return (
    <SpeechContext.Provider value={value}>
      {children}
    </SpeechContext.Provider>
  );
}

export function useSpeech() {
  const context = useContext(SpeechContext);
  if (typeof window === 'undefined') {
    // Return a default value during SSR
    return { speechService: null, isInitialized: false, error: null };
  }
  if (context === undefined) {
    throw new Error('useSpeech must be used within a SpeechProvider');
  }
  return context;
} 