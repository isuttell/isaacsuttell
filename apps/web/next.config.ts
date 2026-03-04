import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ['@mdxeditor/editor'],
};

export default nextConfig;
