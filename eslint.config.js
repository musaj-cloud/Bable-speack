// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // dist/* — build output. bare/** and scripts/** run in the Bare runtime /
    // Node, not the Expo app (different globals like BareKit, and a generated
    // multi-MB worklet bundle), so they're outside the Expo lint scope.
    ignores: ["dist/*", "bare/**", "scripts/**"],
  }
]);
