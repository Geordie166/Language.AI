'use client';

import React, { useState } from 'react';
import { useSpeech } from '../context/speech-context';

export default function SpeechTest() {
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [synthesizedText, setSynthesizedText] = useState('');
  const [error, setError] = useState('');
  const { speechService, isInitialized, error: serviceError } = useSpeech();

  const startRecording = async () => {
    if (!speechService || !isInitialized) {
      setError('Speech service not initialized');
      return;
    }

    try {
      setError('');
      setIsRecording(true);
      setRecognizedText('Listening...');
      
      await speechService.startListening(
        (interimText) => {
          setRecognizedText(`Interim: ${interimText}`);
        },
        (finalText) => {
          setRecognizedText(`Final: ${finalText}`);
          setIsRecording(false);
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!speechService || !isInitialized) {
      setError('Speech service not initialized');
      return;
    }

    try {
      await speechService.stopListening();
      setIsRecording(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const testTextToSpeech = async () => {
    if (!speechService || !isInitialized) {
      setError('Speech service not initialized');
      return;
    }

    try {
      setError('');
      const textToSpeak = "¡Hola! ¿Cómo estás? Soy tu asistente de idiomas.";
      setSynthesizedText(textToSpeak);
      await speechService.speak(textToSpeak);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (serviceError) {
    return (
      <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {serviceError}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-center mb-6">Speech Service Test</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Speech-to-Text Test:</h3>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-full py-2 px-4 rounded-md ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
            disabled={!isInitialized}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
          <div className="mt-2 p-2 bg-gray-100 rounded min-h-[50px]">
            {recognizedText || 'No text recognized yet'}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Text-to-Speech Test:</h3>
          <button
            onClick={testTextToSpeech}
            className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-md"
            disabled={!isInitialized}
          >
            Test Text-to-Speech
          </button>
          <div className="mt-2 p-2 bg-gray-100 rounded min-h-[50px]">
            {synthesizedText || 'Click to hear a test message'}
          </div>
        </div>
      </div>
    </div>
  );
} 