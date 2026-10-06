import type { PropsWithChildren } from 'react';
import type { AppRoute } from '../app/routes';
import { experienceModeLabel, type ExperienceMode } from '../app/experience';
import { BrandMark } from './BrandMark';
import { Icon } from './Icon';

interface AppShellProps extends PropsWithChildren {
  activeRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  experienceMode: ExperienceMode;
  highContrast: boolean;
  isOnline: boolean;
  onToggleExperienceMode: () => void;
  onToggleHighContrast: () => void;
}

export function AppShell({ activeRoute, children, onNavigate, experienceMode, highContrast, isOnline, onToggleExperienceMode, onToggleHighContrast }: AppShellProps) {
  return (
    <div className={`app-shell ${highContrast ? 'app-shell--high-contrast' : ''}`}>
      <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
      <div className="ambient ambient--one" aria-hidden="true" />
      <div className="ambient ambient--two" aria-hidden="true" />
      <div className="noise" aria-hidden="true" />
      <header className="topbar container">
        <a className="brand" href="#/" aria-label="Tom Certo — início">
          <BrandMark />
          <span className="brand__wordmark">TOM CERTO</span>
        </a>
        <div className="topbar__utilities">
          <span className={`connection-status ${isOnline ? 'is-online' : 'is-offline'}`} aria-live="polite">
            <i aria-hidden="true" />{isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
          <button className="utility-button" type="button" onClick={onToggleExperienceMode} aria-pressed={experienceMode === 'guided'} aria-label={`${experienceModeLabel(experienceMode)}: alternar`}>
            {experienceMode === 'guided' ? 'GUIADO' : 'FOCO'}
          </button>
          <button className="utility-button utility-button--contrast" type="button" onClick={onToggleHighContrast} aria-pressed={highContrast}>
            Contraste
          </button>
        </div>
      </header>

      <main id="main-content" className="main-content container" tabIndex={-1}>{children}</main>

      <nav className="bottom-nav container" aria-label="Navegação principal">
        <button
          className={`bottom-nav__item ${activeRoute === 'home' ? 'is-active' : ''}`}
          type="button"
          onClick={() => onNavigate('home')}
          aria-current={activeRoute === 'home' ? 'page' : undefined}
        >
          <Icon name="spark" size={18} />
          <span>Descobrir</span>
        </button>
        <button
          className={`bottom-nav__item ${activeRoute === 'tools' ? 'is-active' : ''}`}
          type="button"
          onClick={() => onNavigate('tools')}
          aria-current={activeRoute === 'tools' ? 'page' : undefined}
        >
          <Icon name="grid" size={18} />
          <span>Ferramentas</span>
        </button>
      </nav>
    </div>
  );
}
