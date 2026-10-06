import { ptBR } from './pt-BR';

export type Locale = 'pt-BR' | 'en' | 'es';

const translations = { 'pt-BR': ptBR } as const;

export function t(key: keyof typeof ptBR): string {
  return translations['pt-BR'][key];
}
