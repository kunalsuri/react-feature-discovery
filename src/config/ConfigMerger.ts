/**
 * ConfigMerger - Merges configuration from multiple sources
 * Priority: CLI args > config file > defaults
 */

import { ToolConfig, PartialToolConfig } from '../types/config.js';

export class ConfigMerger {
  /**
   * Merge configurations with priority: CLI > config file > defaults
   * @param defaults Default configuration
   * @param fileConfig Configuration from file
   * @param cliConfig Configuration from CLI arguments
   * @returns Merged configuration
   */
  merge(
    defaults: ToolConfig,
    fileConfig: PartialToolConfig = {},
    cliConfig: PartialToolConfig = {}
  ): ToolConfig {
    // Start with defaults
    const merged: ToolConfig = { ...defaults };

    // Merge file config
    this.mergeInto(merged, fileConfig);

    // Merge CLI config (highest priority)
    this.mergeInto(merged, cliConfig);

    return merged;
  }

  /**
   * Merge source config into target config
   * @param target Target configuration object
   * @param source Source configuration object
   */
  private mergeInto(target: ToolConfig, source: PartialToolConfig): void {
    for (const key in source) {
      const value = source[key as keyof PartialToolConfig];
      
      if (value === undefined) {
        continue;
      }

      // Handle arrays - replace instead of merge
      if (Array.isArray(value)) {
        (target as any)[key] = [...value];
      }
      // Handle objects - deep merge
      else if (typeof value === 'object' && value !== null && !this.isRegExp(value)) {
        if (typeof (target as any)[key] === 'object' && (target as any)[key] !== null) {
          (target as any)[key] = { ...(target as any)[key], ...value };
        } else {
          (target as any)[key] = { ...value };
        }
      }
      // Handle primitives and RegExp - direct assignment
      else {
        (target as any)[key] = value;
      }
    }
  }

  /**
   * Check if value is a RegExp
   * @param value Value to check
   * @returns True if value is RegExp
   */
  private isRegExp(value: any): boolean {
    return value instanceof RegExp;
  }

  /**
   * Merge array values with deduplication
   * @param target Target array
   * @param source Source array
   * @returns Merged array
   */
  private mergeArrays<T>(target: T[], source: T[]): T[] {
    const merged = [...target];
    
    for (const item of source) {
      if (!merged.includes(item)) {
        merged.push(item);
      }
    }
    
    return merged;
  }
}
