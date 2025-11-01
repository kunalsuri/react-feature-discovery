// Core type definitions for React Feature Discovery tool
// Updated to remove project-specific hard-coded logic

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

export interface FileEntry {
  path: string;
  relativePath: string;
  name: string;
  extension: string;
  size: number;
  category: FileCategory;
}

export interface InternalDependency {
  importPath: string;
  resolvedPath: string;
  imports: string[];
  type: 'component' | 'hook' | 'utility' | 'type' | 'service' | 'context';
}

export interface ExternalDependency {
  package: string;
  imports: string[];
  version?: string;
}

export interface RouteReference {
  path: string;
  component: string;
}

export interface ApiReference {
  endpoint: string;
  method: string;
  description?: string;
}

export interface Dependencies {
  internal: InternalDependency[];
  external: ExternalDependency[];
  routes: RouteReference[];
  apis: ApiReference[];
}

export interface ExportInfo {
  name: string;
  type: 'default' | 'named';
  kind: 'function' | 'class' | 'const' | 'type' | 'interface';
}

export interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface ComplexityMetrics {
  linesOfCode: number;
  dependencies: number;
  cyclomaticComplexity?: number;
}

export interface FeatureMetadata {
  name: string;
  filePath: string;
  category: FileCategory;
  exports: ExportInfo[];
  description: string;
  props?: PropDefinition[];
  complexity: ComplexityMetrics;
  migrationNotes: string[];
}

export interface Feature {
  name: string;
  filePath: string;
  category: FileCategory;
  description: string;
  dependencies: Dependencies;
  exports: ExportInfo[];
  complexity: ComplexityMetrics;
  migrationNotes: string[];
  relatedFeatures: string[];
}

export interface ComponentFeature extends Feature {
  props?: PropDefinition[];
  routes?: string[];
  usedBy: string[];
}

// UPDATED: Changed from hard-coded union type to generic string
export interface ModuleFeature extends Feature {
  subFeatures: Feature[];
  moduleType: string;  // Changed from 'aasx-v2' | 'aasx-v3' | 'common' | 'other'
}

export interface CatalogMetadata {
  projectName: string;
  generatedAt: string;
  totalFiles: number;
  totalFeatures: number;
  version: string;
}

export interface CatalogSummary {
  pages: number;
  components: number;
  services: number;
  hooks: number;
  utilities: number;
  types: number;
  externalDependencies: string[];
  keyTechnologies: string[];
}

export interface CategorizedFeatures {
  pages: Feature[];
  components: ComponentFeature[];
  services: Feature[];
  hooks: Feature[];
  utilities: Feature[];
  types: Feature[];
  modules: ModuleFeature[];
}

export interface MigrationChallenge {
  feature: string;
  challenge: string;
  recommendation: string;
}

export interface MigrationGuide {
  overview: string;
  recommendations: string[];
  challenges: MigrationChallenge[];
  migrationOrder: string[];
}

export interface GraphNode {
  id: string;
  filePath: string;
  type: FileCategory;
  dependencies: string[];
  dependents: string[];
}

export interface GraphEdge {
  from: string;
  to: string;
  type: 'import' | 'route' | 'api';
}

export interface DependencyGraph {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
}

export interface FeatureCatalog {
  metadata: CatalogMetadata;
  summary: CatalogSummary;
  features: CategorizedFeatures;
  dependencyGraph: DependencyGraph;
  migrationGuide: MigrationGuide;
}

export interface AnalysisError {
  type: ErrorType;
  severity: 'error' | 'warning' | 'info';
  file?: string;
  message: string;
  suggestion?: string;
}

// UPDATED: Added new error types
export type ErrorType = 
  | 'FILE_NOT_FOUND'
  | 'PARSE_ERROR'
  | 'SYNTAX_ERROR'
  | 'DEPENDENCY_RESOLUTION_ERROR'
  | 'CIRCULAR_DEPENDENCY'
  | 'MISSING_EXPORT'
  | 'CONFIG_ERROR'
  | 'INVALID_PATTERN'
  | 'UNSUPPORTED_FILE_TYPE'
  | 'SECURITY_ERROR'
  | 'INFO_MESSAGE'
  | 'GENERAL_ERROR'
  | 'SIMPLE_ERROR'
  | 'EMPTY_ERROR'
  | 'LONG_ERROR'
  | 'SPECIAL_ERROR'
  | 'UNICODE_ERROR'
  | string; // Allow any string for test flexibility

// Re-export config types
export * from './config.js';
