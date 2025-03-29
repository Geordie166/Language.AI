// Speech service implementation using Azure Speech SDK via Web Worker
import SpeechWorker from './speech.worker';

export class SpeechService {
  private worker: Worker | null = null;
  private interimResultCallback: ((text: string) => void) | null = null;
  private finalResultCallback: ((text: string) => void) | null = null;
  private apiKey: string;
  private region: string;
  private isInitialized: boolean = false;
  private initializePromise: Promise<void> | null = null;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY || '';
    this.region = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION || '';

    if (!this.apiKey || !this.region) {
      throw new Error('Azure Speech credentials not configured');
    }
  }

  private async ensureInitialized() {
    if (this.isInitialized) {
      return;
    }

    if (!this.initializePromise) {
      this.initializePromise = new Promise((resolve, reject) => {
        try {
          // Create the web worker
          const worker = new SpeechWorker();
          this.worker = worker;
          
          // Set up message handling
          worker.addEventListener('message', this.handleWorkerMessage);
          
          // Set up initialization timeout
          const timeoutId = setTimeout(() => {
            reject(new Error('Speech service initialization timed out'));
          }, 10000);

          // One-time initialization handler
          const initHandler = (event: MessageEvent) => {
            const { type, payload } = event.data;
            if (type === 'initialized') {
              clearTimeout(timeoutId);
              worker.removeEventListener('message', initHandler);
              this.isInitialized = true;
              resolve();
            } else if (type === 'error') {
              clearTimeout(timeoutId);
              worker.removeEventListener('message', initHandler);
              reject(new Error(payload));
            }
          };
          
          worker.addEventListener('message', initHandler);
          
          // Initialize the worker
          worker.postMessage({
            type: 'init',
            payload: {
              apiKey: this.apiKey,
              region: this.region
            }
          });
        } catch (error) {
          reject(error);
        }
      });
    }

    await this.initializePromise;
  }

  private handleWorkerMessage = (event: MessageEvent) => {
    const { type, payload } = event.data;
    
    switch (type) {
      case 'interimResult':
        if (this.interimResultCallback) {
          this.interimResultCallback(payload);
        }
        break;
      case 'finalResult':
        if (this.finalResultCallback) {
          this.finalResultCallback(payload);
        }
        break;
      case 'error':
        console.error('Speech worker error:', payload);
        // If the error indicates a connection issue, try to reinitialize
        if (payload.includes('connection') || payload.includes('WebSocket')) {
          this.isInitialized = false;
          this.initializePromise = null;
        }
        break;
    }
  };

  async startListening(
    onInterimResult: (text: string) => void,
    onFinalResult: (text: string) => void
  ): Promise<void> {
    await this.ensureInitialized();

    this.interimResultCallback = onInterimResult;
    this.finalResultCallback = onFinalResult;
    
    this.worker?.postMessage({ type: 'startListening' });
  }

  async stopListening(): Promise<void> {
    if (!this.worker || !this.isInitialized) {
      return;
    }
    
    this.worker.postMessage({ type: 'stopListening' });
  }

  async setLanguage(language: string): Promise<void> {
    await this.ensureInitialized();
    
    this.worker?.postMessage({
      type: 'setLanguage',
      payload: { language }
    });
  }

  dispose() {
    if (this.worker) {
      this.worker.postMessage({ type: 'dispose' });
      this.worker.terminate();
      this.worker = null;
    }
    this.isInitialized = false;
    this.initializePromise = null;
    this.interimResultCallback = null;
    this.finalResultCallback = null;
  }
} 