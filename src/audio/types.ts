export type AudioSourceKind = 'microphone' | 'file';

export type SignalState = 'silent' | 'weak' | 'healthy' | 'clipping';

export interface AudioSignalMetrics {
  rms: number;
  peak: number;
  decibels: number;
  state: SignalState;
}

export interface ActiveAudioSession {
  analyser: AnalyserNode;
  source: AudioSourceKind;
  sampleRate: number;
  label?: string;
  stop: () => void;
}

export type AudioCapturePhase = 'idle' | 'requesting-permission' | 'listening' | 'processing' | 'complete' | 'error';
