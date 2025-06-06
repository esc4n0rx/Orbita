// app/sw.ts (atualizado)
/// <reference lib="webworker" />

import { clientsClaim } from "workbox-core"
import { ExpirationPlugin } from "workbox-expiration"
import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching"
import { registerRoute } from "workbox-routing"
import { StaleWhileRevalidate, CacheFirst } from "workbox-strategies"

declare const self: ServiceWorkerGlobalScope

clientsClaim()

// Precache all of the assets generated by your build process.
precacheAndRoute(self.__WB_MANIFEST)

// Set up App Shell-style routing for navigation requests
const fileExtensionRegexp = /\/[^/?]+\.[^/]+$/
registerRoute(
  ({ request, url }: { request: Request; url: URL }) => {
    if (request.mode !== "navigate") {
      return false
    }
    if (url.pathname.startsWith("/_")) {
      return false
    }
    if (fileExtensionRegexp.test(url.pathname)) {
      return false
    }
    return true
  },
  createHandlerBoundToURL("/index.html")
)

// Cache images
registerRoute(
  ({ url }) => 
    url.origin === self.location.origin && 
    (url.pathname.endsWith('.png') || 
     url.pathname.endsWith('.jpg') || 
     url.pathname.endsWith('.jpeg') || 
     url.pathname.endsWith('.svg') || 
     url.pathname.endsWith('.gif')),
  new CacheFirst({
    cacheName: "images",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
      }),
    ],
  })
)

// Cache stylesheets and scripts
registerRoute(
  ({ url }) => 
    url.origin === self.location.origin && 
    (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')),
  new StaleWhileRevalidate({
    cacheName: "assets",
  })
)

// Cache API requests
registerRoute(
  ({ url }) => 
    url.origin === self.location.origin && 
    url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: "api-responses",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60, // 24 horas
      }),
    ],
  })
)

// This allows the web app to trigger skipWaiting via registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

// Add offline fallback
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cachedResponse = await caches.match("/offline.html")
        return cachedResponse || new Response("Você está offline. Por favor, verifique sua conexão.", { 
          status: 503, 
          statusText: "Offline" 
        })
      })
    )
  }
})

// Notifica quando o app é instalado
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  self.skipWaiting(); // Garante que o SW seja ativado imediatamente
});

// Notifica quando o app é ativado
self.addEventListener('activate', (event) => {
  console.log('Service Worker ativado');
});

// Evento específico para detectar quando o PWA é instalado pelo usuário
self.addEventListener('appinstalled', (event) => {
  console.log('PWA foi instalado pelo usuário');
});