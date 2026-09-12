import type { Metadata } from "next"
import { WizardShell } from "@/components/wizard/wizard-shell"

export const metadata: Metadata = {
  title: "Évaluation — Filière Angor Cardiomaine",
  description:
    "Parcours en cinq étapes : triage des critères d'alerte, classification symptomatique ESC 2024, probabilité RF-CL et CACS-CL, examen à prescrire, fiche de consultation.",
}

export default function ParcoursPage() {
  return <WizardShell />
}
