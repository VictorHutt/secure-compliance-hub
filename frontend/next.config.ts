import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable webpack for better compatibility with some packages
  experimental: {
    // Turbopack is enabled via CLI flag
  },
  webpack: (config) => {
    // Fix MetaMask SDK warning about React Native async storage
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
    };
    return config;
  },
  headers() {
    // Required by FHEVM 
    return Promise.resolve([
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ]);
  },
  // Allow external access for WSL and browser preview
  // Using wildcard pattern for 127.0.0.1 to allow any port
  allowedDevOrigins: ['localhost:*', '127.0.0.1:*'],
};

export default nextConfig;
