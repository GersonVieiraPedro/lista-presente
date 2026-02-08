import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const preferenceId = url.searchParams.get('preference_id')

  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN_TESTE // ou PROD
  if (!preferenceId)
    return NextResponse.json(
      { error: 'Preference ID é obrigatório' },
      { status: 400 },
    )

  // Buscar pagamentos relacionados à preference
  const res = await fetch(
    `https://api.mercadopago.com/v1/payments/search?preference_id=${preferenceId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  const data = await res.json()
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pago = data.results.some((p: any) => p.status === 'approved')

  return NextResponse.json({
    status: pago ? 'paid' : 'pending',
    payments: data.results,
  })
}
