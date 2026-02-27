import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Añade esto para forzar la detección de estilos en la v4
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;