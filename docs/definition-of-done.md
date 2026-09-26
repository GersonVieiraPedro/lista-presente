# Definition of done

Uma fatia nova só está **done** se:

- [ ] Aceite em `docs/backlog.md` cumprido
- [ ] Comportamento alinhado a `docs/contracts.md` e `docs/data-model.md`
- [ ] Teste da fatia existe, ou a ausência está escrita como dívida no backlog
- [ ] Sem segredo no git; `.env*` continua ignorado
- [ ] Rota nova que lê ou grava presença, e-mail ou pagamento exige sessão, salvo o webhook (que deve autenticar a notificação do Mercado Pago)
- [ ] Erro de API aparece na interface (mensagem), sem tela branca
- [ ] ADR criado se a fatia desviar da stack deste repositório (Next.js + Prisma + Neon + Mercado Pago)

Stack de teste esperada daqui para frente: Vitest ou Playwright no app Next.js. Não há suíte Pytest, porque não há backend FastAPI ([ADR-001](decisions.md)).

O evento atual (F-001 a F-004) foi entregue antes desta definição. A dívida de teste está em F-103.
