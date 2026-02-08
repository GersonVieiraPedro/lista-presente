import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { nome, email, imagemUrl } = await req.json()

  const usuario = await prisma.usuario.upsert({
    where: { email },
    update: { nome, imagemUrl },
    create: { email, nome, imagemUrl },
  })

  return NextResponse.json(usuario)
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')

  if (!email) {
    return NextResponse.json(
      { error: 'Email do usuário é obrigatório' },
      { status: 400 },
    )
  }
  try {
    const usuarios = await prisma.usuario.findMany({
      where: { email: email },
      include: {
        presencas: true,
      },
    })
    return NextResponse.json(usuarios)
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar usuários' },
      { status: 500 },
    )
  }
}
