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
  private systemMessage: string = '';
  private currentLanguage: string = 'english';

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not found');
    }
    this.openai = new OpenAI({ apiKey });
    this.systemMessage = this.getSystemPrompt('english', 'beginner');
  }

  private getSystemPrompt(language: string, level: string): string {
    const basePrompt = language === 'english'
      ? `You are a helpful and patient English language tutor. Your goal is to help the user practice and improve their English through natural conversation.
         - Adapt your language complexity to their ${level} level
         - Provide gentle corrections for grammar or vocabulary mistakes
         - Keep responses concise and natural
         - Encourage the user to express themselves
         - If you notice a mistake, provide the correction in parentheses after your response`
      : `Eres un tutor de español servicial y paciente. Tu objetivo es ayudar al usuario a practicar y mejorar su español a través de una conversación natural.
         - Adapta la complejidad de tu lenguaje a su nivel ${level}
         - Proporciona correcciones suaves para errores de gramática o vocabulario
         - Mantén las respuestas concisas y naturales
         - Anima al usuario a expresarse
         - Si notas un error, proporciona la corrección entre paréntesis después de tu respuesta`;

    return basePrompt;
  }

  public async updateSystemMessage(language: string, level: string): Promise<void> {
    this.conversationHistory = []; // Reset conversation history on language change
    this.systemMessage = this.getSystemPrompt(language, level);
    this.currentLanguage = language;
  }

  private async getGrammarCorrections(text: string, language: string): Promise<string | null> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: language === 'english'
              ? "You are a language correction assistant. Analyze the text for grammar, vocabulary, and pronunciation errors. Provide corrections in a clear, concise format."
              : "Eres un asistente de corrección de idiomas. Analiza el texto en busca de errores de gramática, vocabulario y pronunciación. Proporciona correcciones en un formato claro y conciso."
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 150
      });

      const corrections = response.choices[0]?.message?.content?.trim();
      return corrections && corrections !== text ? corrections : null;
    } catch (error) {
      console.error('Error getting grammar corrections:', error);
      return null;
    }
  }

  public async getStreamingResponse(
    userInput: string,
    callbacks: StreamCallbacks,
    level: string,
    language: string
  ): Promise<void> {
    try {
      // Add user message to conversation history
      this.conversationHistory.push({
        role: "user",
        content: userInput
      });

      // Get streaming response from OpenAI
      const stream = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: this.getSystemPrompt(language, level) },
          ...this.conversationHistory
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 150
      });

      let fullResponse = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
        callbacks.onToken(content);
      }

      // Add AI response to conversation history
      this.conversationHistory.push({
        role: "assistant",
        content: fullResponse
      });

      // Keep conversation history manageable
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }

      // Get grammar corrections in parallel
      const corrections = await this.getGrammarCorrections(userInput, language);
      if (corrections) {
        callbacks.onToken(`\n\n${language === 'english' ? 'Corrections' : 'Correcciones'}: ${corrections}`);
      }

      callbacks.onComplete(fullResponse);
    } catch (error) {
      console.error('Error in streaming response:', error);
      callbacks.onError(error);
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

  // Reset conversation history but keep system message
  resetConversation(): void {
    this.conversationHistory = [];
    this.systemMessage = this.getSystemPrompt(this.currentLanguage, 'beginner');
  }
} 