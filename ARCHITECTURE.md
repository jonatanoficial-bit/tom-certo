# Arquitetura

## Princípios

- **Local-first:** dados e áudio processados no navegador sempre que possível.
- **Áudio isolado da UI:** DSP, workers e worklets nunca devem viver em componentes React.
- **Progressive disclosure:** primeiro o resultado compreensível; detalhes somente por demanda.
- **Static hosting:** nenhum backend é requisito para o núcleo do produto.

## Camadas

```text
React UI / features
        │
app routes · design-system · i18n · storage
        │
audio capture → DSP workers/worklets → music-theory ranking
        │
Web Audio API / uploaded AudioBuffer
```

### Interface

- `src/app`: composição global, registro do service worker e roteamento hash.
- `src/components`: componentes sem regra de negócio específica.
- `src/features`: jornadas e estados por produto. Cada feature pode usar componentes e serviços, mas não importar outra feature diretamente sem uma interface explícita.
- `src/styles`: tokens de produto e CSS global.

### Domínio e infraestrutura

- `src/music-theory`: notas, escalas, enarmonia, transposição e ranking tonal puros e testáveis.
- `src/audio`: captura, normalização, análises de frame, workers e worklets (a partir do Lote 2).
- `src/storage`: adaptadores de armazenamento local/IndexedDB.
- `src/i18n`: chaves de texto, sem strings de interface espalhadas pelo app.
- `src/licensing`: contrato de ativação, identidade local e verificação offline de comprovante assinado.

## Navegação e deploy estático

O app usa hash routing (`#/` e `#/tools`) para que uma atualização de página em GitHub Pages não dependa de rewrites do servidor. `VITE_BASE_PATH` controla o caminho de assets de builds de projeto e de domínio raiz.

## Decisões Lote 1

| Decisão | Motivo |
| --- | --- |
| Sem dependência visual externa | Carregamento previsível e offline futuro. |
| CSS e SVG próprios | Mantém identidade, performance e controle de motion. |
| Service worker manual inicial | Evita acoplamento precoce; pode ser substituído por uma estratégia Workbox quando os assets de áudio forem definidos. |
| Sem “resultado demo” | Confiança do usuário depende de não fingir análise musical. |

## Evolução prevista

No Lote 2, a camada `audio/` receberá `MicrophoneCapture`, `AudioFileDecoder` e métricas de qualidade. Lotes 3–5 adicionam ranking tonal e agregação temporal; Lote 6 conecta os resultados à jornada principal. Ver [ROADMAP.md](ROADMAP.md).

## Licenciamento comercial

A venda não altera o núcleo offline de DSP. Uma conexão é necessária só para ativar cada instalação ou para uma eventual administração de licenças. A prova de licença é emitida e assinada fora do navegador; o cliente apenas armazena e verifica a assinatura via Web Crypto. Consulte [Licenciamento](docs/LICENSING.md) antes de implementar a interface de ativação.
