'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, VolumeX, Volume2, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useAzureSpeech } from '@/app/hooks/useAzureSpeech';
import { useOpenAI } from '@/app/hooks/useOpenAI';
import toast from 'react-hot-toast';
import { AnalyticsService } from '@/app/lib/analytics-service';
import { ProgressService, ScenarioProgress } from '@/app/lib/progress-service';
import { scenarios } from '@/app/lib/scenarios';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  feedback?: {
    pronunciation?: number;
    grammar?: number;
    vocabulary?: number;
    suggestions?: string[];
  };
}

interface ConversationSessionProps {
  scenarioId: string;
  userId: string;
  onComplete: (duration: number) => void;
}

export const ConversationSession: React.FC<ConversationSessionProps> = ({
  scenarioId,
  userId,
  onComplete
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const sessionStartTime = useRef(Date.now());
  const wordsSpokenCount = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const analyticsService = new AnalyticsService();
  const progressService = ProgressService.getInstance();
  const scenario = scenarios[scenarioId];
  const startTime = useRef(Date.now());

  const handleUserSpeech = async (text: string) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Add user message
      setMessages(prev => [...prev, { role: 'user', content: text }]);

      // Get assistant response
      const response = await generateResponse(text, scenario.difficulty);
      setMessages(prev => [...prev, { role: 'assistant', content: response.message }]);

      // Calculate session duration
      const duration = Math.floor((Date.now() - startTime.current) / 1000);

      // Calculate scores based on feedback
      const feedback = await generateResponse(text, scenario.difficulty);
      const scores = {
        pronunciation: Math.round(feedback.feedback.pronunciation * 100),
        grammar: Math.round(feedback.feedback.grammar * 100),
        vocabulary: Math.round(feedback.feedback.vocabulary * 100)
      };

      // Calculate overall score
      const overallScore = Math.round(
        (scores.pronunciation + scores.grammar + scores.vocabulary) / 3
      );

      // Determine completed objectives
      const objectivesCompleted = scenario.objectives?.filter(objective => {
        // Simple check if the objective was met based on the conversation
        return text.toLowerCase().includes(objective.toLowerCase());
      }) || [];

      // Save progress
      const progress: ScenarioProgress = {
        scenarioId,
        completedAt: new Date(),
        duration,
        score: overallScore,
        feedback: scores,
        objectivesCompleted
      };

      await progressService.saveScenarioProgress(userId, progress);

      // Call onComplete with duration
      onComplete(duration);

      // Speak the response
      await speakMessage(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const { startRecording, stopRecording, startSpeaking, stopSpeaking, isReady: isSpeechReady } = useAzureSpeech({
    onTranscript: handleUserSpeech,
    onError: (error) => {
      setError(error);
      toast.error('Speech recognition error. Please try again.');
    }
  });

  const { generateResponse, isLoading: isAILoading } = useOpenAI();

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    // Initialize conversation with scenario context
    async function initializeConversation() {
      try {
        setIsInitializing(true);
        const initialMessage: Message = {
          role: 'assistant',
          content: `Welcome! Let's practice ${scenario.title}. ${scenario.context}`
        };
        setMessages([initialMessage]);
        
        // Add a slight delay before speaking to ensure proper initialization
        timeoutId = setTimeout(async () => {
          if (isSpeechReady) {
            await speakMessage(initialMessage.content);
          }
          setIsInitializing(false);
        }, 1000);
      } catch (error) {
        setError('Failed to initialize conversation');
        setIsInitializing(false);
      }
    }

    initializeConversation();

    return () => {
      clearTimeout(timeoutId);
      stopSpeaking();
    };
  }, [scenario, isSpeechReady]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  async function speakMessage(text: string) {
    if (isMuted) return;
    try {
      await startSpeaking(text);
    } catch (error) {
      toast.error('Failed to speak message');
    }
  }

  function toggleRecording() {
    try {
      if (isRecording) {
        stopRecording();
        setIsRecording(false);
      } else {
        startRecording();
        setIsRecording(true);
        setError(null);
      }
    } catch (error) {
      toast.error('Failed to toggle recording');
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => setError(null)}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4 space-y-4">
      {isInitializing && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p>Initializing conversation...</p>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 relative">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p>{message.content}</p>
                {message.feedback && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <span>Pronunciation: {message.feedback.pronunciation}%</span>
                      <span>Grammar: {message.feedback.grammar}%</span>
                      <span>Vocabulary: {message.feedback.vocabulary}%</span>
                    </div>
                    {message.feedback.suggestions && (
                      <div className="mt-1 text-gray-600">
                        <p>Suggestions:</p>
                        <ul className="list-disc list-inside">
                          {message.feedback.suggestions.map((suggestion, i) => (
                            <li key={i}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Interim Transcript */}
        {interimTranscript && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-end"
          >
            <div className="max-w-[80%] rounded-lg p-4 bg-blue-100 text-blue-900 italic">
              {interimTranscript}
            </div>
          </motion.div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4 p-4 border-t">
        <Button
          onClick={() => setIsMuted(!isMuted)}
          variant="outline"
          size="icon"
          className="rounded-full"
          disabled={isInitializing}
        >
          {isMuted ? <VolumeX /> : <Volume2 />}
        </Button>

        <Button
          onClick={toggleRecording}
          variant={isRecording ? "destructive" : "default"}
          size="lg"
          className="rounded-full w-16 h-16 flex items-center justify-center relative"
          disabled={isProcessing || isInitializing || isAILoading}
        >
          {isProcessing || isAILoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />
          )}
        </Button>
      </div>
    </div>
  );
} 