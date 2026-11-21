import { Phone, ShieldCheck, WifiOff } from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { CONTACTS } from "@/components/shell/contacts-bar"

/**
 * Page d'accueil — le papier ECG comme signature.
 *
 * Le haut de page est une bande de papier millimétré (petits carreaux 1 mm,
 * gros carreaux 5 mm) sur laquelle un tracé en rythme sinusal s'inscrit une
 * seule fois au chargement. Tout le reste est sobre : un bouton pour lancer
 * l'évaluation, puis les numéros d'appel présentés comme un répertoire.
 */

/** Un complexe PQRST, à partir de l'abscisse x0 (unités du viewBox, ligne de base y = 70). */
function complex(x0: number): string {
  const b = 70
  return [
    `L${x0 + 14},${b}`,
    // onde P
    `C${x0 + 18},${b - 9} ${x0 + 26},${b - 9} ${x0 + 30},${b}`,
    `L${x0 + 38},${b}`,
    // QRS
    `L${x0 + 41},${b + 7}`,
    `L${x0 + 46},${b - 52}`,
    `L${x0 + 51},${b + 16}`,
    `L${x0 + 54},${b}`,
    // segment ST puis onde T
    `L${x0 + 64},${b}`,
    `C${x0 + 70},${b - 16} ${x0 + 84},${b - 16} ${x0 + 90},${b}`,
  ].join(" ")
}

const BEAT = 128
const TRACE = `M0,70 ${[0, 1, 2, 3, 4].map((i) => complex(i * BEAT)).join(" ")} L640,70`

export function Landing() {
  const [samu, ...others] = CONTACTS

  return (
    <div className="font-text min-h-screen bg-[#fffcfb] text-[#14213d]">
      {/* En-tête : établissement */}
      <header className="mx-auto flex w-full max-w-2xl items-center gap-3 px-5 pt-5 pb-4">
        <Logo size={40} gauge={false} />
        <p className="text-sm leading-snug text-[#5b6b82]">
          UPATOU
          <br />
          Clinique du Pôle Santé Sud, Le Mans
        </p>
      </header>

      {/* Papier ECG + titre */}
      <section aria-labelledby="titre" className="ecg-paper border-y border-[#e89aa5]">
        <div className="mx-auto w-full max-w-2xl px-5 pt-6 pb-8 sm:pt-10 sm:pb-12">
          <svg
            viewBox="0 0 640 100"
            preserveAspectRatio="none"
            className="h-20 w-full sm:h-24"
            aria-hidden="true"
          >
            <path
              d={TRACE}
              pathLength={1}
              fill="none"
              stroke="#14213d"
              strokeWidth={2.25}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className="ecg-trace"
            />
            <circle cx="640" cy="70" r="4" fill="#c8102e" className="ecg-cursor" />
          </svg>

          <h1
            id="titre"
            className="font-display mt-6 text-[clamp(2.5rem,11vw,4.75rem)] font-extrabold leading-[0.92] tracking-[-0.02em]"
          >
            Filière Angor
            <br />
            Cardiomaine
          </h1>
        </div>
      </section>

      <main className="mx-auto w-full max-w-2xl px-5 pt-7 pb-12">
        <p className="max-w-[34ch] text-[1.0625rem] leading-relaxed text-[#3b4a63]">
          Protocole de gestion des douleurs thoraciques à l&apos;UPATOU, Clinique du Pôle Santé Sud,
          Le Mans.
        </p>

        <a
          href="/parcours/"
          className="mt-7 flex w-full items-center justify-center rounded-xl bg-[#c8102e] px-7 py-4 text-base font-semibold text-white transition-colors hover:bg-[#a50d26] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#14213d] sm:w-auto sm:inline-flex"
        >
          Démarrer une évaluation
        </a>

        {/* Répertoire d'appel */}
        <section aria-labelledby="appel" className="mt-12">
          <h2 id="appel" className="text-lg font-bold">
            Appel direct
          </h2>

          <a
            href={`tel:${samu.tel}`}
            aria-label={samu.aria}
            className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-[#14213d] px-5 py-4 text-white transition-colors hover:bg-[#1f3157] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#c8102e]"
          >
            <span className="flex items-baseline gap-3">
              <span className="font-display text-4xl font-extrabold leading-none">15</span>
              <span className="text-base font-semibold">SAMU</span>
            </span>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#c8102e]">
              <Phone className="h-5 w-5 fill-current" aria-hidden="true" />
            </span>
          </a>

          <ul className="mt-3 divide-y divide-[#ecdfe1] rounded-xl border border-[#ecdfe1] bg-white">
            {others.map((c) => (
              <li key={c.tel}>
                <a
                  href={`tel:${c.tel}`}
                  aria-label={c.aria}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-[#fff5f6] focus-visible:outline focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-[#c8102e]"
                >
                  <span className="min-w-0">
                    <span className="block text-sm text-[#5b6b82]">{c.label}</span>
                    <span className="block text-lg font-bold tabular-nums whitespace-nowrap">{c.number}</span>
                  </span>
                  <Phone className="h-5 w-5 flex-shrink-0 text-[#c8102e]" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <ul className="mt-10 space-y-1.5 text-sm text-[#5b6b82]">
          <li className="flex items-center gap-2">
            <WifiOff className="h-4 w-4" aria-hidden="true" />
            Fonctionne hors ligne une fois l&apos;application ouverte.
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Aucune donnée patient ne quitte l&apos;appareil.
          </li>
        </ul>
      </main>
    </div>
  )
}

export default Landing
