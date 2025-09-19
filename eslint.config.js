import js from '@eslint/js'
import globals from 'globals'
import { defineConfig, globalIgnores } from 'eslint/config'
import stylistic from '@stylistic/eslint-plugin'
// import pluginJest from 'eslint-plugin-jest'

export default defineConfig([
  globalIgnores([
    'tmp/', // unignore `tmp/` directory
  ]),
  stylistic.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    ignores: ['__tests__/**'],
    plugins: { js }, // plugins: { js, jest: pluginJest },
    extends: ['js/recommended'],
  },
  { files: ['**/*.{js,mjs,cjs}'], languageOptions: { globals: globals.node } },
])

// import js from "@eslint/js";
// import globals from "globals";
// import { defineConfig } from "eslint/config";
//
// export default defineConfig([
//   { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
// ]);
