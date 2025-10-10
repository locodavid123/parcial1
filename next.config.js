/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { // Permitir cualquier dominio
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '**',
      },
      { // Permitir cualquier dominio
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '**',
      },
      { // Permitir cualquier dominio
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '**',
      },
      { // Permitir cualquier dominio
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '**',
      }
      
    ],
  },
};

module.exports = nextConfig;