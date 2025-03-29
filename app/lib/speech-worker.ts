// This file will be used as a web worker to handle speech processing
// Web workers run in a separate thread to prevent UI freezing

// Define message types for communication with the main thread
type WorkerMessageType = 
  | 'init'
  | 'speak'
  | 'startListening'
  | 'stopListening'
  | 'pauseListening'
  | 'resumeListening'
  | 'setLanguage'
  | 'setMuted';

interface WorkerMessage {
  type: WorkerMessageType;
  payload?: any;
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
  const message: WorkerMessage = event.data;
  
  try {
    switch (message.type) {
      case 'init':
        self.postMessage({ 
          type: 'log', 
          payload: 'Worker initialized' 
        });
        break;
        
      default:
        self.postMessage({ 
          type: 'error', 
          payload: `Unknown message type: ${message.type}` 
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