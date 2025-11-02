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
      }
    ]
  }
};

export default nextConfig;
