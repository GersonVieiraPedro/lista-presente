'use client'

import { useState } from 'react'

export function ConfirmacaoPresencaModal({
  onConfirm,
}: {
  onConfirm: () => void
}) {
  const [checked, setChecked] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          Confirmação de presença
        </h2>

        <p className="mb-4 text-sm leading-relaxed text-gray-600">
          Esta confirmação é importante para a organização do evento, pois
          envolve reservas de buffet, espaço e planejamento geral.
          <br />
          <br />
          Por favor, confirme apenas se tiver certeza da sua presença.
        </p>

        <label className="mb-4 flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span>
            Confirmo que estarei presente e estou ciente de que esta confirmação
            impacta diretamente na organização do evento.
          </span>
        </label>

        <button
          disabled={!checked}
          onClick={onConfirm}
          className={`w-full rounded-lg py-2.5 text-sm font-medium transition ${
            checked
              ? 'bg-gray-800 text-white hover:bg-gray-900'
              : 'cursor-not-allowed bg-gray-200 text-gray-400'
          }`}
        >
          Confirmar presença
        </button>
      </div>
    </div>
  )
}
