import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function normalizedBase(value: string | undefined): string {
  if (!value || value === '/') return '/';

  return `/${value.replace(/^\/+|\/+$/g, '')}/`;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_');

  return {
    base: normalizedBase(env.VITE_BASE_PATH),
    plugins: [react()],
    test: {
      environment: 'node',
      include: ['tests/**/*.test.ts'],
    },
  };
});
