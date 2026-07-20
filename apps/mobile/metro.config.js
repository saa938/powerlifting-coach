// Metro config for a monorepo: watch the workspace root so the shared @liftly/*
// packages (TypeScript source) are bundled, and resolve modules from both the
// app and the hoisted root node_modules. Wrapped with NativeWind.
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
// Keep hierarchical lookup so nested (React 19) copies resolve correctly.
config.resolver.disableHierarchicalLookup = false;

// The monorepo intentionally holds two React majors: 18 for the Next.js web app
// (root) and 19 for this Expo app. Force React to resolve to THIS app's copy so
// the native bundle never picks up the root's React 18. If a native build ever
// reports mismatched React/hooks, this is the first lever (see docs/mobile-status.md).
const path2 = require('path');
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  react: path2.resolve(projectRoot, 'node_modules/react'),
};

module.exports = withNativeWind(config, { input: './global.css' });
