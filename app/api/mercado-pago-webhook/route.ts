// app/api/mercado-pago-webhook/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('Webhook Mercado Pago recebido:', body)

    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN_PROD
    if (!token) throw new Error('MERCADO_PAGO_ACCESS_TOKEN_PROD não definido')

    // === 1. Se for webhook de payment ===
    if (body.type === 'payment' && body.data?.id) {
      const paymentId = body.data.id

      // Consulta do pagamento para pegar external_reference e order
      const resPayment = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      const payment = await resPayment.json()
      console.log('1 | Detalhes do pagamento:', payment)

      if (payment.status !== 'approved') {
        console.log('Pagamento ainda não aprovado:', payment.status)
        return NextResponse.json({ received: true })
      }

      // Se houver order, usa a order para processar todos os payments
      if (payment.order?.id || payment.order?.resource) {
        const merchantOrderUrl =
          payment.order?.resource ||
          `https://api.mercadolibre.com/merchant_orders/${payment.order.id}`

        const resOrder = await fetch(merchantOrderUrl, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const order = await resOrder.json()
        console.log('2 | Detalhes da ordem:', order)

        for (const p of order.payments || []) {
          if (p.status !== 'approved' || !p.external_reference) continue

          const ref = JSON.parse(p.external_reference)
          const itemId = ref.id
          const quantidade = ref.quantidade ?? 1

          const select = await prisma.item.findUnique({ where: { id: itemId } })
          if (!select) {
            console.warn('Item não encontrado:', itemId)
            continue
          }

          const reservadoPorAtual = select.reservadoPor
            ? [...select.reservadoPor.split(','), p.payer?.name].join(', ')
            : (p.payer?.name ?? 'desconhecido')

          const cotasDisponiveis =
            (select.cotas ?? 1) - (select.cotasReservadas ?? 0)

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

          console.log(`3 | Item ${itemId} atualizado com ${quantidade} cotas`)
        }
      }

      return NextResponse.json({ received: true })
    }

    // === 2. Se for webhook de merchant_order direto ===
    if (body.topic === 'merchant_order' && body.resource) {
      const resOrder = await fetch(body.resource, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const order = await resOrder.json()
      console.log('Detalhes da ordem recebida (merchant_order):', order)

      for (const p of order.payments || []) {
        if (p.status !== 'approved' || !p.external_reference) continue

        const ref = JSON.parse(p.external_reference)
        const itemId = ref.id
        const quantidade = ref.quantidade ?? 1

        const select = await prisma.item.findUnique({ where: { id: itemId } })
        if (!select) {
          console.warn('Item não encontrado:', itemId)
          continue
        }

        const reservadoPorAtual = select.reservadoPor
          ? [...select.reservadoPor.split(','), p.payer?.name].join(', ')
          : (p.payer?.name ?? 'desconhecido')

        const cotasDisponiveis =
          (select.cotas ?? 1) - (select.cotasReservadas ?? 0)

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

        console.log(`Item ${itemId} atualizado com ${quantidade} cotas`)
      }

      return NextResponse.json({ received: true })
    }

    // Se não for payment nem merchant_order
    console.log('Webhook recebido não tratado:', body)
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Erro no webhook:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
