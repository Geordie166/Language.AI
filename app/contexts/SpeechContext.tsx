'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SpeechService } from '../lib/speech-service';

interface SpeechContextType {
  isListening: boolean;
  isSpeaking: boolean;
  startListening: (
    onInterimResult: (text: string) => void,
    onFinalResult: (text: string) => void
  ) => Promise<void>;
  stopListening: () => Promise<void>;
  speak: (text: string) => Promise<void>;
  assessPronunciation: (referenceText: string, spokenText: string) => Promise<any>;
  stopSpeaking: () => Promise<void>;
}

const SpeechContext = createContext<SpeechContextType | undefined>(undefined);

export function SpeechProvider({ children }: { children: React.ReactNode }) {
  const [speechService, setSpeechService] = useState<SpeechService | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Initialize speech service
    try {
      const service = new SpeechService();
      setSpeechService(service);
    } catch (error) {
      console.error('Failed to initialize speech service:', error);
    }

    // Cleanup on unmount
    return () => {
      if (speechService) {
        speechService.dispose();
      }
    };
  }, []);

  const startListening = useCallback(async (
    onInterimResult: (text: string) => void,
    onFinalResult: (text: string) => void
  ) => {
    if (!speechService) return;
    try {
      setIsListening(true);
      await speechService.startListening(onInterimResult, onFinalResult);
    } catch (error) {
      console.error('Error starting listening:', error);
      setIsListening(false);
    }
  }, [speechService]);

  const stopListening = useCallback(async () => {
    if (!speechService) return;
    try {
      await speechService.stopListening();
    } finally {
      setIsListening(false);
    }
  }, [speechService]);

  const speak = useCallback(async (text: string) => {
    if (!speechService) return;
    try {
      setIsSpeaking(true);
      await speechService.speak(text);
    } catch (error) {
      console.error('Error speaking:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, [speechService]);

  const assessPronunciation = async (referenceText: string, spokenText: string) => {
    if (!speechService) throw new Error('Speech service not initialized');
    return speechService.assessPronunciation(referenceText, spokenText);
  };

  const stopSpeaking = useCallback(async () => {
    if (!speechService) return;
    try {
      await speechService.stopSpeaking();
    } finally {
      setIsSpeaking(false);
    }
  }, [speechService]);

  return (
    <SpeechContext.Provider
      value={{
        isListening,
        isSpeaking,
        startListening,
        stopListening,
        speak,
        assessPronunciation,
        stopSpeaking
      }}
    >
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