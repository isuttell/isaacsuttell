import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ['@mdxeditor/editor'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'qk9emm7xscimwo8u.public.blob.vercel-storage.com' },
    ],
  },
  async redirects() {
    return [{ source: '/projects', destination: '/', permanent: true }];
  },
};

export default nextConfig;
