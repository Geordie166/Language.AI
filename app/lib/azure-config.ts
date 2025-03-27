// Azure Speech Service configuration
export const AZURE_SPEECH_CONFIG = {
  region: process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION || '',
  subscriptionKey: process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY || '',
  language: 'es-ES', // Default to Spanish
  voiceName: 'es-ES-AlvaroNeural', // Default Spanish male voice
};

// Speech synthesis options
export const SPEECH_SYNTHESIS_OPTIONS = {
  pitch: 1, // Normal pitch
  rate: 1, // Normal speed
  volume: 1, // Full volume
};

// Speech recognition options
export const SPEECH_RECOGNITION_OPTIONS = {
  enableInterimResults: true,
  profanityFilter: true,
  language: 'es-ES',
}; 