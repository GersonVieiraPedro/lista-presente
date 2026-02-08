// app/api/mercado-pago-webhook/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('Webhook Mercado Pago recebido:', body)

    // Define token dependendo do ambiente
    const token =
      process.env.AMBIENTE === 'prod'
        ? process.env.MERCADO_PAGO_ACCESS_TOKEN_PROD
        : process.env.MERCADO_PAGO_ACCESS_TOKEN_TESTE

    if (!token) {
      return NextResponse.json(
        { error: 'Token do Mercado Pago não definido' },
        { status: 500 },
      )
    }

    // Função auxiliar para processar pagamentos aprovados com external_reference
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function processarPagamentoAprovado(payment: any) {
      if (payment.status !== 'approved') return

      if (!payment.external_reference) {
        console.warn(`Pagamento aprovado sem external_reference: ${payment.id}`)
        return
      }

      let ref
      try {
        ref = JSON.parse(payment.external_reference)
      } catch {
        console.warn(
          `External_reference inválido: ${payment.external_reference}`,
        )
        return
      }

      const itemId = ref.id
      const quantidade = ref.quantidade ?? 1

      const item = await prisma.item.findUnique({ where: { id: itemId } })
      if (!item) {
        console.warn('Item não encontrado:', itemId)
        return
      }

      const reservadoPorAtual = item.reservadoPor
        ? [...item.reservadoPor.split(','), payment.payer?.name].join(', ')
        : (payment.payer?.name ?? 'desconhecido')

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

      console.log(`Item ${itemId} atualizado com ${quantidade} cota(s)`)
    }

    // === 1) Webhook de pagamento ===
    if (body.type === 'payment' && body.data?.id) {
      const paymentId = body.data.id

      const resPayment = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )

      if (!resPayment.ok) {
        console.error('Erro ao buscar pagamento:', await resPayment.text())
        return NextResponse.json({ received: true })
      }

      const payment = await resPayment.json()
      console.log('Detalhes do pagamento:', payment)

      await processarPagamentoAprovado(payment)

      return NextResponse.json({ received: true })
    }

    // === 2) Webhook de merchant_order ===
    if (body.topic === 'merchant_order' && body.resource) {
      const resOrder = await fetch(body.resource, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!resOrder.ok) {
        console.error('Erro ao buscar merchant_order:', await resOrder.text())
        return NextResponse.json({ received: true })
      }

      const order = await resOrder.json()
      console.log('Detalhes da ordem:', order)

      if (!order.payments || order.payments.length === 0) {
        console.log(
          `Nenhum pagamento aprovado encontrado para a order ${order.id}`,
        )
      }

      // Processa todos os pagamentos da ordem
      for (const p of order.payments || []) {
        await processarPagamentoAprovado(p)
      }

      return NextResponse.json({ received: true })
    }

    // Tipo de webhook não tratado
    console.log('Tipo de webhook não tratado:', body.type || body.topic)
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Erro no webhook:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
