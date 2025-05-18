//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {},
  // Remove devServerPort as it's causing warnings and not needed
  // Ensure postcss (for Tailwind) works correctly
  webpack: (config) => {
    return config;
  },
  // Explicitly set the PostCSS config path
  postcssLoaderOptions: {
    config: require.resolve('./postcss.config.cjs')
  }
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
