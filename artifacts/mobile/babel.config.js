module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { unstable_transformImportMeta: true }]],
    // Hermes cannot compile JS private class fields (#foo) that some
    // dependencies ship untranspiled — without these the release Android
    // build fails with "private properties are not supported".
    plugins: [
      "@babel/plugin-transform-class-properties",
      "@babel/plugin-transform-private-methods",
      "@babel/plugin-transform-private-property-in-object",
    ],
  };
};
