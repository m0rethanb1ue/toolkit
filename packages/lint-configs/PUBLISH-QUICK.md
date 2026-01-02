# Quick Publish Guide

## First Time Setup

1. **Login to npm**
   ```bash
   npm login
   ```

2. **Verify login**
   ```bash
   npm whoami
   ```

3. **Update repository URLs** (if needed)
   Edit `toolkit/packages/lint-configs/package.json`:
   ```json
   "repository": {
     "url": "https://github.com/YOUR_USERNAME/YOUR_REPO.git"
   }
   ```

## Publishing Workflow

### Option 1: Using Changesets (Recommended)

```bash
# 1. Navigate to monorepo root
cd toolkit

# 2. Create a changeset (describes changes)
pnpm changeset
# Select: @rizzle/lint-configs
# Choose: patch (0.0.x), minor (0.x.0), or major (x.0.0)
# Describe your changes

# 3. Build everything
pnpm build

# 4. Version and publish
pnpm version    # Updates version numbers
pnpm release    # Publishes to npm
```

### Option 2: Manual Publish

```bash
# 1. Navigate to package
cd toolkit/packages/lint-configs

# 2. Update version in package.json
# "version": "0.0.2"

# 3. Build and test
pnpm build
pnpm test

# 4. Publish to npm
npm publish --access public
```

## Version Bumping Guide

- **Patch** (0.0.x): Bug fixes, documentation
  ```bash
  pnpm changeset  # Select 'patch'
  ```

- **Minor** (0.x.0): New features (backward compatible)
  ```bash
  pnpm changeset  # Select 'minor'
  ```

- **Major** (x.0.0): Breaking changes
  ```bash
  pnpm changeset  # Select 'major'
  ```

## What Gets Published

✅ **Included:**
- `dist/` - Built files (CJS, ESM, types)
- `README.md` - Documentation
- `LICENSE` - License file
- `package.json` - Package manifest

❌ **Excluded** (via .npmignore):
- `src/` - Source files
- `scripts/` - Build scripts
- `tsconfig.json` - TypeScript config
- `*.tsbuildinfo` - Build artifacts
- `node_modules/` - Dependencies

## Quick Commands

```bash
# Check what will be published
npm pack --dry-run

# View published package info
npm view @rizzle/lint-configs

# Install your published package
npm install -D @rizzle/lint-configs

# Unpublish (within 72h, emergency only)
npm unpublish @rizzle/lint-configs@version
```

## Pre-publish Checklist

- [ ] Tests pass: `pnpm test`
- [ ] Builds successfully: `pnpm build`
- [ ] Version updated
- [ ] CHANGELOG updated (if using manual publish)
- [ ] README is current
- [ ] Logged into npm: `npm whoami`

## First Publish

```bash
cd toolkit

# Build everything
pnpm build

# Create initial changeset
pnpm changeset
# Select: @rizzle/lint-configs
# Choose: patch
# Message: "Initial release"

# Version
pnpm version

# Publish (will prompt for 2FA if enabled)
pnpm release
```

## Troubleshooting

**"You must be logged in"**
```bash
npm login
```

**"Package name taken"**
- Use scoped name: `@your-org/lint-configs`
- Or choose different name

**"Need permission to publish"**
- Ensure you own the npm organization
- Or publish without scope

**Build fails**
```bash
cd toolkit/packages/lint-configs
pnpm clean
pnpm build
```

## After Publishing

Verify it worked:
```bash
npm view @rizzle/lint-configs
```

Install in a test project:
```bash
mkdir test-install
cd test-install
npm init -y
npm install -D @rizzle/lint-configs
```

## See Also

- [PUBLISHING.md](./PUBLISHING.md) - Detailed publishing guide
- [README.md](./README.md) - Package documentation
- [package.json](./package.json) - Package configuration
