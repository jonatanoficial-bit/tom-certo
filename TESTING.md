# Estratégia de Testes

## Comandos

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Cobertura atual — Lote 1

- Teste unitário de nomes de nota e normalização cíclica.
- Compilação TypeScript estrita.
- Lint de código fonte.
- Build de produção Vite.
- QA manual responsivo requerido em 320, 360, 390, 412, 768 e 1440px.

## Resultado do Lote 1

Em 2026-10-06, lint, typecheck, os 5 testes unitários e o build foram aprovados. A Home foi inspecionada em 320, 360, 390, 412, 768 e 1440px sem overflow horizontal. Também foi validado o feedback da CTA principal e a navegação para Ferramentas.

## Matriz para os próximos lotes

| Área | Exemplos de casos |
| --- | --- |
| Teoria musical | escalas, enarmonia, transposição, capotraste, relativos. |
| Áudio | silêncio, clipping, sinal baixo, voz, acordes, trecho curto. |
| Motor tonal | top-1, top-2, maior/menor, estabilidade e calibração de confiança. |
| PWA | instalação, atualização, offline e cache de assets. |
| Acessibilidade | teclado, foco, leitor de tela, contraste e reduced motion. |

Quando houver arquivos de áudio de fixture, eles devem ser pequenos, licenciados e processados localmente nos testes; nenhum teste pode exigir API paga.
