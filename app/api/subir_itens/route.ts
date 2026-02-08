export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'
import { Prisma } from '@prisma/client'
import * as XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'

interface ExcelRow {
  nome: string
  categoria?: string
  descricao?: string
  imagemUrl?: string
  prioridade?: string
  quantidade?: number
  preco: number | string
  linkFora?: string
}

export async function POST() {
  try {
    const listaId = '1ff541bd-515b-4fa0-a7dc-3f016f54852e'
    const filePath = path.join(process.cwd(), 'itens.xlsx')

    const fileBuffer = fs.readFileSync(filePath)
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    //
    const rows = XLSX.utils.sheet_to_json<ExcelRow>(sheet)

    const itens = rows
      .map((row) => {
        if (!row.nome || row.preco === undefined || row.preco === null) {
          return null
        }

        let preco: number

        // 👉 se já for número, usa direto
        if (typeof row.preco === 'number') {
          preco = row.preco
        } else {
          // 👉 se for string, só troca vírgula por ponto
          const normalizado = String(row.preco)
            .replace('R$', '')
            .replace(',', '.')
            .trim()

          preco = Number(normalizado)
        }

        if (isNaN(preco)) return null

        return {
          listaId,
          nome: String(row.nome ?? ''),
          categoria: String(row.categoria ?? ''),
          descricao: String(row.descricao ?? ''),
          imagemUrl: String(row.imagemUrl ?? ''),
          prioridade: String(row.prioridade ?? 'media'),
          quantidade: Number(row.quantidade ?? 1),
          preco, // ✅ agora correto
          cotas: 0,
          cotasReservadas: 0,
          cotasValor: 0,
          reservado: false,
          reservadoPor: null,
          reservadoEm: null,
          linkFora: row.linkFora ? String(row.linkFora) : null,
          compradoFora: false,
        } as Prisma.ItemCreateManyInput
      })
      .filter(Boolean)

    await prisma.item.createMany({
      data: itens.filter((i): i is Prisma.ItemCreateManyInput => i !== null),
    })

    return NextResponse.json({
      sucesso: true,
      inseridos: itens.length,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
