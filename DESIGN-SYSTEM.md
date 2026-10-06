# Design System — Tom Certo

## Direção: precisão que se sente, presença que fica

A identidade combina uma base azul-petróleo profunda com uma luz dourada de decisão e acentos verde-menta de sinal ativo. A nova composição editorial usa atmosfera de palco, grade de sinal e geometrias assimétricas para transmitir um produto musical internacional, sem recorrer a clichês de notas flutuantes ou teclados decorativos.

## Tokens

Os tokens vivem em `src/styles/tokens.css`.

| Grupo | Decisão |
| --- | --- |
| Ink | `#07131D`, base silenciosa e concentrada. |
| Citron | `#F5C64F`, ações principais e ponto de descoberta. |
| Mint | `#8EEACB`, estados de sinal, progresso e confirmação. |
| Texto | `#F1F5ED` principal, `#BBCAC8` auxiliar e `#77908F` secundário. |
| Raios | 13 / 19 / 27 / 36 px, com cantos assimétricos em superfícies prioritárias. |
| Motion | 160 ms para feedback; 320 ms para transições. |

## Tipografia

- Interface: pilha nativa legível (`Inter`, system-ui, Segoe UI).
- Instrumentação e rótulos de estado: pilha monoespaçada do sistema.
- Títulos: peso 600–710, tracking negativo controlado e tamanho fluido.

Não há dependência de webfont; isso preserva velocidade de carregamento e comportamento offline inicial em qualquer mercado.

## Componentes disponíveis

| Componente | Uso |
| --- | --- |
| `Button` | CTA principal, ação secundária e futura extensão de variantes. |
| `Icon` | Símbolos SVG próprios, com tamanho previsível. |
| `Toast` | Feedback breve e humano, sem interromper a tarefa. |
| `AppShell` | topo, navegação inferior e ambiente visual comum. |
| `BrandMark` | assinatura visual do produto. |

## Regras de interface

1. A ação musical prioritária ocupa a primeira zona de toque importante.
2. Cor nunca é o único indicador de estado: texto, ícone e contexto acompanham.
3. Superfícies possuem profundidade por borda, contraste, luz ambiente e sombra discreta — não por excesso de glassmorphism.
4. A animação deve explicar estado. No Lote 1, o pulso anuncia prontidão; nos próximos lotes reagirá a áudio real.
5. Cada novo recurso deve usar tokens antes de criar valores visuais locais.

## Acessibilidade e motion

- Contraste alto no tema dark.
- Alvos de toque mínimos de 44px.
- Estados de foco visíveis.
- Região `aria-live` para mensagens efêmeras.
- `prefers-reduced-motion` reduz animações a uma transição imperceptível.
- O modo de contraste reforçado é persistido localmente.
- O modo culto usa contraste alto e tipografia de palco por padrão.

## Breakpoints de QA

O layout é mobile-first e deve ser verificado em 320, 360, 390, 412, 768 e 1440px. A partir de 700px, a Home passa a usar composição de duas colunas; nenhum fluxo depende dessa mudança para ser compreendido.
