import unusedImports from "eslint-plugin-unused-imports";
import prettierConfig from "eslint-config-prettier";
import tsParser from "@typescript-eslint/parser";

export default [
  // Include Prettier's config first to disable conflicting rules
  prettierConfig,
  {
    files: ["**/*.{js,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        // Optionally, include the tsconfig if you need type information:
        // project: "./tsconfig.json"
      }
    },
    plugins: {
      "unused-imports": unusedImports
    },
    rules: {
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_"
        }
      ]
    }
  }
];
