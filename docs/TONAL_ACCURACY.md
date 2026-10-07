# Medição tonal e privacidade

## O que acontece ao tocar em “Capturar 15 segundos”

1. O navegador pede permissão para o microfone.
2. O som passa diretamente para o `AnalyserNode` do Web Audio API, apenas na memória da aba.
3. Durante até 15 segundos, o app acumula evidências harmônicas e de estabilidade; a captura pode ser finalizada manualmente, mas precisa de pelo menos 8 segundos para tentar um resultado tonal.
4. Ao encerrar, as faixas do microfone são desligadas e o `AudioContext` é fechado.

Não usamos `MediaRecorder`, não criamos arquivo de áudio, não enviamos som a servidor e não colocamos áudio no `localStorage`. O que existe durante a sessão são números temporários de energia e classes de altura; eles desaparecem quando a leitura termina ou a página é fechada.

## Dois recursos, duas perguntas

- **Leitura tonal (Início):** responde “qual é o tom da música?” e deve receber um trecho com harmonia clara, idealmente dois ou mais acordes.
- **Afinador (Ferramentas):** responde “qual nota isolada estou tocando/cantando?” e rejeita acordes ou acompanhamento misturado sempre que a evidência estiver ambígua.

Uma voz sem acompanhamento pode sugerir mais de um tom possível; por exemplo, as mesmas notas podem caber em Dó maior e Lá menor. Nesses casos o produto deve exibir baixa confiança, não inventar uma certeza.

## Motor tonal atual

O processamento local combina:

- janelas FFT de 4096 amostras;
- agrupamento de série harmônica na nota fundamental e cromagrama de picos espectrais, para piano, violão e voz não empurrarem o resultado para um harmônico;
- piso de ruído adaptativo por janela: som ambiente amplo do palco não é contado como se fosse nota musical; somente picos acima do piso entram como evidência;
- faixa de microfone ajustada para níveis baixos, sem ativar supressão de ruído ou ganho automático que poderiam alterar a harmonia de uma apresentação ao vivo;
- trilha melódica para voz e linhas únicas: estima a frequência fundamental, aplica mediana curta contra vibrato e consoantes e prioriza as classes de nota fundamentais sobre formantes e harmônicos vocais;
- interpretação por frase para melodia isolada: pondera duração, pausa, nota sustentada no fim da frase e uma resolução melódica leve; essa camada só entra com periodicidade monofônica alta, preservando a análise de acordes;
- correção média de desafinação do instrumento antes de classificar as notas;
- perfil tonal maior/menor, separação entre hipóteses, diversidade de classes de nota e estabilidade temporal;
- janela de 15 segundos e bloqueio de resultado tonal curto ou ambíguo.

Quando existe uma hipótese musical, mas faltam estabilidade, tempo ou diversidade de notas para confirmá-la, a tela a mostra como **hipótese em validação**. Isso evita tanto ocultar uma leitura útil quanto apresentar uma sugestão fraca como certeza.

Uma voz **cantada** tem frequência fundamental e pode alimentar a trilha melódica. Um sussurro puro não tem altura musical estável; nesse caso nenhum software consegue deduzir com segurança o tom a partir apenas da voz. Para uma leitura vocal mais confiável, cante um trecho completo e, quando possível, deixe um instrumento ou playback harmônico audível junto.

O afinador usa um estimador YIN monofônico, suavização por mediana e só mostra nota quando a periodicidade é suficiente.

## Critério de release

Nenhum algoritmo identifica corretamente todo tipo de música: modulações, ruído, acordes sem terça, afinações alternativas e trechos muito curtos são ambíguos por natureza. Antes de chamar a medição de pronta para venda, o Tom Certo precisa ser avaliado com um corpus rotulado de músicas e instrumentos reais, em celulares Android/iOS, com metas explícitas por cenário.

Uma biblioteca de referência pesquisada, Essentia.js, oferece HPCP/KeyExtractor e correção de detuning, mas usa licença AGPL-3.0. Como o Tom Certo é um produto comercial proprietário, ela não foi incorporada ao app sem uma licença comercial apropriada. A base atual continua local, auditável e sem essa dependência.
