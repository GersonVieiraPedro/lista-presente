import { NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('Webhook Mercado Pago recebido:', body)

    if (body.type === 'payment') {
      const paymentId = body.data.id
      const token = process.env.MERCADO_PAGO_ACCESS_TOKEN_PROD
      const res = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      const payment = await res.json()
      console.log('Detalhes do pagamento:', payment)

      if (payment.status === 'approved') {
        const ref = JSON.parse(payment.external_reference)
        const itemId = ref.id
        const quantidade = ref.quantidade ?? 1

        const select = await prisma.item.findUnique({
          where: { id: itemId },
        })

        if (!select) {
          console.warn('Item not found:', itemId)
          return NextResponse.json({ error: 'Item not found' }, { status: 404 })
        }

        const temCotas = select?.cotas ? select?.cotas : 0

        if (
          select.reservado === false &&
          temCotas > 0 &&
          temCotas - select.cotasReservadas != 0 &&
          temCotas - select.cotasReservadas >= quantidade
        ) {
          console.warn('Reservado presente com contas:', ref)

          const reservadoPorAtual = select.reservadoPor
            ? [...select.reservadoPor.split(','), payment.payer?.name].join(
                ', ',
              )
            : (payment.payer?.name ?? 'desconhecido')

          const updated = await prisma.item.updateMany({
            where: { id: itemId },
            data: {
              reservado: true,
              cotasReservadas: { increment: quantidade },
              reservadoPor: reservadoPorAtual ?? 'desconhecido',
              reservadoEm: new Date(),
            },
          })

          console.log('Itens atualizados:', updated.count)
        } else {
          console.log(
            'Não foi possível reservar o item. Verifique as cotas disponíveis.',
            ref,
          )
          const updated = await prisma.item.updateMany({
            where: { id: itemId },
            data: {
              reservado: true,
              reservadoPor: payment.payer?.name ?? 'desconhecido',
              reservadoEm: new Date(),
            },
          })
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Erro no webhook:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
