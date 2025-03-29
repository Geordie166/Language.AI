'use client';

import React, { useState } from 'react';
import { useSpeech } from '../context/speech-context';

export default function SpeechTestPage() {
  const { speechService, isInitialized, error } = useSpeech();
  
  const [recognizedText, setRecognizedText] = useState('');
  const [textToSpeak, setTextToSpeak] = useState('');
  const [status, setStatus] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('english');

  const handleStartListening = async () => {
    if (!speechService || !isInitialized) {
      setStatus('Speech service not initialized');
      return;
    }

    try {
      setStatus('Starting listening...');
      setIsListening(true);
      await speechService.startListening(
        (interimText: string) => {
          setRecognizedText(interimText);
        },
        (finalText: string) => {
          setRecognizedText(finalText);
          setStatus('Final text received');
        }
      );
      setStatus('Listening started');
    } catch (error: any) {
      console.error('Error starting listening:', error);
      setStatus(`Error: ${error.message || 'Unknown error'}`);
      setIsListening(false);
    }
  };

  const handleStopListening = async () => {
    if (!speechService || !isInitialized) return;
    try {
      await speechService.stopListening();
      setIsListening(false);
      setStatus('Listening stopped');
    } catch (error: any) {
      console.error('Error stopping listening:', error);
      setStatus(`Error: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSpeak = async () => {
    if (!speechService || !isInitialized) {
      setStatus('Speech service not initialized');
      return;
    }

    if (!textToSpeak.trim()) {
      setStatus('Please enter text to speak');
      return;
    }
    
    try {
      setStatus('Speaking...');
      setIsSpeaking(true);
      await speechService.speak(textToSpeak);
      setStatus('Speaking completed');
      setIsSpeaking(false);
    } catch (error: any) {
      console.error('Error speaking:', error);
      setStatus(`Error: ${error.message || 'Unknown error'}`);
      setIsSpeaking(false);
    }
  };

  const handleStopSpeaking = async () => {
    if (!speechService || !isInitialized) return;
    try {
      await speechService.stopSpeaking();
      setIsSpeaking(false);
      setStatus('Speaking stopped');
    } catch (error: any) {
      console.error('Error stopping speech:', error);
      setStatus(`Error: ${error.message || 'Unknown error'}`);
    }
  };

  const handleChangeLanguage = async (language: string) => {
    if (!speechService || !isInitialized) return;
    try {
      setStatus(`Changing language to ${language}...`);
      await speechService.setLanguage(language);
      setCurrentLanguage(language);
      setStatus(`Language changed to ${language}`);
    } catch (error: any) {
      console.error('Error changing language:', error);
      setStatus(`Error: ${error.message || 'Unknown error'}`);
    }
  };

  if (!isInitialized) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Speech Service Test</h1>
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
          Initializing speech service...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Speech Service Test</h1>
        <div className="p-4 bg-red-100 text-red-800 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Speech Service Test</h1>
      
      <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Status</h2>
        <div className="mb-2">
          <span className="font-medium">Current status: </span>
          <span>{status}</span>
        </div>
        <div className="mb-2">
          <span className="font-medium">Listening: </span>
          <span>{isListening ? 'Yes' : 'No'}</span>
        </div>
        <div className="mb-2">
          <span className="font-medium">Speaking: </span>
          <span>{isSpeaking ? 'Yes' : 'No'}</span>
        </div>
        <div className="mb-2">
          <span className="font-medium">Current language: </span>
          <span>{currentLanguage}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Speech Recognition</h2>
          
          <div className="mb-4 min-h-[100px] p-3 bg-gray-50 dark:bg-gray-700 rounded border">
            {recognizedText || 'Recognized text will appear here...'}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleStartListening}
              disabled={isListening}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              Start Listening
            </button>
            
            <button
              onClick={handleStopListening}
              disabled={!isListening}
              className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
            >
              Stop Listening
            </button>
          </div>
        </div>
        
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Speech Synthesis</h2>
          
          <div className="mb-4">
            <textarea
              value={textToSpeak}
              onChange={(e) => setTextToSpeak(e.target.value)}
              placeholder="Enter text to speak..."
              className="w-full p-3 border rounded dark:bg-gray-700"
              rows={4}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSpeak}
              disabled={isSpeaking || !textToSpeak.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              Speak
            </button>
            
            <button
              onClick={handleStopSpeaking}
              disabled={!isSpeaking}
              className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
            >
              Stop Speaking
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Language Settings</h2>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleChangeLanguage('english')}
            className={`px-4 py-2 ${
              currentLanguage === 'english' ? 'bg-blue-600' : 'bg-gray-600'
            } text-white rounded`}
          >
            English
          </button>
          
          <button
            onClick={() => handleChangeLanguage('spanish')}
            className={`px-4 py-2 ${
              currentLanguage === 'spanish' ? 'bg-blue-600' : 'bg-gray-600'
            } text-white rounded`}
          >
            Spanish
          </button>
        </div>
      </div>
    </div>
  );
} 