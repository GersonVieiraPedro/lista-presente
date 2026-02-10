import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      titulo,
      valor,
      descricao,
      urlFoto,
      categoria,
      usuario_email,
      usuario_nome,
      external_reference,
    } = body

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
    const notificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercado-pago-webhook`

    console.log('Notification URL:', notificationUrl)

    // Cria a preferência
    const response = await fetch(
      'https://api.mercadopago.com/checkout/preferences',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              title: titulo,
              description: descricao,
              picture_url: urlFoto,
              category_id: categoria,
              quantity: 1,
              unit_price: Number(valor),
            },
          ],
          payer: {
            email: usuario_email || '',
            name: usuario_nome || '',
          },

          back_urls: {
            success: `${process.env.NEXT_PUBLIC_WEBHOOK_URL}/pagamento/sucesso`,
            pending: `${process.env.NEXT_PUBLIC_WEBHOOK_URL}/pagamento/pendente`,
            failure: `${process.env.NEXT_PUBLIC_WEBHOOK_URL}/pagamento/erro`,
          },
          notification_url: notificationUrl,
          external_reference: external_reference, // para referência futura no webhook
          statement_descriptor: 'Lista de Presentes',
          auto_return: 'approved',
          binary_mode: false,
        }),
      },
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Erro ao criar preferência:', data)
      return NextResponse.json(data, { status: response.status })
    }

    //console.log('Preferência criada:', data)

    // Retorna o link correto para o frontend abrir
    return NextResponse.json({
      init_point:
        process.env.AMBIENTE === 'prod'
          ? data.init_point
          : data.sandbox_init_point,
    })
  } catch (err) {
    console.error('Erro interno no backend:', err)
    return NextResponse.json(
      { error: 'Erro interno ao criar pagamento' },
      { status: 500 },
    )
  }
}
