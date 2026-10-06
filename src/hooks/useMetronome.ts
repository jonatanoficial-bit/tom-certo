import { useCallback, useEffect, useRef, useState } from 'react';

interface MetronomeState {
  activeBeat: number;
  error: string | null;
  isPlaying: boolean;
  start: () => Promise<void>;
  stop: () => void;
}

export function useMetronome(bpm: number, beatsPerMeasure: number): MetronomeState {
  const contextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);
  const bpmRef = useRef(bpm);
  const beatsRef = useRef(beatsPerMeasure);
  const [activeBeat, setActiveBeat] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { beatsRef.current = beatsPerMeasure; }, [beatsPerMeasure]);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
    const context = contextRef.current;
    contextRef.current = null;
    if (context && context.state !== 'closed') void context.close();
    setIsPlaying(false);
    setActiveBeat(0);
  }, []);

  const start = useCallback(async () => {
    if (intervalRef.current !== null) return;
    const Context = window.AudioContext ?? window.webkitAudioContext;
    if (!Context) {
      setError('Este navegador não oferece o áudio necessário para o metrônomo.');
      return;
    }

    try {
      const context = new Context();
      contextRef.current = context;
      await context.resume();
      setError(null);
      setIsPlaying(true);

      let nextBeatAt = context.currentTime + .06;
      let beat = 0;
      const scheduleClick = (at: number, beatNumber: number) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.frequency.value = beatNumber === 0 ? 1_280 : 880;
        oscillator.type = 'sine';
        gain.gain.setValueAtTime(.0001, at);
        gain.gain.exponentialRampToValueAtTime(.16, at + .003);
        gain.gain.exponentialRampToValueAtTime(.0001, at + .045);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(at);
        oscillator.stop(at + .055);
        window.setTimeout(() => setActiveBeat(beatNumber), Math.max(0, (at - context.currentTime) * 1_000));
      };
      const scheduler = () => {
        while (nextBeatAt < context.currentTime + .12) {
          scheduleClick(nextBeatAt, beat);
          nextBeatAt += 60 / bpmRef.current;
          beat = (beat + 1) % beatsRef.current;
        }
      };
      scheduler();
      intervalRef.current = window.setInterval(scheduler, 25);
    } catch {
      stop();
      setError('Não foi possível iniciar o metrônomo neste dispositivo.');
    }
  }, [stop]);

  useEffect(() => stop, [stop]);
  return { activeBeat, error, isPlaying, start, stop };
}
