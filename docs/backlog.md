# Backlog

Ordem = prioridade. Itens abaixo da linha de “entregue” já estão no código do evento. A dívida é o que ainda não cumpre o critério.

## Fatia ativa

Nenhuma. Próxima candidata: F-101 (fechar rotas sem autenticação).

## Entregue

### F-001 — Entrar e confirmar presença

- Status: done
- Valor: o convidado se identifica e responde ao convite sem mensagem manual.
- Aceite:
  - [x] Login Google em `/`
  - [x] Usuário criado ou atualizado por e-mail
  - [x] Presença, ausência e até 5 acompanhantes
  - [x] E-mail de confirmação
  - [x] Quem já respondeu vê o resumo e o atalho para a lista
- Dependências: Google OAuth, SMTP, Neon

### F-002 — Ver e filtrar a lista

- Status: done
- Valor: o convidado acha um presente disponível.
- Aceite:
  - [x] `/lista` só abre com sessão
  - [x] Itens vindos de `GET /api/itens`
  - [x] Busca por nome ou categoria
  - [x] Ordenação por menor/maior preço e filtro de disponíveis
  - [x] Explicação de cotas no topo da lista
- Dependências: F-001

### F-003 — Pagar e reservar

- Status: done
- Valor: o presente só sai da lista quando o pagamento é aprovado.
- Aceite:
  - [x] Detalhe em `/presentear/[id]` com quantidade
  - [x] Preferência Mercado Pago e redirecionamento ao `init_point`
  - [x] Retorno sucesso, pendente e erro
  - [x] Webhook idempotente reserva cotas ou quantidade
  - [x] Modal de agradecimento em `/lista?presenteou=true`
- Dependências: F-002, credenciais Mercado Pago
- Notas: página pendente inverte o texto visual em relação ao `status` retornado pela API (dívida F-104).

### F-004 — Painel do casal

- Status: done
- Valor: o casal vê quem confirmou e avisa um presente comprado fora.
- Aceite:
  - [x] Lista de usuários e presenças em `/usuarios/listar`
  - [x] Exportação Excel
  - [x] E-mail de item reservado / comprado fora
- Dependências: F-001
- Notas: a página não exige login (dívida F-101).

## Dívida explícita

### F-101 — Proteger dados de convidado e ações de escrita

- Status: proposed
- Valor: nome, e-mail e presença não ficam em rotas abertas; só o casal dispara e-mail e vê o painel.
- Aceite:
  - [ ] `GET /api/listar-usuarios` e `/usuarios/listar` exigem sessão autorizada
  - [ ] `GET /api/usuarios` só devolve o e-mail da própria sessão
  - [ ] `POST /api/enviar-email` e `POST /api/itens` exigem sessão autorizada
  - [ ] Webhook do Mercado Pago valida a origem da notificação
- Dependências: definição de quem é “casal” (e-mail allowlist ou papel)
- Notas: ver riscos em `docs/architecture.md`

### F-102 — Lista configurável

- Status: proposed
- Valor: trocar o evento sem editar componente.
- Aceite:
  - [ ] `listaId` (ou slug) vem de ambiente ou da tabela `Lista`, não de string fixa na UI
- Dependências: nenhuma

### F-103 — Testes do fluxo feliz

- Status: proposed
- Valor: regressão visível antes do próximo evento.
- Aceite:
  - [ ] Um teste de API cobre reserva idempotente do webhook com pagamento aprovado
  - [ ] Um teste de UI cobre login simulado até a lista, ou a dívida permanece explícita se o ambiente Google impedir
- Dependências: F-003

### F-104 — Página de pagamento pendente

- Status: proposed
- Valor: o convidado lê o status certo enquanto espera o PIX.
- Aceite:
  - [ ] `status === 'paid'` mostra confirmação; o contrário mostra espera
  - [ ] A consulta usa o token do mesmo `AMBIENTE` de `POST /api/pagar`
- Dependências: F-003

### F-105 — PIX estático

- Status: proposed
- Valor: um único caminho de pagamento.
- Aceite:
  - [ ] `/pix/[id]` deixa de ser alcançável, ou passa a usar o Checkout Pro
- Dependências: ADR-004
