import type { ReactNode } from 'react';

export type IconName = 'spark' | 'grid' | 'mic' | 'upload' | 'arrow' | 'metronome' | 'tuner' | 'transpose' | 'clock' | 'shield' | 'chevron' | 'stop';

interface IconProps {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 20 }: IconProps) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };

  const paths: Record<IconName, ReactNode> = {
    spark: <><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" /><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" /></>,
    grid: <><rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.4" /><rect x="14" y="3.5" width="6.5" height="6.5" rx="1.4" /><rect x="3.5" y="14" width="6.5" height="6.5" rx="1.4" /><rect x="14" y="14" width="6.5" height="6.5" rx="1.4" /></>,
    mic: <><rect x="8.3" y="3" width="7.4" height="12" rx="3.7" /><path d="M5.2 11.4a6.8 6.8 0 0 0 13.6 0M12 18.2v3.1M8.3 21.3h7.4" /></>,
    upload: <><path d="M12 15V3.5M7.7 7.8 12 3.5l4.3 4.3" /><path d="M4 14.5v4.1A2.4 2.4 0 0 0 6.4 21h11.2a2.4 2.4 0 0 0 2.4-2.4v-4.1" /></>,
    arrow: <><path d="M5 12h13M13.3 6.7 18.6 12l-5.3 5.3" /></>,
    metronome: <><path d="M7.2 20.5h9.6l-1.6-14H8.8l-1.6 14Z" /><path d="m12 6.5 3.5-3.2M12 12.2l-2.5 3.2" /></>,
    tuner: <><circle cx="12" cy="13" r="7.5" /><path d="M12 13 16.2 9M8 3h8M12 5.5V3" /></>,
    transpose: <><path d="M7 4v13M3.8 7.2 7 4l3.2 3.2M17 20V7m-3.2 9.8L17 20l3.2-3.2" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.3 2" /></>,
    shield: <><path d="M12 3.2 19 6v5.3c0 4.4-2.8 7.9-7 9.5-4.2-1.6-7-5.1-7-9.5V6l7-2.8Z" /><path d="m8.9 12.1 2 2 4.2-4.2" /></>,
    chevron: <path d="m9 5 7 7-7 7" />,
    stop: <rect x="6.2" y="6.2" width="11.6" height="11.6" rx="2" />,
  };

  return <svg {...common}>{paths[name]}</svg>;
}
