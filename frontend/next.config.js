const nextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,

  // Ignore TypeScript and ESLint errors if specified in environment variables
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },

  // Modify Webpack configuration
  webpack: config => {
    // Fallback configurations for client-side libraries
    config.resolve.fallback = { fs: false, net: false, tls: false };

    // Exclude specific modules from the build
    config.externals.push("pino-pretty", "lokijs", "encoding");

    return config;
  },
};

module.exports = nextConfig;