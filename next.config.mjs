/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'scontent.cdninstagram.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'scontent.fdel11-2.fna.fbcdn.net',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
