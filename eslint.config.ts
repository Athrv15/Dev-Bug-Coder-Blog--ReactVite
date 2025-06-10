import ts from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  { ignores: ["dist"] },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node, // Add Node.js globals to avoid 'process is not defined' error
      },
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { tsx: true },
        sourceType: "module",
      },
    },
    settings: { react: { version: "18.3" } },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...ts.rules,
      ...react.configs.recommended.rules,
      ...react.configs["tsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      "react/tsx-no-target-blank": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "no-unused-vars": [
        "warn",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }, // Ignore variables starting with '_'
      ],
      "import/no-unresolved": [
        "off", // Disable unresolved import errors for directories like assets, components, and utility
      ],
    },
  },
];
