'use client'
import Cookies from 'js-cookie'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import { AcompanhanteInput } from './components/inputsAcompanhantes'
import { Session } from 'next-auth'
import Link from 'next/link'
import { templateConfirmacaoPresenca } from './utils/emailTamplate'
type Acompanhante = {
  id: string
  nome: string
  tipo: string
}

type UsuarioData = {
  id: string
  nome: string
  email: string
  imagemUrl: string
  confirmouPresenca: boolean
  presencas: {
    id: string
    nome: string
    tipo: string
    convidadoPresente: boolean
  }[]
}

const MAX_ACOMPANHANTES = 5

export default function AreaLogada() {
  const { data: session, status } = useSession()

  const [acompanhantes, setAcompanhantes] = useState<Acompanhante[]>([
    { id: '', nome: '', tipo: '' },
  ])

  const [showModal, setShowModal] = useState(false)
  const [usuarioData, setUsuarioData] = useState<UsuarioData | null>(null)

  const tooltipRef = useRef<HTMLDivElement>(null)
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const [confirmou, setConfirmou] = useState<boolean | null>(null)
  const [exibirAcompanhantes, setExibirAcompanhantes] = useState(false)
  const [motivoAusencia, setMotivoAusencia] = useState('')
  const [mensagemAusencia, setMensagemAusencia] = useState('')

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setTooltipOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!session?.user) return

    // Chama a API para criar usuário apenas se houver sessão
    const criarUsuario = async () => {
      try {
        const res = await fetch('/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: session.user.name,
            email: session.user.email,
            imagemUrl: session.user.image,
            confirmouPresenca: false,
          }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Erro ao criar usuário')

        console.log('Usuário criado ou já existente:', data)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(err)
      }
    }
    const presencaConfirmada = async () => {
      try {
        const res = await fetch(`/api/usuarios?email=${session.user.email}`)
        if (!res.ok) throw new Error('Erro ao verificar presença')
        const data = await res.json()
        console.log('Dados do usuário:', data)
        setUsuarioData(data?.[0] || null)
        return data
      } catch (err) {
        console.error(err)
        return false
      }
    }
    const verificarPresenca = async () => {
      const confirmada = await presencaConfirmada()
      if (!confirmada) {
        criarUsuario()
      }
    }

    verificarPresenca()

    if (session?.user) {
      // Salva a sessão no cookie para uso posterior
      Cookies.set('session', JSON.stringify(session), { expires: 1 }) // expira em 1 dia
    } else {
      Cookies.remove('session')
    }
  }, [session])

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 text-gray-700">
        Carregando...
      </div>
    )
  }

  function atualizarAcompanhante(
    id: string,
    field: 'nome' | 'tipo',
    value: string,
  ) {
    setAcompanhantes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
    )
  }

  function adicionarAcompanhante() {
    if (acompanhantes.length >= MAX_ACOMPANHANTES) return
    const id =
      acompanhantes.length > 0
        ? String(Number(acompanhantes[acompanhantes.length - 1].id) + 1)
        : '1'
    setAcompanhantes((prev) => [...prev, { id: id, nome: '', tipo: '' }])
  }

  function removerAcompanhante(id: string) {
    setAcompanhantes((prev) => prev.filter((a) => a.id !== id))
  }

  const acompanhantesInvalidos = acompanhantes.some(
    (a) => a.nome.trim() !== '' && !a.tipo,
  )

  const acompanhantesPreenchidos = acompanhantes.filter(
    (a) => a.nome.trim() !== '',
  )
  const enviarEmail = async () => {
    const email = session?.user?.email ? session.user.email : ''
    const res = await fetch('/api/enviar-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: [email, 'vitoria20.03@hotmail.com', 'gerson123vieira@gmail.com'],
        subject: 'Confirmação de Presença Chá de Casa Nova',
        html: templateConfirmacaoPresenca(session?.user?.name || 'Convidado'),
      }),
    })

    const data = await res.json()
    console.log(data)
  }

  const confirmarPresenca = async () => {
    setShowModal(false)
    try {
      const res = await fetch('/api/presenca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acompanhantes: acompanhantesPreenchidos,
          confirmou,
          motivoAusencia,
          mensagemAusencia,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro desconhecido')

      setShowModal(false)
      alert('Presença confirmada ✅')
      enviarEmail() // Envia o e-mail de confirmação
      window.location.reload() // Recarrega a página para atualizar o estado de presença

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert('Erro ao salvar presença: ' + err.message)
    }
  }
  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 px-4">
        <div className="flex w-full max-w-sm flex-col items-center justify-center rounded-2xl bg-white p-8 shadow-lg">
          {/* Cabeçalho */}
          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
            Confirmação de Presença
          </h1>
          <p className="mb-6 text-center text-sm text-gray-500">
            Para confirmar sua presença, faça login com sua conta Google.
          </p>

          {/* Botão de login */}
          <button
            onClick={() => {
              signIn('google')
            }}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md"
          >
            {/* Ícone do Google */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="h-5 w-5"
            />
            Entrar com Google
          </button>

          {/* Informação adicional */}
          <p className="mt-4 text-center text-xs text-gray-400">
            Seus dados serão usados apenas para confirmar sua presença e não
            serão compartilhados.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 text-gray-600">
      <div className="mx-auto w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        {/* Header */}
        <div className="mb-6 flex flex-col items-center">
          {session.user?.image && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={session.user.image}
              className="mb-3 h-20 w-20 rounded-full border"
              alt="Avatar"
            />
          )}
          <h2 className="text-lg font-semibold">{session.user?.name}</h2>
          <p className="text-sm text-gray-500">{session.user?.email}</p>
        </div>
        {usuarioData?.confirmouPresenca ? (
          <>
            <h1 className="mb-4 text-center text-xl font-semibold">
              Presença já Confirmada! 🎉
            </h1>
            {usuarioData?.presencas.find((p) => p.convidadoPresente) ? (
              <p className="mb-6 text-center text-sm">
                Agradecemos por confirmar sua presença! Estamos ansiosos para
                celebrar juntos.
              </p>
            ) : (
              <>
                <p className="mb-6 text-center text-sm">
                  Lamentamos que você não possa comparecer 😢
                </p>
                <p className="mb-6 text-center text-sm">
                  Mas ainda assim, sinta-se à vontade para presentear o casal!
                  🎁
                </p>
              </>
            )}
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Convidados confirmados:
            </label>
            <ul className="space-y-2 rounded-lg bg-gray-100 p-4 text-center text-sm text-gray-700">
              {usuarioData?.presencas.length > 0
                ? usuarioData.presencas.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-center border-b border-gray-200 p-2 text-center last:border-b-0"
                    >
                      {a.nome} ({a.tipo})
                    </li>
                  ))
                : 'Nenhum acompanhante confirmado'}
            </ul>
            <Link href="/lista">
              <button className="animate-pulseScale mt-6 w-full transform cursor-pointer rounded-xl bg-black py-3 text-sm font-medium text-white transition hover:bg-gray-700">
                Presentear o Casal 🎁
              </button>
            </Link>
          </>
        ) : (
          <>
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Você vai comparecer ao evento?{' '}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    confirmou === true ? setConfirmou(null) : setConfirmou(true)
                  }
                  className={`w-[50%] cursor-pointer rounded-xl bg-gray-200 p-2 transition hover:bg-gray-300 ${confirmou === true ? 'bg-green-500 font-bold text-white hover:bg-green-600' : ''}`}
                  type="button"
                >
                  Sim
                </button>
                <button
                  onClick={() => {
                    if (confirmou === false) {
                      setConfirmou(null)
                    } else {
                      setConfirmou(false)
                      setExibirAcompanhantes(false)
                      setAcompanhantes([{ id: '1', nome: '', tipo: '' }])
                    }
                  }}
                  className={`w-[50%] cursor-pointer rounded-xl bg-gray-200 p-2 transition hover:bg-gray-300 ${confirmou === false ? 'bg-red-500 font-bold text-white hover:bg-red-600' : ''}`}
                  type="button"
                >
                  Não
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative flex items-center gap-2 text-center">
                <label className="block text-sm font-semibold text-gray-700">
                  Acompanhantes
                </label>

                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => setTooltipOpen((v) => !v)}
                    onMouseEnter={() => setTooltipOpen(true)}
                    onMouseLeave={() => setTooltipOpen(false)}
                    className="cursor-pointer rounded-full p-1 text-gray-500 transition hover:bg-black/60 hover:text-gray-100"
                    aria-label="Informações sobre acompanhantes"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                      <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
                    </svg>
                  </button>

                  {tooltipOpen && (
                    <div
                      ref={tooltipRef}
                      className="absolute top-0 left-7 z-50 w-80 rounded-xl bg-black/60 p-3 text-xs text-white shadow-lg"
                    >
                      <p className="text-md mb-2 font-semibold">
                        Convidado Não Convida!
                      </p>
                      <p>
                        Adicione apenas os acompanhantes que foram devidamente
                        convidados.
                      </p>
                    </div>
                  )}
                </div>
                <div
                  onClick={() => {
                    if (confirmou === true) {
                      setExibirAcompanhantes(!exibirAcompanhantes)
                    } else {
                      alert(
                        '⚠️ Confirme sua presença para adicionar acompanhantes !',
                      )
                    }
                  }}
                  className={`${exibirAcompanhantes ? 'rotate-180 bg-gray-200 text-gray-400' : 'text-gray-700'} absolute -top-1 right-0 cursor-pointer rounded-xl bg-gray-100 p-2 transition hover:bg-gray-200 hover:text-gray-600`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                  </svg>
                </div>
              </div>

              {exibirAcompanhantes &&
                acompanhantes.map((acompanhante) => (
                  <AcompanhanteInput
                    key={acompanhante.id}
                    acompanhante={acompanhante}
                    onChange={atualizarAcompanhante}
                    onRemove={removerAcompanhante}
                    canRemove={acompanhantes.length > 1}
                  />
                ))}

              {exibirAcompanhantes &&
                acompanhantes.length < MAX_ACOMPANHANTES && (
                  <button
                    onClick={adicionarAcompanhante}
                    className="w-full rounded-xl border border-dashed py-2 text-sm text-gray-500 transition hover:bg-gray-50"
                  >
                    + Adicionar mais um acompanhante
                  </button>
                )}

              {exibirAcompanhantes &&
                acompanhantes.length === MAX_ACOMPANHANTES && (
                  <p className="text-center text-xs text-gray-400">
                    Limite máximo de 5 acompanhantes
                  </p>
                )}
            </div>
            <button
              onClick={() => setShowModal(true)}
              disabled={acompanhantesInvalidos || confirmou === null}
              className="mt-6 w-full cursor-pointer rounded-xl bg-black py-3 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-gray-700"
            >
              Confirmar presença
            </button>
          </>
        )}
        <button
          onClick={() => {
            signOut()
          }}
          className="scale mt-4 w-full text-center text-xs text-gray-400 underline transition hover:scale-110 hover:text-gray-600"
        >
          Sair
        </button>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center">
            <h3 className="mb-3 text-lg font-semibold">
              Confirmação definitiva
            </h3>

            <p className="mb-4 text-sm text-gray-600">
              <strong> Esta confirmação é oficial</strong> e envolve reserva de
              buffet, mesa e organização do evento.
            </p>
            {confirmou === false && (
              <div>
                <p className="mb-4 text-sm">
                  Lamentamos que você não possa comparecer, mas agradecemos por
                  avisar com antecedência! 😢
                </p>

                <select
                  className="mb-2 w-full rounded-xl bg-gray-100 p-2 text-sm"
                  name="motivoAusencia"
                  id="motivoAusencia"
                  onChange={(e) => setMotivoAusencia(e.target.value)}
                >
                  <option value="">Selecione um motivo de ausência</option>
                  <option value="compromisso">Compromisso na mesma data</option>
                  <option value="saude">Motivos de saúde</option>
                  <option value="trabalho">Trabalho</option>
                  <option value="distancia">Distância</option>
                  <option value="viagem">Viagem</option>
                  <option value="outro">Outro</option>
                </select>

                <textarea
                  placeholder="Deixe uma mensagem para o casal"
                  className="mb-5 w-full rounded-xl border border-gray-300 p-2 text-sm"
                  name="mensagemAusencia"
                  id="mensagemAusencia"
                  onChange={(e) => setMensagemAusencia(e.target.value)}
                ></textarea>
              </div>
            )}

            {confirmou === true && (
              <div className="text-sm">
                <p className="mb-4 text-sm">
                  Estamos super felizes que você vai comparecer! 🎉
                </p>

                <div className="mb-6 rounded-xl bg-gray-50 p-4 text-left text-sm">
                  <p className="mb-2 font-medium text-gray-700">
                    Acompanhantes:
                  </p>

                  {acompanhantesPreenchidos.length === 0 ? (
                    <p className="text-gray-500">Nenhum acompanhante</p>
                  ) : (
                    <ul className="space-y-2">
                      {acompanhantesPreenchidos.map((a, index) => (
                        <li
                          key={index}
                          className="flex justify-between rounded-lg bg-white px-3 py-2 shadow-sm"
                        >
                          <span className="font-medium text-gray-800">
                            {index + 1}. {a.nome}
                          </span>
                          <span className="text-xs text-gray-500">
                            {a.tipo}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={confirmarPresenca}
                className="w-1/2 cursor-pointer rounded-xl bg-black py-2 text-sm text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-gray-700"
                disabled={
                  confirmou === false &&
                  (motivoAusencia === '' || mensagemAusencia.trim() === '')
                }
              >
                Confirmar
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-1/2 cursor-pointer rounded-xl border bg-gray-100 py-2 text-sm transition hover:bg-gray-200"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
