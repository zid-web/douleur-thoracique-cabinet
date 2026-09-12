"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  WifiOff,
  ShieldCheck,
  BookOpen,
  Stethoscope,
  ClipboardList,
  Calculator,
  GitBranch,
  FileText,
} from "lucide-react"
import { Logo } from "@/components/brand/logo"

const STEPS = [
  {
    id: 1,
    short: "Triage",
    title: "Écarter l'urgence",
    icon: Stethoscope,
    body: "Les critères d'alerte ESC 2023 d'abord : douleur persistante, instabilité, signes de syndrome coronarien aigu. Tant qu'ils ne sont pas levés, aucun calcul de probabilité n'a de sens.",
  },
  {
    id: 2,
    short: "Symptômes",
    title: "Caractériser la douleur",
    icon: ClipboardList,
    body: "La classification ESC 2024 en trois composantes — caractère, localisation, facteurs déclenchants — remplace le vieux « typique / atypique » et conditionne toute la suite du calcul.",
  },
  {
    id: 3,
    short: "RF-CL",
    title: "Calculer la probabilité",
    icon: Calculator,
    body: "Table Winther 2020 croisant sexe, âge, symptômes et facteurs de risque, puis pondération par le score calcique via la formule CACS-CL et par les modificateurs cliniques.",
  },
  {
    id: 4,
    short: "Décision",
    title: "Choisir le premier examen",
    icon: GitBranch,
    body: "Un examen à prescrire, pas un menu : le choix tient compte de la probabilité obtenue, des délais d'accès réels au coroscanner et à la coronarographie, de la fonction rénale et des comorbidités.",
  },
  {
    id: 5,
    short: "Fiche",
    title: "Éditer la consultation",
    icon: FileText,
    body: "Une fiche récapitulative imprimable ou exportable, reprenant le profil, le calcul détaillé et la conduite à tenir — prête à accompagner la demande adressée au cardiologue.",
  },
]

const GUARANTEES = [
  {
    icon: WifiOff,
    title: "Utilisable hors ligne",
    body: "Installée, l'application fonctionne sans réseau — cabinet, domicile, établissement.",
  },
  {
    icon: ShieldCheck,
    title: "Aucune donnée transmise",
    body: "Tous les calculs s'exécutent sur l'appareil. Rien n'est envoyé ni conservé.",
  },
  {
    icon: BookOpen,
    title: "Sources vérifiables",
    body: "Winther 2020, Knuuti 2018, ESC 2023 et 2024 — chaque étape cite sa référence.",
  },
]

export function Landing() {
  const [activeStep, setActiveStep] = useState(1)
  const step = STEPS.find((s) => s.id === activeStep) ?? STEPS[0]
  const StepIcon = step.icon

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <main className="mx-auto max-w-2xl px-5 pb-20 pt-10 sm:pt-16">
        {/* ── Marque ─────────────────────────────────────────────────── */}
        <header className="flex flex-col items-center text-center">
          <Logo size={112} className="logo-intro" />

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-[#0f172a] sm:text-3xl">
            Filière Angor Cardiomaine
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-[#475569]">
            Dépistage de la maladie coronarienne en consultation — de la douleur thoracique à
            l&apos;examen à prescrire, selon les recommandations ESC 2024.
          </p>

          <div className="mt-7 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:items-center">
            <Link
              href="/parcours/"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#1e293b] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f172a]"
            >
              Démarrer une évaluation
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <Link
              href="/references/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-6 py-3.5 text-sm font-semibold text-[#475569] transition-colors hover:bg-white hover:text-[#1e293b]"
            >
              Références &amp; méthode
            </Link>
          </div>
        </header>

        {/* ── Le parcours, étape par étape ───────────────────────────── */}
        <section className="mt-14" aria-labelledby="parcours-heading">
          <h2
            id="parcours-heading"
            className="text-xs font-bold uppercase tracking-[0.12em] text-[#94a3b8]"
          >
            Le parcours en cinq étapes
          </h2>

          {/* Sélecteur : la ligne de progression sert aussi de navigation. */}
          <div className="mt-4 flex items-start justify-between gap-1">
            {STEPS.map((s) => {
              const isActive = s.id === activeStep
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveStep(s.id)}
                  aria-pressed={isActive}
                  className="group flex flex-1 flex-col items-center gap-2 rounded-lg py-1 outline-none focus-visible:ring-2 focus-visible:ring-[#1e293b]/30"
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? "bg-[#1e293b] text-white ring-4 ring-[#1e293b]/12"
                        : "bg-white text-[#94a3b8] ring-1 ring-[#e2e8f0] group-hover:text-[#475569] group-hover:ring-[#cbd5e1]"
                    }`}
                  >
                    {s.id}
                  </span>
                  <span
                    className={`text-[10px] font-medium leading-tight transition-colors ${
                      isActive ? "text-[#1e293b]" : "text-[#94a3b8]"
                    }`}
                  >
                    {s.short}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Détail de l'étape sélectionnée */}
          <div className="mt-4 rounded-2xl border border-[#e2e8f0] bg-white p-5">
            <div className="flex items-start gap-3.5">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#f1f5f9]">
                <StepIcon className="h-[18px] w-[18px] text-[#1e293b]" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#0f172a]">{step.title}</p>
                <p key={step.id} className="step-body mt-1.5 text-xs leading-relaxed text-[#475569]">
                  {step.body}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Ce sur quoi le praticien peut compter ──────────────────── */}
        <section className="mt-12 grid gap-3 sm:grid-cols-3" aria-label="Garanties">
          {GUARANTEES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
              <Icon className="h-4 w-4 text-[#64748b]" aria-hidden="true" />
              <p className="mt-2.5 text-xs font-bold text-[#0f172a]">{title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#64748b]">{body}</p>
            </div>
          ))}
        </section>

        {/* ── Avertissement ──────────────────────────────────────────── */}
        <footer className="mt-12 border-t border-[#e2e8f0] pt-6">
          <p className="text-[11px] leading-relaxed text-[#64748b]">
            <span className="font-semibold text-[#475569]">Usage strictement médical.</span> Outil
            d&apos;aide à la décision destiné aux professionnels de santé. Il ne remplace ni
            l&apos;examen clinique, ni le jugement du praticien, ni les recommandations en vigueur.
          </p>
          <p className="mt-3 text-[11px] text-[#94a3b8]">
            Moteurs de calcul repris à l&apos;identique de CoroPath —{" "}
            <Link href="/references/" className="underline underline-offset-2 hover:text-[#475569]">
              références et méthode
            </Link>
            .
          </p>
        </footer>
      </main>
    </div>
  )
}

export default Landing
