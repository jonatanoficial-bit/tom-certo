# Tom Certo

**Ouça. Descubra. Toque.**

Tom Certo é um assistente musical comercial e local-first, pensado para descobrir a tonalidade de voz, instrumentos e músicas com uma experiência simples, rápida e bonita. O projeto está na **Fase 3 — kit do músico**.

## O que já existe

- Home mobile-first com identidade visual própria e navegação por hash;
- design tokens, componentes reutilizáveis e suporte a `prefers-reduced-motion`;
- estrutura React + TypeScript strict + Vite para os módulos futuros;
- i18n centralizado (PT-BR ativo; EN e ES preparados);
- camada local de armazenamento preparada;
- PWA inicial: manifesto, ícone e service worker;
- workflow de qualidade e deploy no GitHub Pages.
- arquitetura inicial de licença por dispositivo, preparada para ativação única e uso offline posterior.
- captura local por microfone e envio de arquivo de áudio, sem upload para servidor;
- visualizador reativo, leitura de RMS, silêncio, sinal baixo e clipping;
- ranking tonal local das 24 tonalidades maiores/menores por cromagrama espectral;
- resultado transparente: tom principal, relativa e confiança baseada predominantemente na estabilidade da evidência tonal da própria leitura.
- metrônomo local com Tap Tempo, transposição de cifras, calculadora de capo e repertório local.

> Um resultado só é mostrado quando existem evidências tonais e qualidade de leitura suficientes. A porcentagem não é uma promessa de “acerto do programa”: ela descreve o sinal e, principalmente, a estabilidade das evidências daquele áudio.

## Desenvolvimento

Requer Node.js 20.19+ (recomendado: LTS atual) e pnpm 11.19+.

```bash
pnpm install
pnpm dev
```

Comandos de qualidade:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Deploy no GitHub Pages

O workflow em `.github/workflows/deploy.yml` executa lint, typecheck, testes e build em todo push para `main`, então publica o conteúdo de `dist` no GitHub Pages.

Ele calcula automaticamente a base correta tanto para `usuario.github.io` quanto para `usuario.github.io/repositorio`. Veja [DEPLOY-GITHUB.md](DEPLOY-GITHUB.md).

## Estrutura

```text
src/
  app/              # composição e roteamento hash
  components/       # elementos do design system
  features/         # jornadas por domínio
  i18n/             # mensagens centralizadas
  music-theory/     # primitives de teoria musical
  storage/          # persistência local
  styles/           # tokens e estilos globais
public/             # manifesto, service worker e ícones
tests/              # testes unitários
docs/               # documentação complementar
```

## Documentação

- [Arquitetura](ARCHITECTURE.md)
- [Design system](DESIGN-SYSTEM.md)
- [Plano de entregas](ROADMAP.md)
- [Estratégia de testes](TESTING.md)
- [Estado atual](PROJECT_STATE.md)
- [Changelog](CHANGELOG.md)

## Privacidade

O áudio é processado no navegador e não é enviado automaticamente a um servidor.

## Licenciamento comercial

O primeiro uso deverá ativar uma licença uma vez por dispositivo; depois, o app deve continuar funcionando offline usando uma prova assinada e persistida localmente. A implementação estrutural e seus limites estão em [Licenciamento](docs/LICENSING.md).

## Licenças e créditos

Este repositório não declara uma licença de código aberto. Os ícones e assets atuais são originais do projeto; não há fontes, amostras ou bibliotecas de áudio de terceiros inclusas no Lote 1.
