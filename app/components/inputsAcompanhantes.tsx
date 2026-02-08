'use client'

type Props = {
  acompanhante: {
    id: string
    nome: string
    tipo: string
  }
  onChange: (id: string, field: 'nome' | 'tipo', value: string) => void
  onRemove: (id: string) => void
  canRemove: boolean
}

export function AcompanhanteInput({
  acompanhante,
  onChange,
  onRemove,
  canRemove,
}: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Nome do acompanhante"
          value={acompanhante.nome}
          onChange={(e) => onChange(acompanhante.id, 'nome', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
        />

        <select
          value={acompanhante.tipo}
          onChange={(e) => onChange(acompanhante.id, 'tipo', e.target.value)}
          className="w-[40%] rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
        >
          <option value="">Tipo</option>
          <option value="conjuge">Cônjuge</option>
          <option value="filhos">Filhos</option>
          <option value="familia">Família</option>
          <option value="amigos">Amigos</option>
          <option value="outros">Outros</option>
        </select>
      </div>

      {canRemove && (
        <button
          onClick={() => onRemove(acompanhante.id)}
          className="mt-2 text-xs text-red-500 underline"
        >
          Remover acompanhante
        </button>
      )}
    </div>
  )
}
