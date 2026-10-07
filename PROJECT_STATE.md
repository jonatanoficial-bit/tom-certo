# Estado do Projeto — Tom Certo

## Última atualização

- **Versão:** 0.6.3
- **Build:** 0603
- **Fase atual:** 04 de 04 — em andamento
- **Data:** 2026-10-07

## Status

O Lote 1 está concluído. As Fases 2 e 3 têm seus núcleos funcionais locais; a Fase 4 foi iniciada com experiência guiada, modo culto, melhorias offline, acessibilidade e nova direção visual. A calibração tonal em gravações reais não foi declarada concluída.

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
- modo iniciante persistido, com caminho de três passos e orientação contextual no kit musical;
- modo culto: seleção de música do repertório e apresentação de alto contraste com tom, capo e cifra;
- indicador de conectividade, controle de contraste, link de pular para conteúdo e semântica de abas aprimorada;
- service worker atualizado com navegação network-first e fallback de shell em offline após cache inicial;
- direção visual editorial premium por CSS: profundidade tonal, grade de sinal, superfícies próprias e sem dependências remotas.
- afinador em tempo real local: leitura de frequência, nota, oitava e cents, com indicação para subir/descer a afinação;
- pausa automática do afinador ao trocar de ferramenta, ocultar a página ou parar a sessão.
- calibração do detector tonal para séries harmônicas de instrumentos: o motor agora reúne harmônicos na nota fundamental e rejeita entradas ambíguas no afinador.
- janela controlada de captura: 15 segundos de evidência, mínimo de 8 segundos, barra de progresso e término automático sem armazenar áudio bruto;
- correção de desafinação média do instrumento antes da análise de tonalidade.
- filtro de palco no detector tonal: estima o piso de ruído do ambiente antes de aceitar picos musicais e combina evidência de harmônicos e picos espectrais;
- hipótese tonal explícita quando há notas detectadas, mas a leitura ainda não satisfaz os critérios de confirmação.
- faixa útil de microfone ampliada para níveis baixos; o detector continua a rejeitar silêncio sem picos musicais.
- trilha tonal melódica: frequência fundamental local para voz/linhas únicas, mediana curta contra vibrato e mistura ponderada com o motor harmônico de instrumentos;
- resultado em notação internacional compacta (`C`, `F#`, `Gm`) para evitar separar raiz e modo visualmente.
- interpretação de frase para melodia isolada: duração de nota, pausas, finais sustentados e resolução melódica leve; o sinal só entra nessa trilha se for monofônico o bastante, preservando acordes no caminho harmônico.

## Verificações executadas

- `pnpm lint` — aprovado.
- `pnpm typecheck` — aprovado.
- `pnpm test` — aprovado: 10 arquivos / 35 testes.
- `pnpm build` — aprovado: bundle Vite de produção gerado.
- QA responsivo manual: 320, 360, 390, 412, 768 e 1440px sem overflow horizontal; Home, CTA e navegação verificados.

## Deliberadamente fora deste lote

- validação calibrada em gravações musicais variadas e em dispositivos físicos;
- análise melódica avançada, fusão de evidências e escala/campo harmônico detalhado;
- afinador por nota em tempo real e preparação avançada de setlist;

## Próximo lote

**Fase 4 — validação de release.** Validar em aparelhos físicos: instalação PWA, primeiro cache offline, permissões de microfone, afinador e contraste. A preparação avançada de setlist permanece como próximo marco funcional.

## Decisão de planejamento

O plano original de 13 lotes foi consolidado em 4 fases para reduzir a quantidade de entregas intermediárias sem reduzir os critérios de qualidade. Consulte `ROADMAP.md` para os marcos internos.

## Riscos e decisões abertas

- Validar em dispositivo Android real as políticas de permissão de microfone e suspensão em background.
- Avaliar Essentia.js versus DSP próprio para os motores posteriores, considerando tamanho de bundle e licença.
- Gerar ícones PNG 192/512 antes da auditoria PWA final, para máxima interoperabilidade de instaladores.
- Decidir modalidade comercial e implementar o serviço remoto de ativação antes de liberar vendas.
- O repositório GitHub agora é público, portanto o próximo push deve habilitar a publicação do GitHub Pages pelo workflow existente.
