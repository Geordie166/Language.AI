'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ConversationTemplate from '../components/ConversationTemplate';
import { Message, SavedConversation } from '../lib/types';

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

export default function Conversation() {
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get('scenario');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'spanish'>('english');
  const [nativeLanguage, setNativeLanguage] = useState<string>('english');
  const [scenarioContext, setScenarioContext] = useState<ScenarioContext | null>(null);
  const [showTemplate, setShowTemplate] = useState(true);
  const [conversationScript, setConversationScript] = useState<ConversationScript | null>(null);
  const [isConversationEnded, setIsConversationEnded] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('');
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

  useEffect(() => {
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
      setMessages([{
        id: '1',
        text: "Hi! I'm your English conversation partner. What would you like to talk about today?",
        sender: 'ai',
        audioUrl: '/welcome-message.mp3',
        timestamp: Date.now()
      }]);
    }
  }, [scenarioId]);
  
  const startRecording = () => {
    setIsRecording(true);
    
    // In a real implementation, this would start actual recording
    // mediaRecorderRef.current = new MediaRecorder(stream);
    // mediaRecorderRef.current.start();
    
    // For demo purposes, we'll just set a timeout to simulate recording
    setTimeout(() => {
      stopRecording();
    }, 5000); // Simulate a 5-second recording
  };
  
  const stopRecording = () => {
    setIsRecording(false);
    setIsProcessing(true);
    
    // In a real implementation, this would process the recorded audio
    // mediaRecorderRef.current.stop();
    
    // Simulate processing time
    setTimeout(() => {
      processAudio();
    }, 2000);
  };
  
  const processAudio = () => {
    // Simulate the speech-to-text processing
    let userMessage;
    let aiResponse;

    if (scenarioContext) {
      // Scenario-specific responses
      switch (scenarioContext.id) {
        case 'restaurant':
          userMessage = selectedLanguage === 'english'
            ? "I'd like to order the paella, please."
            : "Quisiera pedir la paella, por favor.";
          aiResponse = selectedLanguage === 'english'
            ? "Excelente elección. ¿Le gustaría alguna bebida para acompañar?"
            : "Great choice. Would you like any drinks to go with that?";
          break;
        case 'daily-life':
          userMessage = selectedLanguage === 'english'
            ? "Nice to meet you! I'm John."
            : "¡Mucho gusto! Me llamo John.";
          aiResponse = selectedLanguage === 'english'
            ? "¡Encantado! Me llamo Carlos. ¿De dónde eres?"
            : "Nice to meet you! I'm Carlos. Where are you from?";
          break;
        default:
          userMessage = selectedLanguage === 'english'
            ? "Hello, how are you? I'm learning Spanish."
            : "Hola, ¿qué tal? Estoy aprendiendo español.";
          aiResponse = selectedLanguage === 'english'
            ? "¡Muy bien! Es genial que estés aprendiendo español. ¿Cuánto tiempo llevas estudiando?"
            : "Very good! It's great that you're learning Spanish. How long have you been studying?";
      }
    } else {
      // Free conversation mode
      userMessage = selectedLanguage === 'english'
        ? "Hello, how are you? I'm learning Spanish."
        : "Hola, ¿qué tal? Estoy aprendiendo español.";
      aiResponse = selectedLanguage === 'english'
        ? "¡Muy bien! Es genial que estés aprendiendo español. ¿Cuánto tiempo llevas estudiando?"
        : "Very good! It's great that you're learning Spanish. How long have you been studying?";
    }
      
    addMessage({
      id: Date.now().toString(),
      text: userMessage,
      sender: 'user',
      timestamp: Date.now()
    });
    
    // Simulate getting a response from the AI
    setTimeout(() => {
      addMessage({
        id: Date.now().toString(),
        text: aiResponse,
        sender: 'ai',
        audioUrl: '/ai-response.mp3',
        timestamp: Date.now()
      });
      
      setIsProcessing(false);
    }, 1500);
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

  return (
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
                    <p>{message.text}</p>
                    {message.audioUrl && message.sender === 'ai' && (
                      <button 
                        onClick={() => playAudio(message.audioUrl!)}
                        className="mt-2 text-primary-600 hover:text-primary-700 text-sm flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Play audio
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
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
  );
} 