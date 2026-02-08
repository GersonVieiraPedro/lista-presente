'use client'

import { useState } from 'react'

export default function InfoCotas() {
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-8 rounded-xl border border-gray-200 bg-linear-to-br from-gray-100 to-gray-200 p-5 text-sm text-gray-700 shadow-sm">
      <div className="relative flex items-center gap-4">
        {/* imagem */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-12 transition-transform duration-300"
          src="/desconto.png"
          alt="Presente dividido em cotas"
        />

        {/* título */}
        <span className="text-xl font-semibold tracking-tight text-gray-700">
          Presente dividido em cotas
        </span>

        {/* botão / ícone */}
        <button
          onClick={() => setOpen(!open)}
          className="absolute right-2 rounded-full p-1 transition hover:bg-gray-300"
          aria-label="Abrir ou fechar explicação"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            fill="currentColor"
            className={`text-gray-500 transition-transform duration-300 ${
              open ? 'rotate-0' : 'rotate-180'
            }`}
            viewBox="0 0 16 16"
          >
            <path d="M3.204 11h9.592L8 5.519zm-.753-.659 4.796-5.48a1 1 0 0 1 1.506 0l4.796 5.48c.566.647.106 1.659-.753 1.659H3.204a1 1 0 0 1-.753-1.659" />
          </svg>
        </button>
      </div>

      {/* conteúdo colapsável */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'mt-4 max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-2 leading-relaxed">
          <p>
            Presentes com este símbolo podem ser divididos em cotas, permitindo
            que o valor seja compartilhado.
          </p>

          <p>
            Assim, várias pessoas podem contribuir juntas, sem que o custo fique
            pesado para apenas uma.
          </p>

          <p className="font-medium text-gray-800">
            Você escolhe quantas cotas deseja presentear ou pode contribuir com
            o valor total.
          </p>
        </div>
      </div>
    </div>
  )
}
