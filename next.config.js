/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'donjediondo.com',
      },
      {
        protocol: 'https',
        hostname: 'cloudfront-us-east-1.images.arcpublishing.com',
      },
      // Puedes agregar aquí otros dominios que necesites
    ],
  },
};

module.exports = nextConfig;