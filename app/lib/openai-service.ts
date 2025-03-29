import OpenAI from 'openai';

export interface ConversationConfig {
  level: 'basic1' | 'basic2' | 'intermediate' | 'advanced';
  topic?: string;
  temperature?: number;
  maxTokens?: number;
}

export class OpenAIService {
  private openai: OpenAI;
  private conversationHistory: Array<{ role: 'system' | 'user' | 'assistant', content: string }> = [];

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }

  private getSystemPrompt(config: ConversationConfig): string {
    const basePrompt = `You are an expert language tutor specializing in conversational English. 
    Your role is to maintain a friendly, patient, and encouraging demeanor while providing natural conversation practice.
    Focus on ${config.level} level vocabulary and grammar.
    ${config.topic ? `The conversation topic is: ${config.topic}.` : ''}
    
    Remember to:
    - Keep responses concise (2-3 sentences per turn)
    - Use natural speech patterns appropriate for ${config.level} level
    - Provide positive reinforcement
    - Note but don't over-correct mistakes
    - Track and gently correct pronunciation, grammar, and vocabulary issues
    - Maintain conversation history to reference previous corrections`;

    return basePrompt;
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
    
    const transcript = await this.openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
    });

    return transcript.text;
  }

  async getChatResponse(
    userInput: string,
    config: ConversationConfig
  ): Promise<string> {
    try {
      // Add user's message to history
      this.conversationHistory.push({
        role: 'user',
        content: userInput
      });

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(config)
          },
          ...this.conversationHistory
        ],
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 1048,
      });

      const response = completion.choices[0].message.content;

      // Add assistant's response to history
      if (response) {
        this.conversationHistory.push({
          role: 'assistant',
          content: response
        });
      }

      return response || 'I apologize, but I was unable to generate a response.';
    } catch (error) {
      console.error('Error getting chat response:', error);
      throw error;
    }
  }

  async getSessionFeedback(): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Analyze the conversation history and provide a detailed feedback report including: 1. Grammar usage 2. Vocabulary level 3. Conversation flow 4. Specific improvements needed. Be constructive and encouraging.'
          },
          ...this.conversationHistory
        ],
        temperature: 0.7,
        max_tokens: 1048,
      });

      return completion.choices[0].message.content || 'Unable to generate feedback.';
    } catch (error) {
      console.error('Error getting session feedback:', error);
      throw error;
    }
  }

  clearConversationHistory(): void {
    this.conversationHistory = [];
  }
} 