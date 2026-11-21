"use client"

import { useEffect, useState } from "react"
import { Calculator, Info } from "lucide-react"
import { computeCACSCLFromBin, getCACSBin, type CACSBin } from "@/lib/cacs-cl"
import type { PathwayStep } from "@/lib/pathway"
import {
  applyModifiersExact,
  cacsValueToBin,
  formatPct,
  getFinalCategory,
  type CACSValue,
  type Step3Data,
} from "./step3-rfcl"

/**
 * Saisie du résultat du score calcique à l'étape 4.
 *
 * ESC 2024 : en probabilité faible (> 5–15 %), le CACS est à envisager pour
 * reclasser en probabilité très faible (IIa, B). Une fois le résultat connu, la
 * probabilité est recalculée par le modèle CACS-CL (Winther 2020) et la suite
 * dépend de cette nouvelle valeur, seuil strict à 5 % :
 *   ≤ 5 %         → pas d'examen coronarien supplémentaire (IIa, B)
 *   > 5 %         → coroscanner (I, B) ; test fonctionnel si calcifications
 *                   massives (CACS ≥ 400) ou probabilité élevée
 * La conduite affichée est le premier examen de la recommandation recalculée
 * (lib/pathway.ts), pour que l'encadré et la recommandation ne divergent jamais.
 */

const CLASSES: { value: CACSValue; label: string }[] = [
  { value: "zero", label: "0" },
  { value: "1-9", label: "1–9" },
  { value: "10-99", label: "10–99" },
  { value: "100-399", label: "100–399" },
  { value: "400-999", label: "400–999" },
  { value: "1000+", label: "≥ 1000" },
]

const BIN_TO_VALUE: Record<CACSBin, CACSValue> = {
  "0": "zero",
  "1-9": "1-9",
  "10-99": "10-99",
  "100-399": "100-399",
  "400-999": "400-999",
  ">=1000": "1000+",
}

/** Couleur de la conduite selon la probabilité recalculée. */
function toneFor(exact: number): { color: string; bg: string } {
  if (exact <= 5) return { color: "#15803d", bg: "#f0fdf4" }
  if (exact <= 15) return { color: "#16a34a", bg: "#f0fdf4" }
  if (exact <= 50) return { color: "#d97706", bg: "#fffbeb" }
  return { color: "#dc2626", bg: "#fef2f2" }
}

export function CacsResultPanel({
  rfclData,
  onChange,
  firstStep,
}: {
  rfclData: Step3Data
  onChange: (cacs: CACSValue) => void
  /** Premier examen de la recommandation recalculée : la « suite » affichée en découle. */
  firstStep?: PathwayStep
}) {
  const cacs = rfclData.modifiers.cacs
  const [agatston, setAgatston] = useState("")

  // Si la classe change ailleurs (boutons, étape 3), on vide une valeur saisie
  // qui ne lui correspondrait plus.
  useEffect(() => {
    if (agatston === "") return
    const n = Number(agatston.replace(",", "."))
    if (!Number.isFinite(n) || BIN_TO_VALUE[getCACSBin(n)] !== cacs) setAgatston("")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacs])

  const onAgatston = (raw: string) => {
    const cleaned = raw.replace(/[^\d.,]/g, "")
    setAgatston(cleaned)
    if (cleaned === "") return
    const n = Number(cleaned.replace(",", "."))
    if (Number.isFinite(n) && n >= 0) onChange(BIN_TO_VALUE[getCACSBin(n)])
  }

  const bin = cacsValueToBin(cacs)
  // Probabilité avant score calcique (modificateurs cliniques inclus) et après.
  const before = applyModifiersExact(rfclData.baseRFCL, { ...rfclData.modifiers, cacs: "unknown" })
  const cacsCL = bin !== null ? computeCACSCLFromBin(rfclData.baseRFCL, bin) : null
  const after = rfclData.adjustedRFCLExact
  const tone = toneFor(after)
  const step =
    bin !== null && firstStep
      ? {
          ...tone,
          title:
            firstStep.exam === "rassurance" ? "Pas d'examen coronarien supplémentaire" : firstStep.label,
          detail:
            firstStep.classe && !/classe|\b(I|IIa|IIb|III), [ABC]\b/i.test(firstStep.rationale)
              ? `${firstStep.rationale} (classe ${firstStep.classe})`
              : firstStep.rationale,
        }
      : null
  const category = getFinalCategory(after)
  const categoryLabel: Record<typeof category, string> = {
    "tres-faible": "très faible",
    faible: "faible",
    intermediaire: "intermédiaire",
    elevee: "élevée",
    "tres-elevee": "très élevée",
  }

  return (
    <section
      aria-label="Résultat du score calcique"
      className="overflow-hidden rounded-xl border-2 border-[#c7d2fe] bg-white"
    >
      <div className="flex items-start gap-3 border-b border-[#e0e7ff] bg-[#eef2ff] px-4 py-3">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#4f46e5] text-white">
          <Calculator className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-bold text-[#312e81]">Résultat du score calcique</p>
          <p className="mt-0.5 text-xs leading-relaxed text-[#4338ca]">
            Saisissez le score d&apos;Agatston ou sa classe : la probabilité est recalculée (CACS-CL) et
            la conduite à tenir mise à jour.
          </p>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {/* Valeur exacte */}
        <div>
          <label htmlFor="agatston" className="mb-1.5 block text-xs font-semibold text-[#475569]">
            Score d&apos;Agatston
          </label>
          <div className="flex items-center gap-2">
            <input
              id="agatston"
              inputMode="numeric"
              autoComplete="off"
              placeholder="ex. 85"
              value={agatston}
              onChange={(e) => onAgatston(e.target.value)}
              className="h-11 w-32 rounded-lg border-2 border-[#e2e8f0] px-3 text-center text-lg font-bold tabular-nums text-[#0f172a] focus:border-[#4f46e5] focus:outline-none"
            />
            <span className="text-xs text-[#64748b]">unités Agatston</span>
          </div>
        </div>

        {/* Classe */}
        <div>
          <p className="mb-1.5 text-xs font-semibold text-[#475569]">ou classe</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {CLASSES.map((c) => {
              const selected = cacs === c.value
              return (
                <button
                  key={c.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setAgatston("")
                    onChange(selected ? "unknown" : c.value)
                  }}
                  className={`touch-target rounded-lg border-2 px-2 py-2 text-sm font-semibold tabular-nums transition-all ${
                    selected
                      ? "border-[#4f46e5] bg-[#4f46e5] text-white"
                      : "border-[#e2e8f0] bg-white text-[#1e293b] hover:border-[#a5b4fc]"
                  }`}
                >
                  {c.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Résultat */}
        {step && cacsCL !== null ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-lg bg-[#f8fafc] px-3 py-2.5">
              <span className="text-xs text-[#64748b]">Probabilité</span>
              <span className="text-sm font-semibold tabular-nums text-[#64748b] line-through decoration-[#94a3b8]">
                {formatPct(before)} %
              </span>
              <span className="text-[#94a3b8]" aria-hidden="true">→</span>
              <span className="text-xl font-black tabular-nums" style={{ color: step.color }}>
                {formatPct(after)} %
              </span>
              <span className="text-xs font-semibold" style={{ color: step.color }}>
                probabilité {categoryLabel[category]}
              </span>
              {after !== cacsCL && (
                <span className="w-full text-[11px] text-[#64748b]">
                  CACS-CL {formatPct(cacsCL)} %, puis modificateurs cliniques de l&apos;étape 3.
                </span>
              )}
            </div>

            <div className="rounded-lg border-l-4 px-3 py-2.5" style={{ borderColor: step.color, backgroundColor: step.bg }}>
              <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: step.color }}>
                Suite ESC 2024
              </p>
              <p className="mt-0.5 text-sm font-bold text-[#0f172a]">{step.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-[#475569]">{step.detail}</p>
            </div>

            <div className="flex gap-2 rounded-lg bg-[#f8fafc] px-3 py-2.5 text-xs leading-relaxed text-[#475569]">
              <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#64748b]" aria-hidden="true" />
              {cacs === "zero" ? (
                <p>
                  Un score à 0 n&apos;exclut pas une plaque non calcifiée, en particulier chez le sujet jeune :
                  réévaluer si les symptômes sont très évocateurs ou persistent.
                </p>
              ) : (
                <p>
                  Un score &gt; 0 signe une athérosclérose coronaire : renforcer la prévention (statine,
                  cibles de LDL selon l&apos;ESC/EAS), même si le bilan d&apos;ischémie s&apos;arrête.
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#94a3b8]">
            Aucun résultat saisi : la recommandation ci-dessous reste « score calcique ».
          </p>
        )}
      </div>
    </section>
  )
}

export default CacsResultPanel
