import type { PropsWithChildren } from 'react';
import type { AppRoute } from '../app/routes';
import { BrandMark } from './BrandMark';
import { Icon } from './Icon';

interface AppShellProps extends PropsWithChildren {
  activeRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

export function AppShell({ activeRoute, children, onNavigate }: AppShellProps) {
  return (
    <div className="app-shell">
      <div className="ambient ambient--one" aria-hidden="true" />
      <div className="ambient ambient--two" aria-hidden="true" />
      <div className="noise" aria-hidden="true" />
      <header className="topbar container">
        <a className="brand" href="#/" aria-label="Tom Certo — início">
          <BrandMark />
          <span className="brand__wordmark">TOM CERTO</span>
        </a>
        <div className="topbar__status" aria-label="Versão em desenvolvimento">
          <span className="status-pip" aria-hidden="true" />
          <span>LAB 03</span>
        </div>
      </header>

      <main className="main-content container">{children}</main>

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
