/**
 * Marque de « Filière Angor Cardiomaine ».
 *
 * Le dessin encode le rôle de l'outil plutôt qu'un symbole cardiologique
 * générique : l'anneau gradué reprend, dans l'ordre et dans les couleurs de
 * l'application, les cinq catégories de probabilité RF-CL (très faible →
 * très élevée) ; le cœur porte l'arbre coronaire (tronc commun, IVA,
 * circonflexe, coronaire droite). Stratifier un risque coronarien, donc.
 */

/** Couleurs des cinq catégories RF-CL, du vert au rouge sombre. */
const CATEGORY_COLORS = ["#15803d", "#16a34a", "#d97706", "#dc2626", "#991b1b"]

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
/** L'anneau ne couvre que 270°, l'ouverture du bas servant d'assise. */
const SWEEP = CIRCUMFERENCE * 0.75
const GAP = 4
const SEGMENT = (SWEEP - GAP * (CATEGORY_COLORS.length - 1)) / CATEGORY_COLORS.length

export function Logo({
  size = 96,
  gauge = true,
  className,
}: {
  size?: number
  /** L'anneau gradué : trop fin pour les petites tailles, on peut l'ôter. */
  gauge?: boolean
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      role="img"
      aria-label="Filière Angor Cardiomaine"
    >
      {gauge && (
        <g transform="rotate(135 60 60)">
          {CATEGORY_COLORS.map((color, i) => (
            <circle
              key={color}
              cx="60"
              cy="60"
              r={RADIUS}
              stroke={color}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${SEGMENT} ${CIRCUMFERENCE}`}
              strokeDashoffset={-i * (SEGMENT + GAP)}
              className="logo-gauge-segment"
              style={{ animationDelay: `${i * 90}ms` }}
            />
          ))}
        </g>
      )}

      {/* Cœur */}
      <path
        d="M60,92 C55,87 28,67 28,49 C28,38 36,31 44,31 C50,31 56,34 60,40 C64,34 70,31 76,31 C84,31 92,38 92,49 C92,67 65,87 60,92 Z"
        fill="#dc2626"
      />

      {/* Arbre coronaire — trois branches seulement : au-delà, le dessin se
          brouille dès que la marque descend à la taille d'une icône. */}
      <g
        stroke="#ffffff"
        strokeWidth="4.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Tronc commun. Les trois branches partent du même point mais
            divergent en longueur et en direction : symétriques, elles se
            liraient comme un pictogramme abstrait plutôt que comme un
            réseau artériel. */}
        <path d="M56,42 C56,46 57,50 58,54" />
        {/* Interventriculaire antérieure — la plus longue, jusqu'à la pointe */}
        <path d="M58,54 C56,65 55,75 57,84" />
        {/* Circonflexe — courte, vers le bord latéral gauche */}
        <path d="M58,54 C51,56 45,59 41,64" />
        {/* Coronaire droite — contourne le bord droit vers le bas */}
        <path d="M58,54 C69,57 76,63 78,71" />
      </g>
    </svg>
  )
}

export default Logo
