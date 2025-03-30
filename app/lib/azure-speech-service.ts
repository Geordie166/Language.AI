import {
  SpeechConfig,
  AudioConfig,
  SpeechRecognizer,
  SpeechSynthesizer,
  ResultReason,
  CancellationReason,
  SpeechRecognitionEventArgs,
  SpeechRecognitionResult,
  Recognizer,
  SpeechRecognitionCanceledEventArgs
} from 'microsoft-cognitiveservices-speech-sdk';

export interface AzureSpeechConfig {
  region: string;
  subscriptionKey: string;
  language: string;
  settings: {
    silenceDurationMs: number;
    autoDetectLanguage: boolean;
  };
}

export class AzureSpeechService {
  private speechConfig: SpeechConfig;
  private recognizer: SpeechRecognizer | null = null;
  private synthesizer: SpeechSynthesizer | null = null;
  private isListening = false;
  private currentLanguage: string;
  private silenceTimeout: NodeJS.Timeout | null = null;

  constructor(config: AzureSpeechConfig) {
    this.speechConfig = SpeechConfig.fromSubscription(
      config.subscriptionKey,
      config.region
    );
    this.currentLanguage = config.language;
    this.speechConfig.speechRecognitionLanguage = config.language;
    this.speechConfig.speechSynthesisLanguage = config.language;
    
    // Set high-quality voice based on language
    if (config.language.startsWith('en')) {
      this.speechConfig.speechSynthesisVoiceName = 'en-US-JennyNeural';
    } else if (config.language.startsWith('es')) {
      this.speechConfig.speechSynthesisVoiceName = 'es-ES-ElviraNeural';
    }
  }

  public async startListening(
    onInterimResult: (text: string) => void,
    onFinalResult: (text: string) => void
  ): Promise<void> {
    if (this.isListening) {
      return;
    }

    try {
      const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
      this.recognizer = new SpeechRecognizer(this.speechConfig, audioConfig);

      // Handle interim results
      this.recognizer.recognizing = (sender: Recognizer, event: SpeechRecognitionEventArgs) => {
        if (event.result.reason === ResultReason.RecognizingSpeech) {
          onInterimResult(event.result.text);
          
          // Reset silence detection
          if (this.silenceTimeout) {
            clearTimeout(this.silenceTimeout);
          }
          
          // Set new silence detection timeout
          this.silenceTimeout = setTimeout(() => {
            if (this.isListening) {
              this.stopListening();
              onFinalResult(event.result.text);
            }
          }, 280); // Same as OpenAI Playground
        }
      };

      // Handle final results
      this.recognizer.recognized = (sender: Recognizer, event: SpeechRecognitionEventArgs) => {
        if (event.result.reason === ResultReason.RecognizedSpeech) {
          onFinalResult(event.result.text);
        } else if (event.result.reason === ResultReason.NoMatch) {
          console.log('Speech not recognized.');
        }
      };

      // Handle errors
      this.recognizer.canceled = (sender: Recognizer, event: SpeechRecognitionCanceledEventArgs) => {
        if (event.reason === CancellationReason.Error) {
          console.error('Speech recognition error:', event.errorDetails);
        }
        this.isListening = false;
      };

      await this.recognizer.startContinuousRecognitionAsync();
      this.isListening = true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      throw error;
    }
  }

  public async stopListening(): Promise<void> {
    if (!this.isListening || !this.recognizer) {
      return;
    }

    try {
      await this.recognizer.stopContinuousRecognitionAsync();
      if (this.silenceTimeout) {
        clearTimeout(this.silenceTimeout);
      }
      this.isListening = false;
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
      throw error;
    }
  }

  public async speak(text: string): Promise<void> {
    try {
      if (!this.synthesizer) {
        const audioConfig = AudioConfig.fromDefaultSpeakerOutput();
        this.synthesizer = new SpeechSynthesizer(this.speechConfig, audioConfig);
      }

      return new Promise((resolve, reject) => {
        this.synthesizer!.speakTextAsync(
          text,
          (result) => {
            if (result.reason === ResultReason.SynthesizingAudioCompleted) {
              resolve();
            } else {
              reject(new Error('Speech synthesis failed'));
            }
            this.synthesizer!.close();
            this.synthesizer = null;
          },
          (error) => {
            console.error('Speech synthesis error:', error);
            reject(error);
            this.synthesizer!.close();
            this.synthesizer = null;
          }
        );
      });
    } catch (error) {
      console.error('Error in speech synthesis:', error);
      throw error;
    }
  }

  public async setLanguage(language: string): Promise<void> {
    this.currentLanguage = language;
    this.speechConfig.speechRecognitionLanguage = language;
    this.speechConfig.speechSynthesisLanguage = language;
    
    // Update voice based on language
    if (language.startsWith('en')) {
      this.speechConfig.speechSynthesisVoiceName = 'en-US-JennyNeural';
    } else if (language.startsWith('es')) {
      this.speechConfig.speechSynthesisVoiceName = 'es-ES-ElviraNeural';
    }
  }

  public dispose(): void {
    if (this.recognizer) {
      this.recognizer.close();
      this.recognizer = null;
    }
    if (this.synthesizer) {
      this.synthesizer.close();
      this.synthesizer = null;
    }
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
    }
    this.isListening = false;
  }
} 