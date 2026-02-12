'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

interface Presenca {
  id: string
  nome: string
  tipo: string
  convidadoPresente: boolean
}

interface Usuario {
  id: string
  nome: string
  email: string
  imagemUrl?: string
  criadoEm: string
  _count: {
    presencas: number
  }
  presencas: Presenca[]
}

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function fetchUsuarios() {
    try {
      setLoading(true)
      const res = await fetch('/api/listar-usuarios')
      if (!res.ok) throw new Error('Erro ao buscar usuários')
      const data = await res.json()
      setUsuarios(data)
      setLoading(false)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id)
  }

  const totalUsuarios = usuarios.length

  const totalPresencas = usuarios.reduce(
    (acc, user) =>
      acc + user.presencas.filter((p) => p.convidadoPresente === true).length,
    0,
  )

  const totalPresencasAusentes = usuarios.reduce(
    (acc, user) =>
      acc + user.presencas.filter((p) => p.convidadoPresente === false).length,
    0,
  )

  const usuariosComPresenca = usuarios.filter(
    (user) => user._count.presencas > 0,
  ).length

  const totalConvites = totalPresencas + totalPresencasAusentes

  const taxaComparecimento =
    totalConvites > 0 ? ((totalPresencas / totalConvites) * 100).toFixed(1) : 0

  const mediaPresencas =
    totalUsuarios > 0 ? (totalPresencas / totalUsuarios).toFixed(1) : 0

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ================= DASHBOARD CARDS ================= */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Total de Usuários</p>
            <h2 className="text-2xl font-bold text-gray-800">
              {totalUsuarios}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Presenças Confirmadas</p>
            <h2 className="text-2xl font-bold text-gray-800">
              {totalPresencas}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Presenças Ausentes</p>
            <h2 className="text-2xl font-bold text-gray-800">
              {totalPresencasAusentes}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Taxa de Comparecimento</p>
            <h2 className="text-2xl font-bold text-gray-800">
              {taxaComparecimento}%
            </h2>
          </div>
        </div>

        {/* BOTÕES */}
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-end">
          <button
            onClick={fetchUsuarios}
            className="w-full cursor-pointer rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-700 sm:w-auto"
          >
            {loading ? 'Atualizando...' : 'Atualizar Lista'}
          </button>

          <button
            onClick={() => exportarExcel(usuarios)}
            className="w-full cursor-pointer rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-green-700 sm:w-auto"
          >
            Baixar Excel
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-center text-2xl font-bold text-gray-900">
          Lista de Usuários
        </h1>

        {/* ===================== MOBILE (CARD) ===================== */}
        <div className="space-y-4 md:hidden">
          {usuarios.map((user) => {
            const isExpanded = expandedId === user.id

            return (
              <div
                key={user.id}
                className="w-full rounded-2xl bg-white p-4 shadow"
              >
                <div
                  onClick={() => toggleExpand(user.id)}
                  className="flex cursor-pointer items-center gap-3"
                >
                  <Image
                    src={user.imagemUrl || '/default-avatar.png'}
                    alt={user.nome}
                    width={60}
                    height={60}
                    className="rounded-full object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-semibold text-gray-800">
                      {user.nome}
                    </h2>
                    <p className="truncate text-xs text-gray-500">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(user.criadoEm).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-blue-600">
                    {user._count.presencas}
                  </span>
                </div>

                {isExpanded && (
                  <div className="mt-4 border-t pt-3">
                    {user.presencas.length === 0 ? (
                      <p className="text-sm text-gray-400">
                        Nenhuma presença vinculada.
                      </p>
                    ) : (
                      user.presencas.map((presenca) => (
                        <div
                          key={presenca.id}
                          className="flex justify-between py-1 text-sm text-gray-500"
                        >
                          <span className="font-semibold text-gray-500">
                            {presenca.nome}
                          </span>
                          <span className="text-gray-500">{presenca.tipo}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ===================== DESKTOP (LISTA) ===================== */}
        <div className="hidden md:block">
          <div className="w-full overflow-hidden rounded-2xl bg-white shadow">
            {/* Header */}
            <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] bg-gray-50 p-4 font-semibold text-gray-700">
              <div>Usuário</div>
              <div>Email</div>
              <div>Data</div>
              <div>Vínculos</div>
              <div>Ações</div>
            </div>

            {usuarios.map((user) => {
              const isExpanded = expandedId === user.id

              return (
                <div key={user.id} className="border-t">
                  <div
                    onClick={() => toggleExpand(user.id)}
                    className="grid cursor-pointer grid-cols-[2fr_2fr_1fr_1fr_1fr] items-center p-4 hover:bg-gray-50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Image
                        src={user.imagemUrl || '/default-avatar.png'}
                        alt={user.nome}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                      <span className="truncate font-bold text-gray-600">
                        {user.nome}
                      </span>
                    </div>

                    <div className="truncate text-gray-600">{user.email}</div>

                    <div className="text-sm text-gray-400">
                      {new Date(user.criadoEm).toLocaleDateString('pt-BR')}
                    </div>

                    <div className="font-semibold text-blue-600">
                      {user._count.presencas}
                    </div>

                    <div className="text-sm text-gray-500">
                      {isExpanded ? 'Fechar' : 'Ver'}
                    </div>
                  </div>

                  <div
                    className={`overflow-hidden transition-all duration-700 ease-in-out ${
                      isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="bg-gray-50 px-4 py-3 text-sm text-gray-500">
                      {user.presencas.length === 0 ? (
                        <p className="text-sm text-gray-400">
                          Nenhuma presença vinculada.
                        </p>
                      ) : (
                        user.presencas.map((presenca) => (
                          <div
                            key={presenca.id}
                            className="flex justify-between border-b py-2 text-sm last:border-none"
                          >
                            <span className="font-semibold text-gray-500">
                              {presenca.nome}
                            </span>
                            <span className="text-gray-500">
                              {presenca.tipo}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

interface DadosPresenca {
  Usuario: string
  Email: string
  NomePresenca: string
  Tipo: string
}

function exportarExcel(usuarios: Usuario[]) {
  /* =========================
     ABA 1 - USUÁRIOS
  ========================== */
  const dadosUsuarios = usuarios.map((user) => ({
    Nome: user.nome,
    Email: user.email,
    CriadoEm: new Date(user.criadoEm).toLocaleString('pt-BR'),
    TotalPresencas: user._count.presencas,
  }))

  const worksheetUsuarios = XLSX.utils.json_to_sheet(dadosUsuarios)

  /* =========================
     ABA 2 - PRESENÇAS
  ========================== */
  const dadosPresencas: DadosPresenca[] = []

  usuarios.forEach((user) => {
    if (user.presencas.length === 0) {
      dadosPresencas.push({
        Usuario: user.nome,
        Email: user.email,
        NomePresenca: '—',
        Tipo: '—',
      })
    } else {
      user.presencas.forEach((presenca) => {
        dadosPresencas.push({
          Usuario: user.nome,
          Email: user.email,
          NomePresenca: presenca.nome,
          Tipo: presenca.tipo,
        })
      })
    }
  })

  const worksheetPresencas = XLSX.utils.json_to_sheet(dadosPresencas)

  /* =========================
     CRIANDO WORKBOOK
  ========================== */
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheetUsuarios, 'Usuarios')
  XLSX.utils.book_append_sheet(workbook, worksheetPresencas, 'Presencas')

  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  })

  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  })

  saveAs(blob, 'relatorio-usuarios.xlsx')
}
