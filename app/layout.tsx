import type { Metadata } from 'next'
import { Playfair_Display, Montserrat } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

// Fonte para Títulos
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair', // Nome da variável CSS
})

// Fonte para o Corpo (Texto comum e listas)
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
})

export const metadata: Metadata = {
  title: 'Chá de Casa Nova',
  description:
    'Celebre conosco o início de uma nova jornada repleta de amor, risos e memórias compartilhadas.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
