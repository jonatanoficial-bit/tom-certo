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
- agrupamento de série harmônica na nota fundamental, para piano, violão e voz não empurrarem o resultado para um harmônico;
- correção média de desafinação do instrumento antes de classificar as notas;
- perfil tonal maior/menor, separação entre hipóteses, diversidade de classes de nota e estabilidade temporal;
- janela de 15 segundos e bloqueio de resultado tonal curto ou ambíguo.

O afinador usa um estimador YIN monofônico, suavização por mediana e só mostra nota quando a periodicidade é suficiente.

## Critério de release

Nenhum algoritmo identifica corretamente todo tipo de música: modulações, ruído, acordes sem terça, afinações alternativas e trechos muito curtos são ambíguos por natureza. Antes de chamar a medição de pronta para venda, o Tom Certo precisa ser avaliado com um corpus rotulado de músicas e instrumentos reais, em celulares Android/iOS, com metas explícitas por cenário.

Uma biblioteca de referência pesquisada, Essentia.js, oferece HPCP/KeyExtractor e correção de detuning, mas usa licença AGPL-3.0. Como o Tom Certo é um produto comercial proprietário, ela não foi incorporada ao app sem uma licença comercial apropriada. A base atual continua local, auditável e sem essa dependência.
