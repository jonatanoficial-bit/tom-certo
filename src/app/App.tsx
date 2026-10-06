import { useEffect, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { Toast, type ToastTone } from '../components/Toast';
import { t } from '../i18n';
import { HomePage } from '../features/home/HomePage';
import { ToolsPage } from '../features/tools/ToolsPage';
import { getRouteFromHash, type AppRoute } from './routes';

interface ToastState {
  message: string;
  tone: ToastTone;
}

export function App() {
  const [route, setRoute] = useState<AppRoute>(() => getRouteFromHash(window.location.hash));
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    const syncRoute = () => setRoute(getRouteFromHash(window.location.hash));
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

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

  return (
    <AppShell activeRoute={route} onNavigate={goTo}>
      {route === 'home' ? <HomePage notify={notify} /> : <ToolsPage notify={notify} />}
      {toast ? (
        <Toast message={toast.message} tone={toast.tone} onDismiss={() => setToast(null)} />
      ) : null}
      <span className="sr-only" aria-live="polite">
        {toast?.message ?? t('app.ready')}
      </span>
    </AppShell>
  );
}
