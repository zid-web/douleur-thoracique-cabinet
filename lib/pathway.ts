/**
 * Pathway recommendation engine — ESC 2024 CCS guidelines + ajustements pratiques.
 *
 * Génère une conduite à tenir personnalisée en fonction de :
 *  - la catégorie de probabilité (RF-CL ou CACS-CL ajusté)
 *  - la sous-catégorie pour la zone intermédiaire (15-30% bas / 30-50% haut)
 *  - l'âge du patient
 *  - la disponibilité du CCTA et de la coronarographie ambulatoire
 *  - les comorbidités modulant le choix de l'examen
 *
 * Références :
 *  - Vrints et al., ESC Guidelines for CCS 2024, Eur Heart J 2024;45:3415-3537
 *  - Winther et al., JACC 2020;76:2421-2432 (CACS-CL)
 */

import type { CACSValue, Step3Data } from "@/components/wizard/step3-rfcl"

// ── Types des modificateurs ──────────────────────────────────────────────────

export type Availability = "rapide" | "differe" | "non-dispo"
export type IRCLevel = "non" | "moderee" | "severe"

export interface ClinicalModifiers {
  /** Disponibilité du CCTA : rapide < 7j / différé > 7j / non disponible */
  ccta: Availability
  /** Disponibilité de la coronarographie ambulatoire */
  ica: Availability
  /** Insuffisance rénale : non / modérée (DFG 30-45) / sévère (DFG < 30) */
  irc: IRCLevel
  /** Fibrillation atriale ou arythmie */
  fa: boolean
  /** Obésité morbide IMC > 40 */
  obesite: boolean
  /** Fragilité ou âge > 80 ans */
  fragilite: boolean
  /** Allergie iode ou asthme sévère */
  allergieIode: boolean
  /** Calcifications massives connues (CACS ≥ 400) */
  calcifMassives: boolean
  /** Symptômes de novo très évocateurs survenant à faible niveau d'effort (ESC 2024, table 11) */
  angorFaibleEffort: boolean
}

export const DEFAULT_MODIFIERS: ClinicalModifiers = {
  ccta: "rapide",
  ica: "differe",
  irc: "non",
  fa: false,
  obesite: false,
  fragilite: false,
  allergieIode: false,
  calcifMassives: false,
  angorFaibleEffort: false,
}

// ── Sous-catégorisation de la zone intermédiaire ────────────────────────────

export type IntermediateSubCategory = "bas" | "haut" | null

/**
 * Sous-segmentation de la zone intermédiaire en bas (15-30%) et haut (30-50%).
 * La zone haute justifie un examen rapide ; la zone basse autorise un délai.
 */
export function getIntermediateSubCategory(
  category: Step3Data["finalCategory"],
  pct: number,
): IntermediateSubCategory {
  if (category !== "intermediaire") return null
  return pct >= 30 ? "haut" : "bas"
}

// ── Pathway ──────────────────────────────────────────────────────────────────

export type ExamKey =
  | "ccta"
  | "cacs"
  | "irm-stress"
  | "scinti"
  | "echo-stress"
  | "ica"
  | "rassurance"

const EXAM_LABELS: Record<ExamKey, string> = {
  ccta: "Coroscanner (CCTA)",
  cacs: "Score calcique coronarien (CACS)",
  "irm-stress": "IRM cardiaque de stress",
  scinti: "Échographie de stress ou scintigraphie myocardique",
  "echo-stress": "Échographie de stress",
  ica: "Coronarographie invasive ambulatoire (coro)",
  rassurance: "Pas d'examen complémentaire",
}

export function examLabel(key: ExamKey): string {
  return EXAM_LABELS[key]
}

export interface PathwayStep {
  rank: 1 | 2 | 3
  exam: ExamKey
  label: string
  delai: string
  rationale: string
  classe?: "I" | "IIa" | "IIb"
  /** Niveau de preuve ESC 2024 (déduit de l'examen si absent, cf. stepEvidenceLevel) */
  niveau?: "A" | "B" | "C"
}

/**
 * Niveau de preuve ESC 2024 d'une étape :
 *  - CCTA, probabilité > 5–50 % : I, A (table 8)
 *  - imagerie fonctionnelle (écho de stress, scintigraphie) : I, B (tables 9–10, 13)
 *  - CACS de reclassement / report des examens : IIa, B (table 3)
 *  - coronarographie après examen non invasif non concluant / ischémie : I, B (table 13)
 *  - coronarographie d'emblée (haut risque, symptômes à faible effort) : I, C (table 11)
 */
export function stepEvidenceLevel(step: PathwayStep): "A" | "B" | "C" | undefined {
  if (step.niveau) return step.niveau
  switch (step.exam) {
    case "ccta":
      return "A"
    case "scinti":
    case "echo-stress":
    case "irm-stress":
    case "cacs":
    case "rassurance":
    case "ica":
      return "B"
    default:
      return undefined
  }
}

export interface PathwayFlag {
  type: "info" | "warning" | "danger"
  title: string
  message: string
}

export interface PathwayRecommendation {
  steps: PathwayStep[]
  flags: PathwayFlag[]
  contraindications: string[]
  rationaleSummary: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function isElderlyOrFragile(
  ageRange: Step3Data["ageRange"],
  mods: ClinicalModifiers,
): boolean {
  return mods.fragilite || ageRange === "70+"
}

function isYoung(ageRange: Step3Data["ageRange"]): boolean {
  return (
    ageRange === "30-39" ||
    ageRange === "40-49" ||
    ageRange === "50-59"
  )
}

/**
 * Le CCTA est dégradé en cas de FA, calcifications massives ou obésité morbide.
 * Dans ces cas, on bascule vers un test fonctionnel d'emblée.
 */
// ESC 2024 (table 8) : CCTA non recommandé (III, C) en cas d'IRC sévère
// (DFGe < 30), de calcifications coronaires étendues, de rythme rapide/irrégulier
// ou d'obésité sévère.
function isCCTAUsable(mods: ClinicalModifiers): boolean {
  return !mods.fa && !mods.calcifMassives && !mods.obesite && mods.irc !== "severe"
}

/**
 * Le contraste iodé est contre-indiqué relativement en cas d'allergie iode
 * ou d'IRC sévère. Dans ces cas, la scintigraphie (sans iode) est privilégiée.
 */
function isIodineCI(mods: ClinicalModifiers): boolean {
  return mods.allergieIode || mods.irc === "severe"
}

/**
 * Choix du test fonctionnel. IRM de stress et FFR-CT non disponibles
 * localement : échographie de stress ou scintigraphie myocardique, toutes deux
 * sans contraste iodé (allergie à l'iode, IRC sévère).
 */
function pickFonctionnel(_mods: ClinicalModifiers): ExamKey {
  return "scinti"
}

function delaiFromAvail(avail: Availability, fast = "Sous 7 jours", slow = "Sous 2-4 semaines"): string {
  if (avail === "rapide") return fast
  if (avail === "differe") return slow
  return "Non disponible"
}

// ── Algorithme principal ────────────────────────────────────────────────────

/**
 * Génère le pathway recommandé selon ESC 2024 + ajustements pratiques.
 *
 * Principes :
 *  - Probabilité 5-15% : CACS de reclassification (Classe IIa)
 *  - Probabilité 15-30% (intermédiaire-bas) : CCTA différé acceptable
 *  - Probabilité 30-50% (intermédiaire-haut) : CCTA RAPIDE prioritaire
 *  - Probabilité 50-85% : test fonctionnel ou coro directe selon âge/comorb.
 *  - Si CCTA non disponible ou inadapté : imagerie fonctionnelle (scintigraphie SPECT/TEP, écho de stress)
 *  - Coronarographie d'emblée : réservée aux probabilités très élevées (> 85 %) avec symptômes
 *    réfractaires / angor à faible niveau d'effort / risque d'événement élevé ; sinon après un
 *    examen non invasif (ischémie modérée à sévère, CCTA à haut risque, résultat non concluant)
 *  - Si CCTA non interprétable (FA / calcif / obésité) : test fonctionnel d'emblée
 *  - Si contre-indication iode : scintigraphie (pas d'IRM de stress disponible)
 *  - Sujet jeune (< 60) : préférer CCTA (faible irradiation, valeur pronostique)
 *  - CACS déjà réalisé (étape 3) : la catégorie est déjà le CACS-CL, on ne
 *    re-prescrit pas de CACS. Si le CACS-CL reste > 5% → CCTA (Classe I,
 *    ESC 2024 : probabilité faible à modérée > 5–50%).
 */
export function getPathwayRecommendation(
  category: Step3Data["finalCategory"],
  ageRange: Step3Data["ageRange"],
  pct: number,
  mods: ClinicalModifiers,
  cacs: CACSValue = "unknown",
): PathwayRecommendation {
  const cacsDone = cacs !== "unknown"
  const subCat = getIntermediateSubCategory(category, pct)
  const elderlyFragile = isElderlyOrFragile(ageRange, mods)
  const young = isYoung(ageRange)
  const cctaUsable = isCCTAUsable(mods)
  const iodineCI = isIodineCI(mods)
  const fonctionnel = pickFonctionnel(mods)

  const steps: PathwayStep[] = []
  const flags: PathwayFlag[] = []
  const contraindications: string[] = []

  // Contre-indications transversales
  if (mods.allergieIode) {
    contraindications.push(
      "Allergie iode → CCTA et coronarographie nécessitent prémédication ; privilégier l'échographie de stress ou la scintigraphie (sans iode)",
    )
  }
  if (mods.irc === "severe") {
    contraindications.push(
      "IRC sévère (DFG < 30) → éviter le contraste iodé ; échographie de stress ou scintigraphie privilégiée",
    )
  } else if (mods.irc === "moderee") {
    contraindications.push(
      "IRC modérée (DFG 30-45) → hydratation pré-procédure et contraste iso-osmolaire si CCTA/coro",
    )
  }
  if (mods.fa) {
    contraindications.push(
      "FA / arythmie → CCTA souvent dégradé (artefacts) ; test fonctionnel ou coro préférés",
    )
  }
  if (mods.calcifMassives) {
    contraindications.push(
      "Calcifications massives (CACS ≥ 400) → CCTA limité par blooming artifact ; test fonctionnel préféré",
    )
  }
  if (mods.obesite) {
    contraindications.push(
      "Obésité morbide (IMC > 40) → CCTA et écho de stress souvent ininterprétables ; scintigraphie (TEP de préférence) préférée",
    )
  }

  // ── ESC 2024 (table 11) : symptômes de novo très évocateurs à faible niveau
  //    d'effort → coronarographie en premier test, après avis cardiologique (I, C)
  if (mods.angorFaibleEffort && (category === "intermediaire" || category === "elevee")) {
    steps.push({
      rank: 1,
      exam: "ica",
      label: "Coronarographie en premier test, après avis cardiologique",
      delai: delaiFromAvail(mods.ica, "Sous 7 jours", "Sous 2 semaines"),
      rationale:
        "ESC 2024 (table 11) : symptômes de novo très évocateurs survenant à faible niveau d'effort → coronarographie à visée de revascularisation en premier test diagnostique, après évaluation clinique par un cardiologue (I, C).",
      classe: "I",
      niveau: "C",
    })
    return {
      steps,
      flags,
      contraindications,
      rationaleSummary:
        "Symptômes de novo très évocateurs à faible niveau d'effort → coronarographie en premier test après avis cardiologique (I, C — ESC 2024).",
    }
  }

  // ── Catégorie : très faible (≤ 5%) ──────────────────────────────────────
  if (category === "tres-faible") {
    steps.push({
      rank: 1,
      exam: "rassurance",
      label: "Pas d'exploration coronarienne en 1ère intention",
      delai: "—",
      rationale:
        "Probabilité ≤ 5% : maladie obstructive très peu probable. Rechercher un diagnostic alternatif (musculo-squelettique, digestif, anxiété, pleuro-pulmonaire).",
      classe: "IIa",
    })
    return {
      steps,
      flags,
      contraindications,
      rationaleSummary: cacsDone
        ? "CACS-CL ≤ 5% (CACS déjà intégré) → report des examens (Classe IIa), diagnostic alternatif prioritaire."
        : "Probabilité ≤ 5% → diagnostic alternatif prioritaire. CACS uniquement si doute persistant ou anxiété majeure.",
    }
  }

  // ── Catégorie : faible (5-15%) ──────────────────────────────────────────
  if (category === "faible") {
    if (cacsDone) {
      // Le CACS a déjà reclassé la probabilité (CACS-CL) et elle reste > 5% :
      // on ne répète pas le CACS, on passe à l'imagerie (ESC 2024, Classe I
      // pour CCTA si probabilité > 5–50% ; ACC/AHA 2021 : CCTA ou imagerie
      // de stress si CACS > 0).
      if (cctaUsable && !iodineCI && mods.ccta !== "non-dispo") {
        steps.push({
          rank: 1,
          exam: "ccta",
          label: "Coroscanner (CCTA)",
          delai: delaiFromAvail(mods.ccta, "Sous 4 semaines", "Sous 4-6 semaines"),
          rationale:
            "CACS déjà réalisé et CACS-CL toujours > 5% : CCTA pour exclure une sténose obstructive (Classe I, ESC 2024).",
          classe: "I",
        })
      } else {
        steps.push({
          rank: 1,
          exam: fonctionnel,
          label: examLabel(fonctionnel),
          delai: "Sous 4 semaines",
          rationale:
            "CACS déjà réalisé ; CCTA non disponible, non interprétable ou contre-indiqué → imagerie fonctionnelle de stress.",
          classe: "I",
        })
      }
      flags.push({
        type: "info",
        title: "Score calcique déjà réalisé",
        message:
          "Le CACS saisi à l'étape 3 est intégré au CACS-CL : ne pas le répéter.",
      })
      return {
        steps,
        flags,
        contraindications,
        rationaleSummary:
          "CACS-CL 5-15% (CACS déjà intégré) → CCTA (Classe I ESC 2024). Pas d'urgence sauf récidive.",
      }
    }
    steps.push({
      rank: 1,
      exam: "cacs",
      label: "Score calcique (CACS) en 1ère intention",
      delai: "Sous 4 semaines",
      rationale:
        "Reclassification (CACS-CL) : si CACS = 0 → report des examens (VPN > 95 %). Si CACS > 0 → probabilité recalculée ; si elle reste > 5 % → CCTA ou test fonctionnel.",
      classe: "IIa",
    })
    if (mods.ccta === "non-dispo") {
      flags.push({
        type: "warning",
        title: "Si CACS positif et CCTA non disponible",
        message:
          "Orienter vers un test fonctionnel non invasif (scintigraphie ou écho de stress) ou une consultation cardiologique.",
      })
    }
    return {
      steps,
      flags,
      contraindications,
      rationaleSummary:
        "Probabilité 5-15% → CACS de reclassification (Classe IIa ESC 2024). Pas d'urgence sauf récidive.",
    }
  }

  // ── Catégorie : intermédiaire ───────────────────────────────────────────
  if (category === "intermediaire") {
    if (subCat === "bas") {
      // 15-30% : CCTA différé acceptable
      if (!cctaUsable) {
        steps.push({
          rank: 1,
          exam: fonctionnel,
          label: examLabel(fonctionnel),
          delai: "Sous 2-4 semaines",
          rationale:
            "CCTA non recommandé (III, C — FA, calcifications étendues, obésité sévère ou IRC sévère) → imagerie fonctionnelle d'emblée (I, B).",
          classe: "I",
        })
      } else if (mods.ccta !== "non-dispo") {
        steps.push({
          rank: 1,
          exam: "ccta",
          label:
            mods.ccta === "rapide"
              ? "Coroscanner (CCTA) — rapide ou différé"
              : "Coroscanner (CCTA) en différé",
          delai: delaiFromAvail(mods.ccta, "Sous 7 jours", "Sous 2-4 semaines"),
          rationale:
            "Probabilité 15-30% : CCTA, examen préféré pour exclure une CAD obstructive (I, B — ESC 2024). Délai différé acceptable car risque MACE faible. Chez le sujet âgé très calcifié, un test fonctionnel est plus adapté. Si CCTA de signification incertaine : échographie de stress ou scintigraphie myocardique (I, B).",
          classe: "I",
        })
        if (iodineCI) {
          steps.push({
            rank: 2,
            exam: "scinti",
            label: "Échographie de stress ou scintigraphie myocardique (sans iode)",
            delai: "Sous 2-4 semaines",
            rationale:
              "Si contre-indication au contraste iodé (allergie) : échographie de stress ou scintigraphie en alternative.",
            classe: "I",
          })
        }
      } else {
        // CCTA non disponible → imagerie fonctionnelle (recommandée pour une probabilité > 15 %)
        steps.push({
          rank: 1,
          exam: fonctionnel,
          label: examLabel(fonctionnel),
          delai: "Sous 4 semaines",
          rationale:
            "CCTA non disponible : échographie de stress ou scintigraphie myocardique, recommandée pour une probabilité > 15 % (ESC 2024).",
          classe: "I",
        })
      }
      return {
        steps,
        flags,
        contraindications,
        rationaleSummary: `Probabilité ${pct}% (intermédiaire-bas) → CCTA en différé sauf contre-indication. Pas d'indication coro d'emblée.`,
      }
    }

    // intermédiaire-haut (30-50%) — la zone qui "tend vers le haut"
    flags.push({
      type: "warning",
      title: "Zone intermédiaire-haute (30-50%)",
      message:
        "Risque MACE significatif → délai d'examen à raccourcir. CCTA RAPIDE en 1er choix ; à défaut, échographie de stress ou scintigraphie myocardique. La coronarographie n'est pas un examen de 1re intention à cette probabilité.",
    })

    if (!cctaUsable) {
      steps.push({
        rank: 1,
        exam: fonctionnel,
        label: examLabel(fonctionnel),
        delai: "Sous 7 jours",
        rationale:
          "CCTA non recommandé (III, C — FA, calcifications étendues, obésité sévère ou IRC sévère) → imagerie fonctionnelle d'emblée (I, B).",
        classe: "I",
      })
      if (mods.ica !== "non-dispo") {
        steps.push({
          rank: 2,
          exam: "ica",
          label: "Coronarographie si ischémie modérée à sévère ou résultat non concluant",
          delai: delaiFromAvail(mods.ica, "Sous 7 jours", "Sous 2 semaines"),
          rationale:
            "ESC 2024 : coronarographie indiquée si un test de stress montre une ischémie modérée à sévère, ou pour confirmer/exclure une CAD obstructive après un résultat non concluant.",
          classe: "I",
        })
      }
    } else if (mods.ccta === "rapide") {
      steps.push({
        rank: 1,
        exam: "ccta",
        label: "Coroscanner (CCTA) RAPIDE",
        delai: "Sous 7 jours",
        rationale: young
          ? "Sujet jeune (< 60 ans), probabilité 30-50% : CCTA rapide prioritaire (Classe I) — exclusion CAD, visualisation des plaques, valeur pronostique, faible irradiation."
          : "Probabilité 30-50% : CCTA rapide (Classe I). Exclusion CAD + stratification du risque MACE.",
        classe: "I",
      })
      steps.push({
        rank: 2,
        exam: fonctionnel,
        label: `${examLabel(fonctionnel)} si CCTA anormal sans critère de haut risque`,
        delai: "Sous 2-4 semaines",
        rationale:
          "ESC 2024 : imagerie fonctionnelle recommandée si le CCTA montre une CAD de signification fonctionnelle incertaine ou n'est pas diagnostique (I, B).",
        classe: "I",
      })
      if (mods.ica !== "non-dispo") {
        steps.push({
          rank: 3,
          exam: "ica",
          label: "Coronarographie si CCTA à haut risque",
          delai: delaiFromAvail(mods.ica),
          rationale:
            "ESC 2024 : sténose du tronc commun ≥ 50 %, IVA proximale ≥ 70 % (mono/bitronculaire) ou atteinte tritronculaire ≥ 70 % → coronarographie (avec évaluation de la pression coronaire).",
          classe: "I",
          niveau: "C",
        })
      }
    } else if (mods.ccta === "differe") {
      // CCTA disponible mais en différé
      steps.push({
        rank: 1,
        exam: "ccta",
        label: "Coroscanner (CCTA) — au plus tôt possible",
        delai: "Sous 2-4 semaines (à raccourcir si possible)",
        rationale:
          "Probabilité 30-50% : CCTA en première intention (ESC 2024). Prévenir le radiologue de la priorité clinique pour avancer le rendez-vous.",
        classe: "I",
      })
      steps.push({
        rank: 2,
        exam: fonctionnel,
        label: `${examLabel(fonctionnel)} (si CCTA trop différé ou symptômes en aggravation)`,
        delai: "Sous 2 semaines",
        rationale:
          "Imagerie fonctionnelle recommandée pour une probabilité > 15 % ; meilleur pouvoir de confirmation que le CCTA.",
        classe: "I",
      })
    } else {
      // CCTA non disponible → imagerie fonctionnelle
      steps.push({
        rank: 1,
        exam: fonctionnel,
        label: examLabel(fonctionnel),
        delai: "Sous 2 semaines",
        rationale:
          "CCTA non disponible : échographie de stress ou scintigraphie myocardique, recommandée pour une probabilité > 15 % (ESC 2024).",
        classe: "I",
      })
      if (mods.ica !== "non-dispo") {
        steps.push({
          rank: 2,
          exam: "ica",
          label: "Coronarographie si ischémie modérée à sévère ou résultat non concluant",
          delai: delaiFromAvail(mods.ica, "Sous 7 jours", "Sous 2 semaines"),
          rationale:
            "ESC 2024 : coronarographie indiquée si un test de stress montre une ischémie modérée à sévère, ou après un résultat non concluant.",
          classe: "I",
        })
      }
    }

    return {
      steps,
      flags,
      contraindications,
      rationaleSummary: `Probabilité ${pct}% (intermédiaire-haut) → CCTA RAPIDE en 1er choix (ESC 2024) ; imagerie fonctionnelle si CCTA inadapté ou indisponible. Coronarographie seulement après un examen non invasif concluant à haut risque.`,
    }
  }

  // ── Catégorie : élevée (50-85%) ─────────────────────────────────────────
  if (category === "elevee") {
    if (!cctaUsable || iodineCI) {
      steps.push({
        rank: 1,
        exam: fonctionnel,
        label: examLabel(fonctionnel),
        delai: "Sous 48-72h",
        rationale:
          "Test d'ischémie de 1ère intention (I, B). TEP privilégiée si disponible (haute sensibilité) ; écho de stress en alternative.",
        classe: "I",
      })
      if (mods.ica !== "non-dispo") {
        steps.push({
          rank: 2,
          exam: "ica",
          label: "Coronarographie si ischémie modérée à sévère ou résultat non concluant",
          delai: delaiFromAvail(mods.ica, "Sous 7 jours", "Sous 2 semaines"),
          rationale: "ESC 2024 : coronarographie avec évaluation fonctionnelle invasive si ischémie modérée à sévère ; recommandée (I, B) pour confirmer ou exclure le diagnostic après des examens non invasifs non concluants.",
          classe: "I",
        })
      }
    } else if (young) {
      steps.push({
        rank: 1,
        exam: fonctionnel,
        label: examLabel(fonctionnel),
        delai: "Sous 7 jours",
        rationale:
          "Sujet jeune (< 60 ans) : test fonctionnel d'abord pour quantifier l'ischémie et guider la décision de revascularisation (réduit le risque de coro inutile).",
        classe: "I",
      })
      if (mods.ica !== "non-dispo") {
        steps.push({
          rank: 2,
          exam: "ica",
          label: "Coronarographie si ischémie modérée à sévère ou résultat non concluant",
          delai: delaiFromAvail(mods.ica, "Sous 7 jours", "Sous 2 semaines"),
          rationale: "ESC 2024 : coronarographie avec évaluation fonctionnelle invasive si ischémie modérée à sévère ; recommandée (I, B) pour confirmer ou exclure le diagnostic après des examens non invasifs non concluants.",
          classe: "I",
        })
      }
    } else {
      steps.push({
        rank: 1,
        exam: fonctionnel,
        label: examLabel(fonctionnel),
        delai: "Sous 7 jours",
        rationale: "Test d'ischémie en 1er choix (Classe I).",
        classe: "I",
      })
      if (mods.ica !== "non-dispo") {
        steps.push({
          rank: 2,
          exam: "ica",
          label: "Coronarographie si ischémie modérée à sévère ou résultat non concluant",
          delai: delaiFromAvail(mods.ica, "Sous 7 jours", "Sous 2 semaines"),
          rationale: "ESC 2024 : coronarographie avec évaluation fonctionnelle invasive si ischémie modérée à sévère ; recommandée (I, B) pour confirmer ou exclure le diagnostic après des examens non invasifs non concluants.",
          classe: "I",
        })
      }
    }

    if (mods.ccta !== "non-dispo") {
      flags.push({
        type: "info",
        title: "CCTA peu pertinent à cette probabilité",
        message:
          "Pour une probabilité ≥ 50%, le CCTA a une moindre valeur ajoutée (forte prévalence de plaques). Préférer l'imagerie fonctionnelle.",
      })
    }
    if (mods.ica === "non-dispo") {
      flags.push({
        type: "warning",
        title: "Coro non disponible en ambulatoire",
        message:
          "À probabilité élevée, organiser une consultation cardiologique rapide pour orientation vers un centre disposant d'un plateau de coro.",
      })
    }

    return {
      steps,
      flags,
      contraindications,
      rationaleSummary: `Probabilité ${pct}% (élevée) → imagerie fonctionnelle en première intention. La coronarographie d'emblée est réservée aux probabilités > 85 % avec symptômes réfractaires ou risque d'événement élevé. CCTA peu pertinent ici.`,
    }
  }

  // ── Catégorie : très élevée — pas de modulation, urgence ───────────────
  return {
    steps: [],
    flags: [],
    contraindications: [],
    rationaleSummary:
      "Urgence — appel SAMU 15. Pas de modulation par les modificateurs cliniques.",
  }
}
