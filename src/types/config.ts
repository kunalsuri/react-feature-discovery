/**
 * Configuration types for React Feature Discovery tool
 */

export interface CategoryRule {
  pattern: string | RegExp;
  category: FileCategory;
  priority: number;
  description?: string;
}

export interface EnvironmentPattern {
  name: string;
  pattern: string | RegExp;
  message: string;
  severity?: 'info' | 'warning' | 'error';
}

export interface MigrationRule {
  name: string;
  pattern: string | RegExp;
  message: string;
  recommendation: string;
}

export type FileCategory = 
  | 'page' 
  | 'component' 
  | 'service' 
  | 'hook' 
  | 'utility' 
  | 'type' 
  | 'config'
  | 'context'
  | 'server'
  | 'module';

export interface ToolConfig {
  // File scanning
  rootDir: string;
  excludeDirs: string[];
  filePatterns: string[];
  
  // Categorization
  customCategories?: Record<string, CategoryRule>;
  moduleTypes?: string[];
  
  // Analysis
  detectReactPatterns: boolean;
  detectHooks: boolean;
  detectContexts: boolean;
  detectHOCs: boolean;
  
  // Full-stack support
  clientDirs: string[];
  serverDirs: string[];
  
  // Output
  outputPath: string;
  outputFormats: ('markdown' | 'json' | 'html')[];
  
  // Performance
  parallel: boolean;
  cacheEnabled: boolean;
  cacheDir: string;
  
  // Migration notes
  environmentPatterns: EnvironmentPattern[];
  customMigrationRules: MigrationRule[];
}

export type PartialToolConfig = Partial<ToolConfig>;
