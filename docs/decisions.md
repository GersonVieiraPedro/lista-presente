# Decisions (ADRs)

## ADR-001 — Next.js full-stack em vez de FastAPI

- Data: 2026-09-26
- Status: accepted
- Contexto: a fábrica padrão separa Next.js e FastAPI. Este repositório já entregou o chá de casa nova como um único app Next.js (páginas e `app/api`), com deploy na Vercel e banco no Neon.
- Opções:
  - A: extrair um backend FastAPI e manter o frontend Next.js.
  - B: manter Route Handlers como API do MVP.
- Decisão: B. Um processo só, um deploy, Prisma no mesmo projeto.
- Consequências: contratos vivem em `docs/contracts.md`, não num OpenAPI gerado pelo FastAPI. Auth é NextAuth, não um serviço próprio. Um backend separado só entra com um ADR novo.

## ADR-002 — PostgreSQL no Neon com Prisma

- Data: 2026-09-26
- Status: accepted
- Contexto: a lista, as presenças e a idempotência do pagamento precisam sobreviver entre deploys.
- Opções:
  - A: JSON local (`app/data/itens.json`) como fonte da lista.
  - B: PostgreSQL (Neon) via Prisma 7 e `@prisma/adapter-neon`.
- Decisão: B para dados vivos. O JSON em `app/data/itens.json` ficou como referência de formato; a lista em tela vem de `GET /api/itens`.
- Consequências: `postinstall` roda `prisma generate`. Não há migrations SQL versionadas além de `prisma/migrations/migration_lock.toml`; o schema em `prisma/schema.prisma` é a fonte. Sincronizar um banco novo é decisão operacional (`prisma db push` ou migration futura), fora deste ADR.

## ADR-003 — Reserva do presente só após pagamento aprovado

- Data: 2026-09-26
- Status: accepted
- Contexto: reservar no clique deixa o item preso se o convidado abandonar o checkout.
- Opções:
  - A: `PATCH /api/itens` marca `reservado` antes do pagamento.
  - B: o webhook do Mercado Pago, com pagamento `approved`, atualiza cotas ou quantidade dentro de uma transação e grava `PagamentoProcessado`.
- Decisão: B para o fluxo de presentear. O `PATCH` continua no código para reserva manual e não é o caminho do checkout.
- Consequências: há uma janela em que dois pagamentos podem ser criados para o mesmo item. O webhook limita a reserva ao estoque restante e não reprocessa o mesmo `paymentId`. Pagamento aprovado sem estoque fica registrado no `WebhookLog`.

## ADR-004 — Checkout Pro do Mercado Pago

- Data: 2026-09-26
- Status: accepted
- Contexto: o casal precisa receber em PIX ou outros meios sem guardar cartão.
- Opções:
  - A: PIX estático com QR gerado no site (`/pix/[id]`).
  - B: preferência do Mercado Pago (`POST /api/pagar`) e retorno pelas `back_urls`.
- Decisão: B. `AMBIENTE=prod` usa token e `init_point` de produção; caso contrário, sandbox.
- Consequências: a página `/pix/[id]` não faz parte do fluxo de liquidação. O status pendente consulta a API do Mercado Pago pelo `preference_id`.
