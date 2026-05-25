const path = require('path');

/**
 * Ensure Turbopack uses the project root directory as the compilation root.
 * This prevents Next from inferring `src/app` as the workspace root.
 */
module.exports = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // note: keep turbopack.root to help Turbopack resolve project root
};
