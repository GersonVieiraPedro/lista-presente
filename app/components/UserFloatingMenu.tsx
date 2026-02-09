'use client'

import { useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function UserFloatingMenu() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  const isLogged = !!session

  return (
    <>
      {/* Avatar flutuante */}
      <div
        className="absolute left-2 z-50 mt-14 cursor-pointer opacity-80 transition hover:opacity-100"
        onClick={() => setOpen(true)}
      >
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full border-4 ${isLogged ? 'border-green-600' : 'border-gray-400'} overflow-hidden bg-gray-200`}
        >
          {isLogged && session.user?.image ? (
            <img src={session.user.image} alt="User" width={48} height={48} />
          ) : (
            <span className="text-xl text-gray-600">👤</span>
          )}
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 text-gray-700">
          <div className="w-72 rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-center text-lg font-semibold">
              {isLogged
                ? `Olá, ${session.user?.name?.split(' ')[0]} 👋`
                : 'Você não está logado'}
            </h2>

            <div className="flex flex-col gap-3 text-gray-600">
              {!isLogged ? (
                <button
                  onClick={() => signIn('google')}
                  className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700"
                >
                  Logar com Google
                </button>
              ) : (
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full rounded-lg bg-red-500 py-2 text-white hover:bg-red-600"
                >
                  Sair
                </button>
              )}

              <button
                onClick={() => setOpen(false)}
                className="w-full rounded-lg border border-gray-300 py-2 hover:bg-gray-100"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
