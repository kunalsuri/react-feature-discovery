/**
 * ConfigLoader - Loads configuration from multiple sources
 */

import * as fs from 'fs';
import * as path from 'path';
import { ToolConfig, PartialToolConfig } from '../types/config.js';
import { defaultConfig } from './defaults.js';

export class ConfigLoader {
  private configPaths = [
    '.rfdrc.json',
    '.rfdrc.js',
    'rfd.config.json',
    'rfd.config.js'
  ];

  /**
   * Load configuration from file system
   * @param configPath Optional explicit config file path
   * @param rootDir Root directory to search for config files
   * @returns Partial configuration object
   */
  async loadFromFile(configPath?: string, rootDir: string = process.cwd()): Promise<PartialToolConfig> {
    // If explicit path provided, use it
    if (configPath) {
      return this.loadConfigFile(configPath);
    }

    // Try to find config file in root directory
    for (const filename of this.configPaths) {
      const fullPath = path.join(rootDir, filename);
      if (fs.existsSync(fullPath)) {
        return this.loadConfigFile(fullPath);
      }
    }

    // Try to load from package.json
    const packageJsonPath = path.join(rootDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      if (packageJson.rfd || packageJson['react-feature-discovery']) {
        return packageJson.rfd || packageJson['react-feature-discovery'];
      }
    }

    // No config file found
    return {};
  }

  /**
   * Load a specific config file
   * @param filePath Path to config file
   * @returns Partial configuration object
   */
  private async loadConfigFile(filePath: string): Promise<PartialToolConfig> {
    const ext = path.extname(filePath);
    
    if (ext === '.json') {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } else if (ext === '.js') {
      // Dynamic import for ES modules
      const fileUrl = new URL(`file://${path.resolve(filePath)}`);
      const module = await import(fileUrl.href);
      return module.default || module;
    }

    throw new Error(`Unsupported config file format: ${ext}`);
  }

  /**
   * Load configuration from package.json
   * @param rootDir Root directory containing package.json
   * @returns Partial configuration object
   */
  loadFromPackageJson(rootDir: string = process.cwd()): PartialToolConfig {
    const packageJsonPath = path.join(rootDir, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      return {};
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      return packageJson.rfd || packageJson['react-feature-discovery'] || {};
    } catch (error) {
      console.warn(`Warning: Failed to parse package.json: ${error}`);
      return {};
    }
  }

  /**
   * Get default configuration
   * @returns Default configuration object
   */
  getDefaults(): ToolConfig {
    return { ...defaultConfig };
  }
}
