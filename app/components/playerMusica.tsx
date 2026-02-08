'use client'
import { useState, useEffect, useRef } from 'react'

export default function MusicaPagina() {
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Configurações básicas do áudio
  useEffect(() => {
    if (!audioRef.current) return
    const audio = audioRef.current
    audio.loop = true
    audio.muted = muted
    audio.volume = muted ? 0 : 0.8
  }, [muted])

  // Função para tocar o áudio com fade-in
  const playAudio = () => {
    if (!audioRef.current || playing) return
    const audio = audioRef.current
    audio.volume = 0
    audio
      .play()
      .then(() => {
        setPlaying(true)
        if (!muted) fadeInVolume(audio, 0.8)
      })
      .catch(() => {
        console.log('Autoplay bloqueado. Aguarde interação do usuário.')
      })
  }

  // Função de fade-in do volume
  const fadeInVolume = (audio: HTMLAudioElement, targetVolume: number) => {
    const step = 0.02
    const intervalMs = 200
    const intervalId = setInterval(() => {
      if (audio.volume >= targetVolume) {
        audio.volume = targetVolume
        clearInterval(intervalId)
        return
      }
      audio.volume = Math.min(targetVolume, audio.volume + step)
    }, intervalMs)
  }

  // Toggle mute/desmute
  const toggleMute = () => {
    if (!audioRef.current) return
    const audio = audioRef.current
    const willMute = !muted
    setMuted(willMute)

    if (willMute) {
      audio.volume = 0
      audio.muted = true
    } else {
      audio.muted = false
      fadeInVolume(audio, 0.8)
    }

    // Caso ainda não esteja tocando, iniciar
    if (!playing) playAudio()
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <audio
        ref={audioRef}
        src="/tribalistas_velha_infancia.mp3"
        preload="auto"
      />

      <button
        onClick={toggleMute}
        className="cursor-pointer rounded-xl bg-zinc-700/50 px-4 py-2 text-white transition hover:bg-zinc-800"
      >
        {muted ? '🔇 Mutado' : '🔊 Tocando'}
      </button>
    </div>
  )
}
