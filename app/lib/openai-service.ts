import OpenAI from 'openai';

interface GrammarCorrection {
  original: string;
  correction: string;
  explanation: string;
  type: 'grammar' | 'vocabulary' | 'pronunciation' | 'style';
}

interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: (fullResponse: string) => void;
  onError: (error: any) => void;
}

export class OpenAIService {
  private openai: OpenAI;
  private conversationHistory: Array<{ role: 'system' | 'user' | 'assistant', content: string }> = [];

  constructor() {
    if (typeof window === 'undefined') {
      throw new Error('OpenAI service should only be initialized on the client side');
    }

    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI API key not found in environment variables');
      throw new Error('OpenAI API key not found');
    }

    try {
      console.log('Initializing OpenAI service...');
      this.openai = new OpenAI({ 
        apiKey,
        dangerouslyAllowBrowser: true
      });
      console.log('OpenAI service initialized successfully');
    } catch (error) {
      console.error('Error initializing OpenAI service:', error);
      throw new Error('Failed to initialize OpenAI service');
    }

    // Initialize with system message
    this.conversationHistory = [{
      role: 'system',
      content: this.getSystemPrompt('english', 'beginner')
    }];
  }

  private getSystemPrompt(language: string, level: string): string {
    return `You are an expert ${language} language learning assistant with deep knowledge of language acquisition, teaching methodologies, and cultural context. Your role is to:

1. CONVERSATION:
- Engage in natural, level-appropriate conversations
- Use vocabulary and structures suitable for a ${level} level student
- Incorporate cultural context when relevant
- Keep responses concise (2-3 sentences max unless explanation needed)

2. CORRECTIONS:
- Identify and correct errors naturally within the conversation
- Provide brief, clear explanations for corrections
- Focus on errors that impact comprehension or are relevant to the student's level

3. ADAPTATION:
- Gradually increase complexity as the student shows proficiency
- Rephrase when the student seems confused
- Use scaffolding techniques to support learning

4. ENGAGEMENT:
- Ask follow-up questions to encourage conversation
- Provide positive reinforcement
- Create opportunities for the student to practice target structures

Current language: ${language}
Student's level: ${level}

Always maintain a supportive, patient tone. Focus on building confidence while ensuring accuracy.`;
  }

  public updateSystemMessage(language: string, level: string = 'beginner'): void {
    if (this.conversationHistory.length > 0) {
      this.conversationHistory[0] = {
        role: 'system',
        content: this.getSystemPrompt(language, level)
      };
    }
  }

  async getStreamingResponse(
    userMessage: string,
    callbacks: StreamCallbacks,
    languageLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
    targetLanguage: string = 'english'
  ): Promise<void> {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      let fullResponse = '';

      // Stream the response
      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4-1106-preview',
        messages: this.conversationHistory,
        stream: true,
        temperature: 0.7,
        max_tokens: 150
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          callbacks.onToken(content);
        }
      }

      // Add assistant's response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: fullResponse
      });

      // Keep history at a reasonable length
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = [
          this.conversationHistory[0],
          ...this.conversationHistory.slice(-19)
        ];
      }

      callbacks.onComplete(fullResponse);

      // Get corrections in parallel
      this.getGrammarCorrections(userMessage)
        .then(({ corrections }) => {
          if (corrections.length > 0) {
            const correctionText = corrections
              .map(c => `Correction: "${c.original}" → "${c.correction}"\n${c.explanation}`)
              .join('\n\n');
            callbacks.onToken('\n\n' + correctionText);
          }
        })
        .catch(error => {
          console.error('Error getting corrections:', error);
        });

    } catch (error) {
      callbacks.onError(error);
      console.error('Error in streaming response:', error);
    }
  }

  async getResponse(
    userMessage: string, 
    languageLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
    targetLanguage: string = 'english'
  ): Promise<{
    response: string;
    corrections: GrammarCorrection[];
  }> {
    try {
      // First, analyze the message for corrections using JSON mode
      const analysis = await this.openai.chat.completions.create({
        model: 'gpt-4-1106-preview',
        messages: [
          {
            role: 'system',
            content: 'Analyze the following message for language corrections. Provide output in JSON format with corrections array. If no corrections needed, return empty array.'
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 150
      });

      const corrections = JSON.parse(analysis.choices[0]?.message?.content || '{"corrections":[]}').corrections as GrammarCorrection[];

      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Get conversational response
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-1106-preview',
        messages: [
          ...this.conversationHistory,
          {
            role: 'system',
            content: `Respond naturally as a language tutor. Current level: ${languageLevel}. Language: ${targetLanguage}.
            ${corrections.length > 0 ? 'Note: Corrections will be handled separately, focus on natural conversation.' : ''}`
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      });

      const response = completion.choices[0]?.message?.content || '';
      
      // Add assistant's response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response
      });

      // Keep history at a reasonable length (utilizing GPT-4's larger context window)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = [
          this.conversationHistory[0], // Keep system message
          ...this.conversationHistory.slice(-19) // Keep last 19 messages
        ];
      }

      return { response, corrections };
    } catch (error) {
      console.error('Error getting OpenAI response:', error);
      throw error;
    }
  }

  async getGrammarCorrections(text: string): Promise<{
    corrections: GrammarCorrection[];
  }> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-1106-preview',
        messages: [
          {
            role: 'system',
            content: 'Analyze the text for grammar, vocabulary, and style corrections. Return a JSON object with an array of corrections.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 150
      });

      const result = JSON.parse(completion.choices[0]?.message?.content || '{"corrections":[]}');
      return { corrections: result.corrections };
    } catch (error) {
      console.error('Error getting grammar corrections:', error);
      throw error;
    }
  }

  // Reset conversation history but keep system message
  resetConversation(): void {
    this.conversationHistory = [this.conversationHistory[0]];
  }
} 