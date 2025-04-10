// Speech worker implementation
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

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
  try {
    speechConfig = sdk.SpeechConfig.fromSubscription(apiKey, region);
    speechConfig.speechRecognitionLanguage = currentLanguage === 'english' ? 'en-US' : 'es-ES';
    speechConfig.speechSynthesisLanguage = currentLanguage === 'english' ? 'en-US' : 'es-ES';
    
    // Set default voice
    speechConfig.speechSynthesisVoiceName = currentLanguage === 'english' 
      ? 'en-US-JennyNeural' 
      : 'es-ES-ElviraNeural';

    self.postMessage({ 
      type: 'initialized',
      payload: { success: true }
    });
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      payload: error instanceof Error ? error.message : String(error)
    });
  }
};

// Start listening for speech
const startListening = () => {
  if (!speechConfig) {
    self.postMessage({ 
      type: 'error', 
      payload: 'Speech SDK not initialized'
    });
    return;
  }

  try {
    // Create the speech recognizer
    const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
    speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    // Set up event handlers
    speechRecognizer.recognizing = (_, e) => {
      // Interim result
      self.postMessage({
        type: 'interimResult',
        payload: e.result.text
      });
    };

    speechRecognizer.recognized = (_, e) => {
      // Final result
      self.postMessage({
        type: 'finalResult',
        payload: e.result.text
      });
    };

    speechRecognizer.canceled = (_, e) => {
      if (e.reason === sdk.CancellationReason.Error) {
        self.postMessage({
          type: 'error',
          payload: `Recognition canceled: ${e.errorDetails}`
        });
      }
    };

    // Start continuous recognition
    speechRecognizer.startContinuousRecognitionAsync(
      () => {
        isListening = true;
        isPaused = false;
        self.postMessage({
          type: 'listeningStarted',
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

// Stop listening
const stopListening = () => {
  if (!speechRecognizer) {
    self.postMessage({ 
      type: 'listeningStopped',
      payload: { success: true }
    });
    return;
  }

  try {
    speechRecognizer.stopContinuousRecognitionAsync(
      () => {
        isListening = false;
        isPaused = false;
        
        // Clean up resources
        speechRecognizer!.close();
        speechRecognizer = null;
        
        self.postMessage({
          type: 'listeningStopped',
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

// Speak text
const speak = (text: string) => {
  if (!speechConfig || isMuted) {
    if (isMuted) {
      self.postMessage({ 
        type: 'speakComplete',
        payload: { success: true, muted: true }
      });
    } else {
      self.postMessage({ 
        type: 'error', 
        payload: 'Speech SDK not initialized'
      });
    }
    return;
  }

  try {
    // Create the synthesizer
    const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
    synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    // Start synthesis
    synthesizer.speakTextAsync(
      text,
      (result) => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          self.postMessage({
            type: 'speakComplete',
            payload: { success: true }
          });
        } else {
          self.postMessage({
            type: 'error',
            payload: `Synthesis failed: ${result.reason}`
          });
        }
        
        // Clean up
        synthesizer!.close();
        synthesizer = null;
      },
      (err) => {
        self.postMessage({
          type: 'error',
          payload: String(err)
        });
        
        // Clean up even on error
        synthesizer?.close();
        synthesizer = null;
      }
    );
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      payload: error instanceof Error ? error.message : String(error)
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

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  try {
    switch (type) {
      case 'init':
        const { apiKey, region } = payload;
        initializeSpeechSDK(apiKey, region);
        break;
      
      case 'speak':
        speak(payload.text);
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
      
      case 'setMuted':
        setMuted(payload.muted);
        break;
        
      default:
        self.postMessage({ 
          type: 'error', 
          payload: `Unknown message type: ${type}` 
        });
    }
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      payload: error instanceof Error ? error.message : String(error)
    });
  }
});

// Signal that the worker is ready
self.postMessage({ type: 'ready' }); 