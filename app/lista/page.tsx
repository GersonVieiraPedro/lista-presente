'use client'

import { Header } from '../components/Header'
import { CardPresente } from '../components/CardsPresents'
import dados from '../data/itens.json'
import { useEffect, useMemo, useState } from 'react'
import PainelFiltros from '../components/PainelFiltros'
import InfoCotas from '../components/infoCotas'

export default function Home() {
  const [busca, setBusca] = useState('')
  const [ordenacao, setOrdenacao] = useState('')
  const [itens, setItens] = useState<typeof dados.itens>([])
  //const [loading, setLoading] = useState(true)

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

      <section className="mx-auto max-w-6xl px-4 py-16">
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
