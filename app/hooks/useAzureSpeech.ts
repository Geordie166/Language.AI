import { useState, useCallback, useEffect } from 'react';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

interface AzureSpeechConfig {
  onInterimResult: (text: string) => void;
  onFinalResult: (text: string) => void;
  onError: (error: Error) => void;
}

export function useAzureSpeech({
  onInterimResult,
  onFinalResult,
  onError
}: AzureSpeechConfig) {
  const [speechConfig, setSpeechConfig] = useState<sdk.SpeechConfig | null>(null);
  const [recognizer, setRecognizer] = useState<sdk.SpeechRecognizer | null>(null);
  const [synthesizer, setSynthesizer] = useState<sdk.SpeechSynthesizer | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize Azure Speech Services
    try {
      const config = sdk.SpeechConfig.fromSubscription(
        process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY!,
        process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION!
      );
      config.speechRecognitionLanguage = 'en-US';
      config.speechSynthesisLanguage = 'en-US';
      config.speechSynthesisVoiceName = 'en-US-JennyNeural';
      
      setSpeechConfig(config);
      setIsReady(true);
    } catch (error) {
      setIsReady(false);
      onError(new Error('Failed to initialize Azure Speech Services'));
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!speechConfig) return;

    try {
      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
      const newRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

      newRecognizer.recognizing = (_, event) => {
        onInterimResult(event.result.text);
      };

      newRecognizer.recognized = (_, event) => {
        if (event.result.reason === sdk.ResultReason.RecognizedSpeech) {
          onFinalResult(event.result.text);
        }
      };

      newRecognizer.canceled = (_, event) => {
        if (event.reason === sdk.CancellationReason.Error) {
          onError(new Error(`Speech recognition canceled: ${event.errorDetails}`));
        }
      };

      newRecognizer.startContinuousRecognitionAsync();
      setRecognizer(newRecognizer);
    } catch (error) {
      onError(new Error('Failed to start recording'));
    }
  }, [speechConfig, onInterimResult, onFinalResult, onError]);

  const stopRecording = useCallback(() => {
    if (!recognizer) return;

    try {
      recognizer.stopContinuousRecognitionAsync();
      setRecognizer(null);
    } catch (error) {
      onError(new Error('Failed to stop recording'));
    }
  }, [recognizer]);

  const startSpeaking = useCallback(async (text: string) => {
    if (!speechConfig) return;

    try {
      const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
      const newSynthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
      setSynthesizer(newSynthesizer);

      return new Promise<void>((resolve, reject) => {
        newSynthesizer.speakTextAsync(
          text,
          result => {
            newSynthesizer.close();
            setSynthesizer(null);
            resolve();
          },
          error => {
            newSynthesizer.close();
            setSynthesizer(null);
            reject(error);
          }
        );
      });
    } catch (error) {
      onError(new Error('Failed to synthesize speech'));
    }
  }, [speechConfig]);

  const stopSpeaking = useCallback(() => {
    if (!synthesizer) return;

    try {
      synthesizer.close();
      setSynthesizer(null);
    } catch (error) {
      onError(new Error('Failed to stop speaking'));
    }
  }, [synthesizer]);

  return {
    startRecording,
    stopRecording,
    startSpeaking,
    stopSpeaking,
    isReady
  };
} 