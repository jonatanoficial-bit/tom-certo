# Changelog

Todas as mudanças relevantes deste projeto serão documentadas aqui.

## [Unreleased]

### Added

- Trilha melódica para voz: extrai a frequência fundamental localmente, usa mediana de cinco leituras para absorver vibrato e dá mais peso às classes de nota cantadas do que aos harmônicos vocais.
- Notação compacta internacional no resultado tonal: `C`, `F#`, `Gm`, inclusive para relativas e hipóteses próximas.
- Detector tonal reforçado para palco: piso de ruído adaptativo, combinação de evidência harmônica e picos espectrais e teste que rejeita ruído ambiente plano como tonalidade.
- Faixa útil de microfone ampliada para níveis baixos sem habilitar ganho automático; quadros silenciosos ainda não contam como evidência tonal.
- Exibição transparente da hipótese tonal quando há notas detectadas, mas a leitura ainda não é estável o bastante para confirmar o tom.
- Captura tonal temporal: análise local de até 15 segundos, mínimo de 8 segundos para resultado, desligamento automático do microfone e indicador de progresso.
- Correção harmônica e de detuning no detector tonal para reduzir deslocamentos de semitom em piano e instrumentos levemente desafinados.
- Calibração de leitura: agrupamento de harmônicos para reduzir falsos deslocamentos em piano/acordes e detector YIN para o afinador monofônico.
- Afinador local em tempo real com detecção por autocorrelação, leitura de nota/oitava/cents e indicador visual de afinação.
- Fase 4 iniciada: modo iniciante, modo culto com apresentação de alto contraste, preferências de contraste e status de conectividade.
- Shell PWA atualizado com fallback de navegação offline e estratégia de cache renovada.
- Direção visual editorial premium, sem imagens ou fontes externas que comprometam carregamento e uso local.
- Fase 3 iniciada: metrônomo local, Tap Tempo, transpositor de cifras, cálculo de capo e repertório local.
- Fase 2 iniciada: captura local por microfone/arquivo, visualizador, métricas de sinal e tratamento de permissão.
- Detector tonal local por cromagrama espectral e ranking das 24 tonalidades.
- Resultado transparente com círculo do tom, tonalidade relativa e confiança de leitura priorizando estabilidade da evidência tonal.

### Changed

- Roadmap consolidado de 13 lotes em 4 fases, preservando os critérios técnicos e visuais como marcos internos.

## [0.1.0] — 2026-10-06

### Added

- Fundação React, TypeScript strict e Vite.
- Home premium, responsiva e mobile-first da experiência “Qual é o tom?”.
- Sistema de identidade visual: tokens, componentes de botão, ícones, feedback e navegação.
- Roteamento por hash compatível com GitHub Pages.
- Estrutura inicial para i18n, storage local e teoria musical.
- Manifesto PWA, service worker e ícone próprio.
- GitHub Actions para qualidade e deploy.
- Documentação de arquitetura, design, deploy, testes e roadmap.
- Teste unitário inicial de teoria musical.
- Fundação de licença comercial por dispositivo: identidade local, comprovante persistente, contrato de ativação e verificação Web Crypto de assinatura pública.

### Not yet implemented

- Captura de microfone, upload de arquivos e análise de áudio (Lote 2).
- Detector harmônico/melódico e resultado tonal real (Lotes 3–6).
