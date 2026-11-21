"use client"

import { useState } from "react"
import { Activity, Calculator, Clock, FileText, Stethoscope, ShieldCheck } from "lucide-react"

/**
 * Branche « patient asymptomatique » du parcours douleur thoracique.
 *
 * Le modèle RF-CL (ESC 2024) estime la probabilité pré-test de coronaropathie
 * obstructive chez le patient SYMPTOMATIQUE : il ne s'applique pas ici. Chez
 * l'asymptomatique, le risque se calcule avec SCORE2 / SCORE2-OP (prévention)
 * et l'imagerie coronaire diagnostique n'est pas indiquée (Classe III), sauf
 * CACS ≥ 400 où un test d'ischémie ou un CCTA peuvent être discutés
 * (Classe IIb, ESC 2019 — asymptomatique à haut risque).
 */

type AsymptomaticCACS = "unknown" | "zero" | "1-99" | "100-399" | "400+"

const CACS_OPTIONS: { value: AsymptomaticCACS; label: string }[] = [
  { value: "unknown", label: "Non réalisé" },
  { value: "zero", label: "CACS = 0" },
  { value: "1-99", label: "CACS 1–99" },
  { value: "100-399", label: "CACS 100–399" },
  { value: "400+", label: "CACS ≥ 400" },
]

const CLASSE_STYLE = {
  IIb: { label: "Classe IIb", bg: "#eef2ff", border: "#c7d2fe", color: "#4338ca" },
  III: { label: "Classe III", bg: "#fef2f2", border: "#fca5a5", color: "#b91c1c" },
} as const

interface Props {
  onPrev: () => void
  onReset: () => void
}

export function Step3Asymptomatic({ onPrev, onReset }: Props) {
  const [cacs, setCacs] = useState<AsymptomaticCACS>("unknown")
  const highCacs = cacs === "400+"

  const exams: { label: string; classe: keyof typeof CLASSE_STYLE }[] = highCacs
    ? [
        { label: "Test d'ischémie non invasif (écho, IRM ou scintigraphie de stress) — à discuter", classe: "IIb" },
        { label: "Coroscanner (CCTA) — alternative à discuter", classe: "IIb" },
      ]
    : [{ label: "Pas de coroscanner ni de test d'ischémie", classe: "III" }]

  const consultation = highCacs
    ? "Programmée — discuter un test d'ischémie ou un CCTA pour éliminer une atteinte à haut risque (ex. tronc commun)"
    : "Non urgente — prévention cardiovasculaire guidée par SCORE2"

  const prescriptions = highCacs
    ? [
        "Test d'ischémie non invasif ou CCTA (après avis cardiologique)",
        "Traitement hypolipémiant intensif — cible LDL selon SCORE2 et CACS",
      ]
    : ["Aucune imagerie coronaire — bilan et contrôle des facteurs de risque (SCORE2)"]

  return (
    <div className="space-y-5">
      {/* Modèle de calcul */}
      <div className="rounded-xl border-2 border-[#c4b5fd] bg-[#f5f3ff] p-4">
        <p className="text-[10px] font-bold uppercase tracking-wide text-[#7c3aed] mb-1.5">
          Modèle de calcul — patient asymptomatique
        </p>
        <p className="text-base font-bold text-[#5b21b6]">SCORE2 / SCORE2-OP (prévention)</p>
        <p className="text-xs text-[#475569] mt-1 leading-relaxed">
          Le RF-CL (probabilité pré-test ESC 2024) est réservé aux patients symptomatiques. Chez
          l&apos;asymptomatique, on estime le risque cardiovasculaire à 10 ans pour guider la prévention.
        </p>
        <a
          href="https://cardiomaine-coronaire.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#7c3aed] px-3 py-2 text-xs font-semibold text-white hover:bg-[#6d28d9] transition-colors"
        >
          <Calculator className="w-3.5 h-3.5" aria-hidden="true" />
          Calculer le risque SCORE2 (CoroPath, onglet Dépistage CV)
        </a>
      </div>

      {/* CACS */}
      <Section color="#475569" title="Score calcique coronarien (CACS) si connu" icon={<Activity className="w-4 h-4" />}>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {CACS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCacs(opt.value)}
              className={`py-2 px-2 rounded-lg text-xs font-semibold border-2 transition-all ${
                cacs === opt.value
                  ? "bg-[#1e293b] border-[#1e293b] text-white"
                  : "bg-white border-[#e2e8f0] text-[#475569] hover:border-[#94a3b8]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {cacs === "unknown" && (
          <p className="text-xs text-[#64748b] mt-3 leading-relaxed">
            Le CACS peut être envisagé pour affiner la classification du risque autour des seuils de traitement
            (prévention) — pas pour rechercher une sténose.
          </p>
        )}
      </Section>

      {/* Examen recommandé */}
      <Section color="#1e293b" title="Examen recommandé" icon={<Stethoscope className="w-4 h-4" />}>
        <div className="space-y-2">
          {exams.map((exam) => {
            const style = CLASSE_STYLE[exam.classe]
            return (
              <div
                key={exam.label}
                className="flex items-center justify-between gap-3 rounded-lg border p-2.5"
                style={{ borderColor: style.border, backgroundColor: style.bg }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: style.color }} />
                  <span className="text-sm font-semibold text-[#1e293b] leading-snug">{exam.label}</span>
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0 text-white"
                  style={{ backgroundColor: style.color }}
                >
                  {style.label}
                </span>
              </div>
            )
          })}
        </div>
      </Section>

      {/* Consultation + ordonnance */}
      <Section color="#1e293b" title="Consultation cardiologique & ordonnance" icon={<Clock className="w-4 h-4" />}>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start gap-1">
            <span className="text-xs font-semibold text-[#64748b] sm:w-40 flex-shrink-0">Consultation cardiologique :</span>
            <span className="text-sm text-[#1e293b]">{consultation}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-start gap-1">
            <span className="text-xs font-semibold text-[#64748b] sm:w-40 flex-shrink-0">Ordonnance :</span>
            <ul className="space-y-1 text-sm text-[#1e293b]">
              {prescriptions.map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#94a3b8]" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Nav */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onPrev}
          className="flex-1 py-3 rounded-xl border-2 border-[#e2e8f0] text-[#475569] text-sm font-semibold hover:bg-[#f8fafc] transition-colors"
        >
          Précédent
        </button>
        <button
          onClick={onReset}
          className="flex-[2] py-3 rounded-xl bg-[#1e293b] text-white font-semibold text-sm hover:bg-[#334155] transition-colors"
        >
          Nouvelle évaluation
        </button>
      </div>
    </div>
  )
}

function Section({
  color,
  title,
  icon,
  children,
}: {
  color: string
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-2 border-b border-[#f1f5f9]" style={{ backgroundColor: `${color}12` }}>
        <span style={{ color }}>{icon}</span>
        <p className="text-sm font-semibold" style={{ color }}>{title}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}
