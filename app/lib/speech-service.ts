import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

const SPEECH_CONFIG = {
  voiceName: 'es-ES-AlvaroNeural',
  language: 'es-ES',
  pitch: 1,
  rate: 1,
  volume: 1
};

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

  constructor() {
    const subscriptionKey = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
    const region = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;

    if (!subscriptionKey || !region) {
      throw new Error('Azure Speech credentials not found');
    }

    this.speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, region);
    this.speechConfig.speechSynthesisVoiceName = SPEECH_CONFIG.voiceName;
    this.speechConfig.speechRecognitionLanguage = SPEECH_CONFIG.language;
  }

  private async initSynthesizer() {
    if (this.synthesizer) {
      await this.synthesizer.close();
      this.synthesizer = null;
    }
    
    if (!this.speechConfig) {
      throw new Error('Speech config not initialized');
    }

    this.synthesizer = new sdk.SpeechSynthesizer(this.speechConfig);
  }

  private async initRecognizer() {
    if (this.recognizer) {
      await this.recognizer.close();
      this.recognizer = null;
    }
    
    if (!this.speechConfig) {
      throw new Error('Speech config not initialized');
    }

    this.recognizer = new sdk.SpeechRecognizer(this.speechConfig);
  }

  async speak(text: string): Promise<void> {
    if (this.isMuted) {
      return; // Skip speaking when muted
    }
    if (this.isSpeaking) {
      await this.stopSpeaking();
    }

    try {
      this.isSpeaking = true;
      await this.initSynthesizer();

      if (!this.synthesizer) {
        throw new Error('Synthesizer not initialized');
      }

      this.currentSpeechPromise = new Promise((resolve, reject) => {
        if (!this.synthesizer) {
          reject(new Error('Synthesizer not initialized'));
          return;
        }

        this.synthesizer.speakTextAsync(
          text,
          async (result) => {
            if (result) {
              await this.cleanup();
              resolve();
            }
          },
          async (error) => {
            await this.cleanup();
            reject(error);
          }
        );
      });

      await this.currentSpeechPromise;
    } catch (error) {
      console.error('Speech synthesis error:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  private async cleanup() {
    if (this.synthesizer) {
      await this.synthesizer.close();
      this.synthesizer = null;
    }
    this.isSpeaking = false;
    this.currentSpeechPromise = null;
  }

  async stopSpeaking(): Promise<void> {
    if (this.currentSpeechPromise) {
      if (this.synthesizer) {
        await this.synthesizer.close();
        this.synthesizer = null;
      }
      this.isSpeaking = false;
      this.currentSpeechPromise = null;
    }
  }

  async startListening(
    onInterimResult: (text: string) => void,
    onFinalResult: (text: string) => void
  ): Promise<void> {
    if (this.isListening) {
      await this.stopListening();
    }

    try {
      this.isListening = true;
      await this.initRecognizer();

      if (!this.recognizer) {
        throw new Error('Recognizer not initialized');
      }

      this.recognizer.recognized = (_, event) => {
        if (event.result.reason === sdk.ResultReason.RecognizedSpeech) {
          onFinalResult(event.result.text);
        }
      };

      this.recognizer.recognizing = (_, event) => {
        onInterimResult(event.result.text);
      };

      await this.recognizer.startContinuousRecognitionAsync();
    } catch (error) {
      console.error('Speech recognition error:', error);
      this.isListening = false;
      throw error;
    }
  }

  async stopListening(): Promise<void> {
    if (this.recognizer) {
      try {
        await this.recognizer.stopContinuousRecognitionAsync();
        await this.recognizer.close();
        this.recognizer = null;
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    this.isListening = false;
  }

  // Get pronunciation assessment for a given text
  async assessPronunciation(referenceText: string, spokenText: string): Promise<number> {
    // For now, return a simple score based on text matching
    // In a future update, we can implement more sophisticated pronunciation assessment
    const normalizedReference = referenceText.toLowerCase().trim();
    const normalizedSpoken = spokenText.toLowerCase().trim();
    return normalizedReference === normalizedSpoken ? 1.0 : 0.5;
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.synthesizer) {
      // Store current volume and set to 0 if muted, restore if unmuted
      if (muted) {
        this.volume = SPEECH_CONFIG.volume;
        SPEECH_CONFIG.volume = 0;
      } else {
        SPEECH_CONFIG.volume = this.volume;
      }
    }
  }

  async pauseListening(): Promise<void> {
    if (this.isListening && !this.isPaused && this.recognizer) {
      this.isPaused = true;
      await this.recognizer.stopContinuousRecognitionAsync();
    }
  }

  async resumeListening(
    onInterimResult: (text: string) => void,
    onFinalResult: (text: string) => void
  ): Promise<void> {
    if (this.isListening && this.isPaused && this.recognizer) {
      this.isPaused = false;
      this.recognizer.recognized = (_, event) => {
        if (event.result.reason === sdk.ResultReason.RecognizedSpeech) {
          onFinalResult(event.result.text);
        }
      };
      this.recognizer.recognizing = (_, event) => {
        onInterimResult(event.result.text);
      };
      await this.recognizer.startContinuousRecognitionAsync();
    }
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  getPaused(): boolean {
    return this.isPaused;
  }

  dispose(): void {
    if (this.synthesizer) {
      this.synthesizer.close();
      this.synthesizer = null;
    }
    if (this.recognizer) {
      this.recognizer.close();
      this.recognizer = null;
    }
    if (this.speechConfig) {
      this.speechConfig.close();
      this.speechConfig = null;
    }
    this.isListening = false;
    this.isSpeaking = false;
    this.currentSpeechPromise = null;
    this.isPaused = false;
    this.isMuted = false;
  }
} 