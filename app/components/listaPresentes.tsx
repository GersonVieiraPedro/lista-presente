'use client'

import { Header } from '../components/Header'
import { CardPresente } from '../components/CardsPresents'
import dados from '../data/itens.json'
import { useEffect, useMemo, useState } from 'react'
import PainelFiltros from '../components/PainelFiltros'
import InfoCotas from '../components/infoCotas'
import { loadPartySound } from '../utils/useConfeteSom'
import Confetes from '../components/confetes'
import { useSearchParams } from 'next/navigation'

export default function Home() {
  const [busca, setBusca] = useState('')
  const [ordenacao, setOrdenacao] = useState('')
  const [itens, setItens] = useState<typeof dados.itens>([])
  const [showConfetes, setShowConfetes] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [presenteou, setPresenteou] = useState<boolean | null>(null)

  const searchParams = useSearchParams()

  useEffect(() => {
    async function fetchItens() {
      try {
        const res = await fetch(
          '/api/itens?listaId=1ff541bd-515b-4fa0-a7dc-3f016f54852e',
        )
        if (!res.ok) throw new Error('Erro ao buscar itens')
        const data = await res.json()
        console.log('Itens carregados:', data)
        setItens(data)
      } catch (err) {
        console.error(err)
      } finally {
      }
    }
    loadPartySound()

    const value = searchParams.get('presenteou') === 'true'
    if (value === true) {
      setPresenteou(value)
      setShowModal(true)
    }
    fetchItens()
  }, [])

  const itensFiltrados = useMemo(() => {
    let lista = [...itens]

    // 🔍 Filtro por nome ou categoria
    if (busca) {
      const termo = busca.toLowerCase()
      lista = lista.filter(
        (item) =>
          item.nome.toLowerCase().includes(termo) ||
          item.categoria.toLowerCase().includes(termo),
      )
    }

    // ↕️ Ordenação por preço
    if (ordenacao === 'menor') {
      lista.sort((a, b) => a.preco - b.preco)
    }

    if (ordenacao === 'maior') {
      lista.sort((a, b) => b.preco - a.preco)
    }

    if (ordenacao === 'disponiveis') {
      lista = lista.filter((item) => item.reservado === false)
    }
    return lista
  }, [busca, ordenacao, itens])

  return (
    <main className="bg-zinc-50">
      <Header />
      <PainelFiltros
        busca={busca}
        setBusca={setBusca}
        ordenacao={ordenacao}
        setOrdenacao={setOrdenacao}
      />
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="animate-in fade-in zoom-in mx-auto max-w-md space-y-6 rounded-2xl bg-white p-8 text-center text-zinc-700 shadow-xl">
            <h1 className="text-2xl font-bold text-yellow-600">
              Presente Recebido! 🎉
            </h1>

            <p className="text-sm leading-relaxed text-zinc-600">
              Recebemos seu presente com o coração cheio de alegria 💛 Muito
              obrigado por esse carinho! Sua presença e esse gesto tornam esse
              momento ainda mais especial para nós. Mal podemos esperar para
              celebrar juntos!
            </p>

            <button
              onClick={() => {
                setShowModal(false)
                setShowConfetes(true)
              }}
              className="w-full rounded-xl bg-zinc-700 py-2 font-semibold text-white transition hover:bg-zinc-800 active:scale-95"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
      {presenteou && <Confetes ativo={showConfetes} />}

      <section
        onClick={() => {
          setShowConfetes(!showConfetes)
        }}
        className="mx-auto max-w-6xl px-4 py-14"
      >
        <InfoCotas />
        <h2 className="font-title mb-8 text-center text-3xl font-semibold text-zinc-800">
          Lista de Presentes
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {itensFiltrados.map((item) => (
            <CardPresente key={item.id} {...item} />
          ))}
        </div>
      </section>
    </main>
  )
}
