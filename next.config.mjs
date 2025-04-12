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
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/:path*', // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
