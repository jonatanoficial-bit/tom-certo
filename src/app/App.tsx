import { useEffect, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { Toast, type ToastTone } from '../components/Toast';
import { t } from '../i18n';
import { HomePage } from '../features/home/HomePage';
import { ToolsPage } from '../features/tools/ToolsPage';
import { getRouteFromHash, type AppRoute } from './routes';
import { EXPERIENCE_MODE_STORAGE_KEY, HIGH_CONTRAST_STORAGE_KEY, isExperienceMode, type ExperienceMode } from './experience';
import { readLocal, saveLocal } from '../storage/localStore';

interface ToastState {
  message: string;
  tone: ToastTone;
}

export function App() {
  const [route, setRoute] = useState<AppRoute>(() => getRouteFromHash(window.location.hash));
  const [toast, setToast] = useState<ToastState | null>(null);
  const [experienceMode, setExperienceMode] = useState<ExperienceMode>(() => {
    const stored = readLocal<unknown>(EXPERIENCE_MODE_STORAGE_KEY);
    return isExperienceMode(stored) ? stored : 'guided';
  });
  const [highContrast, setHighContrast] = useState(() => readLocal<boolean>(HIGH_CONTRAST_STORAGE_KEY) ?? false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const syncRoute = () => setRoute(getRouteFromHash(window.location.hash));
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  useEffect(() => {
    const updateConnection = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateConnection);
    window.addEventListener('offline', updateConnection);
    return () => {
      window.removeEventListener('online', updateConnection);
      window.removeEventListener('offline', updateConnection);
    };
  }, []);

  useEffect(() => { saveLocal(EXPERIENCE_MODE_STORAGE_KEY, experienceMode); }, [experienceMode]);
  useEffect(() => { saveLocal(HIGH_CONTRAST_STORAGE_KEY, highContrast); }, [highContrast]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    void window.addEventListener('load', () => {
      void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
    });
  }, []);

  const notify = (message: string, tone: ToastTone = 'neutral') => setToast({ message, tone });

  const goTo = (nextRoute: AppRoute) => {
    window.location.hash = nextRoute === 'home' ? '/' : `/${nextRoute}`;
  };

  const toggleExperienceMode = () => {
    setExperienceMode((current) => current === 'guided' ? 'focus' : 'guided');
  };

  return (
    <AppShell
      activeRoute={route}
      onNavigate={goTo}
      experienceMode={experienceMode}
      highContrast={highContrast}
      isOnline={isOnline}
      onToggleExperienceMode={toggleExperienceMode}
      onToggleHighContrast={() => setHighContrast((current) => !current)}
    >
      {route === 'home'
        ? <HomePage guided={experienceMode === 'guided'} onOpenTools={() => goTo('tools')} />
        : <ToolsPage notify={notify} guided={experienceMode === 'guided'} />}
      {toast ? (
        <Toast message={toast.message} tone={toast.tone} onDismiss={() => setToast(null)} />
      ) : null}
      <span className="sr-only" aria-live="polite">
        {toast?.message ?? t('app.ready')}
      </span>
    </AppShell>
  );
}
