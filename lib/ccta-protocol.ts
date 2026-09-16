/**
 * Protocole de service « Coro-scanner : parcours patient » — Réf. IC-CT-01 v1.0.
 *
 * Le contenu est décrit une seule fois, sous forme de données, puis rendu
 * à deux endroits à partir de la même source : le panneau consultable à
 * l'étape 4 quand l'examen prescrit est le coroscanner, et le document
 * imprimable A4 (feuilles 1 à 3 = protocole de service, feuille 4 = fiche
 * remise au patient). Toute correction faite ici se répercute sur les deux.
 *
 * Références à confronter aux protocoles locaux avant diffusion :
 *  - CIRTACI / SFR — fiches produits de contraste iodés
 *  - ACR Manual on Contrast Media
 *  - SCCT — guidelines for the performance of coronary CT angiography
 */

import type { ClinicalModifiers } from "@/lib/pathway"

// ── Blocs de contenu ─────────────────────────────────────────────────────────

export type ProtocolBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "bullets"; items: string[] }
  | { kind: "table2"; head: [string, string]; rows: Array<[string, string]> }
  | { kind: "table3"; head: [string, string, string]; rows: Array<[string, string, string]> }
  | { kind: "timeline"; entries: Array<{ tag: string; tagSub: string; items: string[] }> }
  | { kind: "note"; tone: "info" | "warn" | "danger"; title: string; text: string }
  | { kind: "cards"; columns: 2 | 3; items: Array<{ title: string; subtitle?: string; items: string[] }> }
  | { kind: "prescription"; title: string; lines: string[]; note?: string }
  | { kind: "algorithm"; rows: Array<{ band: string; text: string }> }
  | { kind: "fields"; items: string[] }

export interface ProtocolSection {
  /** Numéro affiché dans la pastille (« 1 », « 2 »…). */
  index: string
  title: string
  blocks: ProtocolBlock[]
}

export interface ProtocolSheet {
  id: "parcours" | "allergie" | "frequence" | "patient"
  /** Numéro de feuille dans le document imprimé (1 à 4). */
  sheet: 1 | 2 | 3 | 4
  eyebrow: string
  /** Titre long, utilisé en tête de feuille imprimée. */
  title: string
  /** Titre court, utilisé sur l'onglet du panneau de l'application. */
  tab: string
  intro?: string
  /** Destinataire : le service, ou le patient. */
  audience: "service" | "patient"
  sections: ProtocolSection[]
}

export const PROTOCOL_REF = "IC-CT-01"
export const PROTOCOL_VERSION = "v1.0"
export const PROTOCOL_TITLE = "Coro-scanner : parcours patient"

// ── Feuille 1 — parcours ─────────────────────────────────────────────────────

const SHEET_PARCOURS: ProtocolSheet = {
  id: "parcours",
  sheet: 1,
  eyebrow: "Imagerie cardiaque · Procédure",
  title: "Coro-scanner : parcours patient",
  tab: "Parcours",
  audience: "service",
  intro:
    "Angioscanner coronaire synchronisé à l'ECG. La qualité de l'examen se joue avant l'acquisition : fréquence cardiaque basse et régulière, apnée maîtrisée, patient détendu, sécurité allergique anticipée.",
  sections: [
    {
      index: "1",
      title: "Tri à la prise de rendez-vous (J-15 → J-7)",
      blocks: [
        {
          kind: "table2",
          head: ["À recueillir", "Conduite à tenir"],
          rows: [
            [
              "Réaction antérieure à un produit de contraste iodé (PCI)",
              "Caractériser précisément → feuille « Allergie au PCI ». Ne pas confondre avec « allergie à l'iode », aux fruits de mer ou à la povidone iodée : non prédictives.",
            ],
            [
              "Asthme, atopie, allergies médicamenteuses multiples",
              "Facteur de risque relatif : vigilance et surveillance, pas de prémédication systématique.",
            ],
            [
              "Fonction rénale",
              "Créatinine + DFG < 3 mois si âge > 60 ans, diabète, HTA, insuffisance cardiaque, néphropathie, myélome, chimiothérapie néphrotoxique. DFG ≥ 30 : pas de restriction pratique. DFG < 30 : bénéfice/risque + hydratation NaCl 0,9 %.",
            ],
            [
              "Metformine",
              "Poursuivie si DFG ≥ 30. Arrêt 48 h + contrôle de créatinine si DFG < 30 ou injection artérielle.",
            ],
            [
              "Grossesse / allaitement",
              "Grossesse : indication à rediscuter. Allaitement : poursuite sans interruption.",
            ],
            [
              "Inhibiteurs de la PDE5",
              "Sildénafil / vardénafil < 24 h, tadalafil < 48 h → contre-indication absolue aux dérivés nitrés. À redemander le jour J.",
            ],
            [
              "Rythme",
              "FA, ESV/ESSV fréquentes, BAV, pacemaker/DAI → prévenir le radiologue, adapter le mode (rétrospectif, padding).",
            ],
            [
              "Capacité d'apnée",
              "BPCO sévère, dyspnée stade 4 → essais répétés, acquisition raccourcie.",
            ],
            [
              "Traitement bradycardisant en cours",
              "Le noter : un simple renforcement de dose suffit souvent.",
            ],
            [
              "Contre-indications aux bêtabloquants",
              "Asthme actif, BPCO instable, BAV 2-3 non appareillé, FC < 50, PAS < 100 mmHg, IC décompensée, RA serré, phéochromocytome non bloqué.",
            ],
          ],
        },
        {
          kind: "note",
          tone: "info",
          title: "À envoyer au patient",
          text: "Fiche d'information et de consignes (feuille patient) + ordonnance de bradycardisation et/ou de prémédication si indiquée (feuille « Fréquence cardiaque », § ordonnances).",
        },
      ],
    },
    {
      index: "2",
      title: "Chronologie",
      blocks: [
        {
          kind: "timeline",
          entries: [
            {
              tag: "J-1",
              tagSub: "la veille",
              items: [
                "Éviction des chronotropes positifs : café, thé, boissons énergisantes, colas, chocolat noir, nicotine — arrêt 12 h avant. Pas de sport intense sur 24 h.",
                "Hydratation orale normale (≈ 1,5 L), aucune restriction.",
                "Tous les traitements habituels poursuivis, bêtabloquants et antihypertenseurs compris.",
                "Prise de la dose du soir si bradycardisation orale programmée.",
                "Prévoir un accompagnant si anxiolytique ou bêtabloquant IV envisagé.",
              ],
            },
            {
              tag: "J0",
              tagSub: "arrivée",
              items: [
                "Jeûne léger : pas de solide 3–4 h avant. Eau autorisée jusqu'à l'examen — le jeûne strict prolongé stresse, déshydrate et accélère la FC.",
                "Traitements du matin pris avec un peu d'eau. Ni tabac ni café.",
                "Arrivée 45–60 min avant l'acquisition.",
                "Salle calme et tempérée, décubitus 10–15 min, explication détaillée : l'anxiété est la première cause de tachycardie résiduelle.",
                "VVP 18 G (20 G acceptable) au pli du coude droit — évite l'artéfact de la veine sous-clavière gauche ; testée au sérum physiologique.",
                "Électrodes après préparation cutanée (rasage, abrasion) : un tracé ECG propre conditionne le gating.",
                "Apprentissage de l'apnée : inspiration modérée, jamais forcée (un Valsalva fait chuter puis rebondir la FC et réduit le retour veineux), blocage 8–12 s, 2 à 3 essais FC au scope. La FC en apnée est la FC de référence, souvent 5–10 bpm sous la FC de repos.",
              ],
            },
            {
              tag: "J0",
              tagSub: "en salle",
              items: [
                "Mesure de la FC après décubitus → algorithme fréquence cardiaque (feuille « Fréquence cardiaque »).",
                "Puis contrôle de la PA → trinitrine sublinguale → apnée d'essai → acquisition.",
              ],
            },
            {
              tag: "J0 +",
              tagSub: "après",
              items: [
                "Surveillance 30 min (60 min si antécédent allergique ou prémédication), chariot d'urgence à proximité immédiate, VVP laissée en place.",
                "Hydratation 1 à 1,5 L dans les 12 h.",
                "Bêtabloquant IV ou anxiolytique : pas de conduite pendant 4 h, accompagnant requis.",
                "Information sur les réactions retardées (1 h à 7 j) : rash, prurit, érythème → consulter et signaler (pharmacovigilance + allergologie).",
                "Metformine : reprise à H+48 avec contrôle de créatinine uniquement si DFG < 30 ou injection artérielle.",
              ],
            },
          ],
        },
      ],
    },
    {
      index: "3",
      title: "Dérivés nitrés — indispensables à la lisibilité coronaire",
      blocks: [
        {
          kind: "bullets",
          items: [
            "Trinitrine sublinguale 0,4 à 0,8 mg (1 à 2 bouffées ou 1 capsule), 2 à 5 min avant l'acquisition : pic à 3 min, durée 5–10 min, augmentation du calibre coronaire de 15 à 20 %.",
            "Patient allongé, PA contrôlée avant. Prévenir : céphalées, bouffée de chaleur, lipothymie.",
          ],
        },
        {
          kind: "note",
          tone: "danger",
          title: "Contre-indications",
          text: "Inhibiteur de PDE5 < 24–48 h · PAS < 90–100 mmHg · rétrécissement aortique serré · CMH obstructive · hypovolémie · glaucome à angle fermé (relatif) · allergie aux nitrés.",
        },
        {
          kind: "note",
          tone: "warn",
          title: "Piège",
          text: "La trinitrine accélère la FC de 5 à 10 bpm : toujours l'administrer après la bradycardisation, et revérifier la FC juste avant le départ de l'acquisition.",
        },
      ],
    },
  ],
}

// ── Feuille 2 — allergie au produit de contraste iodé ────────────────────────

const SHEET_ALLERGIE: ProtocolSheet = {
  id: "allergie",
  sheet: 2,
  eyebrow: "Imagerie cardiaque · Procédure",
  title: "Allergie au produit de contraste iodé",
  tab: "Allergie PCI",
  audience: "service",
  sections: [
    {
      index: "1",
      title: "Caractériser l'antécédent — l'étape qui décide de tout",
      blocks: [
        {
          kind: "table3",
          head: ["Type de réaction", "Tableau clinique", "Conduite"],
          rows: [
            [
              "Effet non allergique",
              "Chaleur, goût métallique, nausée isolée, malaise vagal, extravasation",
              "Pas de prémédication, pas d'éviction. Réassurance, injection lente, patient réchauffé.",
            ],
            [
              "Hypersensibilité immédiate légère (< 1 h)",
              "Urticaire localisée, prurit, rhinite",
              "Éviction du PCI incriminé + changement de molécule + prémédication + surveillance 30–60 min.",
            ],
            [
              "HS immédiate modérée ou sévère",
              "Urticaire généralisée, angio-œdème, bronchospasme, hypotension, choc",
              "Avis allergologique préalable obligatoire avec tests cutanés. Discuter une alternative sans iode (IRM de stress, échographie de stress, imagerie nucléaire).",
            ],
            [
              "HS retardée (6 h à 7 j)",
              "Exanthème maculopapuleux ; DRESS, Stevens-Johnson, Lyell",
              "Prémédication inefficace. DRESS / SJS / Lyell = contre-indication absolue et définitive à tout PCI.",
            ],
          ],
        },
      ],
    },
    {
      index: "2",
      title: "Changer de molécule avant de prémédiquer",
      blocks: [
        {
          kind: "paragraph",
          text: "La mesure dont l'efficacité est la mieux établie est l'éviction du produit responsable et le choix d'une molécule de chaîne latérale différente — c'est la chaîne latérale qui porte la réactivité croisée.",
        },
        {
          kind: "cards",
          columns: 3,
          items: [
            {
              title: "Groupes de réactivité croisée",
              items: [
                "Groupe A : iohexol · ioversol · ioméprol (croisées fortes entre eux)",
                "Groupe B : iopamidol · iopromide",
                "Iodixanol (dimère non ionique) : croise volontiers avec le groupe A",
              ],
            },
            {
              title: "En pratique",
              items: [
                "Réaction sous iohexol / ioversol → préférer iopamidol ou iopromide, idéalement guidé par les tests cutanés.",
                "Noter la molécule exacte (DCI, nom commercial, lot) dans le compte rendu — c'est ce qui permettra la décision au prochain examen.",
              ],
            },
          ],
        },
      ],
    },
    {
      index: "3",
      title: "Protocoles de prémédication",
      blocks: [
        {
          kind: "cards",
          columns: 2,
          items: [
            {
              title: "Protocole programmé (≥ 13 h) — Greenberger",
              items: [
                "Prednisolone 50 mg PO · H-13 · H-7 · H-1",
                "+ Antihistaminique H1, 1 h avant : cétirizine 10 mg PO ou dexchlorphéniramine 5 mg IM/IV",
              ],
            },
            {
              title: "Protocole accéléré (< 12 h) — Lasser",
              items: [
                "Méthylprednisolone 40 mg IV (ou hydrocortisone 200 mg IV) toutes les 4 h, ≥ 2 doses, la dernière ≥ 1 h avant l'injection",
                "+ Dexchlorphéniramine 5 mg IV, 1 h avant",
              ],
            },
          ],
        },
        {
          kind: "note",
          tone: "warn",
          title: "Limites à connaître — et à expliquer au prescripteur",
          text: "La prémédication ne prévient pas les réactions sévères : environ 2 % de réactions per-prémédication (« breakthrough »), de sévérité comparable à l'épisode initial. Elle ne dispense jamais de la surveillance ni du matériel d'urgence, et n'a aucun intérêt dans les effets non allergiques ni dans les hypersensibilités retardées. Sous 4 à 5 h d'anticipation son efficacité n'est pas démontrée : mieux vaut différer l'examen que raccourcir le protocole. Prudence chez le diabétique, l'infecté, l'ulcéreux.",
        },
      ],
    },
    {
      index: "4",
      title: "Conditions de réalisation chez le patient à risque",
      blocks: [
        {
          kind: "bullets",
          items: [
            "Créneau en présence médicale, jamais en fin de vacation.",
            "VVP de bon calibre laissée en place ; surveillance 30 à 60 min.",
            "Injection éventuellement fractionnée (test 10–20 mL, pause 1 min) chez le patient très anxieux.",
            "Après tout épisode : CR détaillé (molécule, dose, délai, symptômes, traitement), déclaration de pharmacovigilance, courrier d'adressage en allergologie à 4–6 semaines (prick, IDR, patchs) pour identifier une molécule sûre.",
          ],
        },
        {
          kind: "note",
          tone: "danger",
          title: "Chariot d'urgence — vérifié avant la vacation",
          text: "Adrénaline 1 mg/mL : 0,3–0,5 mg IM face antéro-latérale de cuisse, à répéter toutes les 5 à 15 min · O₂ masque haute concentration · NaCl 0,9 % 500–1000 mL en remplissage · salbutamol spray/nébulisation · antihistaminique IV · corticoïdes IV · matériel d'intubation · DAE · numéro de la réanimation affiché. L'adrénaline IM est le seul traitement de l'anaphylaxie : ne jamais la retarder au profit des corticoïdes, dont l'action est différée.",
        },
      ],
    },
  ],
}

// ── Feuille 3 — contrôle de la fréquence cardiaque ───────────────────────────

const SHEET_FREQUENCE: ProtocolSheet = {
  id: "frequence",
  sheet: 3,
  eyebrow: "Imagerie cardiaque · Procédure",
  title: "Contrôle de la fréquence cardiaque",
  tab: "Fréquence cardiaque",
  audience: "service",
  sections: [
    {
      index: "1",
      title: "Cibles selon la machine",
      blocks: [
        {
          kind: "table3",
          head: ["Équipement et mode d'acquisition", "FC cible", "Remarques"],
          rows: [
            [
              "64 barrettes — prospectif séquentiel (step-and-shoot)",
              "≤ 60 bpm (idéal 50–58)",
              "Régularité impérative : variabilité < 5 bpm.",
            ],
            ["64 barrettes — rétrospectif hélicoïdal", "≤ 65 bpm", "Dose élevée : à réserver aux arythmies."],
            [
              "Double source (2ᵉ / 3ᵉ génération)",
              "≤ 70 bpm (toléré 80)",
              "Mode high-pitch : exige ≤ 60 bpm et rythme régulier.",
            ],
            [
              "Détecteur large 256 / 320 — volume, 1 battement",
              "≤ 65 bpm",
              "Meilleure tolérance à l'arythmie modérée.",
            ],
          ],
        },
        {
          kind: "note",
          tone: "info",
          title: "Règle",
          text: "La FC et sa variabilité comptent autant l'une que l'autre : une FC à 70 régulière donne souvent un meilleur examen qu'une FC à 55 entrecoupée d'extrasystoles.",
        },
      ],
    },
    {
      index: "2",
      title: "Moyens — toujours le non-pharmacologique d'abord",
      blocks: [
        {
          kind: "cards",
          columns: 2,
          items: [
            {
              title: "Sans médicament",
              subtitle: "gain 5 à 15 bpm",
              items: [
                "Salle calme et chaude, explication détaillée, décubitus 10–15 min.",
                "Installation confortable des bras au-dessus de la tête.",
                "Apnée non forcée, répétée à blanc ; anxiolyse verbale.",
              ],
            },
            {
              title: "Anxiolyse ciblée",
              items: [
                "Tachycardie purement émotionnelle persistante : alprazolam 0,25–0,5 mg PO ou hydroxyzine 25 mg PO, 45–60 min avant.",
                "Accompagnant obligatoire, pas de conduite. Ne remplace pas un bradycardisant.",
              ],
            },
            {
              title: "Bêtabloquants",
              subtitle: "première ligne",
              items: [
                "Per os (à privilégier) : métoprolol tartrate 50–100 mg 60 min avant, ou aténolol 50–100 mg, ou bisoprolol 5–10 mg. Si FC de repos > 80 bpm ou échec antérieur : schéma veille + matin.",
                "IV, en titration : métoprolol 5 mg en 1–2 min, répété toutes les 3–5 min jusqu'à 15 mg (maximum 20–30 mg, titration prudente). Alternative : esmolol (demi-vie 9 min) bolus 0,5 mg/kg puis 50–200 µg/kg/min.",
                "Monitorage FC, PA, scope. Arrêt si FC < 50, PAS < 100 mmHg, BAV, bronchospasme.",
                "Secours : atropine 0,5–1 mg IV ; glucagon 1–5 mg IV si bradycardie ou hypotension réfractaire.",
              ],
            },
            {
              title: "Ivabradine",
              subtitle: "alternative ou association",
              items: [
                "Bradycardisant pur (courant If) : pas d'effet inotrope négatif, pas de bronchoconstriction, pas d'hypotension → idéal chez l'asthmatique, le BPCO, l'hypotendu, l'insuffisant cardiaque.",
                "5 mg ×2/j la veille + 5 mg le matin (2 h avant), ou dose unique 15 mg PO 2 h avant — gain moyen 12 à 20 bpm.",
                "Association ivabradine + bêtabloquant : la stratégie la plus efficace en cas de FC rebelle (surveiller la bradycardie).",
                "CI : FA/flutter (inefficace), BAV 3, grossesse, inhibiteurs puissants du CYP3A4 (kétoconazole, clarithromycine, pamplemousse). Prévenir des phosphènes, bénins.",
              ],
            },
            {
              title: "Inhibiteurs calciques bradycardisants",
              items: [
                "Si bêtabloquant contre-indiqué : diltiazem 60–120 mg PO 1 h avant ou 20 mg IV lent ; vérapamil 80–120 mg PO. Moins puissants, hypotension plus fréquente.",
              ],
            },
          ],
        },
        {
          kind: "note",
          tone: "danger",
          title: "Jamais",
          text: "Vérapamil ou diltiazem IV associés à un bêtabloquant IV : bradycardie sévère, BAV.",
        },
      ],
    },
    {
      index: "3",
      title: "Arbre décisionnel en salle — FC mesurée après 10 min de décubitus",
      blocks: [
        {
          kind: "algorithm",
          rows: [
            { band: "≤ 60", text: "Régulière → aucun bradycardisant. Trinitrine → acquisition." },
            {
              band: "61–70",
              text: "Double source ou détecteur large : acquisition possible. 64 barrettes : métoprolol 50–100 mg PO si non déjà pris, ou 5–10 mg IV.",
            },
            {
              band: "71–85",
              text: "Métoprolol IV titré 5 mg toutes les 3–5 min jusqu'à 15–20 mg ; ajouter l'ivabradine si le patient est déjà sous bêtabloquant.",
            },
            {
              band: "> 85",
              text: "Malgré titration : rechercher anxiété, douleur, fièvre, hyperthyroïdie, anémie, insuffisance cardiaque, déshydratation, sevrage, bêta-mimétiques. Reprogrammer avec préparation orale renforcée (bisoprolol 5 mg ×2 + ivabradine 5 mg ×2 la veille).",
            },
            {
              band: "Arythmie",
              text: "FA, ESV/ESSV fréquentes : acquisition rétrospective avec modulation et padding large, ou mode 1 battement. Contrôle de la cadence en amont — une FA à réponse rapide est une mauvaise indication.",
            },
          ],
        },
        {
          kind: "note",
          tone: "info",
          title: "Puis, dans tous les cas",
          text: "Contrôle de la PA → trinitrine sublinguale 0,4–0,8 mg → attente 2–5 min → apnée d'essai → acquisition.",
        },
      ],
    },
    {
      index: "4",
      title: "Paramètres d'acquisition associés",
      blocks: [
        {
          kind: "bullets",
          items: [
            "Injection 3–6 mL/s de PCI à 350–400 mg I/mL, volume ≈ 1 mL/kg (50–80 mL), suivie d'un bolus chasse de sérum physiologique 40–50 mL.",
            "Déclenchement par bolus tracking (ROI aorte, seuil 100–120 UH) ou test-bolus.",
            "Modulation de dose ECG-dépendante, 70–100 kV selon l'IMC, reconstruction itérative ou par IA.",
            "Fenêtre de gating : 75 % (mésodiastole) si FC < 65 ; 40–45 % (télésystole) si FC > 75 ; padding si arythmie.",
            "Score calcique préalable si indiqué : même synchronisation, sans injection ni nitré.",
          ],
        },
      ],
    },
    {
      index: "5",
      title: "Ordonnances types",
      blocks: [
        {
          kind: "prescription",
          title: "Bradycardisation — FC de repos > 70, sans contre-indication",
          lines: [
            "Bisoprolol 5 mg : 1 cp la veille au soir",
            "                  + 1 cp le matin (2 h avant)",
            "  ou Métoprolol 100 mg : même schéma",
          ],
          note: "Ne pas prendre si FC < 55/min ou PA systolique < 100 mmHg au domicile.",
        },
        {
          kind: "prescription",
          title: "Si bêtabloquant contre-indiqué",
          lines: [
            "Ivabradine 5 mg : 1 cp matin et soir la veille",
            "                  + 1 cp 2 h avant l'examen",
          ],
          note: "Ne pas utiliser en cas de fibrillation auriculaire.",
        },
        {
          kind: "prescription",
          title: "Prémédication antiallergique programmée (hypersensibilité immédiate légère documentée)",
          lines: [
            "Prednisolone 50 mg : 1 cp à H-13, 1 cp à H-7, 1 cp à H-1 avant l'examen",
            "Cétirizine 10 mg : 1 cp 1 h avant l'examen",
          ],
          note: "Mention obligatoire sur la demande d'examen : « Antécédent de réaction à ……………… — utiliser un PCI de chaîne latérale différente, surveillance 60 min. »",
        },
      ],
    },
  ],
}

// ── Feuille 4 — fiche remise au patient ──────────────────────────────────────

const SHEET_PATIENT: ProtocolSheet = {
  id: "patient",
  sheet: 4,
  eyebrow: "À remettre au patient",
  title: "Votre scanner des artères du cœur",
  tab: "Fiche patient",
  audience: "patient",
  intro:
    "Un examen indolore : vous restez environ 30 minutes sur place (prévoyez 1 heure au total) et la prise d'images ne dure que quelques secondes. Pour que les images soient nettes, votre cœur doit battre lentement et régulièrement — en dessous de 60 battements par minute. C'est tout l'objet des consignes ci-dessous ; elles évitent d'avoir à refaire l'examen.",
  sections: [
    {
      index: "",
      title: "Rendez-vous",
      blocks: [
        {
          kind: "fields",
          items: [
            "Rendez-vous le ……/……/…… à ……h……",
            "Présentez-vous à ……h…… (45 min avant)",
          ],
        },
      ],
    },
    {
      index: "",
      title: "La veille",
      blocks: [
        {
          kind: "bullets",
          items: [
            "Pas de café, thé, boissons énergisantes, sodas au cola ni chocolat à partir de midi.",
            "Pas de tabac, pas de sport intense.",
            "Buvez normalement : environ 1,5 litre d'eau.",
            "Si un médicament vous a été prescrit pour ralentir le cœur, prenez-le comme indiqué sur l'ordonnance.",
            "Couchez-vous tôt.",
          ],
        },
      ],
    },
    {
      index: "",
      title: "Le jour de l'examen",
      blocks: [
        {
          kind: "bullets",
          items: [
            "Ne mangez pas dans les 4 heures qui précèdent — mais buvez de l'eau normalement : c'est important.",
            "Prenez tous vos médicaments habituels avec un peu d'eau, sans en sauter aucun, surtout ceux du cœur et de la tension.",
            "Ni café, ni cigarette le matin.",
            "Arrivez 45 minutes avant l'heure indiquée, sans précipitation.",
            "Vêtements confortables, sans métal sur le buste : soutien-gorge à armatures, bijoux et patchs sont à retirer.",
          ],
        },
      ],
    },
    {
      index: "",
      title: "À apporter",
      blocks: [
        {
          kind: "paragraph",
          text: "Ordonnance et courrier de votre médecin · résultats de votre prise de sang (créatinine) · comptes rendus et examens précédents (CD, clé USB) · la liste de vos médicaments · carte Vitale et mutuelle.",
        },
      ],
    },
    {
      index: "",
      title: "Signalez-nous impérativement",
      blocks: [
        {
          kind: "bullets",
          items: [
            "Toute réaction à un produit de contraste iodé, même ancienne ou minime — dites-nous laquelle et quand.",
            "Un asthme, des allergies connues, une maladie des reins, un traitement par metformine (diabète).",
            "Une grossesse possible.",
            "La prise de Viagra®, Cialis®, Levitra® ou équivalent dans les 48 dernières heures : incompatible avec le médicament que nous utilisons.",
          ],
        },
      ],
    },
    {
      index: "",
      title: "Pendant l'examen",
      blocks: [
        {
          kind: "bullets",
          items: [
            "Une petite perfusion est posée au bras. Le produit de contraste donne une sensation de chaleur dans tout le corps et une envie d'uriner pendant quelques secondes : c'est normal et sans danger.",
            "Un médicament sous la langue dilate vos artères ; il peut donner un mal de tête passager.",
            "On vous demandera de bloquer votre respiration une dizaine de secondes : inspirez normalement, sans forcer, puis ne bougez plus. Nous nous entraînerons ensemble avant.",
          ],
        },
      ],
    },
    {
      index: "",
      title: "Après",
      blocks: [
        {
          kind: "bullets",
          items: [
            "Restez 30 minutes en salle d'attente : c'est une simple sécurité.",
            "Buvez 1 à 1,5 litre d'eau dans les heures qui suivent.",
            "Si un médicament ralentisseur ou calmant vous a été donné : ne conduisez pas, faites-vous raccompagner.",
            "Boutons, rougeurs ou démangeaisons dans les jours suivants, ou gêne respiratoire : contactez-nous ou votre médecin.",
          ],
        },
        {
          kind: "fields",
          items: ["Service / cabinet : ………………………………", "Téléphone : ………………………………", "Fiche remise le : ……/……/……"],
        },
      ],
    },
  ],
}

export const CCTA_PROTOCOL_SHEETS: ProtocolSheet[] = [
  SHEET_PARCOURS,
  SHEET_ALLERGIE,
  SHEET_FREQUENCE,
  SHEET_PATIENT,
]

export const PROTOCOL_DISCLAIMER =
  "Document d'aide à la pratique — à valider et à adapter aux protocoles du service et aux référentiels en vigueur (CIRTACI-SFR, ACR Manual on Contrast Media, SCCT). Les posologies doivent être confrontées à l'AMM et aux habitudes locales avant diffusion."

// ── Points d'attention déduits du contexte saisi à l'étape 4 ─────────────────

export interface ProtocolAlert {
  tone: "info" | "warn" | "danger"
  title: string
  text: string
  /** Feuille où trouver la conduite détaillée. */
  sheet: ProtocolSheet["id"]
}

/**
 * Traduit les modificateurs cliniques déjà saisis par le praticien en points
 * de préparation à mentionner sur la demande d'examen. Le protocole reste
 * intégral : ces alertes ne font que pointer les paragraphes qui concernent
 * ce patient-ci, pour que la demande parte complète du cabinet.
 */
export function getProtocolAlerts(mods: ClinicalModifiers): ProtocolAlert[] {
  const alerts: ProtocolAlert[] = []

  if (mods.allergieIode) {
    alerts.push({
      tone: "danger",
      sheet: "allergie",
      title: "Antécédent allergique / asthme sévère",
      text: "Caractériser la réaction avant de prémédiquer : effet non allergique, HS immédiate légère, modérée-sévère ou retardée. HS modérée ou sévère → avis allergologique avec tests cutanés avant programmation ; DRESS / Stevens-Johnson / Lyell → contre-indication absolue à tout PCI. Mentionner sur la demande : changement de chaîne latérale, surveillance 60 min.",
    })
  }

  if (mods.irc === "moderee") {
    alerts.push({
      tone: "warn",
      sheet: "parcours",
      title: "Insuffisance rénale modérée (DFG 30–45)",
      text: "Créatinine + DFG de moins de 3 mois joints à la demande. DFG ≥ 30 : pas de restriction pratique, hydratation orale normale, metformine poursuivie. Volume de contraste au plus juste.",
    })
  }

  if (mods.irc === "severe") {
    alerts.push({
      tone: "danger",
      sheet: "parcours",
      title: "Insuffisance rénale sévère (DFG < 30)",
      text: "Bénéfice/risque à rediscuter avec le radiologue, hydratation NaCl 0,9 % encadrant l'injection, volume minimal. Metformine : arrêt 48 h et contrôle de la créatinine avant reprise.",
    })
  }

  if (mods.fa) {
    alerts.push({
      tone: "warn",
      sheet: "frequence",
      title: "Fibrillation atriale ou arythmie",
      text: "Prévenir le radiologue : acquisition rétrospective avec padding large ou mode 1 battement, détecteur large de préférence. L'ivabradine est inefficace en FA — la bradycardisation passe par le contrôle de la cadence en amont. Une FA à réponse rapide est une mauvaise indication.",
    })
  }

  if (mods.calcifMassives) {
    alerts.push({
      tone: "warn",
      sheet: "frequence",
      title: "Calcifications massives connues (CACS ≥ 400)",
      text: "Blooming : risque de surestimation des sténoses et d'examen non contributif. FC la plus basse possible, reconstruction haute résolution ; si le doute persiste, un test fonctionnel ou la coronarographie répondront mieux.",
    })
  }

  if (mods.obesite) {
    alerts.push({
      tone: "info",
      sheet: "frequence",
      title: "Obésité morbide (IMC > 40)",
      text: "kV plus élevés et débit d'injection soutenu : VVP 18 G impérative au pli du coude droit. Prévenir le patient d'une qualité d'image possiblement dégradée et vérifier la limite de poids de la table.",
    })
  }

  if (mods.fragilite) {
    alerts.push({
      tone: "info",
      sheet: "frequence",
      title: "Patient fragile ou âgé",
      text: "Titration prudente des bêtabloquants IV (hypotension, BAV), surveillance prolongée, accompagnant requis si bradycardisant IV ou anxiolytique. Vérifier la capacité d'apnée dès la prise de rendez-vous.",
    })
  }

  return alerts
}
