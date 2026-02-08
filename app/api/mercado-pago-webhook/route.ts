// app/api/mercado-pago-webhook/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const receivedAt = new Date()
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logEntry: any = {
    receivedAt,
    webhookType: null,
    webhookBody: null,
    fetchedResource: null,
    statusProcessed: null,
    externalReference: null,
    itemIdsAffected: [],
    logs: [],
  }

  try {
    const body = await req.json()
    console.log('Webhook Mercado Pago recebido:', body)
    logEntry.webhookBody = body
    logEntry.webhookType = body.type || body.topic

    // Define token dependendo do ambiente
    const token =
      process.env.AMBIENTE === 'prod'
        ? process.env.MERCADO_PAGO_ACCESS_TOKEN_PROD
        : process.env.MERCADO_PAGO_ACCESS_TOKEN_TESTE

    if (!token) throw new Error('Token do Mercado Pago não definido')

    // Função auxiliar para processar pagamentos aprovados
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function processarPagamentoAprovado(payment: any) {
      if (payment.status !== 'approved') {
        logEntry.logs.push(
          `Pagamento ${payment.id} não aprovado: ${payment.status}`,
        )
        return
      }

      if (!payment.external_reference) {
        logEntry.logs.push(`Pagamento sem external_reference: ${payment.id}`)
        return
      }

      const ref = JSON.parse(payment.external_reference)
      logEntry.externalReference = ref.id
      const itemId = ref.id
      const quantidade = ref.quantidade ?? 1
      const usuarioName = ref.usuarioName ?? 'desconhecido'
      console.log(
        `Processando pagamento aprovado para item ${itemId}, quantidade ${quantidade}, usuário ${usuarioName}`,
      )

      const item = await prisma.item.findUnique({ where: { id: itemId } })
      if (!item) {
        logEntry.logs.push(`Item não encontrado: ${itemId}`)
        return
      }

      const reservadoPorAtual = item.reservadoPor
        ? [...item.reservadoPor.split(','), usuarioName].join(', ')
        : usuarioName

      const cotasDisponiveis = (item.cotas ?? 1) - (item.cotasReservadas ?? 0)

      await prisma.item.update({
        where: { id: itemId },
        data: {
          cotasReservadas:
            cotasDisponiveis >= quantidade
              ? { increment: quantidade }
              : { increment: cotasDisponiveis },
          reservado: cotasDisponiveis <= quantidade,
          reservadoPor: reservadoPorAtual,
          reservadoEm: new Date(),
        },
      })

      logEntry.itemIdsAffected.push(itemId)
      logEntry.logs.push(`Item ${itemId} atualizado com ${quantidade} cota(s)`)
      logEntry.statusProcessed = 'approved'
    }

    // === 1) Notificações de pagamento ===
    if (body.type === 'payment' && body.data?.id) {
      const paymentId = body.data.id

      const resPayment = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )

      if (!resPayment.ok) {
        const errorText = await resPayment.text()
        console.error('Erro ao buscar pagamento:', errorText)
        logEntry.logs.push(`Erro ao buscar pagamento: ${errorText}`)
        await prisma.webhookLog.create({ data: logEntry })
        return NextResponse.json({ received: true })
      }

      const payment = await resPayment.json()
      logEntry.fetchedResource = payment

      await processarPagamentoAprovado(payment)
      await prisma.webhookLog.create({ data: logEntry })
      return NextResponse.json({ received: true })
    }

    // === 2) Notificações de merchant_order (ordem de compra) ===
    if (body.topic === 'merchant_order' && body.resource) {
      const resOrder = await fetch(body.resource, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!resOrder.ok) {
        const errorText = await resOrder.text()
        console.error('Erro ao buscar merchant_order:', errorText)
        logEntry.logs.push(`Erro ao buscar merchant_order: ${errorText}`)
        await prisma.webhookLog.create({ data: logEntry })
        return NextResponse.json({ received: true })
      }

      const order = await resOrder.json()
      logEntry.fetchedResource = order
      console.log('Detalhes da ordem:', order)

      // Processa todos os pagamentos da ordem
      for (const p of order.payments || []) {
        await processarPagamentoAprovado(p)
      }

      await prisma.webhookLog.create({ data: logEntry })
      return NextResponse.json({ received: true })
    }

    // Tipo de webhook não tratado
    logEntry.logs.push(
      `Tipo de webhook não tratado: ${body.type || body.topic}`,
    )
    await prisma.webhookLog.create({ data: logEntry })
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Erro no webhook:', err)
    logEntry.logs.push(`Erro interno: ${String(err)}`)
    await prisma.webhookLog.create({ data: logEntry })
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
