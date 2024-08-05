import js from '@eslint/js';
import ts from 'typescript-eslint';
import tsParser from '@typescript-eslint/parser';

import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default ts.config(
  js.configs.recommended,
  ts.configs.eslintRecommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
    },
  },
  { ignores: ['dist/', '**/*.js'] },
  prettierRecommended,
);
