/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { // Permitir cualquier dominio
        protocol: 'https',
        hostname: '**',
      }
    ],
  },
};

module.exports = nextConfig;