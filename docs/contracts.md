# Contracts

Contrato das rotas em `app/api`. Fonte da verdade entre as páginas e os handlers.

Status: vigente

## Convenções

- Base URL: mesma origem do app (`/api/...`)
- Formato: JSON, salvo `POST /api/enviar-email` em erro de body vazio (texto puro)
- Erro usual: `{ "error": "..." }`
- Auth: sessão NextAuth (JWT). Onde a rota não consulta a sessão, isso está explícito.

## Auth

### `GET|POST /api/auth/[...nextauth]`

- Auth: fluxo NextAuth (Google)
- Provedor: Google. Estratégia de sessão: JWT
- Callback de sessão copia `token.sub` para `session.user.id`

## Usuários e presença

### `POST /api/usuarios`

- Auth: sessão com e-mail
- Request: `{ "nome", "email", "imagemUrl" }`
- Response 200: usuário criado ou atualizado (`upsert` por e-mail)
- Erros: 401 sem sessão

### `GET /api/usuarios?email=`

- Auth: nenhuma checagem de sessão nesta rota
- Response 200: array de usuários com `presencas`
- Erros: 400 sem e-mail; 500 falha de banco

### `GET /api/listar-usuarios`

- Auth: nenhuma
- Response 200: usuários com contagem e presenças (`id`, `nome`, `tipo`, `convidadoPresente`), mais recentes primeiro
- Erros: 500

### `POST /api/presenca`

- Auth: sessão com e-mail
- Request:

```json
{
  "confirmou": true,
  "motivoAusencia": "opcional",
  "mensagemAusencia": "opcional",
  "acompanhantes": [{ "nome": "Ana", "tipo": "adulto" }]
}
```

- Comportamento: upsert do usuário; cria presença do responsável; cria acompanhantes só se `confirmou === true` e a lista não estiver vazia; marca `confirmouPresenca: true`
- Response 200: `{ "sucesso": true }`
- Erros: 401 sem sessão; 500 falha ao gravar

### `POST /api/enviar-email`

- Auth: nenhuma
- Request: `{ "to", "subject", "html" }`
- Response 200: `{ "success": true }`
- Erros: 400 body vazio ou campos faltando; 500 falha SMTP
- Remetente: `Vitória & Gerson` com `SMTP_USER`

## Itens

### `GET /api/itens?listaId=`

- Auth: nenhuma
- Response 200: array de itens da lista, ordenados por `prioridade` ascendente
- Erros: 400 sem `listaId`; 500

### `POST /api/itens`

- Auth: nenhuma
- Request: `listaId`, `nome`, `categoria`, `descricao`, `imagemUrl`, `prioridade`, `quantidade`, `preco`, `cotas`, `cotasValor`, `linkFora`
- Response 201: item criado
- Erros: 500

### `PATCH /api/itens`

- Auth: nenhuma
- Request: `{ "itemId", "reservado": true, "reservadoPor" }`
- Comportamento: não reserva de novo um item já `reservado` (409). Não é o caminho do checkout (ver ADR-003).
- Response 200: item atualizado
- Erros: 400 campos obrigatórios; 404 item inexistente; 409 já reservado; 500

## Pagamento

### `POST /api/pagar`

- Auth: nenhuma na rota; o cliente envia nome e e-mail lidos do cookie de sessão
- Request:

```json
{
  "titulo": "🎁 Air Fryer",
  "valor": 54.99,
  "descricao": "texto livre",
  "urlFoto": "https://...",
  "categoria": "Eletrodomésticos",
  "usuario_email": "a@b.com",
  "usuario_nome": "Ana",
  "external_reference": "{\"id\":\"uuid-do-item\",\"quantidade\":1,\"usuarioName\":\"Ana\"}"
}
```

- Comportamento: cria preferência no Mercado Pago. `notification_url` aponta para `/api/mercado-pago-webhook`. `back_urls` apontam para `/pagamento/sucesso|pendente|erro`. `external_reference` segue como string.
- Response 200: `{ "init_point": "https://..." }` — URL de produção se `AMBIENTE=prod`, senão `sandbox_init_point`
- Erros: 500 sem token; status repassado se o Mercado Pago recusar a preferência

### `POST /api/mercado-pago-webhook`

- Auth: nenhuma assinatura validada
- Corpo: notificação do Mercado Pago (`type: payment` com `data.id`, ou `topic: merchant_order` com `resource`)
- Comportamento:
  1. Busca o pagamento (ou a ordem) com o token do ambiente.
  2. Ignora status diferente de `approved`.
  3. Ignora `paymentId` já presente em `PagamentoProcessado`.
  4. Interpreta `external_reference` como JSON `{ id, quantidade, usuarioName }`.
  5. Em transação: incrementa cotas **ou** decrementa quantidade, até o disponível; anexa o nome em `reservadoPor`; grava o pagamento processado.
- Response 200: `{ "received": true }` também para webhook ignorado
- Erros: 500; o log é persistido em `WebhookLog` quando o banco responde

### `GET /api/mercado-pago-status?preference_id=`

- Auth: nenhuma
- Token usado no código: `MERCADO_PAGO_ACCESS_TOKEN_TESTE`
- Response 200: `{ "status": "paid" | "pending", "payments": [] }` — `paid` se algum resultado está `approved`
- Erros: 400 sem `preference_id`

## Fora do contrato ativo

- Upload de planilha em `/app/api/subir_itens` está no `.gitignore` e não faz parte deste contrato.
- `/pix/[id]` não chama estas rotas para liquidar um presente.
