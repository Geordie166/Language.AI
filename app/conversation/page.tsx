'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  audioUrl?: string;
}

export default function Conversation() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hola! ¿Cómo estás? Soy tu asistente de conversación en español.',
      sender: 'ai',
      audioUrl: '/welcome-message.mp3' // This would be a real audio file in production
    }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'spanish'>('english');
  
  // In a real implementation, these would be actual MediaRecorder instances
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Simulate the recording functionality
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
    const userMessage = selectedLanguage === 'english' 
      ? "Hello, how are you? I'm learning Spanish."
      : "Hola, ¿qué tal? Estoy aprendiendo español.";
      
    addMessage({
      id: Date.now().toString(),
      text: userMessage,
      sender: 'user'
    });
    
    // Simulate getting a response from the AI
    setTimeout(() => {
      const aiResponse = selectedLanguage === 'english'
        ? "¡Muy bien! Es genial que estés aprendiendo español. ¿Cuánto tiempo llevas estudiando?"
        : "Very good! It's great that you're learning Spanish. How long have you been studying?";
        
      addMessage({
        id: Date.now().toString(),
        text: aiResponse,
        sender: 'ai',
        audioUrl: '/ai-response.mp3' // This would be a real generated audio in production
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
  
  return (
    <div className="container mx-auto max-w-4xl">
      <div className="card min-h-[70vh] flex flex-col">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600">AI Conversation Partner</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">I speak:</span>
            <select 
              className="input-field py-1 text-sm w-auto"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as 'english' | 'spanish')}
            >
              <option value="english">English</option>
              <option value="spanish">Spanish</option>
            </select>
          </div>
        </div>
        
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
        
        <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
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
          
          <p className="text-center mt-4 text-sm text-gray-500">
            {isRecording 
              ? 'Listening... Click to stop.' 
              : isProcessing 
                ? 'Processing your message...' 
                : 'Click the microphone and speak in your selected language.'}
          </p>
        </div>
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