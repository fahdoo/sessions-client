export interface RecordingOptions {
  videoBitsPerSecond?: number;
  mimeType?: string;
}

export class AudiogramRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private canvas: HTMLCanvasElement;
  private audio: HTMLAudioElement;
  private sessionId: string;

  constructor(canvas: HTMLCanvasElement, audio: HTMLAudioElement, sessionId: string) {
    this.canvas = canvas;
    this.audio = audio;
    this.sessionId = sessionId;
  }

  async startRecording(options: RecordingOptions = {}) {
    if (!this.canvas || !this.audio) {
      throw new Error('Canvas and audio elements are required for recording');
    }

    try {
      this.audio.currentTime = 0;
      const stream = this.canvas.captureStream(30);
      
      // Capture audio stream
      const audioStream = new MediaStream();
      const audioTracks = (this.audio as any).captureStream?.().getAudioTracks();
      if (audioTracks?.length) {
        audioStream.addTrack(audioTracks[0]);
        stream.addTrack(audioStream.getAudioTracks()[0]);
      }

      // Create MediaRecorder with options
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: options.mimeType || 'video/webm;codecs=vp9',
        videoBitsPerSecond: options.videoBitsPerSecond || 5000000
      });

      this.chunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.saveRecording();
      };

      this.mediaRecorder.start(1000);
      this.audio.play();

      return true;
    } catch (err) {
      console.error('Error starting recording:', err);
      throw new Error('Failed to start recording. Make sure you have granted necessary permissions.');
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      if (this.audio) {
        this.audio.pause();
      }
      return true;
    }
    return false;
  }

  private saveRecording() {
    const blob = new Blob(this.chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `audiogram-${this.sessionId}.webm`;
    a.click();
    
    URL.revokeObjectURL(url);
    this.chunks = [];
  }

  isRecording() {
    return this.mediaRecorder?.state === 'recording';
  }

  cleanup() {
    if (this.mediaRecorder) {
      if (this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();
      }
      this.mediaRecorder = null;
    }
    this.chunks = [];
  }
} 