// app/api/mercado-pago-webhook/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('Webhook Mercado Pago recebido:', body)

    // Normalmente o evento é payment.updated
    if (body.type === 'payment') {
      const paymentId = body.data.id

      // Consulta o pagamento na API do Mercado Pago (recomendado)
      const token = process.env.MERCADO_PAGO_ACCESS_TOKEN_PROD
      const res = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      const payment = await res.json()
      console.log('Detalhes do pagamento:', payment)

      // Verifica se o pagamento foi aprovado
      if (payment.status === 'approved') {
        // Atualiza o item correspondente no banco
        // Aqui consideramos que payment.external_reference = listaId ou itemId
        const itemId = payment.external_reference

        const updated = await prisma.item.updateMany({
          where: {
            id: itemId,
            reservado: false, // evita sobrescrever se já reservado
          },
          data: {
            reservado: true,
            reservadoPor: payment.payer?.email ?? 'desconhecido',
            reservadoEm: new Date(),
          },
        })

        console.log('Itens atualizados:', updated.count)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Erro no webhook:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
