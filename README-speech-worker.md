# Speech Worker Implementation

This document describes the implementation of speech services using Web Workers to prevent UI freezing in the language learning application.

## Overview

The speech processing has been moved to a separate thread using Web Workers to prevent UI freezing during speech recognition and synthesis operations. This is a significant improvement over the previous implementation, which ran all speech processing on the main thread.

## Files Changed

1. `app/lib/speech-worker.ts` - New Web Worker implementation that handles all speech processing operations
2. `app/lib/speech-service.ts` - Updated service that communicates with the web worker
3. `app/contexts/SpeechContext.tsx` - No changes needed, as it already uses the speech service API

## How It Works

1. When the application starts, a web worker is created
2. All speech operations (listening, speaking, etc.) are sent to the worker as messages
3. The worker processes these operations in a separate thread, preventing UI freezing
4. Results and errors are sent back to the main thread via messages

## Environment Variables

Make sure you have the following environment variables set in your `.env.local` file:

```
NEXT_PUBLIC_AZURE_SPEECH_KEY=your_azure_speech_key
NEXT_PUBLIC_AZURE_SPEECH_REGION=your_azure_region
```

## Key Improvements

- **Separate Thread**: All speech processing now runs in a separate thread
- **Timeouts**: All operations have timeouts to prevent indefinite hanging
- **Graceful Recovery**: The system can recover from errors without reloading the page
- **Better Error Handling**: Errors are properly caught and reported

## Testing

To test the speech functionality:

1. Navigate to the conversation page
2. Click the microphone button to start listening
3. Speak into your microphone
4. The recognized text should appear without freezing the UI
5. The AI response should be spoken back to you

## Known Limitations

- The web worker implementation requires a modern browser that supports Web Workers
- In some browsers, microphone access must be explicitly granted
- Some features (like pronunciation assessment) are simplified for the demo

## Troubleshooting

If you encounter issues:

1. Check browser console for errors
2. Verify that you have granted microphone permissions
3. Ensure your Azure Speech service key and region are correctly set
4. Try refreshing the page to reset the speech worker

## Next Steps

- Add more robust error recovery mechanisms
- Implement proper pronunciation assessment using Azure's pronunciation assessment API
- Add support for more languages
- Optimize worker message passing for better performance 