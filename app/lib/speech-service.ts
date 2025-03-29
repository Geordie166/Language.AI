// Speech service implementation using Azure Speech SDK via Web Worker
import type SpeechWorkerType from './speech.worker';

export interface ISpeechService {
  startListening(
    onInterimResult: (text: string) => void,
    onFinalResult: (text: string) => void
  ): Promise<void>;
  stopListening(): Promise<void>;
  speak(text: string): Promise<void>;
  stopSpeaking(): Promise<void>;
  setLanguage(language: string): Promise<void>;
  dispose(): void;
}

type WorkerMessage = {
  type: string;
  payload: any;
};

export class SpeechService implements ISpeechService {
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
          if (typeof Worker !== 'undefined') {
            // Dynamic import for the worker
            this.worker = new Worker(new URL('./speech.worker.ts', import.meta.url));
            
            // Set up message handling
            this.worker.addEventListener('message', this.handleWorkerMessage);
            
            // Set up initialization timeout
            const timeoutId = setTimeout(() => {
              reject(new Error('Speech service initialization timed out'));
            }, 10000);

            // One-time initialization handler
            const initHandler = (event: MessageEvent<WorkerMessage>) => {
              const { type, payload } = event.data;
              if (type === 'initialized') {
                clearTimeout(timeoutId);
                this.worker?.removeEventListener('message', initHandler);
                this.isInitialized = true;
                resolve();
              } else if (type === 'error') {
                clearTimeout(timeoutId);
                this.worker?.removeEventListener('message', initHandler);
                reject(new Error(payload));
              }
            };
            
            this.worker.addEventListener('message', initHandler);
            
            // Initialize the worker
            this.worker.postMessage({
              type: 'init',
              payload: {
                apiKey: this.apiKey,
                region: this.region
              }
            });
          } else {
            reject(new Error('Web Workers are not supported in this environment'));
          }
        } catch (error) {
          reject(error);
        }
      });
    }

    await this.initializePromise;
  }

  private handleWorkerMessage = (event: MessageEvent<WorkerMessage>) => {
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

  public async startListening(
    onInterimResult: (text: string) => void,
    onFinalResult: (text: string) => void
  ): Promise<void> {
    await this.ensureInitialized();

    this.interimResultCallback = onInterimResult;
    this.finalResultCallback = onFinalResult;
    
    this.worker?.postMessage({ type: 'startListening' });
  }

  public async stopListening(): Promise<void> {
    if (!this.worker || !this.isInitialized) {
      return;
    }
    
    this.worker.postMessage({ type: 'stopListening' });
  }

  public async speak(text: string): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise<void>((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Speech service not initialized'));
        return;
      }

      const handler = (event: MessageEvent<WorkerMessage>) => {
        const { type, payload } = event.data;
        if (type === 'synthesisComplete' || type === 'speakingStopped') {
          this.worker?.removeEventListener('message', handler);
          resolve();
        } else if (type === 'error') {
          this.worker?.removeEventListener('message', handler);
          reject(new Error(payload));
        }
      };

      this.worker.addEventListener('message', handler);
      this.worker.postMessage({
        type: 'speak',
        payload: { text }
      });
    });
  }

  public async stopSpeaking(): Promise<void> {
    if (!this.worker || !this.isInitialized) {
      return;
    }
    
    const worker = this.worker;
    return new Promise<void>((resolve, reject) => {
      const handler = (event: MessageEvent<WorkerMessage>) => {
        const { type, payload } = event.data;
        if (type === 'speakingStopped') {
          worker.removeEventListener('message', handler);
          resolve();
        } else if (type === 'error') {
          worker.removeEventListener('message', handler);
          reject(new Error(payload));
        }
      };

      worker.addEventListener('message', handler);
      worker.postMessage({ type: 'stopSpeaking' });
    });
  }

  public async setLanguage(language: string): Promise<void> {
    await this.ensureInitialized();
    
    this.worker?.postMessage({
      type: 'setLanguage',
      payload: { language }
    });
  }

  public dispose(): void {
    if (this.worker) {
      this.worker.postMessage({ type: 'dispose' });
      this.worker.terminate();
      this.worker = null;
    }
    this.isInitialized = false;
    this.initializePromise = null;
  }
} 