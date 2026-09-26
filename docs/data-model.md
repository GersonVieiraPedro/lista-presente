# Data model

Status: vigente · PostgreSQL (Neon) · Prisma em `prisma/schema.prisma`

Identificadores de `Lista`, `Item`, `Usuario` e `Presenca` são UUID em texto (`gen_random_uuid()`). `WebhookLog` e `PagamentoProcessado` usam `cuid()`.

## Entidades

### Lista

Agrupa os presentes de um evento.

| Campo | Tipo | Restrições |
| --- | --- | --- |
| id | text (uuid) | PK |
| slug | text | único |
| titulo | text | obrigatório |
| descricao | text | opcional |
| dataInicio | timestamptz | obrigatório |
| dataFim | timestamptz | opcional |
| moeda | text | default `BRL` |
| criadoEm | timestamptz | default now |
| atualizadoEm | timestamptz | atualizado pelo Prisma |

### Item

Presente dentro de uma lista. Dois modos de estoque:

- **Cotas:** `cotas` > 1. Cada pagamento incrementa `cotasReservadas`. `reservado` vira verdadeiro quando não há cota livre.
- **Quantidade:** caso contrário. Cada pagamento decrementa `quantidade`. `reservado` vira verdadeiro quando a quantidade chega a zero.

| Campo | Tipo | Restrições |
| --- | --- | --- |
| id | text (uuid) | PK |
| listaId | text | FK → Lista.id |
| nome | text | obrigatório |
| categoria | text | obrigatório |
| descricao | text | opcional |
| imagemUrl | text | opcional |
| prioridade | enum `alta` \| `media` \| `baixa` | obrigatório |
| quantidade | int | obrigatório |
| preco | float | obrigatório |
| cotas | int | opcional |
| cotasReservadas | int | default 0 |
| cotasValor | float | valor de uma cota, opcional |
| reservado | boolean | default false |
| reservadoPor | text | nomes acumulados, separados por vírgula |
| reservadoEm | timestamptz | opcional |
| compradoFora | boolean | default false |
| linkFora | text | loja externa, opcional |
| criadoEm / atualizadoEm | timestamptz | |

### Usuario

Convidado identificado pelo e-mail do Google.

| Campo | Tipo | Restrições |
| --- | --- | --- |
| id | text (uuid) | PK |
| email | text | único |
| nome | text | opcional |
| imagemUrl | text | opcional |
| confirmouPresenca | boolean | default false; o fluxo de presença grava `true` após o POST, inclusive na ausência |
| criadoEm / atualizadoEm | timestamptz | |

### Presenca

Uma linha para o responsável e uma linha por acompanhante.

| Campo | Tipo | Restrições |
| --- | --- | --- |
| id | text (uuid) | PK |
| nome | text | obrigatório |
| tipo | text | `responsavel` ou o tipo informado no formulário |
| acompanhante | boolean | false no responsável |
| responsavelEmail | text | e-mail de quem confirmou |
| convidadoPresente | boolean | true se confirmou ida |
| motivoAusencia | text | opcional |
| mensagem | text | opcional |
| usuarioId | text | FK opcional → Usuario.id |
| criadoEm / atualizadoEm | timestamptz | |

### WebhookLog

Auditoria de cada POST do Mercado Pago.

| Campo | Tipo | Restrições |
| --- | --- | --- |
| id | cuid | PK |
| receivedAt | timestamptz | |
| webhookType | text | `type` ou `topic` |
| webhookBody | json | corpo recebido |
| fetchedResource | json | pagamento ou merchant order consultado |
| statusProcessed | text | `approved` quando a reserva ocorreu |
| externalReference | text | id do item extraído da referência |
| itemIdsAffected | text[] | |
| logs | text[] | trilha em texto |

### PagamentoProcessado

Idempotência: um `paymentId` do Mercado Pago só reserva uma vez.

| Campo | Tipo | Restrições |
| --- | --- | --- |
| id | cuid | PK |
| paymentId | text | único |
| itemId | text | |
| createdAt | timestamptz | default now |

### item_backup

Cópia estrutural de `Item`, sem relação com `Lista`. Não participa do fluxo da aplicação.

## Relacionamentos

- `Lista` 1—N `Item`
- `Usuario` 1—N `Presenca` (`usuarioId` opcional na presença)

## Índices

- `Lista.slug` único
- `Usuario.email` único
- `PagamentoProcessado.paymentId` único

## Invariantes

- Não criar duas reservas para o mesmo `paymentId`.
- Cota reservada não ultrapassa `cotas`. Quantidade não é decrementada abaixo de zero: o webhook reserva só o mínimo entre o pedido e o disponível.
- `external_reference` do pagamento é um JSON com `id` (item), `quantidade` e `usuarioName`.
- Acompanhantes só são gravados se `confirmou` for verdadeiro.

## Fora do modelo vivo

`app/data/itens.json` não é lido como fonte da lista em produção. O componente importa o tipo/forma, e os itens exibidos vêm da API.
