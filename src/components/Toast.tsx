import { useEffect } from 'react';
import { Icon } from './Icon';

export type ToastTone = 'neutral' | 'warm';

interface ToastProps {
  message: string;
  tone: ToastTone;
  onDismiss: () => void;
}

export function Toast({ message, tone, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 4400);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={`toast toast--${tone}`} role="status">
      <Icon name={tone === 'warm' ? 'spark' : 'clock'} size={17} />
      <p>{message}</p>
      <button type="button" onClick={onDismiss} aria-label="Fechar aviso">×</button>
    </div>
  );
}
