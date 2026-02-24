/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { templateConfirmacaoReservaPresente } from '@/app/utils/emailTamplate'

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
  const [modalOpen, setModalOpen] = useState(false)
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(
    null,
  )
  const [itens, setItens] = useState<any[]>([])

  const [itemSelecionado, setItemSelecionado] = useState<{
    id: string
    nome: string
    imagemUrl: string
    linkFora?: string
    descricao?: string
  } | null>(null)

  function abrirModal(user: Usuario) {
    setUsuarioSelecionado(user)
    setItemSelecionado(null)
    setModalOpen(true)
  }
  async function enviarEmail() {
    if (!usuarioSelecionado || !itemSelecionado) {
      alert('Selecione um item antes de enviar.')
      return
    }

    try {
      await fetch('/api/enviar-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: [
            usuarioSelecionado.email,
            'vitoria20.03@hotmail.com',
            'gerson123vieira@gmail.com',
          ],
          subject: 'Confirmação de Presente Chá de Casa Nova',
          nome: usuarioSelecionado.nome,
          html: templateConfirmacaoReservaPresente(
            usuarioSelecionado.nome,
            itemSelecionado.nome,
            itemSelecionado.imagemUrl,
            'https://www.gerson-vieira-pedro.com.br/lista?presenteou=true',
            itemSelecionado.descricao || undefined,
            itemSelecionado.linkFora || undefined,
            0,
          ),
        }),
      })

      alert('E-mail enviado com sucesso!')
      setModalOpen(false)
    } catch (error) {
      console.error(error)
      alert('Erro ao enviar e-mail')
    }
  }

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

  useEffect(() => {
    fetchUsuarios()
    fetchItens()
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
                    className="grid cursor-pointer grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] items-center p-4 hover:bg-gray-50"
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

                    <div className="rounded-lg bg-gray-100 p-2 text-center text-sm text-gray-500">
                      {isExpanded ? 'Fechar' : 'Ver'}
                    </div>
                    {/* BOTÃO LATERAL FIXO */}
                    <button
                      onClick={() => {
                        if (!usuarios.length)
                          return alert('Nenhum usuário disponível')
                        abrirModal(user)
                      }}
                      className="ml-2 cursor-pointer rounded-lg bg-purple-600 p-2 text-sm font-semibold text-white transition hover:bg-purple-700"
                    >
                      Enviar E-mail 🎁
                    </button>
                    {/* MODAL ENVIO EMAIL */}
                    {modalOpen && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="w-full max-w-lg rounded-2xl border border-gray-300 bg-white p-6">
                          <h2 className="mb-4 text-xl font-bold text-gray-800">
                            Enviar Compra / Presenteação
                          </h2>

                          {usuarioSelecionado && (
                            <p className="mb-4 text-sm text-gray-500">
                              Destinatário:{' '}
                              <strong>{usuarioSelecionado.nome}</strong> (
                              {usuarioSelecionado.email})
                            </p>
                          )}

                          <div className="max-h-80 space-y-4 overflow-y-auto">
                            {itens.map((item) => (
                              <div
                                key={item.id}
                                onClick={() => setItemSelecionado(item)}
                                className={`flex cursor-pointer items-center gap-4 rounded-xl border p-3 transition ${
                                  itemSelecionado?.id === item.id
                                    ? 'border-purple-600 bg-purple-50'
                                    : 'border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                <img
                                  src={item.imagemUrl || '/default-item.png'}
                                  alt={item.nome}
                                  className="size-15 max-h-15 rounded-lg object-cover"
                                />

                                <div className="flex-1">
                                  <p className="font-semibold text-gray-700">
                                    {item.nome}
                                  </p>
                                </div>

                                <input
                                  type="radio"
                                  checked={itemSelecionado?.id === item.id}
                                  readOnly
                                />
                              </div>
                            ))}
                          </div>

                          <div className="mt-6 flex justify-end gap-3">
                            <button
                              onClick={() => setModalOpen(false)}
                              className="cursor-pointer rounded-xl bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
                            >
                              Cancelar
                            </button>

                            <button
                              onClick={enviarEmail}
                              className="cursor-pointer rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-purple-700"
                            >
                              Enviar E-mail
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
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
