import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ['@mdxeditor/editor'],
  async redirects() {
    return [{ source: '/projects', destination: '/', permanent: true }];
  },
};

export default nextConfig;
