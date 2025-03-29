import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

interface LanguageConfig {
  voiceName: string;
  language: string;
}

const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  english: {
    voiceName: 'en-US-JennyNeural',
    language: 'en-US'
  },
  spanish: {
    voiceName: 'es-ES-AlvaroNeural',
    language: 'es-ES'
  }
};

// Maximum time to wait for speech operations before timing out
const OPERATION_TIMEOUT = 5000; // 5 seconds

export class SpeechService {
  private speechConfig: sdk.SpeechConfig | null = null;
  private synthesizer: sdk.SpeechSynthesizer | null = null;
  private recognizer: sdk.SpeechRecognizer | null = null;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;
  private isMuted: boolean = false;
  private currentSpeechPromise: Promise<void> | null = null;
  private volume: number = 1;
  private currentLanguage: string = 'english';
  private isInitialized: boolean = false;
  private initPromise: Promise<void> | null = null;
  private lastError: Error | null = null;

  constructor() {
    // Defer initialization until needed - will be initialized on first use
    this.initPromise = null;
    this.isInitialized = false;
    this.lastError = null;
    
    // Add safety cleanup on page unload to prevent memory leaks
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.dispose();
      });
    }
  }

  /**
   * Get the last error encountered
   */
  public getLastError(): Error | null {
    return this.lastError;
  }

  /**
   * Initialize the speech service by fetching an authentication token from the server
   */
  private async initialize(): Promise<void> {
    // If already initialized, just return
    if (this.isInitialized) {
      return;
    }

    // If initialization is in progress, wait for it
    if (this.initPromise) {
      return this.initPromise;
    }

    // Start initialization process
    this.initPromise = (async () => {
      try {
        console.log('Initializing SpeechService...');
        
        // Fetch token from the API
        const tokenResponse = await fetch('/api/speech-token');
        
        if (!tokenResponse.ok) {
          const error = await tokenResponse.text();
          console.error('Error fetching speech token:', error);
          throw new Error(`Failed to fetch speech token: ${error}`);
        }
        
        const { token, region } = await tokenResponse.json();
        
        if (!token || !region) {
          console.error('Invalid token response:', { token: !!token, region: !!region });
          throw new Error('Invalid speech token response');
        }
        
        console.log('Received token for region:', region);
        
        // Create speech config from auth token
        this.speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, region);
        
        // Set default audio output config
        this.speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_SynthOutputFormat, 'audio-16khz-128kbitrate-mono-mp3');
        
        // Set timeout property
        this.speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, "5000");
        this.speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs, "1000");
        
        this.updateLanguageConfig('english');
        console.log('SpeechService initialized successfully');
        this.isInitialized = true;
        this.lastError = null;
      } catch (err) {
        console.error('Error in SpeechService initialization:', err);
        this.isInitialized = false;
        this.lastError = err instanceof Error ? err : new Error(String(err));
        throw err;
      } finally {
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  private updateLanguageConfig(language: string) {
    if (!this.speechConfig) {
      console.error('Cannot update language config: Speech config is null');
      return;
    }
    
    const config = LANGUAGE_CONFIGS[language.toLowerCase()] || LANGUAGE_CONFIGS.english;
    console.log(`Updating language config to ${language}:`, config);
    this.speechConfig.speechSynthesisVoiceName = config.voiceName;
    this.speechConfig.speechRecognitionLanguage = config.language;
    this.currentLanguage = language.toLowerCase();
  }

  async setLanguage(language: string) {
    console.log(`Setting language to ${language}`);
    
    // Initialize if needed
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const oldLanguage = this.currentLanguage;
    this.updateLanguageConfig(language);
    
    // Reinitialize if language changed
    if (oldLanguage !== this.currentLanguage) {
      console.log(`Language changed from ${oldLanguage} to ${this.currentLanguage}`);
      if (this.isListening) {
        await this.stopListening();
        // The caller should handle restarting listening if needed
      }
      if (this.isSpeaking) {
        await this.stopSpeaking();
      }
    }
  }

  private async initSynthesizer() {
    console.log('Initializing synthesizer...');
    
    // Initialize if needed
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (this.synthesizer) {
      console.log('Closing existing synthesizer');
      await this.safeSynthesizerClose();
    }
    
    if (!this.speechConfig) {
      console.error('Speech config not initialized');
      throw new Error('Speech config not initialized');
    }

    // Create an audio config for output to the default speaker
    const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
    this.synthesizer = new sdk.SpeechSynthesizer(this.speechConfig, audioConfig);
    console.log('Synthesizer initialized');
  }
  
  /**
   * Safely close the synthesizer
   */
  private async safeSynthesizerClose(): Promise<void> {
    if (!this.synthesizer) return;
    
    try {
      // Set a timeout to force close if it takes too long
      const timeoutId = setTimeout(() => {
        console.warn('Synthesizer close operation timed out, forcing close');
        this.synthesizer = null;
      }, OPERATION_TIMEOUT);

      // Try to close normally
      await this.synthesizer.close();
      clearTimeout(timeoutId);
      this.synthesizer = null;
    } catch (error) {
      console.error('Error closing synthesizer:', error);
      // Force null the reference even if close failed
      this.synthesizer = null;
    }
  }
  
  /**
   * Safely close the recognizer
   */
  private async safeRecognizerClose(): Promise<void> {
    if (!this.recognizer) return;
    
    try {
      // First stop recognition if active
      if (this.isListening) {
        try {
          console.log('Stopping continuous recognition');
          
          // Set timeout to force continue if stop takes too long
          const stopTimeoutId = setTimeout(() => {
            console.warn('Recognition stop operation timed out, continuing anyway');
          }, OPERATION_TIMEOUT);
          
          await this.recognizer.stopContinuousRecognitionAsync();
          clearTimeout(stopTimeoutId);
        } catch (stopError) {
          console.error('Error stopping recognition:', stopError);
          // Continue to close even if stop failed
        }
      }
      
      // Then close
      console.log('Closing recognizer');
      
      // Set timeout to force null if close takes too long
      const closeTimeoutId = setTimeout(() => {
        console.warn('Recognizer close operation timed out, forcing close');
        this.recognizer = null;
      }, OPERATION_TIMEOUT);
      
      await this.recognizer.close();
      clearTimeout(closeTimeoutId);
      this.recognizer = null;
    } catch (error) {
      console.error('Error safely closing recognizer:', error);
      // Force null the reference even if close failed
      this.recognizer = null;
    }
  }

  private async initRecognizer() {
    console.log('Initializing recognizer...');
    
    // Initialize if needed
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (this.recognizer) {
      console.log('Closing existing recognizer');
      await this.safeRecognizerClose();
    }
    
    if (!this.speechConfig) {
      console.error('Speech config not initialized');
      throw new Error('Speech config not initialized');
    }

    try {
      // Create an audio config for input from the default microphone
      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
      console.log('Created audio config from default microphone');
      this.recognizer = new sdk.SpeechRecognizer(this.speechConfig, audioConfig);
      console.log('Recognizer initialized');
    } catch (error) {
      console.error('Error initializing recognizer:', error);
      throw error;
    }
  }

  async speak(text: string): Promise<void> {
    console.log(`Speaking: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
    
    // Initialize if needed
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (this.isMuted) {
      console.log('Speech muted, skipping');
      return; // Skip speaking when muted
    }
    if (this.isSpeaking) {
      console.log('Already speaking, stopping first');
      await this.stopSpeaking();
    }

    try {
      this.isSpeaking = true;
      await this.initSynthesizer();

      if (!this.synthesizer) {
        console.error('Synthesizer not initialized');
        throw new Error('Synthesizer not initialized');
      }

      console.log('Starting speech synthesis');
      this.currentSpeechPromise = new Promise((resolve, reject) => {
        if (!this.synthesizer) {
          reject(new Error('Synthesizer not initialized'));
          return;
        }

        // Set up a timeout in case the operation hangs
        const timeoutId = setTimeout(() => {
          this.cleanup().then(() => {
            reject(new Error('Speech synthesis timed out'));
          });
        }, OPERATION_TIMEOUT);

        this.synthesizer.speakTextAsync(
          text,
          async (result) => {
            clearTimeout(timeoutId);
            console.log('Speech synthesis result:', result.reason);
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
              console.log('Speech synthesis completed successfully');
              await this.cleanup();
              resolve();
            } else {
              console.error('Speech synthesis failed:', result.reason);
              await this.cleanup();
              reject(new Error(`Speech synthesis failed: ${result.reason}`));
            }
          },
          async (error) => {
            clearTimeout(timeoutId);
            console.error('Speech synthesis error:', error);
            await this.cleanup();
            reject(error);
          }
        );
      });

      await this.currentSpeechPromise;
    } catch (error) {
      console.error('Speech synthesis error:', error);
      this.lastError = error instanceof Error ? error : new Error(String(error));
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  private async cleanup() {
    console.log('Cleaning up speech resources');
    if (this.synthesizer) {
      await this.safeSynthesizerClose();
    }
    this.isSpeaking = false;
    this.currentSpeechPromise = null;
  }

  async stopSpeaking(): Promise<void> {
    console.log('Stopping speech');
    if (this.currentSpeechPromise) {
      if (this.synthesizer) {
        await this.safeSynthesizerClose();
      }
      this.isSpeaking = false;
      this.currentSpeechPromise = null;
    }
  }

  async startListening(
    onInterimResult: (text: string) => void,
    onFinalResult: (text: string) => void
  ): Promise<void> {
    console.log('Starting listening...');
    
    // Initialize if needed
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (this.isListening) {
      console.log('Already listening, stopping first');
      await this.stopListening();
    }

    try {
      this.isListening = true;
      await this.initRecognizer();

      if (!this.recognizer) {
        console.error('Recognizer not initialized');
        throw new Error('Recognizer not initialized');
      }

      console.log('Setting up recognizer event handlers');
      this.recognizer.recognized = (_, event) => {
        try {
          console.log('Recognized event:', event.result.reason);
          if (event.result.reason === sdk.ResultReason.RecognizedSpeech) {
            const text = event.result.text || '';
            console.log('Final recognition result:', text);
            onFinalResult(text);
          }
        } catch (callbackError) {
          console.error('Error in recognition callback:', callbackError);
        }
      };

      this.recognizer.recognizing = (_, event) => {
        try {
          const text = event.result.text || '';
          console.log('Interim recognition result:', text);
          onInterimResult(text);
        } catch (callbackError) {
          console.error('Error in interim recognition callback:', callbackError);
        }
      };
      
      // Add canceled handler
      this.recognizer.canceled = (_, event) => {
        console.log('Recognition canceled:', event.reason);
        if (event.reason === sdk.CancellationReason.Error) {
          console.error('Recognition error:', event.errorDetails);
          this.lastError = new Error(`Recognition error: ${event.errorDetails}`);
        }
        this.isListening = false;
      };

      console.log('Starting continuous recognition');
      
      // Set timeout to continue if start takes too long
      const startTimeoutId = setTimeout(() => {
        console.warn('Recognition start operation is taking a long time, check microphone permissions');
      }, OPERATION_TIMEOUT);
      
      await this.recognizer.startContinuousRecognitionAsync();
      clearTimeout(startTimeoutId);
      
      console.log('Continuous recognition started');
    } catch (error) {
      console.error('Speech recognition error:', error);
      this.isListening = false;
      this.lastError = error instanceof Error ? error : new Error(String(error));
      throw error;
    }
  }

  async stopListening(): Promise<void> {
    console.log('Stopping listening');
    if (this.recognizer && this.isListening) {
      try {
        await this.safeRecognizerClose();
      } catch (error) {
        console.error('Error stopping recognition:', error);
        this.lastError = error instanceof Error ? error : new Error(String(error));
      }
    }
    this.isListening = false;
    console.log('Listening stopped');
  }

  // Get pronunciation assessment for a given text
  async assessPronunciation(referenceText: string, spokenText: string): Promise<number> {
    // Initialize if needed
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // For now, return a simple score based on text matching
    // In a future update, we can implement more sophisticated pronunciation assessment
    const normalizedReference = referenceText.toLowerCase().trim();
    const normalizedSpoken = spokenText.toLowerCase().trim();
    return normalizedReference === normalizedSpoken ? 1.0 : 0.5;
  }

  setMuted(muted: boolean): void {
    console.log(`Setting muted: ${muted}`);
    this.isMuted = muted;
    if (this.synthesizer) {
      this.volume = muted ? 0 : 1;
    }
  }

  async pauseListening(): Promise<void> {
    console.log('Pausing listening');
    if (!this.isListening || this.isPaused) return;
    
    try {
      if (this.recognizer) {
        this.isPaused = true;
        
        // Set timeout in case pause takes too long
        const pauseTimeoutId = setTimeout(() => {
          console.warn('Recognition pause operation timed out');
        }, OPERATION_TIMEOUT);
        
        await this.recognizer.stopContinuousRecognitionAsync();
        clearTimeout(pauseTimeoutId);
        
        console.log('Listening paused');
      }
    } catch (error) {
      console.error('Error pausing listening:', error);
      this.isPaused = false;
      this.lastError = error instanceof Error ? error : new Error(String(error));
      throw error;
    }
  }

  async resumeListening(
    onInterimResult?: (text: string) => void,
    onFinalResult?: (text: string) => void
  ): Promise<void> {
    console.log('Resuming listening');
    if (!this.isListening || !this.isPaused) return;
    
    try {
      this.isPaused = false;
      // Check if we have the callbacks
      if (onInterimResult && onFinalResult) {
        await this.startListening(onInterimResult, onFinalResult);
      } else {
        console.error('Cannot resume listening: no callbacks provided');
        throw new Error('Cannot resume listening: no callbacks provided');
      }
      console.log('Listening resumed');
    } catch (error) {
      console.error('Error resuming listening:', error);
      this.isPaused = true;
      this.lastError = error instanceof Error ? error : new Error(String(error));
      throw error;
    }
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  getPaused(): boolean {
    return this.isPaused;
  }

  dispose(): void {
    console.log('Disposing SpeechService');
    
    try {
      // Cancel any ongoing operations
      if (this.isSpeaking) {
        this.stopSpeaking();
      }
      
      if (this.isListening) {
        this.stopListening();
      }
      
      // Close and null all resources
      if (this.synthesizer) {
        try {
          this.synthesizer.close();
        } catch (error) {
          console.error('Error closing synthesizer during dispose:', error);
        }
        this.synthesizer = null;
      }
      
      if (this.recognizer) {
        try {
          this.recognizer.close();
        } catch (error) {
          console.error('Error closing recognizer during dispose:', error);
        }
        this.recognizer = null;
      }
      
      if (this.speechConfig) {
        try {
          this.speechConfig.close();
        } catch (error) {
          console.error('Error closing speech config during dispose:', error);
        }
        this.speechConfig = null;
      }
      
      // Reset all state
      this.isListening = false;
      this.isSpeaking = false;
      this.currentSpeechPromise = null;
      this.isPaused = false;
      this.isMuted = false;
      this.isInitialized = false;
      
      console.log('SpeechService disposed');
    } catch (error) {
      console.error('Error during SpeechService disposal:', error);
      this.lastError = error instanceof Error ? error : new Error(String(error));
    }
  }
} 