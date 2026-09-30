import { useEffect, useRef, useState } from 'react'
import { computeRemaining } from '../timer'

/**
 * Cuenta atrás desde `totalSeconds` hasta 0. Basada en Date.now() (no en ticks),
 * así que no se desvía si la pestaña se ralentiza en segundo plano — mismo
 * enfoque que useStopwatch. Se congela sin perder el resto mientras `paused`
 * es true, y llama a `onComplete` una única vez al llegar a 0.
 *
 * Para reiniciarla (nueva serie, nueva fase de descanso) el componente que la
 * usa debe desmontar y volver a montar con un `key` distinto — no hace falta
 * ningún parámetro de reinicio aquí, así los refs siempre nacen limpios.
 */
export function useCountdown(totalSeconds: number, paused: boolean, onComplete: () => void) {
  const [remaining, setRemaining] = useState(totalSeconds)
  const baseRef = useRef(totalSeconds)
  const startedAtRef = useRef(Date.now())
  const firedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  // Al pausar, "congela" el resto; al reanudar, recalcula el punto de partida.
  useEffect(() => {
    if (paused) {
      baseRef.current = remaining
    } else {
      startedAtRef.current = Date.now()
    }
    // Solo debe reaccionar a cambios de `paused`: `remaining` se lee, no se observa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused])

  useEffect(() => {
    if (paused || firedRef.current) return
    const id = setInterval(() => {
      const value = computeRemaining(baseRef.current, startedAtRef.current, Date.now())
      setRemaining(value)
      if (value <= 0 && !firedRef.current) {
        firedRef.current = true
        onCompleteRef.current()
      }
    }, 250)
    return () => clearInterval(id)
  }, [paused])

  return remaining
}
