'use client'

let audioContext: AudioContext | null = null
let audioBuffer: AudioBuffer | null = null

export async function loadPartySound() {
  if (audioBuffer) return

  audioContext = audioContext || new AudioContext()

  const response = await fetch('/confetes.mp3')
  const arrayBuffer = await response.arrayBuffer()
  audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
}

export async function playPartySound() {
  if (!audioContext || !audioBuffer) return

  // 🔥 ISSO É O PULO DO GATO
  if (audioContext.state === 'suspended') {
    await audioContext.resume()
  }

  const source = audioContext.createBufferSource()
  source.buffer = audioBuffer
  source.connect(audioContext.destination)
  source.start(0)
}
