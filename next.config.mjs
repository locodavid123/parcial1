/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'i.ytimg.com',
      'img.youtube.com',
      'youtube.com',
      'www.youtube.com',
      'youtu.be'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: '**.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
      }
    ]
  }
};

export default nextConfig;
