# Estado do Projeto — Tom Certo

## Última atualização

- **Versão:** 0.2.0
- **Build:** 0200
- **Fase atual:** 02 de 04
- **Data:** 2026-10-06

## Status

O Lote 1 está concluído e a Fase 2 está em andamento. A aplicação agora possui captura e análise local iniciais; não há resultado demonstrativo ou resposta inventada.

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

## Verificações executadas

- `pnpm lint` — aprovado.
- `pnpm typecheck` — aprovado.
- `pnpm test` — aprovado: 4 arquivos / 11 testes.
- `pnpm build` — aprovado: bundle Vite de produção gerado.
- QA responsivo manual: 320, 360, 390, 412, 768 e 1440px sem overflow horizontal; Home, CTA e navegação verificados.

## Deliberadamente fora deste lote

- validação calibrada em gravações musicais variadas e em dispositivos físicos;
- análise melódica avançada, fusão de evidências e escala/campo harmônico detalhado;
- persistência de análises, repertório ou histórico;
- metrônomo, afinador, Tap Tempo, capotraste e transpositor funcionais.

## Próximo lote

**Fase 2 — Jornada central de identificação.** A base de captura, ranking tonal e resultado transparente está implementada. Restam calibração com repertório real, análise melódica avançada e expansão do resultado musical antes de concluí-la.

## Decisão de planejamento

O plano original de 13 lotes foi consolidado em 4 fases para reduzir a quantidade de entregas intermediárias sem reduzir os critérios de qualidade. Consulte `ROADMAP.md` para os marcos internos.

## Riscos e decisões abertas

- Validar em dispositivo Android real as políticas de permissão de microfone e suspensão em background.
- Avaliar Essentia.js versus DSP próprio para os motores posteriores, considerando tamanho de bundle e licença.
- Gerar ícones PNG 192/512 antes da auditoria PWA final, para máxima interoperabilidade de instaladores.
- Decidir modalidade comercial e implementar o serviço remoto de ativação antes de liberar vendas.
- O repositório GitHub foi criado como privado. A conta atual informa que GitHub Pages exige tornar o repositório público ou fazer upgrade para um plano que suporte Pages privados; por isso o código e o workflow foram publicados, mas a URL pública ainda não foi gerada.
