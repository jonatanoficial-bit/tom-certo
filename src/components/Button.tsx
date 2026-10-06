import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { Icon, type IconName } from './Icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, PropsWithChildren {
  variant?: 'primary' | 'secondary' | 'quiet';
  icon?: IconName;
}

export function Button({ children, className = '', variant = 'primary', icon, ...props }: ButtonProps) {
  return (
    <button className={`button button--${variant} ${className}`} {...props}>
      {icon ? <Icon name={icon} size={19} /> : null}
      <span>{children}</span>
    </button>
  );
}
