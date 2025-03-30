'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import SpeechService from '@/app/lib/speech-service';

interface SpeechContextType {
  isListening: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  isMuted: boolean;
  currentLanguage: string;
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
  setLanguage: (language: string) => Promise<void>;
  errorMessage: string | null;
}

const SpeechContext = createContext<SpeechContextType | undefined>(undefined);

// Heartbeat interval to detect frozen UI
const HEARTBEAT_INTERVAL = 1000;
// Max operations time before considering the UI frozen
const MAX_OPERATION_TIME = 3000;

export function SpeechProvider({ children }: { children: React.ReactNode }) {
  const [speechService, setSpeechService] = useState<SpeechService | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentCallbacks, setCurrentCallbacks] = useState<{
    onInterimResult: (text: string) => void;
    onFinalResult: (text: string) => void;
  } | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState('english');
  
  // Refs for tracking operation timeouts
  const operationInProgress = useRef<string | null>(null);
  const operationStartTime = useRef<number>(0);
  const heartbeatTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Setup heartbeat to detect UI freezes
  useEffect(() => {
    const startHeartbeat = () => {
      if (heartbeatTimer.current) {
        clearInterval(heartbeatTimer.current);
      }
      
      heartbeatTimer.current = setInterval(() => {
        // Check if an operation has been running too long
        if (operationInProgress.current && 
            Date.now() - operationStartTime.current > MAX_OPERATION_TIME) {
          console.warn(`Operation ${operationInProgress.current} is taking too long, may cause UI freeze`);
          
          // Force reset operation state to prevent UI freeze
          operationInProgress.current = null;
          setIsListening(false);
          setIsSpeaking(false);
          setIsPaused(false);
          setErrorMessage(`Operation timed out: ${operationInProgress.current}`);
          
          // Emergency cleanup
          if (speechService) {
            try {
              speechService.dispose();
              setSpeechService(null);
              
              // Re-initialize service
              const service = new SpeechService();
              setSpeechService(service);
            } catch (error) {
              console.error('Error during emergency cleanup:', error);
            }
          }
        }
      }, HEARTBEAT_INTERVAL);
      
      return () => {
        if (heartbeatTimer.current) {
          clearInterval(heartbeatTimer.current);
          heartbeatTimer.current = null;
        }
      };
    };
    
    startHeartbeat();
    
    return () => {
      if (heartbeatTimer.current) {
        clearInterval(heartbeatTimer.current);
        heartbeatTimer.current = null;
      }
    };
  }, [speechService]);

  // Track operations with timeouts
  const trackOperation = (name: string) => {
    operationInProgress.current = name;
    operationStartTime.current = Date.now();
    return () => {
      operationInProgress.current = null;
    };
  };

  useEffect(() => {
    // Initialize speech service with error handling
    try {
      console.log('Creating new SpeechService');
      const service = new SpeechService();
      setSpeechService(service);
      setErrorMessage(null);
    } catch (error) {
      console.error('Failed to initialize speech service:', error);
      setErrorMessage('Failed to initialize speech service. Please check your browser permissions and try again.');
    }

    // Cleanup on unmount
    return () => {
      if (speechService) {
        try {
          speechService.dispose();
        } catch (error) {
          console.error('Error disposing speech service:', error);
        }
      }
    };
  }, []);

  const setLanguage = useCallback(async (language: string) => {
    if (!speechService) return;
    const stopTracking = trackOperation('setLanguage');
    
    try {
      setErrorMessage(null);
      const wasListening = isListening;
      if (wasListening) {
        await stopListening();
      }

      await speechService.setLanguage(language);
      setCurrentLanguage(language);

      // Restart listening if it was active
      if (wasListening && currentCallbacks) {
        await startListening(
          currentCallbacks.onInterimResult,
          currentCallbacks.onFinalResult
        );
      }
    } catch (error) {
      console.error('Error setting language:', error);
      setErrorMessage(`Error setting language: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      stopTracking();
    }
  }, [speechService, isListening, currentCallbacks]);

  const startListening = useCallback(async (
    onInterimResult: (text: string) => void,
    onFinalResult: (text: string) => void
  ) => {
    if (!speechService) return;
    const stopTracking = trackOperation('startListening');
    
    try {
      setErrorMessage(null);
      setCurrentCallbacks({ onInterimResult, onFinalResult });
      setIsListening(true);
      
      // Use timeout to prevent UI freeze
      const timeoutId = setTimeout(() => {
        console.warn('startListening operation taking too long');
        setErrorMessage('Listening operation timed out. Please try again.');
        setIsListening(false);
      }, MAX_OPERATION_TIME);
      
      await speechService.startListening(
        (text) => {
          try {
            onInterimResult(text);
          } catch (error) {
            console.error('Error in interim result callback:', error);
          }
        },
        (text) => {
          try {
            onFinalResult(text);
          } catch (error) {
            console.error('Error in final result callback:', error);
          }
        }
      );
      
      clearTimeout(timeoutId);
    } catch (error) {
      console.error('Error starting listening:', error);
      setIsListening(false);
      setCurrentCallbacks(null);
      setErrorMessage(`Error starting listening: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      stopTracking();
    }
  }, [speechService]);

  const stopListening = useCallback(async () => {
    if (!speechService) return;
    const stopTracking = trackOperation('stopListening');
    
    try {
      // Set state immediately for UI responsiveness
      setIsListening(false);
      
      // Use timeout to prevent UI freeze
      const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          console.warn('stopListening operation timed out');
          resolve();
        }, MAX_OPERATION_TIME);
      });
      
      // Race between actual operation and timeout
      await Promise.race([
        speechService.stopListening(),
        timeoutPromise
      ]);
    } catch (error) {
      console.error('Error stopping listening:', error);
      setErrorMessage(`Error stopping listening: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsListening(false);
      stopTracking();
    }
  }, [speechService]);

  const speak = useCallback(async (text: string) => {
    if (!speechService) return;
    const stopTracking = trackOperation('speak');
    
    try {
      setErrorMessage(null);
      setIsSpeaking(true);
      
      // Use timeout to prevent UI freeze
      const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          console.warn('speak operation timed out');
          setIsSpeaking(false);
          resolve();
        }, MAX_OPERATION_TIME);
      });
      
      // Race between actual operation and timeout
      await Promise.race([
        speechService.speak(text),
        timeoutPromise
      ]);
    } catch (error) {
      console.error('Error speaking:', error);
      setErrorMessage(`Error speaking: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSpeaking(false);
      stopTracking();
    }
  }, [speechService]);

  const assessPronunciation = useCallback(async (referenceText: string, spokenText: string) => {
    if (!speechService) throw new Error('Speech service not initialized');
    const stopTracking = trackOperation('assessPronunciation');
    
    try {
      return await speechService.assessPronunciation(referenceText, spokenText);
    } catch (error) {
      console.error('Error assessing pronunciation:', error);
      setErrorMessage(`Error assessing pronunciation: ${error instanceof Error ? error.message : String(error)}`);
      return 0;
    } finally {
      stopTracking();
    }
  }, [speechService]);

  const stopSpeaking = useCallback(async () => {
    if (!speechService) return;
    const stopTracking = trackOperation('stopSpeaking');
    
    try {
      // Set state immediately for UI responsiveness
      setIsSpeaking(false);
      
      // Use timeout to prevent UI freeze
      const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          console.warn('stopSpeaking operation timed out');
          resolve();
        }, MAX_OPERATION_TIME);
      });
      
      // Race between actual operation and timeout
      await Promise.race([
        speechService.stopSpeaking(),
        timeoutPromise
      ]);
    } catch (error) {
      console.error('Error stopping speaking:', error);
      setErrorMessage(`Error stopping speaking: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSpeaking(false);
      stopTracking();
    }
  }, [speechService]);

  const pauseListening = useCallback(async () => {
    if (!speechService) return;
    const stopTracking = trackOperation('pauseListening');
    
    try {
      // Set state immediately for UI responsiveness
      setIsPaused(true);
      
      // Use timeout to prevent UI freeze
      const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          console.warn('pauseListening operation timed out');
          resolve();
        }, MAX_OPERATION_TIME);
      });
      
      // Race between actual operation and timeout
      await Promise.race([
        speechService.pauseListening(),
        timeoutPromise
      ]);
    } catch (error) {
      console.error('Error pausing listening:', error);
      setIsPaused(false);
      setErrorMessage(`Error pausing listening: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      stopTracking();
    }
  }, [speechService]);

  const resumeListening = useCallback(async () => {
    if (!speechService || !currentCallbacks) return;
    const stopTracking = trackOperation('resumeListening');
    
    try {
      // Set state immediately for UI responsiveness
      setIsPaused(false);
      
      // Use timeout to prevent UI freeze
      const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          console.warn('resumeListening operation timed out');
          resolve();
        }, MAX_OPERATION_TIME);
      });
      
      // Race between actual operation and timeout
      await Promise.race([
        speechService.resumeListening(
          currentCallbacks.onInterimResult,
          currentCallbacks.onFinalResult
        ),
        timeoutPromise
      ]);
    } catch (error) {
      console.error('Error resuming listening:', error);
      setIsPaused(true);
      setErrorMessage(`Error resuming listening: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      stopTracking();
    }
  }, [speechService, currentCallbacks]);

  const setMuted = useCallback((muted: boolean) => {
    setIsMuted(muted);
    if (speechService) {
      try {
        speechService.setMuted(muted);
      } catch (error) {
        console.error('Error setting muted state:', error);
        setErrorMessage(`Error setting muted state: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }, [speechService]);

  return (
    <SpeechContext.Provider
      value={{
        isListening,
        isSpeaking,
        isPaused,
        isMuted,
        currentLanguage,
        startListening,
        stopListening,
        pauseListening,
        resumeListening,
        speak,
        assessPronunciation,
        stopSpeaking,
        setMuted,
        setLanguage,
        errorMessage
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