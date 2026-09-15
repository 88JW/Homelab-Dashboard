import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Operator Homelabu",
    short_name: "Homelab",
    description: "Lokalny podgląd, diagnoza i bezpieczne naprawy serwera.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    icons: [{ src: "/logoMIaSoftware.png", sizes: "any", type: "image/png" }],
  }
}
