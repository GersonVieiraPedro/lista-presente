'use client'

import { signIn } from 'next-auth/react'

export function LoginGoogle() {
  return (
    <button
      onClick={() => signIn('google')}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium shadow-sm transition hover:bg-gray-50"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/google.svg" alt="" className="h-5 w-5" />
      Entrar com Google
    </button>
  )
}
