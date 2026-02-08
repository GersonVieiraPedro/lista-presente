import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL não definida')

// inicializa adapter direto com URL (melhor compatibilidade TS)
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// função helper para verificar se já existe conexão ativa
export const isPrismaConnected = (): boolean => {
  try {
    // PrismaClient._activeProvider é interno, mas funciona como verificador
    return !!(prisma as unknown as { _activeProvider?: unknown })
      ._activeProvider
  } catch {
    return false
  }
}

// opcional: log de host/banco
console.log(
  'Conectando ao Neon:',
  process.env.DATABASE_URL?.split('@')[1].split('/')[0],
  'banco:',
  process.env.DATABASE_URL?.split('/').pop()?.split('?')[0],
  'conectado:',
  isPrismaConnected(),
)
