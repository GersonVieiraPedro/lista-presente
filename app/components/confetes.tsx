'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { loadPartySound, playPartySound } from '../utils/useConfeteSom'

type ConfetesProps = {
  ativo: boolean
}

export default function Confetes({ ativo }: ConfetesProps) {
  useEffect(() => {
    if (!ativo) return

    const run = async () => {
      try {
        await loadPartySound()
        await playPartySound()

        confetti({
          particleCount: 200,
          angle: 90,
          spread: 90,
          startVelocity: 50,
          origin: { x: 0.5, y: 1 },
          colors: ['#60a5fa', '#ec4899', '#10b981', '#fbbf24', '#f87171'],
        })
      } catch (err) {
        console.error('Erro ao tocar som/confete', err)
      }
    }

    run()
  }, [ativo])

  return null
}
