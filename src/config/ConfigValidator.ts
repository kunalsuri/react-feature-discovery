/**
 * ConfigValidator - Validates configuration schema
 */

import { ToolConfig, PartialToolConfig, FileCategory } from '../types/config.js';

export class ConfigValidator {
  private errors: string[] = [];
  private warnings: string[] = [];

  /**
   * Validate configuration object
   * @param config Configuration to validate
   * @returns True if valid, false otherwise
   */
  validate(config: PartialToolConfig): boolean {
    this.errors = [];
    this.warnings = [];

    // Validate rootDir
    if (config.rootDir !== undefined) {
      if (typeof config.rootDir !== 'string') {
        this.errors.push('rootDir must be a string');
      }
    }

    // Validate excludeDirs
    if (config.excludeDirs !== undefined) {
      if (!Array.isArray(config.excludeDirs)) {
        this.errors.push('excludeDirs must be an array');
      } else if (!config.excludeDirs.every(d => typeof d === 'string')) {
        this.errors.push('excludeDirs must contain only strings');
      }
    }

    // Validate filePatterns
    if (config.filePatterns !== undefined) {
      if (!Array.isArray(config.filePatterns)) {
        this.errors.push('filePatterns must be an array');
      } else if (!config.filePatterns.every(p => typeof p === 'string')) {
        this.errors.push('filePatterns must contain only strings');
      }
    }

    // Validate moduleTypes
    if (config.moduleTypes !== undefined) {
      if (!Array.isArray(config.moduleTypes)) {
        this.errors.push('moduleTypes must be an array');
      } else if (!config.moduleTypes.every(t => typeof t === 'string')) {
        this.errors.push('moduleTypes must contain only strings');
      }
    }

    // Validate boolean flags
    const booleanFields = [
      'detectReactPatterns',
      'detectHooks',
      'detectContexts',
      'detectHOCs',
      'parallel',
      'cacheEnabled'
    ];

    for (const field of booleanFields) {
      if (config[field as keyof PartialToolConfig] !== undefined) {
        if (typeof config[field as keyof PartialToolConfig] !== 'boolean') {
          this.errors.push(`${field} must be a boolean`);
        }
      }
    }

    // Validate clientDirs and serverDirs
    if (config.clientDirs !== undefined) {
      if (!Array.isArray(config.clientDirs)) {
        this.errors.push('clientDirs must be an array');
      } else if (!config.clientDirs.every(d => typeof d === 'string')) {
        this.errors.push('clientDirs must contain only strings');
      }
    }

    if (config.serverDirs !== undefined) {
      if (!Array.isArray(config.serverDirs)) {
        this.errors.push('serverDirs must be an array');
      } else if (!config.serverDirs.every(d => typeof d === 'string')) {
        this.errors.push('serverDirs must contain only strings');
      }
    }

    // Validate outputPath
    if (config.outputPath !== undefined) {
      if (typeof config.outputPath !== 'string') {
        this.errors.push('outputPath must be a string');
      }
    }

    // Validate outputFormats
    if (config.outputFormats !== undefined) {
      if (!Array.isArray(config.outputFormats)) {
        this.errors.push('outputFormats must be an array');
      } else {
        const validFormats = ['markdown', 'json', 'html'];
        for (const format of config.outputFormats) {
          if (!validFormats.includes(format)) {
            this.errors.push(`Invalid output format: ${format}. Must be one of: ${validFormats.join(', ')}`);
          }
        }
      }
    }

    // Validate cacheDir
    if (config.cacheDir !== undefined) {
      if (typeof config.cacheDir !== 'string') {
        this.errors.push('cacheDir must be a string');
      }
    }

    // Validate environmentPatterns
    if (config.environmentPatterns !== undefined) {
      if (!Array.isArray(config.environmentPatterns)) {
        this.errors.push('environmentPatterns must be an array');
      } else {
        for (const pattern of config.environmentPatterns) {
          if (!pattern.name || typeof pattern.name !== 'string') {
            this.errors.push('Each environmentPattern must have a name (string)');
          }
          if (!pattern.pattern) {
            this.errors.push('Each environmentPattern must have a pattern');
          }
          if (!pattern.message || typeof pattern.message !== 'string') {
            this.errors.push('Each environmentPattern must have a message (string)');
          }
          if (pattern.severity && !['info', 'warning', 'error'].includes(pattern.severity)) {
            this.errors.push(`Invalid severity: ${pattern.severity}. Must be info, warning, or error`);
          }
        }
      }
    }

    // Validate customMigrationRules
    if (config.customMigrationRules !== undefined) {
      if (!Array.isArray(config.customMigrationRules)) {
        this.errors.push('customMigrationRules must be an array');
      } else {
        for (const rule of config.customMigrationRules) {
          if (!rule.name || typeof rule.name !== 'string') {
            this.errors.push('Each migrationRule must have a name (string)');
          }
          if (!rule.pattern) {
            this.errors.push('Each migrationRule must have a pattern');
          }
          if (!rule.message || typeof rule.message !== 'string') {
            this.errors.push('Each migrationRule must have a message (string)');
          }
          if (!rule.recommendation || typeof rule.recommendation !== 'string') {
            this.errors.push('Each migrationRule must have a recommendation (string)');
          }
        }
      }
    }

    return this.errors.length === 0;
  }

  /**
   * Get validation errors
   * @returns Array of error messages
   */
  getErrors(): string[] {
    return this.errors;
  }

  /**
   * Get validation warnings
   * @returns Array of warning messages
   */
  getWarnings(): string[] {
    return this.warnings;
  }

  /**
   * Get formatted error message
   * @returns Formatted error message string
   */
  getErrorMessage(): string {
    if (this.errors.length === 0) {
      return '';
    }

    return `Configuration validation failed:\n${this.errors.map(e => `  - ${e}`).join('\n')}`;
  }
}
