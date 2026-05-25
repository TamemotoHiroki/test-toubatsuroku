const path = require('path');

/**
 * Ensure Turbopack uses the project root directory as the compilation root.
 * This prevents Next from inferring `src/app` as the workspace root.
 */
module.exports = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  experimental: {
    // Try disabling Turbopack if the runtime infers the root incorrectly.
    turbopack: false,
  },
};
