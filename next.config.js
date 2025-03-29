/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Worker configuration
      config.module.rules.push({
        test: /\.worker\.(js|ts)$/,
        loader: 'worker-loader',
        options: {
          filename: 'static/[hash].worker.js',
          publicPath: '/_next/',
        },
      });

      // Fix for Worker imports
      config.output.globalObject = 'self';
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
    serverComponentsExternalPackages: ['microsoft-cognitiveservices-speech-sdk']
  }
};

module.exports = nextConfig 