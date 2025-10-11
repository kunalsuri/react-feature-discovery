/**
 * FileScanner - Scans and categorizes files in the codebase
 * Updated to use configurable category rules
 */

import * as fs from 'fs';
import * as path from 'path';
import { FileEntry, FileCategory, ToolConfig, CategoryRule } from '../types/index.js';
import { applyCategoryRules, defaultCategoryRules } from '../config/categoryRules.js';

export class FileScanner {
  private config: ToolConfig;
  private categoryRules: CategoryRule[];
  private errors: string[] = [];

  constructor(config: ToolConfig) {
    this.config = config;
    
    // Merge custom category rules with defaults
    this.categoryRules = this.mergeCategoryRules();
  }

  private mergeCategoryRules(): CategoryRule[] {
    const rules = [...defaultCategoryRules];
    
    // Add custom category rules if provided
    if (this.config.customCategories) {
      for (const [name, rule] of Object.entries(this.config.customCategories)) {
        rules.push(rule);
      }
    }
    
    return rules;
  }

  async scanDirectory(): Promise<FileEntry[]> {
    const files: FileEntry[] = [];
    await this.traverseDirectory(this.config.rootDir, files);
    return files;
  }

  private async traverseDirectory(dir: string, files: FileEntry[]): Promise<void> {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(this.config.rootDir, fullPath);

        // Skip excluded directories
        if (entry.isDirectory()) {
          if (this.shouldExcludeDirectory(entry.name, relativePath)) {
            continue;
          }
          await this.traverseDirectory(fullPath, files);
        } else if (entry.isFile()) {
          if (this.shouldIncludeFile(entry.name)) {
            const fileEntry = this.createFileEntry(fullPath, relativePath, entry.name);
            files.push(fileEntry);
          }
        }
      }
    } catch (error: any) {
      this.errors.push(`Error scanning directory ${dir}: ${error.message}`);
    }
  }

  private shouldExcludeDirectory(name: string, relativePath: string): boolean {
    // Check if directory name is in exclude list
    if (this.config.excludeDirs.includes(name)) {
      return true;
    }
    
    // Check if any part of the path matches exclude patterns
    const pathParts = relativePath.split(path.sep);
    return pathParts.some(part => this.config.excludeDirs.includes(part));
  }

  private shouldIncludeFile(name: string): boolean {
    const ext = path.extname(name);
    
    // Support both TypeScript and JavaScript files
    return ['.ts', '.tsx', '.js', '.jsx'].includes(ext);
  }

  private createFileEntry(fullPath: string, relativePath: string, name: string): FileEntry {
    const stats = fs.statSync(fullPath);
    const extension = path.extname(name);
    const category = this.categorizeFile(relativePath, name);

    return {
      path: fullPath,
      relativePath,
      name,
      extension,
      size: stats.size,
      category: category as FileCategory
    };
  }

  // UPDATED: Use configurable category rules
  categorizeFile(relativePath: string, fileName: string): string {
    return applyCategoryRules(relativePath, fileName, this.categoryRules);
  }

  getErrors(): string[] {
    return this.errors;
  }
}
