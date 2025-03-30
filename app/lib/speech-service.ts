'use client';

import { SpeechConfig, AudioConfig, SpeechRecognizer, SpeechSynthesizer } from 'microsoft-cognitiveservices-speech-sdk';

export interface SpeechServiceConfig {
  subscriptionKey: string;
  region: string;
}

class SpeechService {
  private static instance: SpeechService;
  private speechConfig: SpeechConfig | null = null;
  private recognizer: SpeechRecognizer | null = null;
  private synthesizer: SpeechSynthesizer | null = null;

  private constructor() {}

  static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }

  initialize(config: SpeechServiceConfig) {
    if (!this.speechConfig) {
      this.speechConfig = SpeechConfig.fromSubscription(config.subscriptionKey, config.region);
      this.speechConfig.speechRecognitionLanguage = 'en-US';
      this.speechConfig.speechSynthesisLanguage = 'en-US';
    }
  }

  async startListening(onRecognized: (text: string) => void): Promise<void> {
    if (!this.speechConfig) {
      throw new Error('Speech service not initialized');
    }

    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
    this.recognizer = new SpeechRecognizer(this.speechConfig, audioConfig);

    this.recognizer.recognized = (s, e) => {
      if (e.result.text) {
        onRecognized(e.result.text);
      }
    };

    return new Promise((resolve) => {
      this.recognizer?.startContinuousRecognitionAsync(() => {
        resolve();
      });
    });
  }

  async stopListening(): Promise<void> {
    return new Promise((resolve) => {
      this.recognizer?.stopContinuousRecognitionAsync(() => {
        resolve();
      });
    });
  }

  async synthesizeSpeech(text: string): Promise<void> {
    if (!this.speechConfig) {
      throw new Error('Speech service not initialized');
    }

    const audioConfig = AudioConfig.fromDefaultSpeakerOutput();
    this.synthesizer = new SpeechSynthesizer(this.speechConfig, audioConfig);

    return new Promise((resolve, reject) => {
      this.synthesizer?.speakTextAsync(
        text,
        (result) => {
          this.synthesizer?.close();
          resolve();
        },
        (error) => {
          this.synthesizer?.close();
          reject(error);
        }
      );
    });
  }
}

export default SpeechService; 