#!/usr/bin/env node

/**
 * CLI entry point for React Feature Discovery tool
 */

import { ConfigLoader, ConfigValidator, ConfigMerger, defaultConfig } from './config/index.js';
import { AnalysisEngine } from './core/AnalysisEngine.js';
import { PartialToolConfig } from './types/index.js';
import { SafetyValidator } from './utils/SafetyValidator.js';

async function main() {
  const args = process.argv.slice(2);
  
  // Show help
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }
  
  // Show version
  if (args.includes('--version') || args.includes('-v')) {
    console.log('react-feature-discovery v0.1.0');
    process.exit(0);
  }

  try {
    // Validate environment safety
    const envValidation = SafetyValidator.validateEnvironment();
    if (envValidation.warnings.length > 0) {
      for (const warning of envValidation.warnings) {
        console.warn(warning);
      }
    }
    // Parse CLI arguments
    const { config: configPath, ...cliConfig } = parseCLIArgs(args) as any;
    
    // Load configuration
    const configLoader = new ConfigLoader();
    const fileConfig = await configLoader.loadFromFile(configPath);
    
    // Merge configurations
    const configMerger = new ConfigMerger();
    const mergedConfig = configMerger.merge(defaultConfig, fileConfig, cliConfig);
    
    // Validate configuration
    const validator = new ConfigValidator();
    if (!validator.validate(mergedConfig)) {
      console.error(validator.getErrorMessage());
      process.exit(1);
    }
    
    // Validate safety
    const safetyValidation = SafetyValidator.validateConfig(mergedConfig);
    if (!safetyValidation.valid) {
      console.error('❌ Safety validation failed:');
      for (const error of safetyValidation.errors) {
        console.error(`   - ${error}`);
      }
      process.exit(1);
    }
    
    // Run analysis
    const engine = new AnalysisEngine(mergedConfig);
    await engine.analyze();
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

export function parseCLIArgs(args: string[]): PartialToolConfig {
  const config: PartialToolConfig = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--root':
      case '-r':
        config.rootDir = args[++i];
        break;
      case '--output':
      case '-o':
        config.outputPath = args[++i];
        break;
      case '--format':
      case '-f':
        config.outputFormats = args[++i].split(',') as any;
        break;
      case '--config':
      case '-c':
        (config as any).config = args[++i];
        break;
      case '--no-cache':
        config.cacheEnabled = false;
        break;
      case '--no-parallel':
        config.parallel = false;
        break;
    }
  }
  
  return config;
}

export function showHelp() {
  console.log(`
React Feature Discovery Tool

Analyze React codebases (TypeScript/JavaScript) to generate comprehensive 
feature catalogs with dependency graphs and migration guidance.

Usage: rfd [options]

Options:
  -r, --root <path>       Root directory to analyze (default: current directory)
  -o, --output <path>     Output file path (default: feature-catalog.md)
  -f, --format <formats>  Output formats: markdown,json,html (default: markdown)
  -c, --config <path>     Path to config file
  --no-cache              Disable caching
  --no-parallel           Disable parallel processing
  -v, --version           Show version
  -h, --help              Show this help message

Examples:
  rfd                                    # Analyze current directory
  rfd --root ./src --output docs/features.md
  rfd --format markdown,json,html
  rfd --config .rfdrc.json

Config Files:
  .rfdrc.json, .rfdrc.js, rfd.config.json, rfd.config.js
  Or add "rfd" field to package.json

Documentation:
  https://github.com/kunalsuri/react-feature-discovery
  `);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
