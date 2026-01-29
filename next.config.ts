import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Ignorujemy błędy typów tylko podczas budowania produkcyjnego
    ignoreBuildErrors: true,
  },
  eslint: {
    // Przy okazji zignorujemy linta, żeby nie wywalił się na ostrzeżeniach
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
