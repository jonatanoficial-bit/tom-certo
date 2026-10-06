declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export function createAudioContext(): AudioContext {
  const Context = window.AudioContext ?? window.webkitAudioContext;
  if (!Context) throw new Error('Seu navegador não oferece os recursos de áudio necessários.');
  return new Context();
}

export function createAnalyser(context: AudioContext, fftSize = 2048): AnalyserNode {
  const analyser = context.createAnalyser();
  analyser.fftSize = fftSize;
  analyser.smoothingTimeConstant = 0.72;
  analyser.minDecibels = -92;
  analyser.maxDecibels = -12;
  return analyser;
}
