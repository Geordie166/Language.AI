import OpenAI from 'openai';

export interface ConversationConfig {
  level: 'basic' | 'premium';
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
    const packageDescriptions = {
      basic: 'simple conversations using everyday vocabulary and basic grammar, focusing on common situations',
      premium: 'advanced conversations with rich vocabulary, idiomatic expressions, and complex grammar structures'
    };

    const basePrompt = `You are MyVoiceCoach.ai, an expert language tutor specializing in conversational English. 
Your role is to engage in natural, interactive conversations while helping users improve their English speaking skills.

Package: ${config.level} (${packageDescriptions[config.level]})

Key responsibilities:
1. Maintain natural conversation flow:
   - Ask follow-up questions to keep the conversation going
   - Show interest in the user's responses
   - Share relevant experiences or examples

2. Provide guidance based on package level:
   Basic Package:
   - Focus on essential vocabulary and basic grammar
   - Use simple, clear sentences
   - Gentle correction of major errors only
   - Topics: daily life, hobbies, family, work

   Premium Package:
   - Advanced vocabulary and complex grammar structures
   - Idiomatic expressions and cultural context
   - Detailed feedback and corrections
   - Topics: current events, abstract concepts, professional scenarios
   - Pronunciation refinement
   ${config.level === 'premium' ? '- Provide alternative phrasings and vocabulary enrichment' : ''}

3. Adapt to the user's proficiency:
   - Adjust pace and complexity based on user responses
   - Provide scaffolding when needed
   - Challenge users appropriately

4. Encourage and support:
   - Provide positive reinforcement
   - Acknowledge good usage of new vocabulary or grammar
   - Help when the user struggles

Remember to:
- Keep responses concise (2-3 sentences)
- Always ask a follow-up question to maintain conversation flow
- Use natural speech patterns
- Stay in character as a friendly, patient tutor
${config.level === 'premium' ? '- Offer more sophisticated language options and cultural insights' : '- Keep language simple and clear'}`;

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
    config: ConversationConfig,
    onPartialResponse?: (partial: string) => void
  ): Promise<string> {
    try {
      // If this is the first message, add the system prompt
      if (this.conversationHistory.length === 0) {
        this.conversationHistory.push({
          role: 'system',
          content: this.getSystemPrompt(config)
        });
        
        // Add an initial greeting from the assistant
        const greeting = `Hi! I'm your English conversation partner. I see you're at a ${config.level} level. Let's practice speaking English together!`;
        this.conversationHistory.push({
          role: 'assistant',
          content: greeting
        });
        
        return greeting;
      }

      // Add user's message to history
      this.conversationHistory.push({
        role: 'user',
        content: userInput
      });

      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: this.conversationHistory,
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 1048,
        stream: true,
      });

      let fullResponse = '';
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
        
        if (onPartialResponse) {
          onPartialResponse(fullResponse);
        }
      }

      // Add assistant's response to history
      if (fullResponse) {
        this.conversationHistory.push({
          role: 'assistant',
          content: fullResponse
        });
      }

      return fullResponse || 'I apologize, but I was unable to generate a response.';
    } catch (error) {
      console.error('Error getting chat response:', error);
      throw error;
    }
  }

  async getSessionFeedback(onPartialResponse?: (partial: string) => void): Promise<string> {
    try {
      const stream = await this.openai.chat.completions.create({
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
        stream: true,
      });

      let fullResponse = '';
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
        
        if (onPartialResponse) {
          onPartialResponse(fullResponse);
        }
      }

      return fullResponse || 'Unable to generate feedback.';
    } catch (error) {
      console.error('Error getting session feedback:', error);
      throw error;
    }
  }

  clearConversationHistory(): void {
    this.conversationHistory = [];
  }
} 