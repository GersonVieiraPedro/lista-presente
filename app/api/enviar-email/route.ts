// app/api/enviar-email/route.ts
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  try {
    const text = await req.text()
    if (!text) return new Response('Body vazio', { status: 400 })

    const body = JSON.parse(text) // garante que não quebra com undefined
    //console.log('Dados recebidos para envio de e-mail:', body)
    const { to, subject, html } = body

    if (!to || !subject || !html) {
      return new Response('Parâmetros faltando', { status: 400 })
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: `"Vitória & Gerson" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    })

    return new Response(JSON.stringify({ success: true }), { status: 200 })
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('Erro ao enviar e-mail:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
