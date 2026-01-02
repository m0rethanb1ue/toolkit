/**
 * @rizzle/lint-configs
 * Plug-and-play lint configurations for TypeScript projects
 */

// Base configurations
export { eslintConfig, default as eslint } from './eslint.config.js';
export { prettierConfig, default as prettier } from './prettier.config.js';

// Presets
export { reactNativeConfig, default as reactNative } from './react-native.config.js';
