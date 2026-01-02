import { eslintConfig } from '@rizzle/lint-configs'
import tseslint from 'typescript-eslint'

export default [
  ...eslintConfig,
  {
    rules: {
      semi: ['error', 'never'],
    },
  },
  {
    files: ['*.config.js', '*.config.ts'],
    ...tseslint.configs.disableTypeChecked,
  },
]
