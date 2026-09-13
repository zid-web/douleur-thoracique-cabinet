import Link from "next/link"
import { ArrowRight, WifiOff, ShieldCheck, BookOpen } from "lucide-react"
import { Logo } from "@/components/brand/logo"

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
  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 py-16">
        <header className="flex flex-col items-center text-center">
          <Logo size={112} className="logo-intro" />

          <h1 className="mt-7 text-2xl font-bold tracking-tight text-[#0f172a] sm:text-3xl">
            Filière Angor Cardiomaine
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[#475569]">
            Dépistage de la maladie coronarienne en consultation — de la douleur thoracique à
            l&apos;examen à prescrire, selon les recommandations ESC 2024.
          </p>

          <div className="mt-8 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:items-center">
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
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-6 py-3.5 text-sm font-semibold text-[#475569] transition-colors hover:text-[#1e293b]"
            >
              Références &amp; méthode
            </Link>
          </div>
        </header>

        <section className="mt-14 grid gap-3 sm:grid-cols-3" aria-label="Garanties">
          {GUARANTEES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
              <Icon className="h-4 w-4 text-[#64748b]" aria-hidden="true" />
              <p className="mt-2.5 text-xs font-bold text-[#0f172a]">{title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#64748b]">{body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="pb-8 text-center">
        <p className="text-[11px] text-[#94a3b8]">Application mise à jour en 2026</p>
      </footer>
    </div>
  )
}

export default Landing
