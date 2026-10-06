import { createAnalyser, createAudioContext } from './audioContext';
import type { ActiveAudioSession } from './types';

export function audioErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
      return 'Não conseguimos acessar o microfone. Permita o uso do microfone e tente novamente.';
    }
    if (error.name === 'NotFoundError') return 'Nenhum microfone foi encontrado neste dispositivo.';
    if (error.name === 'NotReadableError') return 'O microfone está sendo usado por outro aplicativo.';
    if (error.name === 'AbortError') return 'A captura de áudio foi interrompida. Tente novamente.';
  }

  return 'Não foi possível preparar este áudio. Tente outro arquivo ou verifique o microfone.';
}

export class AudioCaptureController {
  private active: ActiveAudioSession | null = null;
  private context: AudioContext | null = null;

  async startMicrophone(onEnded: () => void, analyserFftSize = 2048): Promise<ActiveAudioSession> {
    await this.stop();
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Microphone capture is not supported by this browser.');
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
      video: false,
    });

    let context: AudioContext | null = null;
    try {
      context = createAudioContext();
      await context.resume();
      const sourceNode = context.createMediaStreamSource(stream);
      const analyser = createAnalyser(context, analyserFftSize);
      const mutedOutput = context.createGain();
      mutedOutput.gain.value = 0;
      sourceNode.connect(analyser);
      analyser.connect(mutedOutput);
      mutedOutput.connect(context.destination);
      let stopped = false;
      const handleEnded = () => {
        if (!stopped) onEnded();
      };

      const session: ActiveAudioSession = {
        analyser,
        source: 'microphone',
        sampleRate: context.sampleRate,
        stop: () => {
          stopped = true;
          stream.getAudioTracks().forEach((track) => track.removeEventListener('ended', handleEnded));
          stream.getTracks().forEach((track) => track.stop());
          sourceNode.disconnect();
          analyser.disconnect();
          mutedOutput.disconnect();
        },
      };

      stream.getAudioTracks().forEach((track) => {
        track.addEventListener('ended', handleEnded, { once: true });
      });

      this.context = context;
      this.active = session;
      return session;
    } catch (error) {
      stream.getTracks().forEach((track) => track.stop());
      if (context && context.state !== 'closed') await context.close();
      throw error;
    }
  }

  async startFile(file: File, onEnded: () => void, analyserFftSize = 2048): Promise<ActiveAudioSession> {
    await this.stop();
    const context = createAudioContext();
    try {
      const audioBuffer = await context.decodeAudioData(await file.arrayBuffer());
      const sourceNode = context.createBufferSource();
      const analyser = createAnalyser(context, analyserFftSize);
      const mutedOutput = context.createGain();
      mutedOutput.gain.value = 0;

      sourceNode.buffer = audioBuffer;
      sourceNode.connect(analyser);
      analyser.connect(mutedOutput);
      mutedOutput.connect(context.destination);
      let stopped = false;
      const handleEnded = () => {
        if (!stopped) onEnded();
      };
      sourceNode.addEventListener('ended', handleEnded, { once: true });
      await context.resume();
      sourceNode.start();

      const session: ActiveAudioSession = {
        analyser,
        source: 'file',
        sampleRate: context.sampleRate,
        label: file.name,
        stop: () => {
          stopped = true;
          sourceNode.removeEventListener('ended', handleEnded);
          try {
            sourceNode.stop();
          } catch {
            // The node may already have naturally finished.
          }
          sourceNode.disconnect();
          analyser.disconnect();
          mutedOutput.disconnect();
        },
      };

      this.context = context;
      this.active = session;
      return session;
    } catch (error) {
      if (context.state !== 'closed') await context.close();
      throw error;
    }
  }

  async stop(): Promise<void> {
    const active = this.active;
    const context = this.context;
    this.active = null;
    this.context = null;
    active?.stop();
    if (context && context.state !== 'closed') await context.close();
  }
}
