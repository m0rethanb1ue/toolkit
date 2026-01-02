# Publishing @rizzle/lint-configs to npm

This guide covers how to publish the package to npm.

## Prerequisites

1. **npm Account**: Create an account at [npmjs.com](https://www.npmjs.com/)
2. **npm Login**: Login via CLI
   ```bash
   npm login
   ```

3. **Organization (Optional)**: If using scoped package `@rizzle/`, create an organization at npmjs.com

## Publishing Methods

### Method 1: Using Changesets (Recommended for Monorepo)

The monorepo uses `@changesets/cli` for version management.

#### 1. Create a Changeset

```bash
cd toolkit
pnpm changeset
```

This will prompt you to:
- Select packages that changed
- Select version bump type (patch/minor/major)
- Describe the changes

#### 2. Version the Package

```bash
pnpm version
```

This updates version numbers and changelogs based on changesets.

#### 3. Build and Publish

```bash
pnpm release
```

This runs:
- `turbo build` - Builds all packages
- `changeset publish` - Publishes to npm

### Method 2: Manual Publishing

#### 1. Update Version

Edit `package.json`:
```json
{
  "version": "0.0.2"
}
```

Follow [Semantic Versioning](https://semver.org/):
- **Patch** (0.0.x): Bug fixes
- **Minor** (0.x.0): New features (backward compatible)
- **Major** (x.0.0): Breaking changes

#### 2. Build the Package

```bash
cd toolkit/packages/lint-configs
pnpm build
pnpm test
```

#### 3. Publish to npm

**Public package:**
```bash
npm publish --access public
```

**Private package (requires paid npm account):**
```bash
npm publish
```

## Pre-publish Checklist

- [ ] All tests passing (`pnpm test`)
- [ ] Package builds successfully (`pnpm build`)
- [ ] Version number updated
- [ ] CHANGELOG updated
- [ ] README is up to date
- [ ] Repository URLs are correct in package.json
- [ ] License file exists
- [ ] .npmignore is correct (source files excluded)

## Publishing Workflow

### For New Features

1. Create a changeset:
   ```bash
   pnpm changeset
   ```
   Select: `minor` version bump

2. Commit the changeset:
   ```bash
   git add .changeset/
   git commit -m "chore: add changeset for new feature"
   ```

3. When ready to release:
   ```bash
   pnpm version    # Updates versions
   pnpm release    # Publishes to npm
   ```

### For Bug Fixes

1. Create a changeset:
   ```bash
   pnpm changeset
   ```
   Select: `patch` version bump

2. Follow same commit and release process

### For Breaking Changes

1. Create a changeset:
   ```bash
   pnpm changeset
   ```
   Select: `major` version bump

2. Update migration guides if needed
3. Follow same commit and release process

## Scoped Package Configuration

If publishing as `@rizzle/lint-configs`, ensure your npm account has access to the `@rizzle` organization.

### Create Organization

1. Go to [npmjs.com](https://www.npmjs.com/)
2. Click "Add Organization"
3. Create organization with name `rizzle`

### Publish Scoped Package

```bash
npm publish --access public
```

The `--access public` flag is required for scoped packages to be publicly available.

## Automated Publishing (CI/CD)

### GitHub Actions Example

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  push:
    branches:
      - main

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 10

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - run: pnpm build

      - run: pnpm test

      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1
        with:
          publish: pnpm release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Setup Secrets

Add to GitHub repository secrets:
- `NPM_TOKEN`: Get from [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens)

## Verifying Published Package

After publishing:

```bash
# View on npm
npm view @rizzle/lint-configs

# Install in a test project
npm install -D @rizzle/lint-configs

# Check installed version
npm list @rizzle/lint-configs
```

## Unpublishing (Emergency Only)

If you need to unpublish (within 72 hours of publishing):

```bash
npm unpublish @rizzle/lint-configs@version
```

**Warning**: Unpublishing is not recommended. Consider deprecating instead:

```bash
npm deprecate @rizzle/lint-configs@version "Reason for deprecation"
```

## Troubleshooting

### "You do not have permission to publish"

- Ensure you're logged in: `npm whoami`
- Check organization membership
- Verify package name isn't taken

### "Package name too similar to existing package"

- Choose a more unique name
- Use scoped package: `@yourorg/package-name`

### "prepublishOnly script failed"

- Run `pnpm build` locally
- Run `pnpm test` locally
- Fix any errors before publishing

## Quick Reference

```bash
# Create changeset
pnpm changeset

# Version packages
pnpm version

# Build and publish
pnpm release

# Or manual publish
cd toolkit/packages/lint-configs
npm publish --access public
```

## Version History

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.
