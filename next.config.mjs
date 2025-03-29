/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.worker\.(js|ts)$/,
      loader: 'worker-loader',
      options: {
        filename: 'static/[hash].worker.js',
      },
    });

    // Required for Web Workers to work with Webpack
    config.output = {
      ...config.output,
      globalObject: 'self',
    };

    return config;
  },
};

export default nextConfig; 