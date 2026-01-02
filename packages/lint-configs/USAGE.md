# Usage Examples

## 1. ESLint Configuration

### Method 1: Basic Import (Recommended)

Create `eslint.config.js` in your project root:

```javascript
import { eslintConfig } from '@rizzle/lint-configs';

export default eslintConfig;
```

### Method 2: Import via Direct Export

```javascript
import eslintConfig from '@rizzle/lint-configs/eslint';

export default eslintConfig;
```

### Method 3: Import and Extend

```javascript
import { eslintConfig } from '@rizzle/lint-configs';

export default [
  ...eslintConfig,
  {
    // Your custom rules
    rules: {
      'no-console': 'off',
    },
  },
];
```

## 2. Prettier Configuration

### Method 1: Basic Import (Recommended)

Create `.prettierrc.js` in your project root:

```javascript
import { prettierConfig } from '@rizzle/lint-configs';

export default prettierConfig;
```

### Method 2: Import via Direct Export

```javascript
import prettierConfig from '@rizzle/lint-configs/prettier';

export default prettierConfig;
```

### Method 3: Import and Extend

```javascript
import { prettierConfig } from '@rizzle/lint-configs';

export default {
  ...prettierConfig,
  // Your custom overrides
  printWidth: 120,
  semi: false,
};
```

## 3. Complete Setup Example

### Installation

```bash
# Install the lint configs package
pnpm add -D @rizzle/lint-configs

# Peer dependencies (if not already installed)
pnpm add -D eslint@^9.0.0 prettier@^3.0.0 typescript@^5.0.0
```

### Project Structure

```
your-project/
├── eslint.config.js       # ESLint configuration
├── .prettierrc.js         # Prettier configuration
├── .prettierignore        # Prettier ignore patterns
├── tsconfig.json          # TypeScript configuration
├── package.json
└── src/
    └── index.ts
```

### eslint.config.js

```javascript
import { eslintConfig } from '@rizzle/lint-configs';

export default eslintConfig;
```

### .prettierrc.js

```javascript
import { prettierConfig } from '@rizzle/lint-configs';

export default prettierConfig;
```

### .prettierignore

```
node_modules
dist
build
.turbo
coverage
.next
.expo
.expo-shared
```

### package.json Scripts

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit"
  }
}
```

## 4. VS Code Integration

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

## 5. Monorepo Setup

For monorepos using pnpm workspaces:

### Root package.json

```json
{
  "name": "my-monorepo",
  "private": true,
  "devDependencies": {
    "@rizzle/lint-configs": "workspace:*",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Workspace Package

Each workspace can inherit the root config:

```javascript
// apps/web/eslint.config.js
import { eslintConfig } from '@rizzle/lint-configs';

export default eslintConfig;
```

Or extend with package-specific rules:

```javascript
// apps/web/eslint.config.js
import { eslintConfig } from '@rizzle/lint-configs';

export default [
  ...eslintConfig,
  {
    // Web app specific rules
    rules: {
      'no-console': 'off', // Allow console in development
    },
  },
];
```

## 6. CI/CD Integration

### GitHub Actions

```yaml
name: Lint and Format Check

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm format:check
      - run: pnpm typecheck
```

## 7. Troubleshooting

### ESLint can't find tsconfig.json

Make sure your `tsconfig.json` is in the project root or update the `parserOptions`:

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
          tsconfigRootDir: import.meta.dirname,
          project: './tsconfig.json',
        },
      },
    };
  }
  return config;
});
```

### Prettier and ESLint conflicts

The package includes `eslint-config-prettier` to disable conflicting ESLint rules. If you still experience conflicts, ensure you're not adding rules that conflict with Prettier in your custom config.
