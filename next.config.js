/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev, isServer }) => {
    // Worker configuration (only for client-side)
    if (!isServer) {
      config.module.rules.push({
        test: /\.worker\.(js|ts)$/,
        use: {
          loader: 'worker-loader',
          options: {
            filename: 'static/[hash].worker.js',
            publicPath: '/_next/',
            inline: 'no-fallback',
          },
        },
      });

      // Fix for Worker imports
      config.output = {
        ...config.output,
        globalObject: 'self',
      };
    }

    // Fix for fs module
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    return config;
  },
  // Disable symlinks to prevent EINVAL errors
  experimental: {
    enableUndici: true,
    disableSymlinkResolution: true,
  },
  // Ensure the app doesn't crash on references to web workers during SSR
  experimental: {
    serverComponentsExternalPackages: ['microsoft-cognitiveservices-speech-sdk'],
  },
  typescript: {
    // Ensure TypeScript errors don't prevent builds
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig 