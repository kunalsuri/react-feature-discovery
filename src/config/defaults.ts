/**
 * Default configuration for React Feature Discovery tool
 */

import { ToolConfig, EnvironmentPattern } from '../types/config.js';

export const defaultEnvironmentPatterns: EnvironmentPattern[] = [
  {
    name: 'node-env',
    pattern: /process\.env\.NODE_ENV/,
    message: 'Uses NODE_ENV for environment detection',
    severity: 'info'
  },
  {
    name: 'env-vars',
    pattern: /process\.env\.\w+/,
    message: 'Uses environment variables',
    severity: 'info'
  },
  {
    name: 'platform-detection',
    pattern: /process\.platform/,
    message: 'Contains platform-specific code',
    severity: 'warning'
  }
];

export const defaultConfig: ToolConfig = {
  // File scanning
  rootDir: process.cwd(),
  excludeDirs: [
    'node_modules',
    'dist',
    'build',
    '.git',
    '.kiro',
    'coverage',
    '.next',
    '.cache',
    'public',
    'attached_assets',
    '.rfd-cache'
  ],
  filePatterns: [
    '**/*.ts',
    '**/*.tsx',
    '**/*.js',
    '**/*.jsx'
  ],
  
  // Categorization
  moduleTypes: ['common', 'shared', 'core', 'feature', 'other'],
  
  // Analysis
  detectReactPatterns: true,
  detectHooks: true,
  detectContexts: true,
  detectHOCs: true,
  
  // Full-stack support
  clientDirs: ['client', 'src', 'app', 'pages', 'components'],
  serverDirs: ['server', 'api', 'backend', 'routes', 'middleware'],
  
  // Output
  outputPath: 'feature-catalog.md',
  outputFormats: ['markdown'],
  
  // Performance
  parallel: true,
  cacheEnabled: true,
  cacheDir: '.rfd-cache',
  
  // Migration notes
  environmentPatterns: defaultEnvironmentPatterns,
  customMigrationRules: []
};
