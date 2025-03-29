'use client';

import React, { useState } from 'react';
import { useSpeech } from '../contexts/SpeechContext';

export default function SpeechTestPage() {
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
    isListening,
    isSpeaking,
    setLanguage,
    currentLanguage
  } = useSpeech();
  
  const [recognizedText, setRecognizedText] = useState('');
  const [textToSpeak, setTextToSpeak] = useState('');
  const [status, setStatus] = useState('');

  const handleStartListening = async () => {
    try {
      setStatus('Starting listening...');
      await startListening(
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
    }
  };

  const handleSpeak = async () => {
    if (!textToSpeak.trim()) {
      setStatus('Please enter text to speak');
      return;
    }
    
    try {
      setStatus('Speaking...');
      await speak(textToSpeak);
      setStatus('Speaking completed');
    } catch (error: any) {
      console.error('Error speaking:', error);
      setStatus(`Error: ${error.message || 'Unknown error'}`);
    }
  };

  const handleChangeLanguage = async (language: string) => {
    try {
      setStatus(`Changing language to ${language}...`);
      await setLanguage(language);
      setStatus(`Language changed to ${language}`);
    } catch (error: any) {
      console.error('Error changing language:', error);
      setStatus(`Error: ${error.message || 'Unknown error'}`);
    }
  };

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
          <span className="font-medium">Paused: </span>
          <span>{isPaused ? 'Yes' : 'No'}</span>
        </div>
        <div className="mb-2">
          <span className="font-medium">Muted: </span>
          <span>{isMuted ? 'Yes' : 'No'}</span>
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
              disabled={isListening && !isPaused}
              className="px-4 py-2 bg-primary-600 text-white rounded disabled:opacity-50"
            >
              Start Listening
            </button>
            
            <button
              onClick={stopListening}
              disabled={!isListening}
              className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
            >
              Stop Listening
            </button>
            
            <button
              onClick={pauseListening}
              disabled={!isListening || isPaused}
              className="px-4 py-2 bg-yellow-600 text-white rounded disabled:opacity-50"
            >
              Pause
            </button>
            
            <button
              onClick={async () => {
                try {
                  await resumeListening();
                } catch (error: any) {
                  console.error('Error resuming listening:', error);
                  setStatus(`Error: ${error.message || 'Unknown error'}`);
                }
              }}
              disabled={!isListening || !isPaused}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              Resume
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
              className="px-4 py-2 bg-primary-600 text-white rounded disabled:opacity-50"
            >
              Speak
            </button>
            
            <button
              onClick={stopSpeaking}
              disabled={!isSpeaking}
              className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
            >
              Stop Speaking
            </button>
            
            <button
              onClick={() => setMuted(!isMuted)}
              className={`px-4 py-2 ${isMuted ? 'bg-green-600' : 'bg-yellow-600'} text-white rounded`}
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Language Settings</h2>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleChangeLanguage('english')}
            disabled={currentLanguage === 'english'}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            English
          </button>
          
          <button
            onClick={() => handleChangeLanguage('spanish')}
            disabled={currentLanguage === 'spanish'}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Spanish
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Debug Information</h2>
        <p className="mb-2">Check the browser console for detailed logs about the speech service execution.</p>
        <p>If you're experiencing issues, press F12 to open developer tools and look at the console tab for error messages.</p>
      </div>
    </div>
  );
} 