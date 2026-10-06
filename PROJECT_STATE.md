# Estado do Projeto — Tom Certo

## Última atualização

- **Versão:** 0.3.0
- **Build:** 0300
- **Fase atual:** 03 de 04
- **Data:** 2026-10-06

## Status

O Lote 1 está concluído. A Fase 2 segue em calibração de análise tonal e a Fase 3 foi iniciada com ferramentas locais para ritmo, cifras, capo e repertório. Não há resultado demonstrativo ou resposta inventada.

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
- captura por `getUserMedia` com desligamento ao sair da tela e mensagens de permissão;
- leitura local de arquivos de áudio em buffer, sem reprodução audível e sem upload;
- RMS, silêncio, nível baixo, clipping, forma de onda e painel de estado em tempo real;
- detector tonal local baseado em cromagrama/FFT e ranking das 24 tonalidades;
- resultado central com círculo do tom, relativa e indicador de confiança da leitura;
- métrica de confiança que prioriza estabilidade da evidência tonal, não uma alegação arbitrária sobre o programa.
- metrônomo por Web Audio com acento, BPM ajustável, Tap Tempo e fórmulas de compasso;
- transpositor de cifras com acordes menores, extensões e baixo alternado;
- calculadora de forma de violão para capotraste;
- repertório local persistido no próprio dispositivo.

## Verificações executadas

- `pnpm lint` — aprovado.
- `pnpm typecheck` — aprovado.
- `pnpm test` — aprovado: 6 arquivos / 16 testes.
- `pnpm build` — aprovado: bundle Vite de produção gerado.
- QA responsivo manual: 320, 360, 390, 412, 768 e 1440px sem overflow horizontal; Home, CTA e navegação verificados.

## Deliberadamente fora deste lote

- validação calibrada em gravações musicais variadas e em dispositivos físicos;
- análise melódica avançada, fusão de evidências e escala/campo harmônico detalhado;
- afinador por nota em tempo real e preparação avançada de setlist;

## Próximo lote

**Fase 3 — Kit do músico.** O núcleo de ritmo, cifras, capo e repertório está implementado. O próximo marco é o afinador em tempo real; a calibração da Fase 2 segue como trabalho de qualidade em paralelo.

## Decisão de planejamento

O plano original de 13 lotes foi consolidado em 4 fases para reduzir a quantidade de entregas intermediárias sem reduzir os critérios de qualidade. Consulte `ROADMAP.md` para os marcos internos.

## Riscos e decisões abertas

- Validar em dispositivo Android real as políticas de permissão de microfone e suspensão em background.
- Avaliar Essentia.js versus DSP próprio para os motores posteriores, considerando tamanho de bundle e licença.
- Gerar ícones PNG 192/512 antes da auditoria PWA final, para máxima interoperabilidade de instaladores.
- Decidir modalidade comercial e implementar o serviço remoto de ativação antes de liberar vendas.
- O repositório GitHub agora é público, portanto o próximo push deve habilitar a publicação do GitHub Pages pelo workflow existente.
