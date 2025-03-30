import { useState, useCallback } from 'react';
import OpenAI from 'openai';

interface FeedbackResponse {
  message: string;
  feedback: {
    pronunciation: number;
    grammar: number;
    vocabulary: number;
    suggestions: string[];
  };
}

export function useOpenAI() {
  const [isLoading, setIsLoading] = useState(false);
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const generateResponse = useCallback(async (
    userInput: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<FeedbackResponse> => {
    setIsLoading(true);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are an AI language tutor helping someone practice ${difficulty} level English conversation.
            Analyze their speech for pronunciation, grammar, and vocabulary.
            Provide a natural response that continues the conversation while offering subtle corrections and improvements.
            Format your response as JSON with the following structure:
            {
              "message": "Your conversational response",
              "feedback": {
                "pronunciation": 0-100 score,
                "grammar": 0-100 score,
                "vocabulary": 0-100 score,
                "suggestions": ["1-3 specific improvement suggestions"]
              }
            }`
          },
          {
            role: "user",
            content: userInput
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');

      return {
        message: result.message || "I'm sorry, I couldn't understand that. Could you please repeat?",
        feedback: {
          pronunciation: result.feedback?.pronunciation || 0,
          grammar: result.feedback?.grammar || 0,
          vocabulary: result.feedback?.vocabulary || 0,
          suggestions: result.feedback?.suggestions || []
        }
      };
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error('Failed to generate response');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generateResponse,
    isLoading
  };
} 