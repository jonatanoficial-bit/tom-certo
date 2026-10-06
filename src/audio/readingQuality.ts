import type { AudioSignalMetrics } from './types';
import type { KeyDetection } from '../music-theory/keyDetector';

export interface ReadingQuality {
  score: number;
  signalScore: number;
  stabilityScore: number;
  frameCount: number;
  summary: string;
}

export const EMPTY_READING_QUALITY: ReadingQuality = {
  score: 0,
  signalScore: 0,
  stabilityScore: 0,
  frameCount: 0,
  summary: 'Ainda não há áudio suficiente para avaliar a leitura.',
};

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Measures this audio reading, not an assumed accuracy for the application. */
export class ReadingQualityMeter {
  private frames = 0;
  private weightedSignal = 0;
  private readonly candidates = new Map<string, number>();

  reset(): void {
    this.frames = 0;
    this.weightedSignal = 0;
    this.candidates.clear();
  }

  record(signal: AudioSignalMetrics, detection: KeyDetection | null): void {
    this.frames += 1;
    const signalWeight = {
      healthy: 1,
      weak: .62,
      silent: .08,
      clipping: .14,
    }[signal.state];
    this.weightedSignal += signalWeight;

    if ((signal.state === 'healthy' || signal.state === 'weak') && detection && detection.confidence >= .2) {
      this.candidates.set(detection.label, (this.candidates.get(detection.label) ?? 0) + 1);
    }
  }

  result(): ReadingQuality {
    if (this.frames === 0) return EMPTY_READING_QUALITY;

    const signalScore = this.weightedSignal / this.frames;
    const candidateFrames = Array.from(this.candidates.values()).reduce((sum, value) => sum + value, 0);
    const leadingCandidate = Math.max(0, ...this.candidates.values());
    const stabilityScore = candidateFrames === 0 ? 0 : (leadingCandidate / candidateFrames) * (candidateFrames / this.frames);
    const coverage = Math.min(1, this.frames / 12);
    const score = clamp((signalScore * .28 + stabilityScore * .72) * coverage);
    const summary = signalScore < .58
      ? 'O sinal teve trechos fracos, silenciosos ou saturados.'
      : stabilityScore < .65
        ? 'As evidências tonais variaram bastante ao longo da leitura.'
        : 'Sinal e evidências tonais permaneceram estáveis nesta leitura.';

    return { score, signalScore, stabilityScore, frameCount: this.frames, summary };
  }
}
