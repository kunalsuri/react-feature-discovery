import * as fs from 'fs';
import * as path from 'path';
import { 
  Dependencies, 
  InternalDependency, 
  ExternalDependency, 
  RouteReference, 
  ApiReference,
  FileEntry,
  DependencyGraph,
  GraphNode,
  GraphEdge
} from '../types/index.js';

export class DependencyAnalyzer {
  private rootDir: string;
  private fileMap: Map<string, FileEntry>;

  constructor(rootDir: string, files: FileEntry[]) {
    this.rootDir = rootDir;
    this.fileMap = new Map(files.map(f => [f.relativePath, f]));
  }

  analyzeDependencies(fileContent: string, filePath: string): Dependencies {
    const internal: InternalDependency[] = [];
    const external: ExternalDependency[] = [];
    const routes: RouteReference[] = [];
    const apis: ApiReference[] = [];

    // Extract import statements
    const importRegex = /import\s+(?:(?:(\{[^}]+\})|(\*\s+as\s+\w+)|(\w+))\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(fileContent)) !== null) {
      const namedImports = match[1];
      const namespaceImport = match[2];
      const defaultImport = match[3];
      const importPath = match[4];

      const imports: string[] = [];
      if (namedImports) {
        // Extract named imports
        const names = namedImports.replace(/[{}]/g, '').split(',').map(s => s.trim());
        imports.push(...names);
      }
      if (namespaceImport) {
        imports.push(namespaceImport.trim());
      }
      if (defaultImport) {
        imports.push(defaultImport.trim());
      }

      if (this.isExternalDependency(importPath)) {
        external.push({
          package: this.getPackageName(importPath),
          imports
        });
      } else {
        const resolvedPath = this.resolveImportPath(importPath, filePath);
        if (resolvedPath) {
          internal.push({
            importPath,
            resolvedPath,
            imports,
            type: this.inferDependencyType(resolvedPath)
          });
        }
      }
    }

    // Extract route definitions
    if (filePath.includes('App.tsx') || filePath.includes('routes')) {
      const routeRegex = /<Route\s+path=["']([^"']+)["']\s+component=\{?(\w+)\}?/g;
      while ((match = routeRegex.exec(fileContent)) !== null) {
        routes.push({
          path: match[1],
          component: match[2]
        });
      }
    }

    // Extract API endpoints
    if (filePath.includes('routes.ts') || filePath.includes('api')) {
      const apiRegex = /app\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/g;
      while ((match = apiRegex.exec(fileContent)) !== null) {
        apis.push({
          endpoint: match[2],
          method: match[1].toUpperCase()
        });
      }
    }

    return { internal, external, routes, apis };
  }

  private isExternalDependency(importPath: string): boolean {
    return !importPath.startsWith('.') && !importPath.startsWith('@/') && !importPath.startsWith('@shared');
  }

  private getPackageName(importPath: string): string {
    // Handle scoped packages
    if (importPath.startsWith('@')) {
      const parts = importPath.split('/');
      return `${parts[0]}/${parts[1]}`;
    }
    return importPath.split('/')[0];
  }

  private resolveImportPath(importPath: string, fromFile: string): string | null {
    try {
      // Handle path aliases
      if (importPath.startsWith('@/')) {
        importPath = importPath.replace('@/', 'client/src/');
      } else if (importPath.startsWith('@shared')) {
        importPath = importPath.replace('@shared', 'shared');
      } else if (importPath.startsWith('.')) {
        // Resolve relative path
        const dir = path.dirname(fromFile);
        importPath = path.join(dir, importPath);
      }

      // Normalize path
      importPath = path.normalize(importPath);

      // Try to find the file with various extensions
      const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
      for (const ext of extensions) {
        const testPath = importPath + ext;
        if (this.fileMap.has(testPath)) {
          return testPath;
        }
      }

      return importPath;
    } catch (error) {
      return null;
    }
  }

  private inferDependencyType(filePath: string): 'component' | 'hook' | 'utility' | 'type' | 'service' {
    const lowerPath = filePath.toLowerCase();
    
    if (lowerPath.includes('hook') || path.basename(lowerPath).startsWith('use')) {
      return 'hook';
    }
    if (lowerPath.includes('service') || lowerPath.includes('api')) {
      return 'service';
    }
    if (lowerPath.includes('type') || lowerPath.includes('.types.')) {
      return 'type';
    }
    if (lowerPath.includes('util') || lowerPath.includes('lib') || lowerPath.includes('helper')) {
      return 'utility';
    }
    return 'component';
  }

  buildDependencyGraph(files: FileEntry[], allDependencies: Map<string, Dependencies>): DependencyGraph {
    const nodes = new Map<string, GraphNode>();
    const edges: GraphEdge[] = [];

    // Create nodes
    for (const file of files) {
      nodes.set(file.relativePath, {
        id: file.relativePath,
        filePath: file.relativePath,
        type: file.category,
        dependencies: [],
        dependents: []
      });
    }

    // Create edges and populate dependencies
    for (const [filePath, deps] of allDependencies.entries()) {
      const node = nodes.get(filePath);
      if (!node) continue;

      for (const internalDep of deps.internal) {
        if (nodes.has(internalDep.resolvedPath)) {
          node.dependencies.push(internalDep.resolvedPath);
          edges.push({
            from: filePath,
            to: internalDep.resolvedPath,
            type: 'import'
          });

          // Add to dependents
          const depNode = nodes.get(internalDep.resolvedPath);
          if (depNode) {
            depNode.dependents.push(filePath);
          }
        }
      }

      for (const route of deps.routes) {
        edges.push({
          from: filePath,
          to: route.component,
          type: 'route'
        });
      }
    }

    return { nodes, edges };
  }

  detectCircularDependencies(graph: DependencyGraph): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string, path: string[]): void => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);

      const node = graph.nodes.get(nodeId);
      if (node) {
        for (const depId of node.dependencies) {
          if (!visited.has(depId)) {
            dfs(depId, [...path]);
          } else if (recursionStack.has(depId)) {
            // Found a cycle
            const cycleStart = path.indexOf(depId);
            if (cycleStart !== -1) {
              cycles.push(path.slice(cycleStart));
            }
          }
        }
      }

      recursionStack.delete(nodeId);
    };

    for (const nodeId of graph.nodes.keys()) {
      if (!visited.has(nodeId)) {
        dfs(nodeId, []);
      }
    }

    return cycles;
  }
}
