'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AzureSpeechService, AzureSpeechConfig } from '../lib/azure-speech-service';

interface AzureSpeechContextType {
  isInitialized: boolean;
  isListening: boolean;
  currentLanguage: string;
  error: string | null;
  startListening: (onInterimResult: (text: string) => void, onFinalResult: (text: string) => void) => Promise<void>;
  stopListening: () => Promise<void>;
  speak: (text: string) => Promise<void>;
  setLanguage: (language: string) => Promise<void>;
}

const AzureSpeechContext = createContext<AzureSpeechContextType | null>(null);

export const useAzureSpeech = () => {
  const context = useContext(AzureSpeechContext);
  if (!context) {
    throw new Error('useAzureSpeech must be used within an AzureSpeechProvider');
  }
  return context;
};

interface AzureSpeechProviderProps {
  children: React.ReactNode;
  config: AzureSpeechConfig;
}

export const AzureSpeechProvider: React.FC<AzureSpeechProviderProps> = ({ children, config }) => {
  const [service, setService] = useState<AzureSpeechService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(config.language);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const speechService = new AzureSpeechService(config);
      setService(speechService);
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      setError('Failed to initialize Azure Speech Service');
      console.error('Azure Speech Service initialization error:', err);
    }

    return () => {
      if (service) {
        service.dispose();
      }
    };
  }, [config]);

  const startListening = async (
    onInterimResult: (text: string) => void,
    onFinalResult: (text: string) => void
  ) => {
    if (!service) {
      setError('Speech service not initialized');
      return;
    }

    try {
      await service.startListening(onInterimResult, onFinalResult);
      setIsListening(true);
      setError(null);
    } catch (err) {
      setError('Failed to start listening');
      console.error('Start listening error:', err);
    }
  };

  const stopListening = async () => {
    if (!service) {
      return;
    }

    try {
      await service.stopListening();
      setIsListening(false);
      setError(null);
    } catch (err) {
      setError('Failed to stop listening');
      console.error('Stop listening error:', err);
    }
  };

  const speak = async (text: string) => {
    if (!service) {
      setError('Speech service not initialized');
      return;
    }

    try {
      await service.speak(text);
      setError(null);
    } catch (err) {
      setError('Failed to synthesize speech');
      console.error('Speech synthesis error:', err);
    }
  };

  const setLanguage = async (language: string) => {
    if (!service) {
      setError('Speech service not initialized');
      return;
    }

    try {
      await service.setLanguage(language);
      setCurrentLanguage(language);
      setError(null);
    } catch (err) {
      setError('Failed to change language');
      console.error('Language change error:', err);
    }
  };

  const value = {
    isInitialized,
    isListening,
    currentLanguage,
    error,
    startListening,
    stopListening,
    speak,
    setLanguage,
  };

  return (
    <AzureSpeechContext.Provider value={value}>
      {children}
    </AzureSpeechContext.Provider>
  );
}; 