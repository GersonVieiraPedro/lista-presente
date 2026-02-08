export type Presente = {
  id: string
  nome: string
  categoria: string
  preco: number
  imagemUrl: string
  reservado?: boolean
  reservadoPor?: string
  cotas?: number
  cotasReservadas?: number
  cotasValor?: number
}
