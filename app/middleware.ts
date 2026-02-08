import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Lista de rotas públicas
const PUBLIC_PATHS = ['/']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Permite acesso às rotas públicas sem autenticação
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next()
  }

  // Aqui você verifica a sessão/logado
  const token =
    req.cookies.get('next-auth.session-token')?.value ||
    req.cookies.get('__Secure-next-auth.session-token')?.value

  if (!token) {
    // Se não estiver logado, redireciona para a raiz
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

// Aplica middleware a todas as rotas exceto arquivos estáticos
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
