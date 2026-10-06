# Estado do Projeto — Tom Certo

## Última atualização

- **Versão:** 0.1.0
- **Build:** 0100
- **Lote concluído:** 01 de 13
- **Data:** 2026-10-06

## Status

O Lote 1 está concluído: a aplicação possui fundação compilável, design system premium e Home responsiva. Ainda não há qualquer captura ou análise real de áudio — isso é intencional e preserva a verdade da interface.

## Implementado

- Vite + React + TypeScript strict;
- páginas `#/` e `#/tools`;
- componentes de base: `Button`, `Icon`, `Toast`, `AppShell` e `BrandMark`;
- visual dark premium com tokens centralizados;
- responsividade entre 320px e desktop por CSS mobile-first;
- i18n com PT-BR como idioma ativo e arquivos EN/ES preparados;
- abstração de `localStorage` com prefixo do produto;
- PWA shell inicial;
- estrutura de licenciamento por dispositivo, com prova assinada verificável localmente;
- workflow GitHub Pages;
- documentação e teste unitário de base.

## Verificações executadas

- `pnpm lint` — aprovado.
- `pnpm typecheck` — aprovado.
- `pnpm test` — aprovado: 2 arquivos / 5 testes.
- `pnpm build` — aprovado: bundle Vite de produção gerado.
- QA responsivo manual: 320, 360, 390, 412, 768 e 1440px sem overflow horizontal; Home, CTA e navegação verificados.

## Deliberadamente fora deste lote

- `getUserMedia`, permissões, RMS, clipping, silêncio e upload;
- visualizador responsivo ao áudio real;
- DSP, FFT, cromagrama/HPCP, pitch tracking ou decisão tonal;
- persistência de análises, repertório ou histórico;
- metrônomo, afinador, Tap Tempo, capotraste e transpositor funcionais.

## Próximo lote

**Lote 2 — Captura de áudio e experiência de escuta.** Implementar microfone, processamento local de buffer, RMS, silêncio, clipping, upload e o visualizador conectado a sinais reais.

## Riscos e decisões abertas

- Validar em dispositivo Android real as políticas de permissão de microfone e suspensão em background.
- Avaliar Essentia.js versus DSP próprio para os motores posteriores, considerando tamanho de bundle e licença.
- Gerar ícones PNG 192/512 antes da auditoria PWA final, para máxima interoperabilidade de instaladores.
- Decidir modalidade comercial e implementar o serviço remoto de ativação antes de liberar vendas.
