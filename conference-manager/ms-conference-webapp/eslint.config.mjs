import nextConfig from "eslint-config-next/core-web-vitals";
import typescriptConfig from "eslint-config-next/typescript";
import storybookPlugin from "eslint-plugin-storybook";

const eslintConfig = [
  ...nextConfig,
  ...typescriptConfig,
  ...storybookPlugin.configs["flat/recommended"],
];

export default eslintConfig;
