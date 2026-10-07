import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioCaptureController, audioErrorMessage } from '../audio/audioCaptureController';
import { CAPTURE_WINDOW_MS, captureProgressFor, hasEnoughCaptureTime } from '../audio/capturePolicy';
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
  const [captureElapsedMs, setCaptureElapsedMs] = useState(0);
  const stopTimerRef = useRef<number | null>(null);
  const captureTimerRef = useRef<number | null>(null);
  const captureStartedAtRef = useRef<number | null>(null);
  const captureElapsedRef = useRef(0);
  const detectorRef = useRef(new LocalKeyDetector());
  const qualityRef = useRef(new ReadingQualityMeter());

  const resetTimer = useCallback(() => {
    if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
    stopTimerRef.current = null;
  }, []);

  const resetCaptureWindow = useCallback(() => {
    if (captureTimerRef.current) window.clearTimeout(captureTimerRef.current);
    captureTimerRef.current = null;
    captureStartedAtRef.current = null;
  }, []);

  const finish = useCallback(async () => {
    resetTimer();
    const elapsedMs = captureStartedAtRef.current === null
      ? captureElapsedRef.current
      : Math.min(CAPTURE_WINDOW_MS, performance.now() - captureStartedAtRef.current);
    captureElapsedRef.current = elapsedMs;
    setCaptureElapsedMs(elapsedMs);
    resetCaptureWindow();
    const finalDetection = detectorRef.current.estimate();
    const finalQuality = qualityRef.current.result();
    const hasEnoughTime = hasEnoughCaptureTime(elapsedMs);
    const hasReliableResult = isReliableDetection(finalDetection, detectorRef.current.frames)
      && finalQuality.stabilityScore >= .62
      && finalQuality.score >= .54
      && hasEnoughTime;
    await controllerRef.current.stop();
    setSession(null);
    setMetrics(EMPTY_METRICS);
    setDetection(finalDetection);
    setReadingQuality(finalQuality);
    setHasReliableDetection(hasReliableResult);
    setPhase('complete');
    setMessage(hasReliableResult
      ? 'Leitura concluída com evidência suficiente para o resultado abaixo.'
      : !hasEnoughTime
        ? 'Trecho curto demais para concluir. Faça uma captura de pelo menos 8 segundos, de preferência 15 segundos.'
        : 'Ainda não há evidência tonal suficiente. Tente um trecho com harmonia clara e menos ruído.');
  }, [resetCaptureWindow, resetTimer]);

  const beginCaptureWindow = useCallback(() => {
    captureStartedAtRef.current = performance.now();
    captureElapsedRef.current = 0;
    setCaptureElapsedMs(0);
    captureTimerRef.current = window.setTimeout(() => {
      void finish();
    }, CAPTURE_WINDOW_MS);
  }, [finish]);

  const handleNaturalEnd = useCallback(() => {
    setPhase('processing');
    setMessage('Finalizando a leitura do áudio…');
    stopTimerRef.current = window.setTimeout(() => {
      void finish();
    }, 500);
  }, [finish]);

  const startMicrophone = useCallback(async () => {
    resetTimer();
    resetCaptureWindow();
    detectorRef.current.reset();
    qualityRef.current.reset();
    setDetection(null);
    setReadingQuality(EMPTY_READING_QUALITY);
    setHasReliableDetection(false);
    setPhase('requesting-permission');
    setMessage('Pedindo acesso ao microfone…');
    try {
      const activeSession = await controllerRef.current.startMicrophone(handleNaturalEnd, 4096);
      setSession(activeSession);
      setPhase('listening');
      beginCaptureWindow();
      setMessage('Capture um trecho de até 15 segundos. Continue até a leitura terminar automaticamente.');
    } catch (error) {
      setSession(null);
      setPhase('error');
      setMessage(audioErrorMessage(error));
    }
  }, [beginCaptureWindow, handleNaturalEnd, resetCaptureWindow, resetTimer]);

  const startFile = useCallback(async (file: File) => {
    resetTimer();
    resetCaptureWindow();
    detectorRef.current.reset();
    qualityRef.current.reset();
    setDetection(null);
    setReadingQuality(EMPTY_READING_QUALITY);
    setHasReliableDetection(false);
    setPhase('processing');
    setMessage(`Preparando ${file.name} localmente…`);
    try {
      const activeSession = await controllerRef.current.startFile(file, handleNaturalEnd, 4096);
      setSession(activeSession);
      setPhase('listening');
      beginCaptureWindow();
      setMessage('O arquivo está sendo lido neste dispositivo por até 15 segundos.');
    } catch (error) {
      setSession(null);
      setPhase('error');
      setMessage(audioErrorMessage(error));
    }
  }, [beginCaptureWindow, handleNaturalEnd, resetCaptureWindow, resetTimer]);

  useEffect(() => {
    if (!session) return;
    const samples = new Uint8Array(session.analyser.fftSize);
    const spectrum = new Float32Array(session.analyser.frequencyBinCount);
    let animationFrame = 0;
    let lastSampleAt = 0;
    let lastProgressAt = 0;

    const measure = (now: number) => {
      if (captureStartedAtRef.current !== null && now - lastProgressAt > 180) {
        const elapsedMs = Math.min(CAPTURE_WINDOW_MS, now - captureStartedAtRef.current);
        captureElapsedRef.current = elapsedMs;
        setCaptureElapsedMs(elapsedMs);
        lastProgressAt = now;
      }
      if (now - lastSampleAt > 100) {
        session.analyser.getByteTimeDomainData(samples);
        const signal = measureTimeDomainSignal(samples);
        setMetrics(signal);
        let candidate = detectorRef.current.estimate();
        // The detector has its own adaptive spectral floor. Running it for a
        // quiet frame lets low-gain microphones contribute musical peaks while
        // a truly silent frame still contributes no tonal evidence.
        if (signal.state !== 'clipping') {
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
    resetCaptureWindow();
    void controllerRef.current.stop();
  }, [resetCaptureWindow, resetTimer]);

  return {
    phase,
    session,
    metrics,
    message,
    detection,
    readingQuality,
    hasReliableDetection,
    captureElapsedMs,
    captureProgress: captureProgressFor(captureElapsedMs),
    captureWindowSeconds: CAPTURE_WINDOW_MS / 1_000,
    startMicrophone,
    startFile,
    stop: finish,
  };
}
