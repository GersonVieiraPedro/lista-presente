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

    // Caso o webhook seja de payment
    if (body.type === 'payment' && body.data?.id) {
      const paymentId = body.data.id

      // Consulta o payment para pegar o external_reference
      const resPayment = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      const payment = await resPayment.json()
      console.log('Detalhes do pagamento:', payment)

      // Confere status
      if (payment.status !== 'approved') {
        console.log('Pagamento ainda não aprovado:', payment.status)
        return NextResponse.json({ received: true })
      }

      // Consulta a order (link do merchant_order)
      const merchantOrderUrl = payment.order?.id
        ? `https://api.mercadolibre.com/merchant_orders/${payment.order.id}`
        : payment.order?.resource
      if (!merchantOrderUrl) {
        console.warn('Não encontrou link da order no pagamento')
        return NextResponse.json({ received: true })
      }

      const resOrder = await fetch(merchantOrderUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const order = await resOrder.json()
      console.log('Detalhes da ordem:', order)

      // Atualiza os itens conforme os payments da order
      for (const p of order.payments || []) {
        if (p.status !== 'approved') continue
        if (!p.external_reference) continue

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

        // Atualiza o item no banco
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
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Erro no webhook:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
