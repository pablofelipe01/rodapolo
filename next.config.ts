import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    // Temporalmente deshabilitar verificación de tipos durante build
    ignoreBuildErrors: true,
  },
}

export default nextConfig
