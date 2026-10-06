import { useRef, type ChangeEvent } from 'react';
import { AudioVisualizer } from '../../components/AudioVisualizer';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { formatDecibels } from '../../audio/signalMetrics';
import type { SignalState } from '../../audio/types';
import { useAudioCapture } from '../../hooks/useAudioCapture';
import { relativeKeyFor } from '../../music-theory/keyDetector';

const SIGNAL_COPY: Record<SignalState, string> = {
  silent: 'Silêncio detectado',
  weak: 'Aproxime-se um pouco',
  healthy: 'Sinal saudável',
  clipping: 'Sinal muito alto',
};

export function ListeningPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { phase, session, metrics, message, detection, readingQuality, hasReliableDetection, startMicrophone, startFile, stop } = useAudioCapture();
  const isLive = phase === 'listening';
  const isBusy = phase === 'requesting-permission' || phase === 'processing';
  const isComplete = phase === 'complete';

  const selectFile = () => fileInputRef.current?.click();
  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void startFile(file);
    event.target.value = '';
  };

  const isError = phase === 'error';
  const header = isLive ? (session?.source === 'file' ? 'ARQUIVO EM LEITURA' : 'OUVINDO AGORA') : isBusy ? 'PREPARANDO ÁUDIO' : isComplete ? 'LEITURA CONCLUÍDA' : isError ? 'PRECISAMOS DE ATENÇÃO' : 'PRONTO PARA OUVIR';
  const relativeKey = detection ? relativeKeyFor(detection) : null;

  return (
    <>
      <div className={`signal-card signal-card--${phase}`}>
        <div className="signal-card__glow" aria-hidden="true" />
        <div className="signal-card__topline">
          <span className={`live-dot ${isLive ? 'is-live' : ''}`} aria-hidden="true" />
          <span>{header}</span>
          <span className="signal-card__line" aria-hidden="true" />
          <span>{session?.source === 'file' ? 'FILE' : isComplete ? 'LOCAL' : 'MIC'}</span>
        </div>

        {isLive ? (
          <div className="listening-readout">
            <div className="listening-readout__visual">
              <AudioVisualizer analyser={session?.analyser ?? null} active={isLive} />
              <span className="listening-readout__source"><Icon name={session?.source === 'file' ? 'upload' : 'mic'} size={17} /></span>
            </div>
            <div className="signal-metrics">
              <div><span>NÍVEL</span><strong>{formatDecibels(metrics.decibels)}</strong></div>
              <div><span>QUALIDADE</span><strong className={`signal-state signal-state--${metrics.state}`}>{SIGNAL_COPY[metrics.state]}</strong></div>
            </div>
          </div>
        ) : isComplete && hasReliableDetection && detection ? (
          <div className="key-wheel" aria-label={`Tom identificado: ${detection.label}`}>
            <span className="key-wheel__label">TOM</span>
            <strong>{detection.tonicName}</strong>
            <small>{detection.mode === 'major' ? 'MAIOR' : 'MENOR'}</small>
          </div>
        ) : (
          <div className="signal-orbit" aria-hidden="true">
            <span className="signal-orbit__ring signal-orbit__ring--one" />
            <span className="signal-orbit__ring signal-orbit__ring--two" />
            <span className="signal-orbit__core"><Icon name={isError ? 'shield' : isComplete ? 'spark' : 'mic'} size={25} /></span>
            {isBusy ? <span className="signal-orbit__pulse" /> : null}
          </div>
        )}
        <p>{message}</p>
        {isLive && session?.label ? <small className="file-name">{session.label}</small> : null}
      </div>

      {isComplete ? (
        <section className={`key-result ${hasReliableDetection ? 'key-result--reliable' : 'key-result--inconclusive'}`} aria-live="polite" aria-label="Resultado da análise tonal">
          <div className="key-result__eyebrow"><Icon name={hasReliableDetection ? 'spark' : 'shield'} size={15} /> {hasReliableDetection ? 'TONALIDADE ENCONTRADA' : 'RESULTADO INCONCLUSIVO'}</div>
          {hasReliableDetection && detection ? (
            <>
              <div className="key-result__details">
                <div><span>{relativeKey?.relation}</span><strong>{relativeKey?.label}</strong></div>
                <div><span>CONFIANÇA DA LEITURA</span><strong>{Math.round(readingQuality.score * 100)}%</strong></div>
              </div>
              <div className="quality-bar" aria-label={`Confiança da leitura: ${Math.round(readingQuality.score * 100)}%`}><span style={{ width: `${Math.round(readingQuality.score * 100)}%` }} /></div>
              <p>{readingQuality.summary} A evidência tonal tem mais peso que o volume do áudio nesta porcentagem.</p>
              <small>Hipóteses próximas: {detection.alternatives.slice(0, 2).map((alternative) => alternative.label).join(' · ')}</small>
            </>
          ) : (
            <p>Não vamos adivinhar: toque ou envie um trecho com alguns acordes e menos ruído para chegar a uma tonalidade confiável.</p>
          )}
        </section>
      ) : null}

      <input ref={fileInputRef} className="sr-only" type="file" accept="audio/*,.wav,.mp3,.m4a,.aac,.ogg,.flac" onChange={handleFile} />
      <div className="hero__actions">
        {isLive ? (
          <Button variant="primary" icon="stop" onClick={() => void stop()}>PARAR ESCUTA</Button>
        ) : (
          <Button variant="primary" icon="mic" disabled={isBusy} onClick={() => void startMicrophone()}>{isError || isComplete ? 'OUVIR NOVAMENTE' : 'OUVIR AGORA'}</Button>
        )}
        <Button variant="secondary" icon="upload" disabled={isBusy || isLive} onClick={selectFile}>Enviar áudio</Button>
      </div>
      <p className="hero__privacy"><Icon name="shield" size={14} /> O áudio é processado apenas neste dispositivo.</p>
    </>
  );
}
