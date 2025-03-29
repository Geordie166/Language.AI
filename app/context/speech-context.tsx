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

  return (
    <SpeechContext.Provider value={{ speechService, isInitialized, error }}>
      {children}
    </SpeechContext.Provider>
  );
}

export function useSpeech() {
  const context = useContext(SpeechContext);
  if (context === undefined) {
    throw new Error('useSpeech must be used within a SpeechProvider');
  }
  return context;
} 