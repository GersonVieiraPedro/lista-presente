import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 },
      )
    }

    const body = await req.json()
    const { acompanhantes } = body as {
      acompanhantes: { nome: string; tipo: string }[]
    }

    const { confirmou, motivoAusencia, mensagemAusencia } = body as {
      confirmou: boolean
      motivoAusencia?: string
      mensagemAusencia?: string
    }

    // garante usuário no banco
    const usuario = await prisma.usuario.upsert({
      where: { email: session.user.email },
      update: {
        nome: session.user.name,
        imagemUrl: session.user.image,
      },
      create: {
        email: session.user.email,
        nome: session.user.name,
        imagemUrl: session.user.image,
      },
    })

    // presença do próprio usuário
    await prisma.presenca.create({
      data: {
        nome: usuario.nome || 'Convidado',
        tipo: 'responsavel',
        acompanhante: false,
        responsavelEmail: usuario.email,
        usuarioId: usuario.id,
        convidadoPresente: confirmou,
        motivoAusencia: motivoAusencia || null,
        mensagem: mensagemAusencia || null,
      },
    })

    // Só salva acompanhantes se confirmou presença e tiver acompanhantes preenchidos (evita criar registros de acompanhantes para quem não vai)
    if (acompanhantes?.length > 0 && confirmou === true) {
      await prisma.presenca.createMany({
        data: acompanhantes.map((a) => ({
          nome: a.nome,
          tipo: a.tipo,
          acompanhante: true,
          responsavelEmail: usuario.email,
          usuarioId: usuario.id,
          convidadoPresente: confirmou,
          motivoAusencia: null,
          mensagem: null,
        })),
      })
    }

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { confirmouPresenca: true },
    })

    return NextResponse.json({ sucesso: true })
  } catch (error) {
    console.error('🔥 ERRO AO SALVAR PRESENÇA:', error)
    return NextResponse.json(
      { error: 'Erro ao confirmar presença' },
      { status: 500 },
    )
  }
}
