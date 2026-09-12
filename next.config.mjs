import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Export statique : l'application est entièrement cliente (aucun calcul
  // n'est fait côté serveur, aucune donnée patient ne quitte l'appareil).
  // Le dossier `out/` est déployable sur n'importe quel hébergeur statique
  // et sert de base au wrapper Android (TWA) / iOS.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },

  // Racine explicite : Turbopack ne remonte pas au-dessus du dépôt pour y
  // chercher un lockfile, ce qui garde le build identique en local, en CI et
  // sur Vercel.
  turbopack: { root: projectRoot },
  outputFileTracingRoot: projectRoot,
}

export default nextConfig
