/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/mercado-pago-webhook/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const receivedAt = new Date()

  const logEntry: any = {
    receivedAt,
    webhookType: null,
    webhookBody: null,
    fetchedResource: null,
    statusProcessed: null,
    externalReference: null,
    itemIdsAffected: [],
    logs: [],
  }

  try {
    const body = await req.json()
    logEntry.webhookBody = body
    logEntry.webhookType = body.type || body.topic

    const token =
      process.env.AMBIENTE === 'prod'
        ? process.env.MERCADO_PAGO_ACCESS_TOKEN_PROD
        : process.env.MERCADO_PAGO_ACCESS_TOKEN_TESTE

    if (!token) throw new Error('Token do Mercado Pago não definido')

    // ============================
    // PROCESSAMENTO PRINCIPAL
    // ============================
    async function processarPagamentoAprovado(payment: any) {
      if (payment.status !== 'approved') {
        logEntry.logs.push(
          `Pagamento ${payment.id} ignorado (${payment.status})`,
        )
        return
      }

      // 🔒 IDMPOTÊNCIA
      const jaProcessado = await prisma.pagamentoProcessado.findUnique({
        where: { paymentId: String(payment.id) },
      })

      if (jaProcessado) {
        logEntry.logs.push(`Pagamento ${payment.id} já processado`)
        return
      }

      if (!payment.external_reference) {
        logEntry.logs.push(`Pagamento ${payment.id} sem external_reference`)
        return
      }
      //https://typescript-eslint.io/rules/no-explicit-any
      let ref: any
      try {
        ref = JSON.parse(payment.external_reference)
      } catch {
        logEntry.logs.push(`external_reference inválido`)
        return
      }

      const itemId = ref.id
      const quantidade = ref.quantidade ?? 1
      const usuarioName = ref.usuarioName ?? 'desconhecido'

      logEntry.externalReference = itemId

      // ============================
      // TRANSACTION (ANTI-CONCORRÊNCIA)
      // ============================
      await prisma.$transaction(async (tx) => {
        const item = await tx.item.findUnique({
          where: { id: itemId },
        })

        if (!item) {
          logEntry.logs.push(`Item não encontrado: ${itemId}`)
          return
        }

        const reservadoPorAtual = item.reservadoPor
          ? `${item.reservadoPor}, ${usuarioName}`
          : usuarioName

        const isItemPorCota = item.cotas !== null && item.cotas > 1

        // ============================
        // 🟦 ITEM POR COTAS
        // ============================
        if (isItemPorCota) {
          const cotasTotais = item.cotas ?? 0
          const cotasReservadas = item.cotasReservadas ?? 0
          const cotasDisponiveis = cotasTotais - cotasReservadas

          if (cotasDisponiveis <= 0) {
            logEntry.logs.push(`Item ${item.nome} já totalmente reservado`)
            return
          }

          const cotasParaReservar = Math.min(quantidade, cotasDisponiveis)

          await tx.item.update({
            where: { id: itemId },
            data: {
              cotasReservadas: { increment: cotasParaReservar },
              reservado: cotasDisponiveis - cotasParaReservar === 0,
              reservadoPor: reservadoPorAtual,
              reservadoEm: new Date(),
            },
          })

          logEntry.logs.push(
            `Item por cotas: ${item.nome} | ${cotasParaReservar}/${cotasTotais}`,
          )
        }

        // ============================
        // 🟩 ITEM POR QUANTIDADE
        // ============================
        else {
          const quantidadeAtual = item.quantidade ?? 0

          if (quantidadeAtual <= 0) {
            logEntry.logs.push(`Item ${item.nome} sem estoque`)
            return
          }

          const quantidadeParaReservar = Math.min(quantidade, quantidadeAtual)

          await tx.item.update({
            where: { id: itemId },
            data: {
              quantidade: { decrement: quantidadeParaReservar },
              reservado: quantidadeAtual - quantidadeParaReservar === 0,
              reservadoPor: reservadoPorAtual,
              reservadoEm: new Date(),
            },
          })

          logEntry.logs.push(
            `Item por quantidade: ${item.nome} | ${quantidadeParaReservar}`,
          )
        }

        // 🔒 MARCA COMO PROCESSADO
        await tx.pagamentoProcessado.create({
          data: {
            paymentId: String(payment.id),
            itemId,
          },
        })

        logEntry.itemIdsAffected.push(itemId)
        logEntry.statusProcessed = 'approved'
      })
    }

    // ============================
    // PAYMENT
    // ============================
    if (body.type === 'payment' && body.data?.id) {
      const res = await fetch(
        `https://api.mercadopago.com/v1/payments/${body.data.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )

      const payment = await res.json()
      logEntry.fetchedResource = payment

      await processarPagamentoAprovado(payment)
      await prisma.webhookLog.create({ data: logEntry })

      return NextResponse.json({ received: true })
    }

    // ============================
    // MERCHANT ORDER
    // ============================
    if (body.topic === 'merchant_order' && body.resource) {
      const res = await fetch(body.resource, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const order = await res.json()
      logEntry.fetchedResource = order

      for (const p of order.payments || []) {
        await processarPagamentoAprovado(p)
      }

      await prisma.webhookLog.create({ data: logEntry })
      return NextResponse.json({ received: true })
    }

    logEntry.logs.push('Webhook ignorado')
    await prisma.webhookLog.create({ data: logEntry })
    return NextResponse.json({ received: true })
  } catch (err) {
    logEntry.logs.push(`Erro interno: ${String(err)}`)
    await prisma.webhookLog.create({ data: logEntry })
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
