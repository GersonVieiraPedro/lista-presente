'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

const fotos = [
  '/fotos/1.jpeg',
  '/fotos/2.jpeg',
  '/fotos/3.jpeg',
  '/fotos/4.jpeg',
  '/fotos/5.jpeg',
  '/fotos/6.jpeg',
  '/fotos/7.jpeg',
  '/fotos/8.jpeg',
]

export function Header() {
  const [fotoAtiva, setFotoAtiva] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setFotoAtiva((prev) => (prev + 1) % fotos.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    // min-h-screen permite que a tela cresça se faltar espaço
    <header className="relative flex min-h-screen flex-col overflow-hidden bg-zinc-900 text-white">
      {/* Carrossel - Fica absoluto atrás de tudo */}
      <div className="absolute inset-0">
        {fotos.map((foto, index) => (
          <Image
            key={foto}
            src={foto}
            fill
            alt={'Foto do casal' + ' ' + (index + 1)}
            className={`object-cover transition-opacity duration-1000 ${index === fotoAtiva ? 'opacity-60' : 'opacity-0'}`}
            unoptimized
          />
        ))}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Conteúdo */}
      <div className="relative mx-auto flex max-w-4xl flex-1 flex-col justify-between px-6 py-10 text-center md:py-20">
        {/* Topo: Nomes */}
        <div className="animate-fade-in">
          <h1 className="font-title mt-20 text-4xl font-extrabold tracking-wide md:text-6xl lg:mt-0">
            Vitória e Gerson
          </h1>
          <p className="text-md my-3 font-medium tracking-[0.3em] text-zinc-200 uppercase md:text-base">
            Chá de Casa Nova
          </p>
        </div>

        {/* Meio: O convite (com margens que diminuem no PC) */}
        <div className="font-body mx-auto my-auto flex max-w-2xl flex-col gap-5 space-y-6 text-base leading-relaxed text-zinc-100 md:py-2 md:text-lg">
          <p>
            Com imensa alegria, convidamos você para celebrar conosco o nosso
            Chá de Casa Nova! Venha compartilhar momentos especiais enquanto
            preparamos nosso novo lar com amor e carinho.
          </p>

          <p>
            Esse evento é mais do que uma simples reunião; é uma celebração do
            início de uma nova fase em nossas vidas.
          </p>

          <p>
            Então chegue mais, abra uma cerveja gelada, desfrute uma boa
            feijoada, escute um bom samba e traga sua energia positiva!
          </p>
          <p>
            Conheça nossa lista de presentes e ajude-nos a tornar nosso lar
            ainda mais acolhedor.
          </p>
        </div>

        {/* Rodapé: Fechamento */}
        <div className="mt-5">
          <p className="font-title text-2xl font-medium text-green-300 md:text-3xl">
            🍻 &#x1f1e7;&#x1f1f7; Novo Capítulo &#x1f1e7;&#x1f1f7; 🍻
          </p>
        </div>
      </div>
    </header>
  )
}
