'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Cookies from 'js-cookie'

interface Item {
  id: string
  nome: string
  categoria: string
  preco: number
  cotas?: number
  cotasReservadas?: number
  descricao?: string
  imagemUrl: string
  reservado?: boolean
}

export default function DetalhesPresente() {
  const params = useParams()
  const id = params.id as string

  console.log('ID do presente:', id)

  const [presente, setPresente] = useState<Item | null>(null)
  const [quantidade, setQuantidade] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPresente() {
      try {
        setLoading(true)
        const res = await fetch(
          '/api/itens?listaId=1ff541bd-515b-4fa0-a7dc-3f016f54852e',
        )
        if (!res.ok) throw new Error('Erro ao buscar itens')
        const data: Item[] = await res.json()
        console.log('Dados recebidos:', data)
        const itemSelecionado = data.find((i) => String(i.id) === String(id))
        console.log('Item selecionado:', itemSelecionado)
        setPresente(itemSelecionado ?? null)
      } catch (err) {
        console.error(err)
        setPresente(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPresente()
  }, [id])

  const csession = Cookies.get('session')
    ? JSON.parse(Cookies.get('session')!)
    : null

  console.log('Sessão do usuário:', csession)
  console.log('Nome do usuário:', csession?.user?.name)

  const gerarPagamentoPix = async () => {
    if (!presente) return

    try {
      const res = await fetch('/api/pagar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor: totalPagar,
          descricao: `🎁 ${presente.nome}`,
          external_reference: JSON.stringify({
            id: presente.id,
            quantidade: quantidade,
            usuarioName: csession?.user?.name || 'Anônimo',
          }), // para referência futura no webhook
        }),
      })

      const data = await res.json()
      window.location.href = data.init_point
    } catch (error) {
      console.error('Erro ao gerar pagamento PIX:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-4 bg-gray-50">
        <samp className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-800"></samp>
        <p className="text-lg font-semibold text-zinc-700">
          Carregando presente...
        </p>
      </div>
    )
  }

  if (!presente) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <h1 className="text-xl font-bold">Presente não encontrado</h1>
        <Link
          href="/lista"
          className="mt-4 flex items-center gap-2 p-5 text-blue-500 underline"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-caret-left-fill"
            viewBox="0 0 16 16"
          >
            <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z" />
          </svg>
          Voltar para a lista
        </Link>
      </div>
    )
  }

  const valorCota = (presente.preco ?? 0) / (presente.cotas || 1)
  const cotasDisponiveis =
    (presente.cotas || 1) - (presente.cotasReservadas || 0)
  const totalPagar = valorCota * quantidade

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-10 md:py-20">
        {/* Botão Voltar */}
        <Link
          href="/"
          className="group mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-zinc-500 transition hover:bg-gray-200 hover:text-zinc-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-caret-left-fill"
            viewBox="0 0 16 16"
          >
            <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z" />
          </svg>
          <span className="font-medium">Voltar</span>
        </Link>

        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2 md:gap-16">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-zinc-100 bg-zinc-100 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={presente.imagemUrl}
              alt={presente.nome}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-8">
            <div>
              <span className="text-sm font-bold tracking-widest text-zinc-400 uppercase">
                {presente.categoria}
              </span>
              <h1 className="font-title mt-2 text-2xl leading-tight font-bold text-zinc-900 md:text-3xl">
                {presente.nome}
              </h1>
              <p className="font-body mt-4 text-3xl font-semibold text-zinc-900">
                R${' '}
                {presente.preco.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            <div className="border-t border-zinc-100 pt-6">
              <h2 className="mb-3 text-xs font-bold tracking-wider text-zinc-900 uppercase">
                Nota dos Noivos
              </h2>
              <p className="leading-relaxed text-zinc-600 italic">
                {presente.descricao ||
                  'Este presente nos ajudará muito a montar nosso novo cantinho com muito amor.'}
              </p>
            </div>

            {presente.cotas && presente.cotas > 1 && (
              <div className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-zinc-900">
                    Presentear com cotas
                  </h3>
                  <span className="rounded-full bg-zinc-200 px-2 py-1 text-xs text-zinc-600">
                    {cotasDisponiveis} disponíveis
                  </span>
                </div>

                <p className="text-sm text-zinc-600">
                  Este presente é grande, por isso dividimos em {presente.cotas}{' '}
                  cotas de
                  <span className="font-bold text-zinc-900">
                    {' '}
                    R$ {valorCota.toFixed(2)}
                  </span>{' '}
                  cada.
                </p>

                <div className="flex items-center gap-4 py-2">
                  <div className="flex items-center overflow-hidden rounded-xl border border-zinc-300 text-zinc-700">
                    <button
                      onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                      className="border-r border-zinc-300 bg-white px-4 py-2 transition hover:bg-zinc-100"
                    >
                      -
                    </button>

                    <span className="bg-white px-6 py-2 font-bold text-zinc-900">
                      {quantidade}
                    </span>

                    <button
                      onClick={() =>
                        setQuantidade(
                          Math.min(cotasDisponiveis, quantidade + 1),
                        )
                      }
                      className="border-l border-zinc-300 bg-white px-4 py-2 transition hover:bg-zinc-100"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex-1 text-right">
                    <p className="text-xs text-zinc-500 uppercase">Subtotal</p>
                    <p className="text-xl font-bold text-zinc-900">
                      R$ {totalPagar.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Link
              onClick={gerarPagamentoPix}
              href={``}
              className="flex w-full flex-col items-center rounded-2xl bg-zinc-900 py-4 font-bold text-white shadow-lg transition hover:bg-zinc-800"
            >
              {presente.cotas && presente.cotas > 1 ? (
                <span>
                  Contribuir com {quantidade}{' '}
                  {quantidade > 1 ? 'cotas' : 'cota'}
                </span>
              ) : (
                <span>Presentear</span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
