import type { Metadata } from "next"
import { Landing } from "@/components/landing/landing"

export const metadata: Metadata = {
  title: "Filière Angor Cardiomaine — Douleurs thoraciques à l'UPATOU",
  description:
    "Protocole de gestion des douleurs thoraciques à l'UPATOU — Clinique du Pôle Santé Sud, Le Mans. Utilisable hors ligne, aucune donnée ne quitte l'appareil.",
}

export default function HomePage() {
  return <Landing />
}
