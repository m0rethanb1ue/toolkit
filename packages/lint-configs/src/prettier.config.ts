import type { Config } from 'prettier';

/**
 * Base Prettier configuration
 */
export const prettierConfig: Config = {
  // Print width
  printWidth: 100,

  // Tab width
  tabWidth: 2,
  useTabs: false,

  // Semicolons
  semi: true,

  // Quotes
  singleQuote: true,
  quoteProps: 'as-needed',

  // Trailing commas
  trailingComma: 'es5',

  // Brackets
  bracketSpacing: true,
  bracketSameLine: false,

  // Arrow functions
  arrowParens: 'always',

  // End of line
  endOfLine: 'lf',

  // Prose wrap
  proseWrap: 'preserve',

  // HTML whitespace sensitivity
  htmlWhitespaceSensitivity: 'css',

  // Embedded language formatting
  embeddedLanguageFormatting: 'auto',

  // JSX
  jsxSingleQuote: false,

  // Vue files
  vueIndentScriptAndStyle: false,

  // Range format
  rangeStart: 0,
  rangeEnd: Infinity,

  // Plugin overrides
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
      },
    },
    {
      files: '*.md',
      options: {
        proseWrap: 'always',
        printWidth: 80,
      },
    },
  ],
};

export default prettierConfig;
