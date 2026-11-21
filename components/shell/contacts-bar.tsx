import { Ambulance, HeartPulse, Phone, Activity, Building2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"

/**
 * Numéros utiles, repris du bandeau de CoroPath (cardiomaine-coronaire).
 * Chaque entrée est un lien `tel:` : un toucher lance l'appel sur téléphone.
 */
const CONTACTS: {
  label: string
  short: string
  number: string
  tel: string
  aria: string
  icon: LucideIcon
  urgent?: boolean
}[] = [
  {
    label: "SAMU",
    short: "SAMU 15",
    number: "15",
    tel: "15",
    aria: "Appeler le SAMU, 15",
    icon: Ambulance,
    urgent: true,
  },
  {
    label: "Cardiologue de garde",
    short: "Cardio garde",
    number: "06 79 92 44 58",
    tel: "0679924458",
    aria: "Appeler le cardiologue de garde, 06 79 92 44 58",
    icon: HeartPulse,
  },
  {
    label: "Cardiologie interventionnelle",
    short: "Cardio interv.",
    number: "02 43 50 50 50",
    tel: "0243505050",
    aria: "Appeler la cardiologie interventionnelle, 02 43 50 50 50",
    icon: Activity,
  },
  {
    label: "USIC / Standard",
    short: "USIC",
    number: "02 43 78 39 39",
    tel: "0243783939",
    aria: "Appeler l'USIC ou le standard, 02 43 78 39 39",
    icon: Building2,
  },
]

/**
 * Bandeau d'appel.
 * - `full` : page d'accueil, quatre cartes avec intitulé et numéro.
 * - `compact` : en-tête du parcours, quatre pastilles sur une ligne.
 */
export function ContactsBar({ variant = "full" }: { variant?: "full" | "compact" }) {
  if (variant === "compact") {
    return (
      <nav aria-label="Numéros utiles" className="grid grid-cols-4 gap-1.5">
        {CONTACTS.map(({ short, tel, aria, icon: Icon, urgent }) => (
          <a
            key={tel}
            href={`tel:${tel}`}
            aria-label={aria}
            className={`flex min-h-9 items-center justify-center gap-1 rounded-lg border px-1.5 py-1.5 text-[10px] font-semibold leading-tight transition-colors sm:text-[11px] ${
              urgent
                ? "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c] hover:bg-[#fee2e2]"
                : "border-[#e2e8f0] bg-white text-[#334155] hover:border-[#cbd5e1] hover:bg-[#f8fafc]"
            }`}
          >
            <Icon className="hidden h-3.5 w-3.5 flex-shrink-0 sm:block" aria-hidden="true" />
            <span className="text-center">{short}</span>
          </a>
        ))}
      </nav>
    )
  }

  return (
    <section aria-label="Numéros utiles" className="w-full">
      <p className="mb-2.5 flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
        <Phone className="h-3 w-3" aria-hidden="true" />
        Numéros utiles
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CONTACTS.map(({ label, number, tel, aria, icon: Icon, urgent }) => (
          <a
            key={tel}
            href={`tel:${tel}`}
            aria-label={aria}
            className={`group flex flex-col items-start gap-1.5 rounded-2xl border p-3 text-left backdrop-blur transition-all hover:-translate-y-0.5 ${
              urgent
                ? "border-[#fecaca] bg-[#fef2f2]/90 hover:border-[#fca5a5] hover:shadow-[0_8px_24px_-12px_rgba(220,38,38,0.45)]"
                : "border-[#e2e8f0] bg-white/80 hover:border-[#cbd5e1] hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.35)]"
            }`}
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                urgent ? "bg-[#dc2626] text-white" : "bg-[#f1f5f9] text-[#334155]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <span className={`text-[11px] font-medium leading-tight ${urgent ? "text-[#991b1b]" : "text-[#64748b]"}`}>
              {label}
            </span>
            <span
              className={`text-sm font-bold tabular-nums tracking-tight ${urgent ? "text-[#b91c1c]" : "text-[#0f172a]"}`}
            >
              {number}
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}

export default ContactsBar
