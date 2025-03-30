'use client';

import React, { useState, useRef, useEffect } from 'react';
import { OpenAIService, ConversationConfig } from '../lib/openai-service';
import { useAzureSpeech } from '../context/azure-speech-context';
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
  isInterim?: boolean;
}

export default function Conversation() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [config, setConfig] = useState<ConversationConfig>({
    level: 'basic1',
    temperature: 0.7,
    maxTokens: 1048,
  });

  const openAIService = useRef<OpenAIService>(new OpenAIService());
  const { isInitialized, isListening, error, startListening, stopListening, speak } = useAzureSpeech();

  const startRecording = async () => {
    try {
      await startListening(
        // Handle interim results
        (interimText) => {
          setInterimTranscript(interimText);
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.isInterim) {
              return [...prev.slice(0, -1), { role: 'user', content: interimText, isInterim: true }];
            } else {
              return [...prev, { role: 'user', content: interimText, isInterim: true }];
            }
          });
        },
        // Handle final results
        async (finalText) => {
          setInterimTranscript('');
          await processUserInput(finalText);
        }
      );
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone. Please ensure you have granted microphone permissions.');
    }
  };

  const stopRecording = async () => {
    try {
      await stopListening();
      setInterimTranscript('');
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const processUserInput = async (input: string) => {
    try {
      setIsProcessing(true);
      // Remove any interim message and add the final user message
      setMessages(prev => {
        const withoutInterim = prev.filter(m => !m.isInterim);
        return [...withoutInterim, { role: 'user', content: input }];
      });
      
      // Add an empty assistant message that will be updated with streaming content
      setMessages(prev => [...prev, { role: 'assistant', content: '', isInterim: true }]);
      
      const response = await openAIService.current.getChatResponse(
        input,
        config,
        (partialResponse) => {
          // Update the assistant's message with the streaming content
          setMessages(prev => {
            const withoutLast = prev.slice(0, -1);
            return [...withoutLast, { role: 'assistant', content: partialResponse, isInterim: true }];
          });
        }
      );
      
      // Update with final response and speak it
      setMessages(prev => {
        const withoutLast = prev.slice(0, -1);
        return [...withoutLast, { role: 'assistant', content: response }];
      });
      await speak(response);
      
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
      // Add an empty feedback message that will be updated with streaming content
      setMessages(prev => [...prev, { role: 'assistant', content: '', isInterim: true }]);
      
      const feedback = await openAIService.current.getSessionFeedback(
        (partialFeedback) => {
          // Update the feedback message with the streaming content
          setMessages(prev => {
            const withoutLast = prev.slice(0, -1);
            return [...withoutLast, { role: 'assistant', content: partialFeedback, isInterim: true }];
          });
        }
      );
      
      // Update with final feedback and speak it
      setMessages(prev => {
        const withoutLast = prev.slice(0, -1);
        return [...withoutLast, { role: 'assistant', content: feedback }];
      });
      await speak(feedback);
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
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
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
                    ? message.isInterim
                      ? 'bg-blue-300 text-white'
                      : 'bg-blue-500 text-white'
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
          disabled={isProcessing || isListening || !isInitialized}
          className="flex-1"
        />
        <Button
          type="button"
          variant={isListening ? 'destructive' : 'secondary'}
          onClick={isListening ? stopRecording : startRecording}
          disabled={isProcessing || !isInitialized}
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        <Button type="submit" disabled={!inputText.trim() || isProcessing || isListening || !isInitialized}>
          <Send className="h-5 w-5" />
        </Button>
      </form>

      <Button
        onClick={handleGetFeedback}
        disabled={isProcessing || messages.length === 0 || isListening || !isInitialized}
        variant="outline"
      >
        Get Session Feedback
      </Button>
    </div>
  );
} 