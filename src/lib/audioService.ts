import * as Tone from 'tone';

export type Effect = 'none' | 'chipmunk' | 'monster' | 'echo';

export interface Recording {
  id: string;
  blob: Blob;
  color: string;
}

const RECORDING_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
];

let colorIndex = 0;

function getNextColor(): string {
  const color = RECORDING_COLORS[colorIndex % RECORDING_COLORS.length];
  colorIndex++;
  return color;
}

class AudioService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private player: Tone.Player | null = null;
  private analyser: AnalyserNode | null = null;
  private recordingTimeout: ReturnType<typeof setTimeout> | null = null;
  private onRecordingComplete: ((recording: Recording) => void) | null = null;
  private isRecording = false;

  async requestMicPermission(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (err) {
      console.error('Microphone permission denied:', err);
      return false;
    }
  }

  async startRecording(onComplete: (recording: Recording) => void, maxDuration = 15000): Promise<boolean> {
    if (this.isRecording) return false;

    // Ensure we have mic permission
    if (!this.stream) {
      const hasPermission = await this.requestMicPermission();
      if (!hasPermission) return false;
    }

    // Start Tone.js context (required for audio playback later)
    await Tone.start();

    this.onRecordingComplete = onComplete;
    this.audioChunks = [];
    this.isRecording = true;

    this.mediaRecorder = new MediaRecorder(this.stream!);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
      const recording: Recording = {
        id: Date.now().toString(),
        blob,
        color: getNextColor()
      };
      this.isRecording = false;
      this.onRecordingComplete?.(recording);
    };

    this.mediaRecorder.start();

    // Auto-stop after max duration
    this.recordingTimeout = setTimeout(() => {
      this.stopRecording();
    }, maxDuration);

    return true;
  }

  stopRecording(): void {
    if (this.recordingTimeout) {
      clearTimeout(this.recordingTimeout);
      this.recordingTimeout = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    this.isRecording = false;
  }

  async playWithEffect(recording: Recording, effect: Effect): Promise<void> {
    // Stop any currently playing audio
    this.stopPlayback();

    await Tone.start();

    // Convert blob to array buffer then to Tone.js buffer
    const arrayBuffer = await recording.blob.arrayBuffer();
    const audioBuffer = await Tone.getContext().decodeAudioData(arrayBuffer);

    // Create player
    this.player = new Tone.Player(audioBuffer);

    // Set up analyser for visualization
    this.analyser = Tone.getContext().createAnalyser();
    this.analyser.fftSize = 256;

    // Apply effect chain
    switch (effect) {
      case 'chipmunk': {
        const pitchShift = new Tone.PitchShift(8);
        this.player.playbackRate = 1.3;
        this.player.connect(pitchShift);
        pitchShift.connect(this.analyser);
        const gain = new Tone.Gain(1).toDestination();
        Tone.connect(this.analyser, gain);
        break;
      }
      case 'monster': {
        const pitchShift = new Tone.PitchShift(-8);
        this.player.playbackRate = 0.8;
        this.player.connect(pitchShift);
        pitchShift.connect(this.analyser);
        const gain = new Tone.Gain(1).toDestination();
        Tone.connect(this.analyser, gain);
        break;
      }
      case 'echo': {
        const delay = new Tone.FeedbackDelay('8n', 0.5);
        delay.wet.value = 0.4; // Mix 40% wet, 60% dry to keep original volume
        const reverb = new Tone.Reverb(1);
        reverb.wet.value = 0.3; // Subtle reverb
        this.player.connect(delay);
        delay.connect(reverb);
        reverb.connect(this.analyser);
        const gain = new Tone.Gain(2).toDestination(); // Boost volume
        Tone.connect(this.analyser, gain);
        break;
      }
      default: {
        // No effect
        this.player.connect(this.analyser);
        const gain = new Tone.Gain(1).toDestination();
        Tone.connect(this.analyser, gain);
        break;
      }
    }

    this.player.start();
  }

  stopPlayback(): void {
    if (this.player) {
      this.player.stop();
      this.player.dispose();
      this.player = null;
    }
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  getRecordingStream(): MediaStream | null {
    return this.stream;
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  isCurrentlyPlaying(): boolean {
    return this.player !== null && this.player.state === 'started';
  }

  // Create an analyser for recording visualization
  createRecordingAnalyser(): AnalyserNode | null {
    if (!this.stream) return null;

    const audioContext = Tone.getContext().rawContext as AudioContext;
    const source = audioContext.createMediaStreamSource(this.stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    return analyser;
  }
}

export const audioService = new AudioService();
