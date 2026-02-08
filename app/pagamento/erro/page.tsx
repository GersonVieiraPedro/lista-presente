'use client'

import Link from 'next/link'

export default function PagamentoErro() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-8">
      <div className="mx-auto max-w-md space-y-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Pagamento falhou ❌</h1>
        <p className="text-sm text-zinc-500">
          Ocorreu um erro ao processar seu pagamento. Por favor, tente
          novamente.
        </p>

        <div className="rounded-xl bg-white p-6 text-zinc-700 shadow">
          <p>
            ID da transação: <strong>145334452062</strong>
          </p>
          <p>
            Metodo de pagamento: <strong>PIX</strong>
          </p>
        </div>

        <Link
          href="/lista"
          className="block rounded-xl bg-zinc-900 px-4 py-3 font-bold text-white transition hover:bg-zinc-700"
        >
          Voltar para a lista
        </Link>
      </div>
    </main>
  )
}
