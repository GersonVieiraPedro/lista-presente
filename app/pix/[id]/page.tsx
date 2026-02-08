'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PixQr from '@/app/components/QRcode'

export default function PixPage() {
  const [tempo, setTempo] = useState(61 * 60) // 61 minutos
  const [copiado, setCopiado] = useState(false)

  const pixCopiaCola =
    '00020126360014BR.GOV.BCB.PIX0114+5599999999995204000053039865405100.005802BR5920Chá de Casa Nova6009SAO PAULO62070503***6304ABCD'

  useEffect(() => {
    const timer = setInterval(() => {
      setTempo((t) => (t > 0 ? t - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  function copiarPix(texto: string) {
    if (typeof window === 'undefined') return

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).catch(() => fallbackCopy(texto))
    } else {
      fallbackCopy(texto)
    }
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  function fallbackCopy(texto: string) {
    const textarea = document.createElement('textarea')
    textarea.value = texto

    textarea.setAttribute('readonly', '')
    textarea.style.position = 'absolute'
    textarea.style.left = '-9999px'

    document.body.appendChild(textarea)
    textarea.select()

    try {
      document.execCommand('copy')
    } catch (err) {
      console.error('Falha ao copiar', err)
    }

    document.body.removeChild(textarea)
  }

  const horas = String(Math.floor(tempo / 3600)).padStart(2, '0')
  const minutos = String(Math.floor((tempo % 3600) / 60)).padStart(2, '0')
  const segundos = String(tempo % 60).padStart(2, '0')

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="mx-auto max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-zinc-900">Pagamento via PIX</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Finalize o pagamento para confirmar seu presente 💝
          </p>
        </div>

        {/* Timer */}
        <div className="rounded-xl bg-zinc-900 py-3 text-center text-white">
          <span className="text-sm opacity-80">Tempo restante</span>
          <p className="text-2xl font-bold">
            {horas}:{minutos}:{segundos}
          </p>
        </div>
        <p className="mt-2 text-center text-sm text-zinc-500">
          Após esse tempo, o item será liberado novamente para outros
          convidados.
        </p>
        {/* QR Code */}
        <div className="flex justify-center rounded-3xl bg-white p-6 shadow-sm">
          <PixQr pix={pixCopiaCola} />
        </div>

        {/* Copia e Cola */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-zinc-500 uppercase">
            Pix Copia e Cola
          </p>
          <div className="flex items-center gap-2">
            <input
              value={pixCopiaCola}
              readOnly
              className="flex-1 rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-xs text-gray-600"
            />
            <button
              onClick={() => copiarPix(pixCopiaCola)}
              className="cursor-pointer rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-zinc-700"
            >
              {copiado ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="animate-pulse rounded-xl bg-zinc-200 p-4 text-center text-sm text-zinc-600">
          Aguardando confirmação do pagamento…
        </div>

        {/* Parcelamento Pix */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <h3 className="text-sm font-bold text-zinc-900">
            Parcelamento via PIX
          </h3>
          <p className="mt-2 text-sm text-zinc-600">
            Muitos bancos permitem parcelar pagamentos Pix direto no app, usando
            crédito pessoal ou limite disponível.
          </p>
        </div>

        {/* Voltar */}
        <Link
          href="/"
          className="block text-center text-sm text-zinc-500 underline"
        >
          Voltar para lista
        </Link>
      </div>
    </main>
  )
}
