/* eslint-disable no-restricted-globals */
/**
 * Service worker de retrait, servi à la place de `/sw.js` sur l'ancienne
 * adresse douleur-thoracique-cabinet.vercel.app (réécriture dans vercel.json).
 *
 * Les navigateurs et applications installées depuis l'ancienne adresse ont un
 * service worker qui sert les pages depuis son cache : sans lui, la redirection
 * vers la nouvelle adresse ne serait jamais vue. Celui-ci prend sa place, vide
 * les caches, se désinscrit, puis renvoie chaque onglet ouvert vers la même
 * page sur la nouvelle adresse.
 */
const NEW_ORIGIN = "https://filiere-angor-cardiomaine.vercel.app"

self.addEventListener("install", () => self.skipWaiting())

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
      await self.registration.unregister()
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true })
      await Promise.all(
        windows.map((client) => {
          const url = new URL(client.url)
          return client.navigate(NEW_ORIGIN + url.pathname + url.search + url.hash).catch(() => {})
        }),
      )
    })(),
  )
})
