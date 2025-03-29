// Speech service implementation using OpenAI API
import OpenAI from 'openai';

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

export class SpeechService implements ISpeechService {
  private openai: OpenAI;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private currentLanguage = 'english';
  private audioContext: AudioContext | null = null;
  private audioSource: AudioBufferSourceNode | null = null;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    this.openai = new OpenAI({ apiKey });
  }

  public async startListening(
    onInterimResult: (text: string) => void,
    onFinalResult: (text: string) => void
  ): Promise<void> {
    if (this.isRecording) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      this.audioChunks = [];
      this.isRecording = true;

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        try {
          const transcription = await this.transcribeAudio(audioBlob);
          onFinalResult(transcription);
        } catch (error) {
          console.error('Transcription error:', error);
          throw error;
        }
      };

      this.mediaRecorder.start(1000); // Collect data in 1-second chunks
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  public async stopListening(): Promise<void> {
    if (!this.isRecording || !this.mediaRecorder) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.mediaRecorder!.onstop = () => {
          this.isRecording = false;
          const tracks = this.mediaRecorder?.stream.getTracks();
          tracks?.forEach(track => track.stop());
          resolve();
        };
        this.mediaRecorder!.stop();
      } catch (error) {
        reject(error);
      }
    });
  }

  public async speak(text: string): Promise<void> {
    try {
      const response = await this.openai.audio.speech.create({
        model: "tts-1",
        voice: this.currentLanguage === 'english' ? "alloy" : "nova",
        input: text,
      });

      const arrayBuffer = await response.arrayBuffer();
      await this.playAudio(arrayBuffer);
    } catch (error) {
      console.error('Text-to-speech error:', error);
      throw error;
    }
  }

  public async stopSpeaking(): Promise<void> {
    if (this.audioSource) {
      this.audioSource.stop();
      this.audioSource = null;
    }
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
  }

  public async setLanguage(language: string): Promise<void> {
    this.currentLanguage = language.toLowerCase();
  }

  public dispose(): void {
    this.stopListening();
    this.stopSpeaking();
  }

  private async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      // Convert Blob to File object
      const audioFile = new File([audioBlob], 'audio.webm', { 
        type: 'audio/webm',
        lastModified: Date.now()
      });

      const response = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        language: this.currentLanguage === 'english' ? 'en' : 'es',
      });

      return response.text;
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }

  private async playAudio(arrayBuffer: ArrayBuffer): Promise<void> {
    if (this.audioContext) {
      await this.audioContext.close();
    }

    this.audioContext = new AudioContext();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.audioSource = this.audioContext.createBufferSource();
    this.audioSource.buffer = audioBuffer;
    this.audioSource.connect(this.audioContext.destination);
    this.audioSource.start(0);

    return new Promise((resolve) => {
      this.audioSource!.onended = () => {
        resolve();
      };
    });
  }
} 