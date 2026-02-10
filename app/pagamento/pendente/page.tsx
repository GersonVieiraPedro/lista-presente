'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function PagamentoPendente() {
  const [preferenceId, setPreferenceId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('preference_id') || null
  })
  const [status, setStatus] = useState('pending') // 'paid', 'pending', 'failed'

  useEffect(() => {
    if (!preferenceId) return
    const intervalId = setInterval(async () => {
      const data = await verificarPagamento(preferenceId)
      setStatus(data.status)
    }, 5000) // Verificar a cada 5 segundos

    return () => clearInterval(intervalId)
  }, [preferenceId])
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-8">
      {status === 'paid' ? (
        <div className="mx-auto max-w-md space-y-6 text-center">
          <h1 className="text-2xl font-bold text-yellow-500">
            Pagamento pendente ⏳
          </h1>
          <p className="text-sm text-zinc-500">
            Estamos aguardando a confirmação do seu pagamento. Ele pode levar
            alguns minutos.
          </p>

          <div className="rounded-xl bg-white p-6 text-zinc-700 shadow">
            <p>
              ID da transação: <strong>{preferenceId}</strong>
            </p>
            <p>
              Metodo de pagamento:{' '}
              <strong className="h-8 w-20 transform animate-pulse bg-gray-300">
                PIX
              </strong>
            </p>
          </div>

          <Link
            href="/lista"
            className="block rounded-xl bg-zinc-900 px-4 py-3 font-bold text-white transition hover:bg-zinc-700"
          >
            Voltar para a lista
          </Link>
        </div>
      ) : (
        <div className="mx-auto max-w-md space-y-6 text-center">
          <h1 className="text-2xl font-bold text-green-600">
            Pagamento aprovado 🎉
          </h1>
          <p className="text-sm text-zinc-500">
            Seu pagamento foi confirmado com sucesso. Obrigado pelo seu
            presente!
          </p>

          <div className="rounded-xl bg-white p-6 text-zinc-700 shadow">
            <p>
              ID da transação: <strong>{preferenceId}</strong>
            </p>
            <p>
              Metodo de pagamento:{' '}
              <strong className="h-8 w-20 transform animate-pulse bg-gray-300">
                PIX
              </strong>
            </p>
          </div>

          <Link
            href="/lista?presenteou=true"
            className="block rounded-xl bg-zinc-900 px-4 py-3 font-bold text-white transition hover:bg-zinc-700"
          >
            Voltar para a lista
          </Link>
        </div>
      )}
    </main>
  )
}
async function verificarPagamento(preferenceId: string) {
  const res = await fetch(
    `/api/mercado-pago-status?preference_id=${preferenceId}`,
  )
  const data = await res.json()
  return data // { status: 'paid' | 'pending' | 'failed', transactionAmount: number }
}
