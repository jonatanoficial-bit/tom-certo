import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  active: boolean;
}

export function AudioVisualizer({ analyser, active }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser || !active) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const samples = new Uint8Array(analyser.fftSize);
    let animationFrame = 0;

    const render = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(bounds.width * ratio));
      const height = Math.max(1, Math.floor(bounds.height * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      analyser.getByteTimeDomainData(samples);
      context.clearRect(0, 0, width, height);
      const gradient = context.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, 'rgba(142, 234, 203, .16)');
      gradient.addColorStop(.5, 'rgba(245, 198, 79, 1)');
      gradient.addColorStop(1, 'rgba(142, 234, 203, .16)');
      context.strokeStyle = gradient;
      context.lineWidth = Math.max(2, 2 * ratio);
      context.lineCap = 'round';
      context.beginPath();
      samples.forEach((sample, index) => {
        const x = (index / (samples.length - 1)) * width;
        const y = ((sample - 128) / 128) * height * .42 + height / 2;
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.stroke();
      animationFrame = window.requestAnimationFrame(render);
    };

    animationFrame = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [active, analyser]);

  return <canvas ref={canvasRef} className="audio-visualizer" aria-label="Visualização do áudio ao vivo" />;
}
