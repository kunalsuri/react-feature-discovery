/**
 * FileScanner - Scans and categorizes files in the codebase
 * M8: Category rules are sorted once during construction, not per-file invocation.
 * L4: Directory traversal uses fs.promises (async) instead of readdirSync.
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
    // M8: rules are sorted once here — not on every applyCategoryRules() call
    this.categoryRules = this.mergeCategoryRules();
  }

  private mergeCategoryRules(): CategoryRule[] {
    const rules = [...defaultCategoryRules];
    
    // Merge custom category rules if provided
    if (this.config.customCategories) {
      for (const [, rule] of Object.entries(this.config.customCategories)) {
        rules.push(rule);
      }
    }

    // M8: sort by priority (descending) once, here, not inside applyCategoryRules
    rules.sort((a, b) => b.priority - a.priority);
    return rules;
  }

  async scanDirectory(): Promise<FileEntry[]> {
    const files: FileEntry[] = [];
    await this.traverseDirectory(this.config.rootDir, files);
    return files;
  }

  // L4: async traversal using fs.promises.readdir
  private async traverseDirectory(dir: string, files: FileEntry[]): Promise<void> {
    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(this.config.rootDir, fullPath);

        if (entry.isDirectory()) {
          if (this.shouldExcludeDirectory(entry.name, relativePath)) {
            continue;
          }
          await this.traverseDirectory(fullPath, files);
        } else if (entry.isFile()) {
          if (this.shouldIncludeFile(entry.name)) {
            const fileEntry = await this.createFileEntry(fullPath, relativePath, entry.name);
            files.push(fileEntry);
          }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.errors.push(`Error scanning directory ${dir}: ${message}`);
    }
  }

  private shouldExcludeDirectory(name: string, relativePath: string): boolean {
    if (this.config.excludeDirs.includes(name)) {
      return true;
    }
    const pathParts = relativePath.split(path.sep);
    return pathParts.some(part => this.config.excludeDirs.includes(part));
  }

  private shouldIncludeFile(name: string): boolean {
    const ext = path.extname(name);
    return ['.ts', '.tsx', '.js', '.jsx'].includes(ext);
  }

  // L4: uses fs.promises.stat instead of statSync
  private async createFileEntry(fullPath: string, relativePath: string, name: string): Promise<FileEntry> {
    const stats = await fs.promises.stat(fullPath);
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

  // M8: passes the pre-sorted rules — no sort inside applyCategoryRules
  categorizeFile(relativePath: string, fileName: string): string {
    return applyCategoryRules(relativePath, fileName, this.categoryRules);
  }

  getErrors(): string[] {
    return this.errors;
  }
}
