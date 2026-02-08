import { useState } from 'react'

export default function PainelFiltros({
  busca,
  setBusca,
  ordenacao,
  setOrdenacao,
}: {
  busca: string
  setBusca: (v: string) => void
  ordenacao: string
  setOrdenacao: (v: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div
      style={{
        background:
          'linear-gradient(181deg,rgba(43, 43, 43, 1) 0%, rgba(74, 74, 74, 1) 50%, rgba(56, 56, 56, 1) 100%)',
      }}
      className="sticky top-0 z-20 flex justify-center gap-2 bg-zinc-700 p-2 text-gray-700 shadow-xl"
    >
      <input
        type="search"
        placeholder="Buscar presente ou categoria"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="h-14 w-[80%] rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-zinc-400 focus:outline-none"
      />

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-zinc-400 focus:outline-none"
        >
          <div className="flex h-8 items-center gap-2 p-2 text-zinc-700">
            <span className="flex size-5 items-center justify-center text-zinc-700">
              {!ordenacao && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5m-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5"
                  />
                </svg>
              )}

              {ordenacao === 'disponiveis' && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M3 2.5a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 1 5 0v.006c0 .07 0 .27-.038.494H15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 14.5V7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h2.038A3 3 0 0 1 3 2.506zm1.068.5H7v-.5a1.5 1.5 0 1 0-3 0c0 .085.002.274.045.43zM9 3h2.932l.023-.07c.043-.156.045-.345.045-.43a1.5 1.5 0 0 0-3 0zM1 4v2h6V4zm8 0v2h6V4zm5 3H9v8h4.5a.5.5 0 0 0 .5-.5zm-7 8V7H2v7.5a.5.5 0 0 0 .5.5z" />
                </svg>
              )}

              {ordenacao === 'menor' && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  className="bi bi-caret-down-fill text-red-800"
                  viewBox="0 0 16 16"
                >
                  <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                </svg>
              )}
              {ordenacao === 'maior' && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  className="bi bi-caret-up-fill text-green-800"
                  viewBox="0 0 16 16"
                >
                  <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z" />
                </svg>
              )}
            </span>
          </div>

          <svg
            className={`h-4 w-4 transition-transform ${
              open ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {open && (
          <ul className="absolute z-10 mt-2 w-full rounded-xl border border-zinc-200 bg-white p-1 px-2 shadow-lg">
            <li
              onClick={() => {
                if (ordenacao === 'menor') {
                  setOrdenacao('')
                } else {
                  setOrdenacao('menor')
                }
                setOpen(false)
              }}
              className={`cursor-pointer rounded-xl px-4 py-3 text-sm hover:bg-zinc-100 ${ordenacao === 'menor' ? 'bg-zinc-100' : ''}`}
            >
              Menor preço
            </li>

            <li
              onClick={() => {
                if (ordenacao === 'maior') {
                  setOrdenacao('')
                } else {
                  setOrdenacao('maior')
                }
                setOpen(false)
              }}
              className={`cursor-pointer rounded-xl px-4 py-3 text-sm hover:bg-zinc-100 ${ordenacao === 'maior' ? 'bg-zinc-100' : ''}`}
            >
              Maior preço
            </li>
            <li
              onClick={() => {
                if (ordenacao === 'disponiveis') {
                  setOrdenacao('')
                } else {
                  setOrdenacao('disponiveis')
                }
                setOpen(false)
              }}
              className={`cursor-pointer rounded-xl px-4 py-3 text-sm hover:bg-zinc-100 ${ordenacao === 'disponiveis' ? 'bg-zinc-100' : ''}`}
            >
              Livre
            </li>
          </ul>
        )}
      </div>
    </div>
  )
}
