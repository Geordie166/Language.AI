'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SpeechService } from '../lib/speech-service';

interface SpeechContextType {
  isListening: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  isMuted: boolean;
  startListening: (
    onInterimResult: (text: string) => void,
    onFinalResult: (text: string) => void
  ) => Promise<void>;
  stopListening: () => Promise<void>;
  pauseListening: () => Promise<void>;
  resumeListening: () => Promise<void>;
  speak: (text: string) => Promise<void>;
  assessPronunciation: (referenceText: string, spokenText: string) => Promise<any>;
  stopSpeaking: () => Promise<void>;
  setMuted: (muted: boolean) => void;
}

const SpeechContext = createContext<SpeechContextType | undefined>(undefined);

export function SpeechProvider({ children }: { children: React.ReactNode }) {
  const [speechService, setSpeechService] = useState<SpeechService | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentCallbacks, setCurrentCallbacks] = useState<{
    onInterimResult: (text: string) => void;
    onFinalResult: (text: string) => void;
  } | null>(null);

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
      setCurrentCallbacks({ onInterimResult, onFinalResult });
      setIsListening(true);
      await speechService.startListening(onInterimResult, onFinalResult);
    } catch (error) {
      console.error('Error starting listening:', error);
      setIsListening(false);
      setCurrentCallbacks(null);
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

  const pauseListening = useCallback(async () => {
    if (!speechService) return;
    try {
      await speechService.pauseListening();
      setIsPaused(true);
    } catch (error) {
      console.error('Error pausing listening:', error);
    }
  }, [speechService]);

  const resumeListening = useCallback(async () => {
    if (!speechService || !currentCallbacks) return;
    try {
      await speechService.resumeListening(
        currentCallbacks.onInterimResult,
        currentCallbacks.onFinalResult
      );
      setIsPaused(false);
    } catch (error) {
      console.error('Error resuming listening:', error);
    }
  }, [speechService, currentCallbacks]);

  const setMuted = useCallback((muted: boolean) => {
    if (!speechService) return;
    speechService.setMuted(muted);
    setIsMuted(muted);
  }, [speechService]);

  return (
    <SpeechContext.Provider
      value={{
        isListening,
        isSpeaking,
        isPaused,
        isMuted,
        startListening,
        stopListening,
        pauseListening,
        resumeListening,
        speak,
        assessPronunciation,
        stopSpeaking,
        setMuted
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