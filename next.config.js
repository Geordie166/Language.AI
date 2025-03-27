/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Add WebAssembly support
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    
    // Add support for Azure Speech SDK
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    return config;
  },
}

module.exports = nextConfig 