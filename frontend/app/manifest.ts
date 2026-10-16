import type { MetadataRoute } from "next";

// Web app manifest — makes the app installable as a PWA.
// Android reads it only at install time: after changes, reinstall the app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Diet Tracker",
    short_name: "Diet Tracker",
    description: "Śledź swoje kalorie i makroskładniki",
    start_url: "/dashboard",
    display: "standalone",
    // Locks rotation in the installed app (Android; iOS ignores this field)
    orientation: "portrait",
    background_color: "#f6f4ee",
    theme_color: "#f6f4ee",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
