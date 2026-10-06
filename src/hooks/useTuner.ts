import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioCaptureController, audioErrorMessage } from '../audio/audioCaptureController';
import { estimatePitch, tunerReadingFor, type TunerReading } from '../audio/pitchDetector';
import type { ActiveAudioSession } from '../audio/types';

export type TunerPhase = 'idle' | 'requesting-permission' | 'listening' | 'error';

export function useTuner() {
  const controllerRef = useRef(new AudioCaptureController());
  const [phase, setPhase] = useState<TunerPhase>('idle');
  const [reading, setReading] = useState<TunerReading | null>(null);
  const [message, setMessage] = useState('Ative o microfone e toque uma nota por vez.');
  const sessionRef = useRef<ActiveAudioSession | null>(null);
  const frequencyHistoryRef = useRef<number[]>([]);

  const stop = useCallback(async () => {
    await controllerRef.current.stop();
    sessionRef.current = null;
    frequencyHistoryRef.current = [];
    setPhase('idle');
    setReading(null);
    setMessage('Afinador pausado. Nenhum áudio é gravado ou enviado.');
  }, []);

  const start = useCallback(async () => {
    setPhase('requesting-permission');
    setReading(null);
    frequencyHistoryRef.current = [];
    setMessage('Pedindo acesso ao microfone…');
    try {
      const session = await controllerRef.current.startMicrophone(() => { void stop(); }, 4096);
      sessionRef.current = session;
      setPhase('listening');
      setMessage('Ouvindo localmente. Toque uma nota sustentada.');
    } catch (error) {
      sessionRef.current = null;
      setPhase('error');
      setMessage(audioErrorMessage(error));
    }
  }, [stop]);

  useEffect(() => {
    const session = sessionRef.current;
    if (phase !== 'listening' || !session) return;

    const samples = new Float32Array(session.analyser.fftSize);
    let animationFrame = 0;
    let lastMeasuredAt = 0;

    const measure = (now: number) => {
      if (now - lastMeasuredAt >= 80) {
        session.analyser.getFloatTimeDomainData(samples);
        const pitch = estimatePitch(samples, session.sampleRate);
        if (pitch && pitch.clarity >= .72) {
          const history = [...frequencyHistoryRef.current, pitch.frequency].slice(-5).sort((left, right) => left - right);
          frequencyHistoryRef.current = history;
          const middle = history[Math.floor(history.length / 2)];
          setReading(tunerReadingFor({ ...pitch, frequency: middle }));
        } else {
          frequencyHistoryRef.current = [];
          setReading(null);
        }
        lastMeasuredAt = now;
      }
      animationFrame = window.requestAnimationFrame(measure);
    };

    animationFrame = window.requestAnimationFrame(measure);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [phase]);

  useEffect(() => {
    const stopWhenHidden = () => {
      if (document.visibilityState === 'hidden' && sessionRef.current) void stop();
    };
    document.addEventListener('visibilitychange', stopWhenHidden);
    return () => document.removeEventListener('visibilitychange', stopWhenHidden);
  }, [stop]);

  useEffect(() => () => { void controllerRef.current.stop(); }, []);

  return { phase, reading, message, start, stop };
}
