# @rizzle/lint-configs

> Plug-and-play lint configurations for TypeScript projects with ESLint 9.x (flat config) and Prettier 3.x.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- ✨ **Latest ESLint 9.x** with flat config format
- 🎨 **Prettier 3.x** with sensible defaults
- 📦 **TypeScript-first** with typescript-eslint v8
- 🔧 **Zero-config** - just install and use
- 🚀 **Multiple import methods** - use root config files or import directly
- 📋 **Import sorting** - automatic import organization with simple-import-sort
- ⚛️ **React Native preset** - ready-to-use configuration for React Native projects
- 🎯 **Plug-and-play** - works out of the box
- 📚 **Well-documented** - comprehensive usage examples

## Installation

```bash
pnpm add -D @rizzle/lint-configs
```

The package includes all necessary dependencies (ESLint, Prettier, typescript-eslint) so you don't need to install them separately unless you want to use them directly.

## Quick Start

### ESLint Setup

Create `eslint.config.js` in your project root:

```javascript
import { eslintConfig } from '@rizzle/lint-configs';

export default eslintConfig;
```

### Prettier Setup

Create `.prettierrc.js` in your project root:

```javascript
import { prettierConfig } from '@rizzle/lint-configs';

export default prettierConfig;
```

### Add Scripts to package.json

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

That's it! You're ready to go. 🚀

## Usage

### Method 1: Using Package Exports (Recommended)

Import configurations from the package:

**ESLint (`eslint.config.js`):**

```javascript
import { eslintConfig } from '@rizzle/lint-configs';

export default eslintConfig;
```

**Prettier (`.prettierrc.js`):**

```javascript
import { prettierConfig } from '@rizzle/lint-configs';

export default prettierConfig;
```

### Method 2: Using Direct Exports

Use the named exports for specific configs:

```javascript
// ESLint
import eslintConfig from '@rizzle/lint-configs/eslint';

export default eslintConfig;

// Prettier
import prettierConfig from '@rizzle/lint-configs/prettier';

export default prettierConfig;
```

### Method 3: Extend and Customize

You can extend the base configs with your own rules:

**ESLint:**

```javascript
import { eslintConfig } from '@rizzle/lint-configs';

export default [
  ...eslintConfig,
  {
    rules: {
      'no-console': 'off', // Your custom rules
    },
  },
];
```

**Prettier:**

```javascript
import { prettierConfig } from '@rizzle/lint-configs';

export default {
  ...prettierConfig,
  printWidth: 120, // Your custom overrides
};
```

## Configuration Details

### ESLint Rules

The ESLint configuration includes:

- **Base configs**: `@eslint/js` recommended rules
- **TypeScript**: Full typescript-eslint recommended & stylistic rules
- **Prettier integration**: Disables conflicting ESLint rules via `eslint-config-prettier`
- **Import sorting**: Automatic import organization with `eslint-plugin-simple-import-sort`
- **Import validation**: Import statement validation with `eslint-plugin-import`

**Key Rules:**

- ✅ Enforced consistent type imports (`type { ... }`)
- ✅ Automatic import sorting and grouping
- ✅ Import validation (no duplicates, first import, newline after)
- ✅ Unused variable warnings (with `_` prefix ignore pattern)
- ✅ Strict equality checks (`===`)
- ✅ Prefer `const` over `let`
- ✅ Template literals over string concatenation
- ✅ Arrow functions and modern ES6+ syntax
- ⚠️ Console warnings (allows `warn`, `error`, `info`)
- ⚠️ Any type warnings (not errors)

### Prettier Rules

- **Print width:** 100 characters
- **Indentation:** 2 spaces
- **Quotes:** Single quotes (except JSX)
- **Semicolons:** Required
- **Trailing commas:** ES5 style
- **Line endings:** LF (Unix)
- **Special overrides:**
  - JSON files: 80 character width
  - Markdown files: 80 character width, always wrap prose

### Ignored Patterns

The following directories are automatically ignored:

- `node_modules`
- `dist`, `build`
- `.turbo`
- `coverage`
- `.next`
- `.expo`, `.expo-shared`

## Advanced Usage

### React Native Projects

For React Native projects, use the React Native preset:

```javascript
// eslint.config.js
import { reactNativeConfig } from '@rizzle/lint-configs';

export default reactNativeConfig;
```

**What's included in React Native preset:**
- All base TypeScript rules
- Custom import grouping for React Native projects
- React & React Native specific rules
- Console errors (not warnings)
- Test file configurations

**Additional peer dependencies needed:**
```bash
pnpm add -D eslint-plugin-react eslint-plugin-react-native eslint-plugin-testing-library
```

### Monorepo Setup

For monorepos, install at the root and reference in each workspace:

```javascript
// apps/web/eslint.config.js
import { eslintConfig } from '@rizzle/lint-configs';

export default eslintConfig;

// Or extend with workspace-specific rules
import { eslintConfig } from '@rizzle/lint-configs';

export default [
  ...eslintConfig,
  {
    rules: {
      // Workspace-specific rules
    },
  },
];
```

### VS Code Integration

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

### CI/CD Integration

**GitHub Actions:**

```yaml
name: Lint

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm format:check
```

## Package Structure

```
@rizzle/lint-configs/
├── dist/
│   ├── cjs/           # CommonJS builds
│   ├── esm/           # ESM builds
│   └── types/         # TypeScript declarations
├── .eslintrc.js       # ESLint flat config
├── .prettierrc.js     # Prettier config
└── README.md
```

## Requirements

- **Node.js:** >= 18
- **TypeScript:** >= 5.0
- **ESLint:** >= 9.0
- **Prettier:** >= 3.0

## Peer Dependencies

The package will work out of the box, but if you need to use ESLint, Prettier, or TypeScript directly in your project, install them as dev dependencies:

```bash
pnpm add -D eslint@^9.0.0 prettier@^3.0.0 typescript@^5.0.0
```

## Included Dependencies

This package includes the following dependencies, so you don't need to install them separately:

- `@eslint/js` ^9.17.0
- `eslint` ^9.17.0
- `eslint-config-prettier` ^9.1.0
- `prettier` ^3.4.2
- `typescript-eslint` ^8.18.1

## Troubleshooting

### ESLint can't find tsconfig.json

Ensure your `tsconfig.json` is in the project root. If it's in a different location, update the parser options:

```javascript
import { eslintConfig } from '@rizzle/lint-configs';

export default eslintConfig.map(config => {
  if (config.languageOptions?.parserOptions) {
    return {
      ...config,
      languageOptions: {
        ...config.languageOptions,
        parserOptions: {
          ...config.languageOptions.parserOptions,
          project: './path/to/tsconfig.json',
        },
      },
    };
  }
  return config;
});
```

### Import.meta warning in CJS

This is expected. The `import.meta.dirname` is used in the ESM build for TypeScript project detection. The CommonJS build will use a fallback. This doesn't affect functionality.

### Prettier and ESLint conflicts

The package includes `eslint-config-prettier` to disable conflicting rules. If you still see conflicts, ensure you're not adding conflicting rules in your custom config.

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Watch mode
pnpm dev

# Clean build artifacts
pnpm clean
```

## Documentation

- [USAGE.md](./USAGE.md) - Comprehensive usage examples
- [Contributing Guidelines](#contributing)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Rizzle

## Related Links

- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [typescript-eslint](https://typescript-eslint.io/)
- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files)

---

Made with ❤️ for the TypeScript community
