import { Ambulance, HeartPulse, Phone, Activity, Building2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"

/**
 * Numéros utiles (bandeau inspiré de CoroPath / cardiomaine-coronaire).
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
    number: "02 43 78 40 21",
    tel: "0243784021",
    aria: "Appeler la cardiologie interventionnelle, 02 43 78 40 21",
    icon: Activity,
  },
  {
    label: "USIC",
    short: "USIC",
    number: "02 43 78 39 05",
    tel: "0243783905",
    aria: "Appeler l'USIC, 02 43 78 39 05",
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
      <p className="mb-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
        <Phone className="h-3 w-3" aria-hidden="true" />
        Appel direct
      </p>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {CONTACTS.map(({ label, number, tel, aria, icon: Icon, urgent }) => (
          <a
            key={tel}
            href={`tel:${tel}`}
            aria-label={aria}
            className={`group relative flex items-center gap-3.5 overflow-hidden rounded-2xl border p-3.5 pr-4 text-left backdrop-blur transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${
              urgent
                ? "border-[#fecaca] bg-gradient-to-br from-[#fff1f2] to-[#fee2e2]/80 hover:shadow-[0_12px_28px_-14px_rgba(220,38,38,0.6)]"
                : "border-[#e2e8f0] bg-white/85 hover:border-[#cbd5e1] hover:shadow-[0_12px_28px_-14px_rgba(15,23,42,0.4)]"
            }`}
          >
            {/* Pastille de service */}
            <span
              className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
                urgent ? "bg-white text-[#dc2626] ring-1 ring-[#fecaca]" : "bg-[#f1f5f9] text-[#334155]"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>

            <span className="min-w-0 flex-1">
              <span className={`block text-xs font-medium leading-tight ${urgent ? "text-[#991b1b]" : "text-[#64748b]"}`}>
                {label}
              </span>
              <span
                className={`mt-0.5 block whitespace-nowrap text-lg font-bold tabular-nums tracking-tight ${
                  urgent ? "text-[#b91c1c]" : "text-[#0f172a]"
                }`}
              >
                {number}
              </span>
            </span>

            {/* Bouton d'appel, façon écran de téléphone */}
            <span className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center">
              {urgent && (
                <span
                  className="absolute inset-0 animate-ping rounded-full bg-[#dc2626]/30 motion-reduce:hidden"
                  aria-hidden="true"
                />
              )}
              <span
                className={`relative flex h-11 w-11 items-center justify-center rounded-full text-white shadow-md transition-transform group-hover:scale-110 ${
                  urgent ? "bg-[#dc2626] shadow-[#dc2626]/30" : "bg-[#16a34a] shadow-[#16a34a]/30"
                }`}
              >
                <Phone className="h-5 w-5 fill-current" aria-hidden="true" />
              </span>
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}

export default ContactsBar
