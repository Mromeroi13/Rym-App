import { useCallback, useEffect, useRef, useState } from 'react'
import { computeElapsed } from '../timer'

/**
 * Cronómetro global del entrenamiento. Vive en el componente de ejecución, por lo que
 * cambiar de ejercicio nunca lo reinicia. Se basa en Date.now() (no en contar ticks),
 * así que no se desvía aunque la pestaña se ralentice.
 */
export function useStopwatch(initialSeconds: number, initiallyRunning: boolean) {
  const baseRef = useRef(initialSeconds)
  const startedRef = useRef<number | null>(initiallyRunning ? Date.now() : null)
  const [seconds, setSeconds] = useState(initialSeconds)
  const [running, setRunning] = useState(initiallyRunning)

  const read = useCallback(() => computeElapsed(baseRef.current, startedRef.current, Date.now()), [])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSeconds(read()), 500)
    return () => clearInterval(id)
  }, [running, read])

  const pause = useCallback(() => {
    const value = read()
    baseRef.current = value
    startedRef.current = null
    setRunning(false)
    setSeconds(value)
    return value
  }, [read])

  const resume = useCallback(() => {
    if (startedRef.current === null) startedRef.current = Date.now()
    setRunning(true)
  }, [])

  return { seconds, running, pause, resume, read }
}
