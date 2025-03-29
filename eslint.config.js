import unusedImports from "eslint-plugin-unused-imports"
import importPlugin from "eslint-plugin-import"
import prettierConfig from "eslint-config-prettier"
import tsParser from "@typescript-eslint/parser"

export default [
  prettierConfig,
  {
    files: ["**/*.{js,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
    },
    plugins: {
      "unused-imports": unusedImports,
      import: importPlugin,
    },
    rules: {
      // Existing rules
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["../../*"],
              message: "Avoid deep relative imports — use @/ instead",
            },
          ],
        },
      ],
    },
  },
]
