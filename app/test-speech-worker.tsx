'use client';

import React, { useState, useEffect } from 'react';
import SpeechService from '@/app/lib/speech-service';

export default function TestSpeechWorker() {
  const [speechService, setSpeechService] = useState<SpeechService | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [textToSpeak, setTextToSpeak] = useState('Hello, this is a test of the speech synthesis functionality using a web worker.');
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Check if we're on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Add log function
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString().slice(11, 19)}: ${message}`]);
  };

  // Initialize speech service
  useEffect(() => {
    if (!isClient) return; // Ensure we're on the client
    
    try {
      addLog('Creating speech service');
      const service = new SpeechService();
      setSpeechService(service);
      setStatus('Ready');
      addLog('Speech service created successfully');
    } catch (err) {
      console.error('Error initializing speech service:', err);
      setError(`Failed to initialize speech service: ${err instanceof Error ? err.message : String(err)}`);
      setStatus('Error');
      addLog(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }

    return () => {
      if (speechService) {
        addLog('Disposing speech service');
        speechService.dispose();
      }
    };
  }, [isClient]);

  // Start listening
  const handleStartListening = async () => {
    if (!speechService) {
      setError('Speech service not initialized');
      return;
    }

    try {
      setStatus('Starting listening...');
      addLog('Starting listening');
      
      await speechService.startListening(
        (interimText) => {
          setRecognizedText(`${interimText}...`);
          addLog(`Interim: ${interimText}`);
        },
        (finalText) => {
          setRecognizedText(finalText);
          addLog(`Final: ${finalText}`);
        }
      );
      
      setIsListening(true);
      setStatus('Listening');
      addLog('Listening started successfully');
    } catch (err) {
      console.error('Error starting listening:', err);
      setError(`Failed to start listening: ${err instanceof Error ? err.message : String(err)}`);
      setStatus('Error');
      setIsListening(false);
      addLog(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Stop listening
  const handleStopListening = async () => {
    if (!speechService) {
      setError('Speech service not initialized');
      return;
    }

    try {
      setStatus('Stopping listening...');
      addLog('Stopping listening');
      
      await speechService.stopListening();
      
      setIsListening(false);
      setStatus('Ready');
      addLog('Listening stopped successfully');
    } catch (err) {
      console.error('Error stopping listening:', err);
      setError(`Failed to stop listening: ${err instanceof Error ? err.message : String(err)}`);
      setStatus('Error');
      addLog(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Start speaking
  const handleSpeak = async () => {
    if (!speechService) {
      setError('Speech service not initialized');
      return;
    }

    try {
      setStatus('Speaking...');
      addLog(`Speaking: ${textToSpeak.substring(0, 30)}...`);
      setIsSpeaking(true);
      
      await speechService.speak(textToSpeak);
      
      setIsSpeaking(false);
      setStatus('Ready');
      addLog('Speaking completed successfully');
    } catch (err) {
      console.error('Error speaking:', err);
      setError(`Failed to speak: ${err instanceof Error ? err.message : String(err)}`);
      setStatus('Error');
      setIsSpeaking(false);
      addLog(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Stop speaking
  const handleStopSpeaking = async () => {
    if (!speechService) {
      setError('Speech service not initialized');
      return;
    }

    try {
      setStatus('Stopping speech...');
      addLog('Stopping speech');
      
      await speechService.stopSpeaking();
      
      setIsSpeaking(false);
      setStatus('Ready');
      addLog('Speech stopped successfully');
    } catch (err) {
      console.error('Error stopping speech:', err);
      setError(`Failed to stop speech: ${err instanceof Error ? err.message : String(err)}`);
      setStatus('Error');
      addLog(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  // Show loading state if not client yet
  if (!isClient) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Loading Speech Test...</h1>
        <p>Please wait while we initialize the speech components</p>
      </div>
    </div>;
  }

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <h1 className="text-2xl font-bold mb-4">Speech Worker Test</h1>
      
      <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Status</h2>
        <div className="flex items-center space-x-2">
          <div 
            className={`w-3 h-3 rounded-full ${
              status === 'Ready' ? 'bg-green-500' :
              status === 'Listening' ? 'bg-blue-500' :
              status === 'Speaking...' ? 'bg-yellow-500' :
              status === 'Error' ? 'bg-red-500' : 'bg-gray-500'
            }`}
          ></div>
          <span>{status}</span>
        </div>
        
        {error && (
          <div className="mt-2 p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
            {error}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-2">Speech Recognition</h2>
          
          <div className="mb-4 p-4 min-h-[100px] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg">
            {recognizedText || 'Recognized text will appear here...'}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleStartListening}
              disabled={isListening || !speechService}
              className={`px-4 py-2 rounded ${
                isListening ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Start Listening
            </button>
            
            <button
              onClick={handleStopListening}
              disabled={!isListening || !speechService}
              className={`px-4 py-2 rounded ${
                !isListening ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              Stop Listening
            </button>
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-lg font-semibold mb-2">Speech Synthesis</h2>
          
          <div className="mb-4">
            <textarea
              value={textToSpeak}
              onChange={(e) => setTextToSpeak(e.target.value)}
              rows={4}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg"
              placeholder="Enter text to speak..."
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleSpeak}
              disabled={isSpeaking || !speechService}
              className={`px-4 py-2 rounded ${
                isSpeaking ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              Speak Text
            </button>
            
            <button
              onClick={handleStopSpeaking}
              disabled={!isSpeaking || !speechService}
              className={`px-4 py-2 rounded ${
                !isSpeaking ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              Stop Speaking
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Logs</h2>
        <div className="h-64 overflow-y-auto p-4 bg-black text-green-400 font-mono text-sm rounded-lg">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
} 