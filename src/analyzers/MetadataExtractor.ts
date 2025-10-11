/**
 * MetadataExtractor - Extracts metadata from source files
 * Updated to use configurable environment patterns instead of hard-coded checks
 */

import * as path from 'path';
import { 
  FeatureMetadata, 
  ExportInfo, 
  PropDefinition, 
  ComplexityMetrics,
  FileCategory,
  Dependencies,
  EnvironmentPattern,
  MigrationRule
} from '../types/index.js';

export class MetadataExtractor {
  private environmentPatterns: EnvironmentPattern[];
  private customMigrationRules: MigrationRule[];

  constructor(
    environmentPatterns: EnvironmentPattern[] = [],
    customMigrationRules: MigrationRule[] = []
  ) {
    this.environmentPatterns = environmentPatterns;
    this.customMigrationRules = customMigrationRules;
  }

  extractMetadata(
    fileContent: string, 
    filePath: string, 
    category: FileCategory,
    dependencies: Dependencies
  ): FeatureMetadata {
    const name = this.extractName(filePath);
    const exports = this.extractExports(fileContent);
    const props = this.extractComponentProps(fileContent);
    const description = this.inferDescription(fileContent, filePath, category);
    const complexity = this.calculateComplexity(fileContent, dependencies);
    const migrationNotes = this.generateMigrationNotes(fileContent, filePath, dependencies);

    return {
      name,
      filePath,
      category,
      exports,
      description,
      props,
      complexity,
      migrationNotes
    };
  }

  private extractName(filePath: string): string {
    const basename = path.basename(filePath, path.extname(filePath));
    // Convert kebab-case or snake_case to PascalCase
    return basename
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  extractExports(fileContent: string): ExportInfo[] {
    const exports: ExportInfo[] = [];

    // Default exports
    const defaultExportRegex = /export\s+default\s+(function|class|const)?\s*(\w+)?/g;
    let match;
    while ((match = defaultExportRegex.exec(fileContent)) !== null) {
      exports.push({
        name: match[2] || 'default',
        type: 'default',
        kind: (match[1] as any) || 'const'
      });
    }

    // Named exports
    const namedExportRegex = /export\s+(const|function|class|interface|type)\s+(\w+)/g;
    while ((match = namedExportRegex.exec(fileContent)) !== null) {
      exports.push({
        name: match[2],
        type: 'named',
        kind: match[1] as any
      });
    }

    // Export statements
    const exportStatementRegex = /export\s+\{([^}]+)\}/g;
    while ((match = exportStatementRegex.exec(fileContent)) !== null) {
      const names = match[1].split(',').map(s => s.trim());
      for (const name of names) {
        const cleanName = name.split(' as ')[0].trim();
        exports.push({
          name: cleanName,
          type: 'named',
          kind: 'const'
        });
      }
    }

    return exports;
  }

  extractComponentProps(fileContent: string): PropDefinition[] | undefined {
    const props: PropDefinition[] = [];

    // Look for interface or type definitions that might be props
    const propsInterfaceRegex = /(?:interface|type)\s+(\w+Props)\s*\{([^}]+)\}/g;
    let match;

    while ((match = propsInterfaceRegex.exec(fileContent)) !== null) {
      const propsBody = match[2];
      const propLines = propsBody.split('\n');

      for (const line of propLines) {
        const propMatch = line.match(/(\w+)(\?)?:\s*([^;]+)/);
        if (propMatch) {
          props.push({
            name: propMatch[1],
            type: propMatch[3].trim(),
            required: !propMatch[2],
            description: this.extractPropDescription(line)
          });
        }
      }
    }

    return props.length > 0 ? props : undefined;
  }

  private extractPropDescription(line: string): string | undefined {
    const commentMatch = line.match(/\/\*\*?\s*([^*]+)\*\//);
    return commentMatch ? commentMatch[1].trim() : undefined;
  }

  inferDescription(fileContent: string, filePath: string, category: FileCategory): string {
    // Try to extract from JSDoc comment at the top
    const jsdocMatch = fileContent.match(/\/\*\*\s*\n\s*\*\s*([^\n]+)/);
    if (jsdocMatch) {
      return jsdocMatch[1].trim();
    }

    // Try to extract from single-line comment at the top
    const commentMatch = fileContent.match(/^\/\/\s*(.+)/m);
    if (commentMatch) {
      return commentMatch[1].trim();
    }

    // Generate description based on file name and category
    const name = this.extractName(filePath);
    
    switch (category) {
      case 'page':
        return `${name} page component for the application`;
      case 'component':
        return `${name} UI component`;
      case 'hook':
        return `Custom React hook: ${name}`;
      case 'service':
        return `${name} service for API interactions`;
      case 'utility':
        return `Utility functions for ${name}`;
      case 'type':
        return `Type definitions for ${name}`;
      case 'config':
        return `Configuration for ${name}`;
      case 'context':
        return `React Context: ${name}`;
      case 'server':
        return `Server module: ${name}`;
      default:
        return `${name} module`;
    }
  }

  calculateComplexity(fileContent: string, dependencies: Dependencies): ComplexityMetrics {
    const lines = fileContent.split('\n');
    const linesOfCode = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && !trimmed.startsWith('//') && !trimmed.startsWith('/*');
    }).length;

    const dependencyCount = dependencies.internal.length + dependencies.external.length;

    return {
      linesOfCode,
      dependencies: dependencyCount
    };
  }

  // UPDATED: Use configurable environment patterns instead of hard-coded checks
  generateMigrationNotes(fileContent: string, filePath: string, dependencies: Dependencies): string[] {
    const notes: string[] = [];

    // Check for environment-specific code using configurable patterns
    for (const pattern of this.environmentPatterns) {
      const regex = typeof pattern.pattern === 'string' 
        ? new RegExp(pattern.pattern) 
        : pattern.pattern;
      
      if (regex.test(fileContent)) {
        notes.push(pattern.message);
      }
    }

    // Apply custom migration rules
    for (const rule of this.customMigrationRules) {
      const regex = typeof rule.pattern === 'string'
        ? new RegExp(rule.pattern)
        : rule.pattern;
      
      if (regex.test(fileContent)) {
        notes.push(`${rule.message} - ${rule.recommendation}`);
      }
    }

    // Check for external service integrations (generic approach)
    const externalServices = ['google-cloud', 'anthropic', 'ollama', 'aws', 'azure', 'firebase'];
    for (const service of externalServices) {
      if (dependencies.external.some(dep => dep.package.includes(service))) {
        notes.push(`Integrates with external service: ${service}`);
      }
    }

    // Check for database operations
    if (fileContent.includes('drizzle') || fileContent.includes('sql') || fileContent.includes('prisma')) {
      notes.push('Contains database operations - ensure schema compatibility');
    }

    // Check for session management
    if (fileContent.includes('express-session') || fileContent.includes('req.session')) {
      notes.push('Uses session management - verify session store configuration');
    }

    // Check for file system operations
    if (fileContent.includes('fs.') || fileContent.includes('readFile') || fileContent.includes('writeFile')) {
      notes.push('Performs file system operations - ensure proper permissions');
    }

    // Check for WebSocket usage
    if (fileContent.includes('WebSocket') || fileContent.includes('ws')) {
      notes.push('Uses WebSocket connections - verify server configuration');
    }

    // Check for complex state management
    const stateManagementLibs = ['@tanstack/react-query', 'redux', 'zustand', 'jotai', 'recoil'];
    for (const lib of stateManagementLibs) {
      if (dependencies.external.some(dep => dep.package === lib)) {
        notes.push(`Uses ${lib} for state management`);
      }
    }

    // Check for authentication
    if (fileContent.includes('bcrypt') || fileContent.includes('passport') || fileContent.includes('jwt')) {
      notes.push('Handles authentication - ensure security best practices');
    }

    // Check for high complexity
    const loc = fileContent.split('\n').length;
    if (loc > 500) {
      notes.push(`Large file (${loc} lines) - consider refactoring into smaller modules`);
    }

    // Check for tight coupling
    if (dependencies.internal.length > 10) {
      notes.push(`High number of internal dependencies (${dependencies.internal.length}) - may be tightly coupled`);
    }

    return notes;
  }
}
