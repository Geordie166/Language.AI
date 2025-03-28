'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ConversationTemplate from '../components/ConversationTemplate';
import { Message, SavedConversation } from '../lib/types';
import { useSpeech } from '../contexts/SpeechContext';
import { OpenAIService } from '../lib/openai-service';

interface ScenarioContext {
  id: string;
  title: string;
  currentSituation: string;
  context: string;
}

interface ConversationScript {
  topic: string;
  keyPoints: string[];
  suggestedResponses: string[];
}

function ConversationLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );
}

function ConversationContent() {
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get('scenario');
  const { 
    startListening, 
    stopListening, 
    speak, 
    stopSpeaking,
    pauseListening,
    resumeListening,
    setMuted,
    isPaused,
    isMuted,
    setLanguage
  } = useSpeech();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'spanish'>('english');
  const [nativeLanguage, setNativeLanguage] = useState<string>('english');
  const [scenarioContext, setScenarioContext] = useState<ScenarioContext | null>(null);
  const [showTemplate, setShowTemplate] = useState(!!scenarioId);
  const [conversationScript, setConversationScript] = useState<ConversationScript | null>(null);
  const [isConversationEnded, setIsConversationEnded] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('');
  const [recognizedText, setRecognizedText] = useState('');
  const [selfAssessment, setSelfAssessment] = useState<{
    fluency: number;
    accuracy: number;
    vocabulary: number;
    confidence: number;
    pronunciation: number;
    comments: string;
  }>({
    fluency: 0,
    accuracy: 0,
    vocabulary: 0,
    confidence: 0,
    pronunciation: 0,
    comments: ''
  });
  
  // In a real implementation, these would be actual MediaRecorder instances
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const [openAIService, setOpenAIService] = useState<OpenAIService | null>(null);
  const [openAIError, setOpenAIError] = useState<string | null>(null);

  // Cleanup function for speech
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, [stopSpeaking, stopListening]);

  useEffect(() => {
    let mounted = true;

    const initializeConversation = async () => {
      if (!mounted) return;

      // Stop any ongoing speech before starting new conversation
      await stopSpeaking();
      
      if (scenarioId) {
        // In a real implementation, this would fetch the scenario details from an API
        const scenario = {
          'daily-life': {
            title: 'Daily Life',
            situations: ['Meeting new people', 'Weather talk', 'Weekend plans', 'Shopping'],
            contexts: [
              'You are meeting someone new at a social event.',
              'You are discussing the weather with a colleague.',
              'You are making weekend plans with friends.',
              'You are shopping at a local store.'
            ]
          },
          'work-life': {
            title: 'Work & Career',
            situations: ['Job interviews', 'Office small talk', 'Email writing'],
            contexts: [
              'You are having a job interview for a position you are interested in.',
              'You are making small talk with colleagues during lunch break.',
              'You need to write a professional email to a client.'
            ]
          }
        }[scenarioId];

        if (scenario) {
          const randomIndex = Math.floor(Math.random() * scenario.situations.length);
          setScenarioContext({
            id: scenarioId,
            title: scenario.title,
            currentSituation: scenario.situations[randomIndex],
            context: scenario.contexts[randomIndex]
          });

          // Add initial AI message based on the scenario
          setMessages([{
            id: '1',
            text: `Hello! Let's practice a conversation about ${scenario.situations[randomIndex]}. ${scenario.contexts[randomIndex]} Ready to begin?`,
            sender: 'ai',
            audioUrl: '/welcome-message.mp3',
            timestamp: Date.now()
          }]);
        }
      } else {
        // Free conversation mode
        const initialMessage = selectedLanguage === 'english'
          ? "Hi! I'm your English conversation partner. What would you like to talk about today?"
          : "¡Hola! Soy tu compañero de conversación en español. ¿De qué te gustaría hablar hoy?";
        
        setMessages([{
          id: '1',
          text: initialMessage,
          sender: 'ai',
          timestamp: Date.now()
        }]);

        // Speak the initial message after a short delay
        setTimeout(async () => {
          if (!mounted) return;
          try {
            await speak(initialMessage);
          } catch (error) {
            console.error('Error speaking initial message:', error);
          }
        }, 500);
      }
    };

    initializeConversation();

    // Cleanup function
    return () => {
      mounted = false;
      stopSpeaking();
    };
  }, [scenarioId, selectedLanguage, speak, stopSpeaking]);
  
  const startRecording = async () => {
    try {
      setIsRecording(true);
      setRecognizedText('Listening...');
      
      startListening(
        (interimText) => {
          console.log('Interim text:', interimText);
          setRecognizedText(`${interimText}...`);
        },
        (finalText) => {
          console.log('Final text:', finalText);
          setRecognizedText('');
          processUserInput(finalText);
          setIsRecording(false);
        }
      );
    } catch (err) {
      console.error('Error starting recording:', err);
      setIsRecording(false);
      setRecognizedText('Error: Could not start recording');
    }
  };
  
  const stopRecording = async () => {
    try {
      await stopListening();
      setIsRecording(false);
    } catch (err) {
      console.error('Error stopping recording:', err);
    }
  };
  
  const processUserInput = async (text: string) => {
    if (!openAIService) {
      console.error('OpenAI service not initialized');
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'Sorry, the AI service is not available right now. Please try again later.',
        sender: 'ai',
        timestamp: Date.now()
      };
      addMessage(errorMessage);
      return;
    }

    setIsProcessing(true);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: Date.now()
    };
    addMessage(userMessage);

    // Create a temporary message for streaming response
    const tempMessageId = Date.now().toString();
    const tempMessage: Message = {
      id: tempMessageId,
      text: '',
      sender: 'ai',
      timestamp: Date.now()
    };
    addMessage(tempMessage);

    try {
      await openAIService.getStreamingResponse(
        text,
        {
          onToken: (token) => {
            setMessages(prev => prev.map(msg => 
              msg.id === tempMessageId
                ? { ...msg, text: msg.text + token }
                : msg
            ));
          },
          onComplete: async (fullResponse) => {
            try {
              await handleSpeak(fullResponse);
            } catch (error) {
              console.error('Error speaking AI response:', error);
            }
            setIsProcessing(false);
          },
          onError: (error) => {
            console.error('Error in streaming response:', error);
            setIsProcessing(false);
            setMessages(prev => prev.map(msg => 
              msg.id === tempMessageId
                ? { ...msg, text: "I'm sorry, I encountered an error. Please try again." }
                : msg
            ));
          }
        },
        'beginner',
        selectedLanguage
      );
    } catch (error) {
      console.error('Error processing message:', error);
      setIsProcessing(false);
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessageId
          ? { ...msg, text: "I'm sorry, I encountered an error. Please try again." }
          : msg
      ));
    }
  };
  
  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };
  
  const playAudio = (audioUrl: string) => {
    // In a real implementation, this would play the actual audio
    console.log(`Playing audio: ${audioUrl}`);
    // const audio = new Audio(audioUrl);
    // audio.play();
  };
  
  useEffect(() => {
    // Scroll to the bottom of the messages container when messages change
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);
  
  const generateConversationScript = (answers: Record<string, string>) => {
    // This would typically be done by the AI in production
    const script: ConversationScript = {
      topic: scenarioContext?.currentSituation || 'Daily Activities',
      keyPoints: Object.values(answers),
      suggestedResponses: [
        `Today, I ${answers.activities?.toLowerCase()}`,
        `I did this ${answers.time?.toLowerCase()}`,
        `I felt ${answers.feelings?.toLowerCase()} about it`
      ]
    };
    
    setConversationScript(script);
    setShowTemplate(false);
    
    // Add AI's initial message based on the script
    addMessage({
      id: Date.now().toString(),
      text: `Great! Let's talk about your day. Tell me about what you did today.`,
      sender: 'ai',
      audioUrl: '/welcome-message.mp3',
      timestamp: Date.now()
    });
  };

  const handleEndConversation = () => {
    setIsConversationEnded(true);
  };

  const handleSaveConversation = () => {
    if (!conversationTitle.trim()) return;

    const savedConversation: SavedConversation = {
      id: Date.now().toString(),
      title: conversationTitle,
      date: Date.now(),
      scenario: scenarioContext?.currentSituation,
      templateType: scenarioContext?.id,
      messages: messages.map(msg => ({
        ...msg,
        timestamp: Date.now()
      })),
      userNativeLanguage: nativeLanguage,
      practiceLanguage: selectedLanguage,
      script: conversationScript || undefined,
      feedback: {
        fluency: selfAssessment.fluency,
        accuracy: selfAssessment.accuracy,
        vocabulary: selfAssessment.vocabulary,
        confidence: selfAssessment.confidence,
        pronunciation: selfAssessment.pronunciation,
        comments: selfAssessment.comments
      }
    };

    // In a real app, this would be an API call
    const savedConversations = JSON.parse(localStorage.getItem('savedConversations') || '[]');
    localStorage.setItem('savedConversations', JSON.stringify([...savedConversations, savedConversation]));

    // Reset everything
    setMessages([{
      id: '1',
      text: "Hi! I'm your English conversation partner. What would you like to talk about today?",
      sender: 'ai',
      audioUrl: '/welcome-message.mp3',
      timestamp: Date.now()
    }]);
    setConversationTitle('');
    setIsConversationEnded(false);
    setShowTemplate(true);
    setConversationScript(null);
    setSelfAssessment({
      fluency: 0,
      accuracy: 0,
      vocabulary: 0,
      confidence: 0,
      pronunciation: 0,
      comments: ''
    });
  };

  // Function to handle text-to-speech
  const handleSpeak = async (text: string) => {
    try {
      await stopSpeaking(); // Stop any ongoing speech
      await speak(text);
    } catch (error) {
      console.error('Error speaking:', error);
    }
  };

  const togglePause = () => {
    if (isPaused) {
      resumeListening();
    } else {
      pauseListening();
    }
  };

  const toggleMute = () => {
    setMuted(!isMuted);
  };

  // Initialize OpenAI service
  useEffect(() => {
    let mounted = true;

    const initializeOpenAI = () => {
      try {
        if (typeof window !== 'undefined') {
          const service = new OpenAIService();
          if (mounted) {
            setOpenAIService(service);
            setOpenAIError(null);
          }
        }
      } catch (error) {
        console.error('Failed to initialize OpenAI service:', error);
        if (mounted) {
          setOpenAIError('Failed to initialize AI service. Please check your configuration.');
        }
      }
    };

    initializeOpenAI();

    return () => {
      mounted = false;
    };
  }, []);

  // Update language selection effect
  useEffect(() => {
    if (openAIService) {
      openAIService.updateSystemMessage(selectedLanguage, 'beginner');
    }
    // Update speech service language
    setLanguage(selectedLanguage);
  }, [selectedLanguage, openAIService, setLanguage]);

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && isRecording && !event.repeat && 
          !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault();
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRecording, togglePause]);

  // Update the control buttons in the UI
  const renderControls = () => (
    <div className="fixed bottom-24 right-4 flex flex-col gap-2">
      <button
        onClick={togglePause}
        className={`p-2 rounded-full ${
          isPaused 
            ? 'bg-yellow-500 hover:bg-yellow-600' 
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white shadow-lg transition-colors relative group`}
        title={`${isPaused ? 'Resume' : 'Hold'} (Spacebar)`}
        disabled={!isRecording}
      >
        <span className="sr-only">{isPaused ? 'Resume' : 'Hold'}</span>
        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isPaused ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
          )}
        </svg>
        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Spacebar
        </span>
      </button>
      <button
        onClick={toggleMute}
        className={`p-2 rounded-full ${
          isMuted 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-green-500 hover:bg-green-600'
        } text-white shadow-lg transition-colors`}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isMuted ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18 9.172a8 8 0 010 5.656M12 5l4.586 4.586a1 1 0 010 1.414L12 15" />
          )}
        </svg>
      </button>
    </div>
  );
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-4xl">
          <div className="card min-h-[70vh] flex flex-col">
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-primary-600">
                  {scenarioContext ? scenarioContext.title : 'AI English Conversation Partner'}
                </h1>
                {scenarioContext && (
                  <p className="text-gray-600 mt-1">
                    Scenario: {scenarioContext.currentSituation}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">My native language:</span>
                  <select 
                    className="input-field py-1 text-sm w-auto"
                    value={nativeLanguage}
                    onChange={(e) => setNativeLanguage(e.target.value)}
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="chinese">Chinese</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                    <option value="japanese">Japanese</option>
                    <option value="korean">Korean</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Practice in:</span>
                  <select 
                    className="input-field py-1 text-sm w-auto"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value as 'english' | 'spanish')}
                  >
                    <option value="english">English</option>
                    <option value="spanish" disabled>Spanish (Coming Soon)</option>
                  </select>
                </div>
              </div>
            </div>

            {scenarioContext && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <span className="font-semibold">Context:</span> {scenarioContext.context}
                </p>
              </div>
            )}
            
            {showTemplate ? (
              <ConversationTemplate
                onComplete={generateConversationScript}
                templateType={scenarioContext?.id || 'daily-activities'}
              />
            ) : (
              <>
                {conversationScript && (
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <div className="mb-2">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200">Your Conversation Script:</h4>
                      <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300">
                        {conversationScript.suggestedResponses.map((response, index) => (
                          <li key={index}>{response}</li>
                        ))}
                      </ul>
                    </div>
                    <button
                      onClick={() => setShowTemplate(true)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2"
                    >
                      Prepare a different response
                    </button>
                  </div>
                )}
          
          <div 
            id="messages-container"
            className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
          >
            {messages.map(message => (
              <div 
                key={message.id}
                className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div 
                  className={`inline-block max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-primary-100 text-gray-800' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                  }`}
                >
                        <div className="flex items-center justify-between gap-2">
                  <p>{message.text}</p>
                          {message.sender === 'ai' && (
                    <button 
                              onClick={() => handleSpeak(message.text)}
                              className={`ml-2 p-1.5 rounded-full transition-colors ${
                                isSpeaking 
                                  ? 'bg-red-500 hover:bg-red-600' 
                                  : 'bg-primary-500 hover:bg-primary-600'
                              }`}
                              title={isSpeaking ? "Stop Speaking" : "Play Message"}
                            >
                              {isSpeaking ? (
                                <svg className="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <rect x="6" y="6" width="12" height="12" stroke="none" fill="currentColor" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.8l5.7 5.7-5.7 5.7" />
                      </svg>
                              )}
                    </button>
                  )}
                        </div>
                </div>
              </div>
            ))}
                     
                    {recognizedText && (
              <div className="text-left mb-4">
                <div className="inline-block bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 italic">{recognizedText}</p>
                </div>
              </div>
            )}
              
            {isProcessing && (
              <div className="text-left mb-4">
                <div className="inline-block bg-gray-200 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
                  <div className="mt-auto">
                    {isConversationEnded ? (
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="max-w-2xl mx-auto">
                          <h3 className="text-lg font-semibold mb-4">Rate Your Conversation</h3>
                          <div className="space-y-6">
                            {/* Self Assessment Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {[
                                { key: 'fluency', label: 'Speaking Fluency' },
                                { key: 'accuracy', label: 'Grammar Accuracy' },
                                { key: 'vocabulary', label: 'Vocabulary Usage' },
                                { key: 'confidence', label: 'Speaking Confidence' },
                                { key: 'pronunciation', label: 'Pronunciation' }
                              ].map(({ key, label }) => (
                                <div key={key} className="space-y-2">
                                  <label className="block text-sm font-medium">
                                    {label}
                                  </label>
                                  <div className="flex items-center space-x-2">
                                    {[1, 2, 3, 4, 5].map((value) => (
                                      <button
                                        key={value}
                                        onClick={() => setSelfAssessment(prev => ({
                                          ...prev,
                                          [key]: value
                                        }))}
                                        className={`w-8 h-8 rounded-full ${
                                          selfAssessment[key as keyof typeof selfAssessment] === value
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                        }`}
                                      >
                                        {value}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Additional Comments
                              </label>
                              <textarea
                                value={selfAssessment.comments}
                                onChange={(e) => setSelfAssessment(prev => ({
                                  ...prev,
                                  comments: e.target.value
                                }))}
                                placeholder="What did you learn? What would you like to improve?"
                                className="input-field w-full"
                                rows={3}
                              />
                            </div>

                            {/* Title and Save Section */}
                            <div className="pt-4 border-t">
                              <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">
                                  Conversation Title
                                </label>
                                <input
                                  type="text"
                                  className="input-field w-full"
                                  placeholder="Enter a title for this conversation"
                                  value={conversationTitle}
                                  onChange={(e) => setConversationTitle(e.target.value)}
                                />
                              </div>
                              <div className="flex space-x-4">
                                <button
                                  onClick={handleSaveConversation}
                                  disabled={!conversationTitle.trim() || Object.values(selfAssessment).slice(0, 5).some(v => v === 0)}
                                  className="btn-primary flex-1"
                                >
                                  Save Conversation
                                </button>
                                <button
                                  onClick={() => setIsConversationEnded(false)}
                                  className="btn-secondary flex-1"
                                >
                                  Continue Practicing
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={handleEndConversation}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            End Conversation
                          </button>
              <div className="flex items-center justify-center">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  className={`relative rounded-full p-4 ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : isProcessing 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-primary-500 hover:bg-primary-600'
                  } transition-colors text-white shadow-lg`}
                >
                  {isRecording ? (
                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <rect x="6" y="6" width="12" height="12" stroke="none" fill="currentColor" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
          
                  {isRecording && (
                    <span className="absolute -top-1 -right-1 w-3 h-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  )}
                </button>
                          </div>
              </div>
              
              <p className="text-center mt-4 text-sm text-gray-500">
                {isRecording 
                  ? 'Listening... Click to stop.' 
                  : isProcessing 
                    ? 'Processing your message...' 
                    : 'Click the microphone and speak in your selected language.'}
              </p>
            </div>
                    )}
                  </div>
              </>
            )}
          </div>
          
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>In this demo, the conversation is simulated. In a production environment, this would use:</p>
            <ul className="list-disc text-left max-w-md mx-auto mt-2">
              <li>OpenAI Whisper for speech-to-text</li>
              <li>GPT-4-turbo for generating responses</li>
              <li>Google Cloud Text-to-Speech for audio synthesis</li>
            </ul>
          </div>
        </div>
        {renderControls()}
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <div className="flex justify-center space-x-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-6 py-3 rounded-full font-semibold text-white flex items-center space-x-2 ${
              isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isRecording ? (
                <rect x="6" y="6" width="12" height="12" stroke="none" fill="currentColor" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              )}
            </svg>
            <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
          </button>

          <button
            onClick={toggleMute}
            className={`px-6 py-3 rounded-full font-semibold text-white flex items-center space-x-2 ${
              isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-gray-600'
            }`}
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMuted ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18 9.172a8 8 0 010 5.656M12 5l4.586 4.586a1 1 0 010 1.414L12 15" />
              )}
            </svg>
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          <button
            onClick={togglePause}
            className={`px-6 py-3 rounded-full font-semibold text-white flex items-center space-x-2 ${
              isPaused ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-500 hover:bg-gray-600'
            }`}
            disabled={!isRecording}
            title="Press Spacebar to toggle"
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isPaused ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
              )}
            </svg>
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConversationPage() {
  return (
    <Suspense fallback={<ConversationLoading />}>
      <ConversationContent />
    </Suspense>
  );
} 