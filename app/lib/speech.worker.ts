/// <reference lib="webworker" />

// Speech worker implementation
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

declare const self: DedicatedWorkerGlobalScope;

// Export for worker-loader
export default {} as typeof Worker & (new () => Worker);

// Global variables
let speechConfig: sdk.SpeechConfig | null = null;
let speechRecognizer: sdk.SpeechRecognizer | null = null;
let synthesizer: sdk.SpeechSynthesizer | null = null;
let isMuted = false;
let currentLanguage = 'english';
let isListening = false;
let isPaused = false;

// Initialize the Azure Speech SDK
const initializeSpeechSDK = (apiKey: string, region: string) => {
  cleanup(); // Clean up any existing resources
  
  try {
    // Create speech config
    speechConfig = sdk.SpeechConfig.fromSubscription(apiKey, region);
    
    // Configure recognition settings
    speechConfig.speechRecognitionLanguage = currentLanguage === 'english' ? 'en-US' : 'es-ES';
    speechConfig.speechSynthesisLanguage = currentLanguage === 'english' ? 'en-US' : 'es-ES';
    
    // Set default voice
    speechConfig.speechSynthesisVoiceName = currentLanguage === 'english' 
      ? 'en-US-JennyNeural' 
      : 'es-ES-ElviraNeural';

    // Set connection timeout
    speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, "5000");
    speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs, "5000");
    speechConfig.setProperty("SPEECH_ServiceConnection_ReconnectBackOffMs", "1000");

    self.postMessage({ 
      type: 'initialized',
      payload: { success: true }
    });
  } catch (error) {
    console.error('Speech SDK initialization failed:', error);
    self.postMessage({ 
      type: 'error', 
      payload: error instanceof Error ? error.message : String(error)
    });
  }
};

// Start listening for speech
const startListening = () => {
  cleanup(); // Ensure clean state before starting

  if (!speechConfig) {
    self.postMessage({ 
      type: 'error', 
      payload: 'Speech SDK not initialized'
    });
    return;
  }

  try {
    // Create the speech recognizer with default microphone
    const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
    speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    // Set up event handlers before starting recognition
    speechRecognizer.recognizing = (_, e) => {
      self.postMessage({
        type: 'interimResult',
        payload: e.result.text
      });
    };

    speechRecognizer.recognized = (_, e) => {
      if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
        self.postMessage({
          type: 'finalResult',
          payload: e.result.text
        });
      }
    };

    speechRecognizer.canceled = (_, e) => {
      self.postMessage({
        type: 'error',
        payload: `Recognition canceled: ${e.errorDetails}`
      });
      cleanup();
    };

    // Start recognition
    speechRecognizer.startContinuousRecognitionAsync(
      () => {
        self.postMessage({
          type: 'listeningStarted',
          payload: { success: true }
        });
      },
      (error) => {
        console.error('Failed to start recognition:', error);
        self.postMessage({
          type: 'error',
          payload: String(error)
        });
        cleanup();
      }
    );
  } catch (error) {
    console.error('Error in startListening:', error);
    self.postMessage({
      type: 'error',
      payload: String(error)
    });
    cleanup();
  }
};

// Cleanup function
const cleanup = () => {
  if (speechRecognizer) {
    try {
      speechRecognizer.stopContinuousRecognitionAsync(
        () => {
          speechRecognizer?.close();
          speechRecognizer = null;
        },
        (error) => {
          console.warn('Error stopping recognition during cleanup:', error);
          speechRecognizer?.close();
          speechRecognizer = null;
        }
      );
    } catch (error) {
      console.warn('Error during recognizer cleanup:', error);
      try {
        speechRecognizer.close();
      } catch (e) {
        console.warn('Error closing recognizer:', e);
      }
      speechRecognizer = null;
    }
  }

  if (synthesizer) {
    try {
      synthesizer.close();
    } catch (error) {
      console.warn('Error during synthesizer cleanup:', error);
    }
    synthesizer = null;
  }
};

// Stop listening
const stopListening = () => {
  if (!speechRecognizer) {
    return;
  }

  try {
    speechRecognizer.stopContinuousRecognitionAsync(
      () => {
        cleanup();
        self.postMessage({
          type: 'listeningStopped',
          payload: { success: true }
        });
      },
      (error) => {
        console.error('Failed to stop recognition:', error);
        self.postMessage({
          type: 'error',
          payload: String(error)
        });
        cleanup();
      }
    );
  } catch (error) {
    console.error('Error in stopListening:', error);
    self.postMessage({
      type: 'error',
      payload: String(error)
    });
    cleanup();
  }
};

// Pause listening
const pauseListening = () => {
  if (!speechRecognizer || !isListening) {
    self.postMessage({ 
      type: 'error', 
      payload: 'No active recognition to pause'
    });
    return;
  }

  try {
    speechRecognizer.stopContinuousRecognitionAsync(
      () => {
        isPaused = true;
        self.postMessage({
          type: 'listeningPaused',
          payload: { success: true }
        });
      },
      (err) => {
        self.postMessage({
          type: 'error',
          payload: String(err)
        });
      }
    );
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      payload: error instanceof Error ? error.message : String(error)
    });
  }
};

// Resume listening
const resumeListening = () => {
  if (!speechRecognizer || !isPaused) {
    self.postMessage({ 
      type: 'error', 
      payload: 'No paused recognition to resume'
    });
    return;
  }

  try {
    speechRecognizer.startContinuousRecognitionAsync(
      () => {
        isPaused = false;
        self.postMessage({
          type: 'listeningResumed',
          payload: { success: true }
        });
      },
      (err) => {
        self.postMessage({
          type: 'error',
          payload: String(err)
        });
      }
    );
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      payload: error instanceof Error ? error.message : String(error)
    });
  }
};

// Speak text using text-to-speech
const speak = async (text: string) => {
  if (!speechConfig) {
    self.postMessage({ 
      type: 'error', 
      payload: 'Speech SDK not initialized'
    });
    return;
  }

  try {
    // Create the synthesizer if it doesn't exist
    if (!synthesizer) {
      const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
      synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
    }

    // Synthesize the text
    return new Promise<void>((resolve, reject) => {
      synthesizer!.speakTextAsync(
        text,
        (result) => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            self.postMessage({
              type: 'synthesisComplete',
              payload: { success: true }
            });
            resolve();
          } else {
            const error = `Synthesis failed: ${result.errorDetails}`;
            self.postMessage({
              type: 'error',
              payload: error
            });
            reject(new Error(error));
          }
        },
        (error) => {
          console.error('Error in speak:', error);
          self.postMessage({
            type: 'error',
            payload: String(error)
          });
          reject(error);
        }
      );
    });
  } catch (error) {
    console.error('Error in speak:', error);
    self.postMessage({
      type: 'error',
      payload: String(error)
    });
  }
};

// Stop speaking
const stopSpeaking = () => {
  if (!synthesizer) {
    self.postMessage({
      type: 'speakingStopped',
      payload: { success: true }
    });
    return;
  }

  try {
    synthesizer.close();
    synthesizer = null;
    self.postMessage({
      type: 'speakingStopped',
      payload: { success: true }
    });
  } catch (error) {
    console.error('Error stopping synthesis:', error);
    self.postMessage({
      type: 'error',
      payload: String(error)
    });
  }
};

// Set language
const setLanguage = (language: string) => {
  currentLanguage = language;
  
  if (speechConfig) {
    speechConfig.speechRecognitionLanguage = language === 'english' ? 'en-US' : 'es-ES';
    speechConfig.speechSynthesisLanguage = language === 'english' ? 'en-US' : 'es-ES';
    speechConfig.speechSynthesisVoiceName = language === 'english' 
      ? 'en-US-JennyNeural' 
      : 'es-ES-ElviraNeural';
    
    self.postMessage({
      type: 'languageSet',
      payload: { language, success: true }
    });
  } else {
    self.postMessage({ 
      type: 'error', 
      payload: 'Speech SDK not initialized'
    });
  }
};

// Set muted state
const setMuted = (muted: boolean) => {
  isMuted = muted;
  self.postMessage({
    type: 'mutedSet',
    payload: { muted, success: true }
  });
};

// Message handler
self.addEventListener('message', async (event: MessageEvent) => {
  const { type, payload } = event.data;

  try {
    switch (type) {
      case 'init':
        initializeSpeechSDK(payload.apiKey, payload.region);
        break;
      case 'startListening':
        startListening();
        break;
      case 'stopListening':
        stopListening();
        break;
      case 'pauseListening':
        pauseListening();
        break;
      case 'resumeListening':
        resumeListening();
        break;
      case 'setLanguage':
        setLanguage(payload.language);
        break;
      case 'speak':
        await speak(payload.text);
        break;
      case 'stopSpeaking':
        stopSpeaking();
        break;
      case 'dispose':
        cleanup();
        break;
      case 'setMuted':
        setMuted(payload.muted);
        break;
      default:
        console.warn('Unknown message type:', type);
    }
  } catch (error) {
    console.error('Error handling message:', error);
    self.postMessage({
      type: 'error',
      payload: String(error)
    });
  }
});

// Signal that the worker is ready
self.postMessage({ type: 'ready' }); 