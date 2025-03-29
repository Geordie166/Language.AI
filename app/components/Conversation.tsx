'use client';

import React, { useState, useRef, useEffect } from 'react';
import { OpenAIService, ConversationConfig } from '../lib/openai-service';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Mic, MicOff, Send } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Conversation() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [config, setConfig] = useState<ConversationConfig>({
    level: 'basic1',
    temperature: 0.7,
    maxTokens: 1048,
  });

  const openAIService = useRef<OpenAIService>(new OpenAIService());
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
        mediaRecorder.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        await processAudioInput(audioBlob);
        
        // Clean up the stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone. Please ensure you have granted microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const processAudioInput = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      const transcription = await openAIService.current.transcribeAudio(audioBlob);
      await processUserInput(transcription);
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('Error processing audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processUserInput = async (input: string) => {
    try {
      setIsProcessing(true);
      setMessages(prev => [...prev, { role: 'user', content: input }]);
      
      const response = await openAIService.current.getChatResponse(input, config);
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setInputText('');
    } catch (error) {
      console.error('Error processing message:', error);
      alert('Error processing message. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    await processUserInput(inputText);
  };

  const handleGetFeedback = async () => {
    try {
      setIsProcessing(true);
      const feedback = await openAIService.current.getSessionFeedback();
      setMessages(prev => [...prev, { role: 'assistant', content: feedback }]);
    } catch (error) {
      console.error('Error getting feedback:', error);
      alert('Error getting feedback. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex space-x-4 mb-4">
        <Select
          value={config.level}
          onValueChange={(value: ConversationConfig['level']) => 
            setConfig(prev => ({ ...prev, level: value }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="basic1">Basic 1</SelectItem>
            <SelectItem value="basic2">Basic 2</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <form onSubmit={handleSendMessage} className="flex space-x-2">
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message..."
          disabled={isProcessing}
          className="flex-1"
        />
        <Button
          type="button"
          variant={isRecording ? 'destructive' : 'secondary'}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
        >
          {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        <Button type="submit" disabled={!inputText.trim() || isProcessing}>
          <Send className="h-5 w-5" />
        </Button>
      </form>

      <Button
        onClick={handleGetFeedback}
        disabled={isProcessing || messages.length === 0}
        variant="outline"
      >
        Get Session Feedback
      </Button>
    </div>
  );
} 