import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioCaptureController, audioErrorMessage } from '../audio/audioCaptureController';
import { measureTimeDomainSignal } from '../audio/signalMetrics';
import { EMPTY_READING_QUALITY, ReadingQualityMeter, type ReadingQuality } from '../audio/readingQuality';
import type { ActiveAudioSession, AudioCapturePhase, AudioSignalMetrics } from '../audio/types';
import { isReliableDetection, LocalKeyDetector, type KeyDetection } from '../music-theory/keyDetector';

const EMPTY_METRICS: AudioSignalMetrics = { rms: 0, peak: 0, decibels: -Infinity, state: 'silent' };

export function useAudioCapture() {
  const controllerRef = useRef(new AudioCaptureController());
  const [phase, setPhase] = useState<AudioCapturePhase>('idle');
  const [session, setSession] = useState<ActiveAudioSession | null>(null);
  const [metrics, setMetrics] = useState<AudioSignalMetrics>(EMPTY_METRICS);
  const [detection, setDetection] = useState<KeyDetection | null>(null);
  const [readingQuality, setReadingQuality] = useState<ReadingQuality>(EMPTY_READING_QUALITY);
  const [hasReliableDetection, setHasReliableDetection] = useState(false);
  const [message, setMessage] = useState('Pronto quando você estiver.');
  const stopTimerRef = useRef<number | null>(null);
  const detectorRef = useRef(new LocalKeyDetector());
  const qualityRef = useRef(new ReadingQualityMeter());

  const resetTimer = useCallback(() => {
    if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
    stopTimerRef.current = null;
  }, []);

  const finish = useCallback(async () => {
    resetTimer();
    const finalDetection = detectorRef.current.estimate();
    const finalQuality = qualityRef.current.result();
    const hasReliableResult = isReliableDetection(finalDetection, detectorRef.current.frames)
      && finalQuality.stabilityScore >= .62
      && finalQuality.score >= .54;
    await controllerRef.current.stop();
    setSession(null);
    setMetrics(EMPTY_METRICS);
    setDetection(finalDetection);
    setReadingQuality(finalQuality);
    setHasReliableDetection(hasReliableResult);
    setPhase('complete');
    setMessage(hasReliableResult
      ? 'Leitura concluída com evidência suficiente para o resultado abaixo.'
      : 'Ainda não há evidência suficiente. Tente alguns acordes ou uma parte mais clara da música.');
  }, [resetTimer]);

  const handleNaturalEnd = useCallback(() => {
    setPhase('processing');
    setMessage('Finalizando a leitura do áudio…');
    stopTimerRef.current = window.setTimeout(() => {
      void finish();
    }, 500);
  }, [finish]);

  const startMicrophone = useCallback(async () => {
    resetTimer();
    detectorRef.current.reset();
    qualityRef.current.reset();
    setDetection(null);
    setReadingQuality(EMPTY_READING_QUALITY);
    setHasReliableDetection(false);
    setPhase('requesting-permission');
    setMessage('Pedindo acesso ao microfone…');
    try {
      const activeSession = await controllerRef.current.startMicrophone(handleNaturalEnd);
      setSession(activeSession);
      setPhase('listening');
      setMessage('Cante, toque ou reproduza alguns acordes.');
    } catch (error) {
      setSession(null);
      setPhase('error');
      setMessage(audioErrorMessage(error));
    }
  }, [handleNaturalEnd, resetTimer]);

  const startFile = useCallback(async (file: File) => {
    resetTimer();
    detectorRef.current.reset();
    qualityRef.current.reset();
    setDetection(null);
    setReadingQuality(EMPTY_READING_QUALITY);
    setHasReliableDetection(false);
    setPhase('processing');
    setMessage(`Preparando ${file.name} localmente…`);
    try {
      const activeSession = await controllerRef.current.startFile(file, handleNaturalEnd);
      setSession(activeSession);
      setPhase('listening');
      setMessage('O arquivo está sendo lido neste dispositivo.');
    } catch (error) {
      setSession(null);
      setPhase('error');
      setMessage(audioErrorMessage(error));
    }
  }, [handleNaturalEnd, resetTimer]);

  useEffect(() => {
    if (!session) return;
    const samples = new Uint8Array(session.analyser.fftSize);
    const spectrum = new Float32Array(session.analyser.frequencyBinCount);
    let animationFrame = 0;
    let lastSampleAt = 0;

    const measure = (now: number) => {
      if (now - lastSampleAt > 100) {
        session.analyser.getByteTimeDomainData(samples);
        const signal = measureTimeDomainSignal(samples);
        setMetrics(signal);
        let candidate = detectorRef.current.estimate();
        if (signal.state === 'healthy' || signal.state === 'weak') {
          session.analyser.getFloatFrequencyData(spectrum);
          candidate = detectorRef.current.ingestSpectrum(spectrum, session.sampleRate, session.analyser.fftSize);
        }
        qualityRef.current.record(signal, candidate);
        setDetection(candidate);
        lastSampleAt = now;
      }
      animationFrame = window.requestAnimationFrame(measure);
    };
    animationFrame = window.requestAnimationFrame(measure);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [session]);

  useEffect(() => {
    const stopWhenHidden = () => {
      if (document.visibilityState === 'hidden' && session?.source === 'microphone') {
        void finish();
      }
    };
    document.addEventListener('visibilitychange', stopWhenHidden);
    return () => document.removeEventListener('visibilitychange', stopWhenHidden);
  }, [finish, session]);

  useEffect(() => () => {
    resetTimer();
    void controllerRef.current.stop();
  }, [resetTimer]);

  return {
    phase,
    session,
    metrics,
    message,
    detection,
    readingQuality,
    hasReliableDetection,
    startMicrophone,
    startFile,
    stop: finish,
  };
}
