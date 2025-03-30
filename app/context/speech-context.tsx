'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import SpeechService from '@/app/lib/speech-service';

interface SpeechContextType {
  speechService: SpeechService | null;
  isInitialized: boolean;
  error: string | null;
  initialize: (subscriptionKey: string, region: string) => void;
}

const SpeechContext = createContext<SpeechContextType>({
  speechService: null,
  isInitialized: false,
  error: null,
  initialize: () => {},
});

export function SpeechProvider({ children }: { children: React.ReactNode }) {
  const [speechService, setSpeechService] = useState<SpeechService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialize = (subscriptionKey: string, region: string) => {
    try {
      const service = SpeechService.getInstance();
      service.initialize({ subscriptionKey, region });
      setSpeechService(service);
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize speech service');
    }
  };

  return (
    <SpeechContext.Provider value={{ speechService, isInitialized, error, initialize }}>
      {children}
    </SpeechContext.Provider>
  );
}

export function useSpeech() {
  const context = useContext(SpeechContext);
  if (!context) {
    throw new Error('useSpeech must be used within a SpeechProvider');
  }
  return context;
} 