import Link from 'next/link'
import { Presente } from '../type'
import ItemReservado from './botaoReservado'

type Props = Presente

export function CardPresente(props: Props) {
  const {
    id,
    nome,
    preco,
    imagemUrl,
    reservado = false,
    reservadoPor,
    categoria,
    cotas,
    cotasValor,
  } = props

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-gray-50 shadow-sm transition hover:bg-gray-100 hover:shadow-lg">
      {cotas && cotas > 1 ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          className="absolute top-2 left-2 w-16"
          src="desconto.png"
          alt="Desconto"
        />
      ) : null}
      <div className="aspect-square overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imagemUrl}
          alt={nome}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="space-y-2 p-4">
        <div className="min-h-32">
          <span className="text-xs tracking-wide text-zinc-500 uppercase">
            {categoria}
          </span>

          <h3 className="text-lg font-medium text-zinc-900">{nome}</h3>

          <p className="font-semibold text-zinc-700">
            R$ {preco.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-[12px] text-gray-600">
            {cotas && cotas > 1
              ? `Cota: R$ ${cotasValor?.toFixed(2).replace('.', ',')}`
              : ''}
          </p>
        </div>
        <ItemReservado
          id={id}
          reservado={reservado}
          reservadoPor={reservadoPor}
        />
      </div>
    </div>
  )
}
