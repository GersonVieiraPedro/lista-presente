# Product

Status: vigente (evento em uso)

## Problema

Convidados de um chá de casa nova precisam confirmar presença e presentear o casal sem planilha, PIX solto no WhatsApp ou dúvida sobre o que já foi comprado. Os anfitriões precisam saber quem vem, com quem, e quais presentes já foram pagos.

## Público

- Primário: convidados de Vitória e Gerson (confirmam presença e escolhem um presente).
- Secundário: o casal anfitrião (acompanha confirmações, exporta a lista e avisa quem reservou um item comprado fora da plataforma).

Premissa: um único evento, uma única lista. Não é um produto multi-casal.

## Proposta de valor

Para convidados de um chá de casa nova, o site confirma presença, mostra a lista e cobra o presente pelo Mercado Pago, diferente de uma lista estática ou de mensagens avulsas.

## Hipótese do MVP

Convidados conseguem, sozinhos, entrar com a conta Google, responder ao convite e pagar um item (inteiro ou em cotas) sem o casal intermediar cada transferência.

## Escopo do MVP (in)

- Login com Google.
- Confirmação de presença, ausência com motivo e até 5 acompanhantes.
- E-mail de confirmação de presença.
- Lista de presentes com busca, ordenação por preço e filtro de disponíveis.
- Item inteiro ou dividido em cotas.
- Checkout Mercado Pago (produção ou sandbox conforme `AMBIENTE`).
- Reserva automática do item quando o pagamento é aprovado (webhook, idempotente).
- Páginas de retorno: sucesso, pendente e erro.
- Painel do casal com convidados, exportação Excel e e-mail de item comprado fora.

## Fora de escopo (out)

- Várias listas ou vários casais no mesmo deploy.
- Cadastro com e-mail e senha.
- App mobile nativo.
- Estorno, reembolso ou disputa dentro do site.
- Edição pública do catálogo pelo convidado.
- Backend FastAPI separado.

## Métrica de sucesso (MVP)

- Convidado autenticado confirma presença (ou ausência) e recebe e-mail.
- Pagamento aprovado reserva o item ou incrementa as cotas, uma única vez por `paymentId`.
- O casal enxerga a lista de confirmações e exporta para planilha.

## Premissas

- O evento é o Chá de Casa Nova de Vitória e Gerson.
- O convidado tem conta Google.
- O pagamento passa pelo Mercado Pago; o site não guarda dados de cartão.
- A lista ativa está fixa no frontend (um `listaId`).

## Riscos de produto

| Risco | Sinal | Mitigação |
| --- | --- | --- |
| Dois convidados pagam o último item ao mesmo tempo | Webhook chega com estoque já zerado | Transação no webhook; cotas/quantidade não ficam negativas; pagamento extra fica só no log |
| Convidado acha que pagou e o item não reserva | Mercado Pago aprova, mas o webhook falha | `WebhookLog` e `PagamentoProcessado`; página pendente consulta o status |
| Lista “sumiu” depois do login | `listaId` hardcoded não existe no banco | Conferir o id usado em `listaPresentes` e `presentear/[id]` contra a tabela `Lista` |
