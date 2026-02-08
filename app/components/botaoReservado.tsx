import { useState } from 'react'
import Link from 'next/link'

type Props = {
  id: string
  reservado: boolean
  reservadoPor?: string // pode ser "Fulano" ou "Fulano, Beltrano, Ciclano"
}

export default function ItemReservado({ id, reservado, reservadoPor }: Props) {
  const [showLista, setShowLista] = useState(false)

  if (!reservado) {
    return (
      <>
        <samp className="block justify-center text-center text-xs text-gray-100">
          Ola
        </samp>
        <Link
          href={`/presentear/${id}`}
          className="block w-full rounded-xl bg-zinc-700 py-2 text-center text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Quero presentear
        </Link>
      </>
    )
  }

  // Se tiver mais de 1 nome
  const nomes = reservadoPor?.split(',').map((n) => n.trim()) || []

  return (
    <>
      {nomes.length > 1 ? (
        <samp className="block justify-center text-center text-xs text-zinc-500">
          Clique para ver quem presentou
        </samp>
      ) : (
        <samp className="block justify-center text-center text-xs text-gray-100">
          Ola
        </samp>
      )}
      <button
        onClick={() => nomes.length > 1 && setShowLista(true)}
        className={`inline-block w-full rounded-xl px-3 py-2 text-center text-sm ${nomes.length > 1 ? 'cursor-pointer bg-zinc-700 text-white hover:bg-zinc-800' : 'cursor-default bg-zinc-200 text-zinc-700'}`}
      >
        {nomes.length === 1
          ? `Presenteado por ${nomes[0]} 🫶🏼`
          : `Presenteado por ${nomes.length} Convidados 🫶🏼`}
      </button>

      {/* Modal / lista de nomes */}
      {showLista && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              🎁 Quem Presentou 🎁
            </h3>
            <ul className="mb-6 space-y-2 text-sm text-gray-700">
              {nomes.map((nome, i) => (
                <li key={i} className="rounded-lg bg-gray-100 px-3 py-2">
                  {nome}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowLista(false)}
              className="w-full rounded-xl bg-zinc-700 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
