import type { Metadata } from "next"
import { Landing } from "@/components/landing/landing"

export const metadata: Metadata = {
  title: "Filière Angor Cardiomaine — Dépistage de la maladie coronarienne",
  description:
    "De la douleur thoracique à l'examen à prescrire : triage, classification ESC 2024, probabilité clinique RF-CL et CACS-CL, choix du premier examen. Utilisable hors ligne, aucune donnée ne quitte l'appareil.",
}

export default function HomePage() {
  return <Landing />
}
