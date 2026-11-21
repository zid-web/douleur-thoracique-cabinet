import Link from "next/link"
import { ArrowRight, ShieldCheck, WifiOff } from "lucide-react"
import { Logo } from "@/components/brand/logo"

export function Landing() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#f8fafc]">
      {/* Halo d'arrière-plan : deux taches de couleur très diffuses et une
          trame fine, pour donner de la profondeur sans charger la page. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(220,38,38,0.10),transparent)]" />
        <div className="absolute -bottom-48 right-[-10%] h-[420px] w-[620px] rounded-full bg-[radial-gradient(closest-side,rgba(30,41,59,0.10),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_75%)]" />
      </div>

      <main className="relative mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        <Logo size={104} className="logo-intro" />

        <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#e2e8f0] bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#64748b] backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-[#dc2626]" aria-hidden="true" />
          UPATOU · Pôle Santé Sud
        </span>

        <h1 className="mt-5 text-balance text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
          Filière Angor Cardiomaine
        </h1>
        <p className="mt-4 max-w-md text-balance text-[15px] leading-relaxed text-[#475569]">
          Protocole de gestion des douleurs thoraciques à l&apos;UPATOU — Clinique du Pôle Santé
          Sud, Le Mans
        </p>

        <Link
          href="/parcours/"
          className="group mt-10 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f172a] px-7 py-4 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(15,23,42,0.55)] transition-all hover:-translate-y-0.5 hover:bg-[#1e293b] hover:shadow-[0_14px_34px_-10px_rgba(15,23,42,0.6)] sm:w-auto"
        >
          Démarrer une évaluation
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#64748b]">
          <li className="inline-flex items-center gap-1.5">
            <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
            Fonctionne hors ligne
          </li>
          <li className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Aucune donnée transmise
          </li>
        </ul>
      </main>
    </div>
  )
}

export default Landing
