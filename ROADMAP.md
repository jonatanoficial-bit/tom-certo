# Roadmap

O plano foi consolidado de 13 lotes para **4 fases de entrega**. Os antigos lotes continuam como marcos internos de qualidade, mas não criam mais pausas artificiais para o produto. Cada fase gera um ZIP completo, atualiza a documentação e passa pelas verificações técnicas e visuais.

| Fase | Versão-alvo | Foco | Situação |
| --- | --- | --- | --- |
| 1 | 0.1.0 | Fundação, identidade, PWA inicial, licença e GitHub | Concluída |
| 2 | 0.4.0 | Jornada central completa: captura, qualidade, detector tonal e resultado | Em andamento |
| 3 | 0.7.0 | Kit do músico: metrônomo, Tap Tempo, afinador, transposição, capo e repertório | Em andamento |
| 4 | 1.0.0 | Modo iniciante/igreja, offline final, acessibilidade, calibração, QA e release | Em andamento |

## Fase 2 — jornada central

Reúne os antigos Lotes 2 a 6, em marcos internos:

1. captura local por microfone e arquivo; RMS, silêncio, clipping e visualizador reativo;
2. ranking harmônico das 24 tonalidades;
3. análise melódica para voz/instrumento monofônico e fusão de evidências;
4. confiança, ambiguidade, estabilidade temporal e resultado premium com escala/campo.

Nenhum resultado de tonalidade será mostrado até existir análise real e testada. A tela de ativação comercial continuará separada do DSP e não comprometerá o funcionamento offline.

## Fase 3 — kit do músico

O primeiro núcleo reúne ferramentas que funcionam sem conexão:

1. metrônomo por Web Audio com acento no primeiro tempo e BPM entre 35–240;
2. Tap Tempo que calcula o BPM pelos últimos toques válidos;
3. transposição de cifras, incluindo qualidade de acorde e baixo alternado;
4. calculadora de forma para capotraste e repertório persistido somente no dispositivo.

O afinador e a preparação de setlist avançada seguem como marcos desta fase. A Fase 2 permanece em calibração de análise tonal; avançar o kit não transforma aquele motor em versão final.

## Fase 4 — experiência de palco e release

O primeiro marco desta fase está entregue no app:

1. modo iniciante persistido, com caminho em três passos e orientações contextuais;
2. modo culto que escolhe uma música do repertório local e abre uma apresentação de alto contraste com tom, capo e cifras;
3. indicador online/offline, shell PWA atualizado e fallback para navegação offline após a primeira visita controlada pelo service worker;
4. controles de contraste, link para pular ao conteúdo e relações de abas acessíveis;
5. redesign editorial premium, pensado para uma marca internacional sem depender de imagens externas ou fontes remotas.

Antes de chamar a versão 1.0.0 de release final, ainda são obrigatórios: teste físico de microfone/instalação em Android e iOS, validação do cache em rede desligada, calibração do detector com gravações variadas e definição do serviço comercial de ativação.
