# Licenciamento e uso offline

## Decisão de produto

Tom Certo será comercializado. O produto deve pedir a ativação **somente na primeira utilização de cada dispositivo** e, depois disso, continuar utilizável mesmo sem conexão.

## O que é tecnicamente possível

É possível fazer uma PWA funcionar online e offline, inclusive após uma ativação inicial. A estratégia projetada é:

```text
primeiro uso online
  → código de ativação
  → serviço de licenças emite comprovante assinado para a instalação
  → navegador guarda comprovante e ID aleatório local
  → usos posteriores verificam assinatura localmente, inclusive offline
```

`src/licensing/` já contém as interfaces e o fluxo local desse contrato. A ativação remota ainda não está ligada a uma tela nem a um servidor neste lote.

## Limite importante

Uma PWA não recebe do navegador um ID de hardware estável e confiável. O `deviceId` é um UUID local e respeita privacidade: se dados do site forem apagados ou o app for instalado noutro navegador, haverá uma nova ativação. Isso é adequado para uma camada leve de proteção, mas não impede cópia por alguém tecnicamente determinado.

Uma chave secreta, algoritmo de “serial” ou validação só no JavaScript do cliente seria extraível e não deve ser tratada como segurança. Para controle comercial real, o produto precisará de um serviço mínimo de emissão/ativação que guarde a chave privada de assinatura e aplique o limite de dispositivos por licença. O app conterá apenas a chave pública.

## Proposta de experiência

1. Primeiro uso com rede: tela curta “Ative o Tom Certo neste dispositivo”.
2. O cliente envia serial e UUID local via HTTPS.
3. Após a resposta assinada, abre-se o app e a prova é persistida.
4. Em todos os usos seguintes, a assinatura e a validade são verificadas localmente, sem bloquear a música por estar offline.
5. Se a licença expirar (caso a modalidade escolhida tenha prazo), comunicar antecipadamente e aplicar uma política de carência a ser decidida pelo produto.

## Pendências antes de ativar a venda

- decidir licença perpétua versus assinatura e quantidade de ativações;
- escolher e implementar o serviço de ativação (pode ser pequeno; o DSP continua sem backend);
- definir chave pública Ed25519 e processo seguro de rotação;
- mover o comprovante de `localStorage` para IndexedDB com uma estratégia de recuperação, se necessário;
- criar tela acessível de ativação, estados offline e fluxo de troca de aparelho;
- definir suporte/revogação e política de privacidade.
