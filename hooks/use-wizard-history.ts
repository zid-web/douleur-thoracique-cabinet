"use client"

import { useCallback, useEffect, useId, useRef } from "react"

/**
 * Synchronise les étapes d'un assistant avec l'historique du navigateur.
 *
 * Chaque étape franchie ajoute une entrée d'historique : le bouton ou le geste
 * « retour » du téléphone ramène alors à l'étape précédente au lieu de quitter
 * la page. Les boutons « Précédent » de l'assistant passent eux aussi par
 * l'historique (`back` / `goBackTo`) pour que les deux restent alignés.
 */
export function useWizardHistory(setStep: (step: number) => void, firstStep = 1) {
  const id = useId()
  // Étapes réellement parcourues (le chemin n'est pas toujours linéaire).
  const pathRef = useRef<number[]>([firstStep])

  useEffect(() => {
    const onPop = (event: PopStateEvent) => {
      const state = event.state as { wizardId?: string; wizardDepth?: number } | null
      if (state?.wizardId === id && typeof state.wizardDepth === "number") {
        pathRef.current = pathRef.current.slice(0, state.wizardDepth + 1)
      } else if (state?.wizardId) {
        // Entrée d'un autre assistant de la page : pas de changement ici.
        return
      } else {
        // Retour avant la première étape franchie : on revient au début.
        pathRef.current = [firstStep]
      }
      setStep(pathRef.current[pathRef.current.length - 1])
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [id, firstStep, setStep])

  /** Avancer vers `next` en créant une entrée d'historique. */
  const push = useCallback(
    (next: number) => {
      pathRef.current = [...pathRef.current, next]
      window.history.pushState(
        { ...window.history.state, wizardId: id, wizardDepth: pathRef.current.length - 1 },
        "",
      )
      setStep(next)
    },
    [id, setStep],
  )

  /** Revenir à une étape déjà parcourue (par défaut la précédente). */
  const goBackTo = useCallback((target?: number) => {
    const path = pathRef.current
    const index = target === undefined ? path.length - 2 : path.lastIndexOf(target)
    if (index < 0 || index >= path.length - 1) return
    window.history.go(index - (path.length - 1))
  }, [])

  const back = useCallback(() => goBackTo(), [goBackTo])

  /** Étapes déjà parcourues, vers lesquelles on peut revenir. */
  const canGoBackTo = useCallback((target: number) => {
    const path = pathRef.current
    const index = path.lastIndexOf(target)
    return index >= 0 && index < path.length - 1
  }, [])

  return { push, back, goBackTo, canGoBackTo }
}
