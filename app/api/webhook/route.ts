// /api/webhook.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()

  console.log('Webhook recebido:', body)

  const { id, type } = body

  if (type === 'payment') {
    // Buscar pagamento no Mercado Pago
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN_TESTE}`,
      },
    })
    const data = await res.json()
    console.log('Status do pagamento:', data.status)

    // Atualizar status no banco
    // Exemplo pseudo-código:
    // await prisma.presente.update({
    //   where: { id: data.external_reference },
    //   data: { statusPagamento: data.status }
    // })
  }

  return NextResponse.json({ ok: true })
}
