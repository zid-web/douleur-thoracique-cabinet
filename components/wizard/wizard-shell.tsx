"use client"

import { useState, useCallback, useEffect } from "react"
import { BookOpen, ChevronLeft } from "lucide-react"
import { Step1Triage } from "./step1-triage"
import { Step2Symptoms, type Step2Data } from "./step2-symptoms"
import { Step3RFCL, recomputeWithCacs, type Step3Data } from "./step3-rfcl"
import { Step4Decision, type BayesianWizardData } from "./step4-decision"
import { Step5Summary } from "./step5-summary"
import { Step3Asymptomatic } from "./step3-asymptomatic"
import { useWizardHistory } from "@/hooks/use-wizard-history"
import { ContactsBar } from "@/components/shell/contacts-bar"

const STEPS = [
  { id: 1, title: "Triage immédiat", short: "Triage" },
  { id: 2, title: "Caractérisation", short: "Symptômes" },
  { id: 3, title: "Calcul RF-CL", short: "RF-CL" },
  { id: 4, title: "Stratification", short: "Décision" },
  { id: 5, title: "Probabilité post-test", short: "Post-test" },
  { id: 6, title: "Résumé", short: "Résumé" },
]

type WizardState = {
  step: number
  symptomData: Step2Data | null
  rfclData: Step3Data | null
  bayesianData: BayesianWizardData | null
  /** Incrémenté à chaque nouvelle évaluation pour remettre les étapes à zéro. */
  round: number
}

export function WizardShell() {
  const [state, setState] = useState<WizardState>({
    step: 1,
    symptomData: null,
    rfclData: null,
    bayesianData: null,
    round: 0,
  })

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const setStep = useCallback((step: number) => setState((s) => ({ ...s, step })), [])
  // Étapes synchronisées avec l'historique : le « retour » du téléphone
  // ramène à l'étape précédente.
  const { push, back, goBackTo, canGoBackTo } = useWizardHistory(setStep)

  useEffect(() => {
    scrollToTop()
  }, [state.step, scrollToTop])

  const reset = () => {
    setState((s) => ({ step: 1, symptomData: null, rfclData: null, bayesianData: null, round: s.round + 1 }))
    goBackTo(1)
  }

  const stepTitles: Record<number, string> = {
    1: "Évaluation initiale — Critères d'alerte immédiate",
    2: "Classification symptomatique de la douleur",
    3: "Calcul de la probabilité pré-test — Modèle RF-CL (Winther / ESC 2024)",
    4: "Stratification et prise en charge",
    5: "Probabilité post-test, consultation cardiologique et ordonnance",
    6: "Fiche de consultation — Résumé clinique",
  }

  const stepSubtitles: Record<number, string> = {
    1: "Répondez par OUI ou NON à chacune des situations suivantes",
    2: "Selon la classification ESC 2024 — remplace la terminologie 'typique/atypique'",
    3: "Score calculé à partir du sexe, de l'âge, des symptômes et des facteurs de risque",
    4: "Décision clinique basée sur le RF-CL ajusté final",
    5: "Probabilité mise à jour selon les examens réalisés (Knuuti 2018 — ESC 2024)",
    6: "Fiche récapitulative imprimable",
  }

  const currentStep = state.step
  // Patient asymptomatique : branche prévention (SCORE2) au lieu du RF-CL,
  // qui n'estime la probabilité pré-test que chez le symptomatique.
  const asymptomatic = state.symptomData?.asymptomatique === true
  const steps = asymptomatic
    ? [...STEPS.slice(0, 2), { id: 3, title: "Prévention", short: "SCORE2" }]
    : STEPS
  if (asymptomatic) {
    stepTitles[3] = "Patient asymptomatique — Modèle SCORE2 (prévention)"
    stepSubtitles[3] = "Le RF-CL ne s'applique qu'aux patients symptomatiques"
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      {/* Top bar */}
      <div className="bg-white border-b border-[#e2e8f0] sticky top-0 z-20 print:hidden">
        <div className="max-w-2xl mx-auto px-4 pt-2 pb-3">
          {/* Retour à l'accueil, et accès aux sources du calcul. Liens classiques
              (rechargement de page) plutôt que la navigation interne de Next.js :
              ils ne dépendent ni des fichiers préchargés ni du cache de l'app. */}
          <div className="flex items-center justify-between gap-3 mb-2">
            <a
              href="/"
              className="inline-flex items-center gap-1 text-xs text-[#64748b] hover:text-[#1e293b] transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
              Accueil
            </a>
            <a
              href="/references/"
              className="inline-flex items-center gap-1 text-xs text-[#64748b] hover:text-[#1e293b] transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              Références
            </a>
          </div>
          {/* Title */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-sm font-bold text-[#1e293b]">Filière Angor Cardiomaine</h1>
              <p className="text-xs text-[#64748b]">Douleur thoracique au cabinet — ESC 2023/2024</p>
            </div>
            <span className="text-xs text-[#94a3b8] font-medium">
              Étape {currentStep} / {steps.length}
            </span>
          </div>

          {/* Numéros utiles, accessibles à chaque étape */}
          <div className="mb-3">
            <ContactsBar variant="compact" />
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#e2e8f0] rounded-full h-1.5 mb-3">
            <div
              className="h-1.5 rounded-full bg-[#1e293b] transition-all duration-500"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>

          {/* Step dots */}
          <div className="flex items-center justify-between">
            {steps.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goBackTo(s.id)}
                disabled={!canGoBackTo(s.id)}
                aria-label={`Revenir à l'étape ${s.id} — ${s.short}`}
                className="flex flex-col items-center gap-1 disabled:cursor-default"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    s.id < currentStep
                      ? "bg-[#1e293b] text-white"
                      : s.id === currentStep
                      ? "bg-[#1e293b] text-white ring-4 ring-[#1e293b]/20"
                      : "bg-[#e2e8f0] text-[#94a3b8]"
                  }`}
                >
                  {s.id < currentStep ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s.id
                  )}
                </div>
                <span
                  className={`text-[9px] font-medium hidden sm:block ${
                    s.id === currentStep ? "text-[#1e293b]" : "text-[#94a3b8]"
                  }`}
                >
                  {s.short}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky score badge after step 3 */}
      {state.rfclData && currentStep >= 4 && (
        <div className="print:hidden sticky top-[148px] sm:top-[152px] z-10 pointer-events-none">
          <div className="max-w-2xl mx-auto px-4">
            <div
              className="ml-auto w-fit rounded-full px-3 py-1 text-xs font-bold text-white shadow-lg"
              style={{ backgroundColor: getCategoryColor(state.rfclData.finalCategory) }}
            >
              RF-CL : {state.rfclData.adjustedRFCL}% — {getCategoryShortLabel(state.rfclData.finalCategory)}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-16">
        {/* Step heading */}
        <div className="mb-6 print:hidden">
          <h2 className="text-lg font-bold text-[#1e293b] text-balance leading-snug">
            {stepTitles[currentStep]}
          </h2>
          <p className="text-sm text-[#64748b] mt-1 leading-relaxed">
            {stepSubtitles[currentStep]}
          </p>
        </div>

        {/* Step content — les étapes visitées restent montées (masquées) pour
            conserver les réponses quand on revient en arrière. */}
        <div key={state.round}>
        <div hidden={currentStep !== 1}>
          <Step1Triage
            onNext={(data) => {
              if (!data.redFlagTriggered) push(2)
            }}
          />
        </div>

        <div hidden={currentStep !== 2}>
          <Step2Symptoms
            onPrev={back}
            onNext={(data) => {
              setState((s) => ({ ...s, symptomData: data }))
              push(3)
            }}
          />
        </div>

        {state.symptomData && (
          <div hidden={currentStep !== 3 || !asymptomatic}>
            <Step3Asymptomatic onPrev={back} onReset={reset} />
          </div>
        )}

        {state.symptomData && (
          <div hidden={currentStep !== 3 || asymptomatic}>
          <Step3RFCL
            symptomData={state.symptomData}
            cacsFromLaterStep={state.rfclData?.modifiers.cacs}
            onPrev={back}
            onNext={(data) => {
              setState((s) => ({ ...s, rfclData: data }))
              push(4)
            }}
          />
          </div>
        )}

        {state.rfclData && state.symptomData && (
          <div hidden={currentStep !== 4 && currentStep !== 5}>
          {/* Un seul composant pour les étapes 4 (décision) et 5 (post-test) :
              les examens saisis et les réglages restent partagés. */}
          <Step4Decision
            rfclData={state.rfclData}
            symptomType={state.symptomData.symptomType}
            view={currentStep === 5 ? "posttest" : "decision"}
            onPrev={back}
            onNext={() => push(5)}
            onNextSummary={() => push(6)}
            onBayesianChange={(data) =>
              setState((s) => ({ ...s, bayesianData: data }))
            }
            onCacsResult={(cacs) =>
              setState((s) => (s.rfclData ? { ...s, rfclData: recomputeWithCacs(s.rfclData, cacs) } : s))
            }
          />
          </div>
        )}

        {currentStep === 6 && state.symptomData && state.rfclData && (
          <Step5Summary
            symptomData={state.symptomData}
            rfclData={state.rfclData}
            bayesianData={state.bayesianData}
            onPrev={back}
            onReset={reset}
          />
        )}
        </div>
      </main>
    </div>
  )
}

function getCategoryColor(cat: Step3Data["finalCategory"]): string {
  const map = {
    "tres-faible": "#15803d",
    faible: "#16a34a",
    intermediaire: "#d97706",
    elevee: "#dc2626",
    "tres-elevee": "#991b1b",
  }
  return map[cat]
}

function getCategoryShortLabel(cat: Step3Data["finalCategory"]): string {
  const map = {
    "tres-faible": "Très faible",
    faible: "Faible",
    intermediaire: "Intermédiaire",
    elevee: "Élevée",
    "tres-elevee": "Très élevée",
  }
  return map[cat]
}
