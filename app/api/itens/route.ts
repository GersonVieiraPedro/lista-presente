export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

/**
 * GET /api/itens
 * Lista itens de uma lista específica
 * ?listaId=xxxx
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const listaId = searchParams.get('listaId')

    if (!listaId) {
      return NextResponse.json(
        { error: 'listaId é obrigatório' },
        { status: 400 },
      )
    }

    const itens = await prisma.item.findMany({
      where: { listaId },
      orderBy: { prioridade: 'asc' },
    })

    return NextResponse.json(itens)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar itens' }, { status: 500 })
  }
}

/**
 * POST /api/itens
 * Cria um novo item
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const item = await prisma.item.create({
      data: {
        listaId: body.listaId,
        nome: body.nome,
        categoria: body.categoria,
        descricao: body.descricao,
        imagemUrl: body.imagemUrl,
        prioridade: body.prioridade,
        quantidade: body.quantidade,
        preco: body.preco,
        cotas: body.cotas,
        cotasValor: body.cotasValor,
        linkFora: body.linkFora,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao criar item' }, { status: 500 })
  }
}

/**
 * PATCH /api/itens
 * Reserva ou libera um item
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json()

    const { itemId, reservado, reservadoPor } = body

    if (!itemId || typeof reservado !== 'boolean') {
      return NextResponse.json(
        { error: 'itemId e reservado são obrigatórios' },
        { status: 400 },
      )
    }

    // busca item atual
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item não encontrado' },
        { status: 404 },
      )
    }

    // regra: não reservar duas vezes
    if (reservado && item.reservado) {
      return NextResponse.json(
        { error: 'Item já está reservado' },
        { status: 409 },
      )
    }

    const itemAtualizado = await prisma.item.update({
      where: { id: itemId },
      data: {
        reservado,
        reservadoPor: reservado ? reservadoPor : null,
        reservadoEm: reservado ? new Date() : null,
      },
    })

    return NextResponse.json(itemAtualizado)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Erro ao atualizar item' },
      { status: 500 },
    )
  }
}
