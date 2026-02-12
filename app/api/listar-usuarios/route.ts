import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        _count: {
          select: { presencas: true }, // Conta quantas pessoas o usuário vinculou
        },
        presencas: {
          select: {
            id: true, // 🔥 obrigatório para key
            nome: true,
            tipo: true,
            convidadoPresente: true,
          },
        },
      },
      orderBy: {
        criadoEm: 'desc', // Mais recentes primeiro
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
