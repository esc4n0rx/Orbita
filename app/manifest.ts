import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Orbita - Sistema de Rotina Inteligente",
    short_name: "Orbita",
    description: "Um sistema de rotina inteligente que te mantém na órbita dos seus objetivos",
    start_url: "/",
    display: "standalone",
    background_color: "#0F172A",
    theme_color: "#0F172A",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    orientation: "portrait",
    categories: ["productivity", "lifestyle", "health"],
    screenshots: [
      {
        src: "/screenshots/dashboard.png",
        sizes: "1280x720",
        type: "image/png",
        label: "Dashboard do Orbita",
      },
    ],
  }
}
