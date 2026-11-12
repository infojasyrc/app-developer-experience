// If using react-app-rewired with config-overrides.js
module.exports = function override(config) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "fs": false,
    "path": require.resolve("path-browserify")
  };
  
  return config;
}
