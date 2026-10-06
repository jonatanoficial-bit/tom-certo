export type AppRoute = 'home' | 'tools';

export function getRouteFromHash(hash: string): AppRoute {
  const path = hash.replace(/^#/, '').replace(/\/$/, '') || '/';
  return path === '/tools' ? 'tools' : 'home';
}
