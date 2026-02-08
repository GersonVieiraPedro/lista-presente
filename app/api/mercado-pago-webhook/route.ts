import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('💳 Webhook Mercado Pago recebido:')
    console.dir(body, { depth: null }) // mostra tudo, sem cortar objetos
  } catch (err) {
    console.error('Erro ao ler webhook:', err)
  }

  return NextResponse.json({ received: true })
}
