const { defineConfig } = require("eslint/config")
const expoConfig = require("eslint-config-expo/flat")
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended")
const tseslint = require("typescript-eslint")
const reactotronPlugin = require("eslint-plugin-reactotron")
const reactNativePlugin = require("eslint-plugin-react-native")
const globals = require("globals")

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: [".expo/**", "dist/**", "node_modules/**", "ios/**", "android/**"],
  },
  {
    plugins: {
      "reactotron": reactotronPlugin,
      "react-native": reactNativePlugin,
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      "prettier/prettier": "error",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-var-requires": "off",
      "no-use-before-define": "off",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react",
              importNames: ["default"],
              message: "Import named exports from 'react' instead.",
            },
          ],
        },
      ],
      "react/prop-types": "off",
      "react-native/no-raw-text": "off",
      "react-native/no-inline-styles": "off",
      "reactotron/no-tron-in-production": "error",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["metro.config.js", "babel.config.js", "jest.config.js", "eslint.config.js"],
    languageOptions: {
      globals: globals.node,
    },
  },
])
