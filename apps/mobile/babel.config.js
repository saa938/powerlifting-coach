module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    // Reanimated 4 ships its Babel transform via react-native-worklets and it
    // MUST be listed last.
    plugins: ['react-native-worklets/plugin'],
  };
};
