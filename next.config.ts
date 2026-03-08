import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Cache Components: explicit opt-in caching (Next.js 16).
  // Completes the PPR story — static shell streams instantly, dynamic
  // content fills in without blocking navigation.
  cacheComponents: true,

  // React Compiler: stable in Next.js 16.
  // Auto-memoizes components with zero manual useMemo/useCallback.
  // Note: slightly increases compile time (Babel-backed).
  reactCompiler: true,

  images: {
    remotePatterns: [
      { hostname: 'upload.wikimedia.org' },
      { hostname: 'api.qrserver.com' },
      { hostname: 'covers.openlibrary.org' },
      { hostname: 'avatars.githubusercontent.com' },
    ],
  },

  experimental: {
    // Turbopack File System Caching: persists compiler artifacts across
    // restarts for dramatically faster dev startup in large codebases.
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
