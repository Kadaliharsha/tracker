module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Add this plugins line
    plugins: ['react-native-reanimated/plugin'], 
  };
};