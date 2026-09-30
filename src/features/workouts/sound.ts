// Pitido corto para avisar de que ha terminado un descanso o un ejercicio por
// tiempo. Se genera con la Web Audio API (sin ficheros de audio que servir ni
// cachear) y reutiliza un único AudioContext para todo el entrenamiento.
//
// Restricciones de autoplay: los navegadores exigen un gesto del usuario antes
// de reproducir audio. Para llegar a esta pantalla el usuario ya ha pulsado
// varios botones (iniciar entrenamiento, completar series...), así que el
// contexto se crea/retoma de forma perezosa la primera vez que hace falta y
// queda desbloqueado para el resto de la sesión.
let ctx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) ctx = new Ctor()
  return ctx
}

function beep(audioCtx: AudioContext, freq: number, startTime: number, duration: number, gain: number) {
  const osc = audioCtx.createOscillator()
  const g = audioCtx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, startTime)
  g.gain.setValueAtTime(0.0001, startTime)
  g.gain.exponentialRampToValueAtTime(gain, startTime + 0.01)
  g.gain.setValueAtTime(gain, startTime + duration - 0.05)
  g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
  osc.connect(g)
  g.connect(audioCtx.destination)
  osc.start(startTime)
  osc.stop(startTime + duration + 0.01)
}

/**
 * Tres pitidos ascendentes cortos seguidos de uno largo.
 * Patrón: 880 Hz · 1100 Hz · 1320 Hz · 880 Hz (laaargo)
 * Total ~1.6 s, inconfundible incluso sin mirar la pantalla.
 */
export function playCountdownEndSound() {
  const audioCtx = getContext()
  if (!audioCtx) return
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }

  const t = audioCtx.currentTime
  beep(audioCtx, 880,  t,        0.12, 0.35)
  beep(audioCtx, 1100, t + 0.18, 0.12, 0.35)
  beep(audioCtx, 1320, t + 0.36, 0.12, 0.35)
  beep(audioCtx, 880,  t + 0.54, 0.45, 0.40)
}