/**
 * @rizzle/lint-configs/react-native
 * React Native preset that extends the base TypeScript configuration
 */

import { eslintConfig as baseConfig } from './eslint.config.js';

/**
 * React Native preset configuration
 * Extends base config with React Native specific rules
 *
 * Note: This preset requires additional peer dependencies:
 * - eslint-plugin-react
 * - eslint-plugin-react-native
 * - eslint-plugin-testing-library (for test files)
 */
export const reactNativeConfig = [
  ...baseConfig,
  {
    // Override base config rules for React Native
    rules: {
      // Override import sorting with React Native specific groups
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Side effect imports.
            ['^\\u0000'],
            // Packages.
            // Things that start with a letter (or digit or underscore), or `@` followed by a letter.
            ['^@?\\w'],
            // Absolute imports and other imports such as Vue-style `@/foo`.
            // Anything that does not start with a dot.
            ['^[^.]'],
            // Relative imports from project aliases
            [
              '^@(assets|components|constants|contexts|features|hooks|navigators|services|stores|utils|schema|portfolio)/',
            ],
            // Relative imports.
            // Anything that starts with a dot.
            ['^\\.'],
          ],
        },
      ],

      // Console is error in React Native (not just warn)
      'no-console': 'error',

      // React specific rules
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/no-unstable-nested-components': 'off',

      // React Native specific rules
      'react-native/no-inline-styles': 'off',
    },
  },
  {
    // Test files configuration
    files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    rules: {
      // Allow console in test files
      'no-console': 'off',
    },
  },
];

export default reactNativeConfig;
