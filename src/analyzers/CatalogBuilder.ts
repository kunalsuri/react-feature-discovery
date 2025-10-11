/**
 * CatalogBuilder - Builds feature catalog from analyzed data
 * Updated to use generic wording and configurable module types
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  FeatureCatalog,
  CatalogMetadata,
  CatalogSummary,
  CategorizedFeatures,
  Feature,
  ComponentFeature,
  ModuleFeature,
  MigrationGuide,
  MigrationChallenge,
  FeatureMetadata,
  Dependencies,
  DependencyGraph
} from '../types/index.js';

export class CatalogBuilder {
  private rootDir: string;
  private moduleTypes: string[];

  constructor(rootDir: string, moduleTypes: string[] = ['common', 'shared', 'core', 'feature', 'other']) {
    this.rootDir = rootDir;
    this.moduleTypes = moduleTypes;
  }

  buildCatalog(
    allMetadata: FeatureMetadata[],
    allDependencies: Map<string, Dependencies>,
    dependencyGraph: DependencyGraph
  ): FeatureCatalog {
    const features = this.createFeatures(allMetadata, allDependencies, dependencyGraph);
    const categorizedFeatures = this.groupByCategory(features);
    const summary = this.generateSummary(categorizedFeatures, allDependencies);
    const metadata = this.createMetadata(allMetadata.length);
    const migrationGuide = this.createMigrationGuide(categorizedFeatures, dependencyGraph);

    return {
      metadata,
      summary,
      features: categorizedFeatures,
      dependencyGraph,
      migrationGuide
    };
  }

  private createFeatures(
    allMetadata: FeatureMetadata[],
    allDependencies: Map<string, Dependencies>,
    dependencyGraph: DependencyGraph
  ): Feature[] {
    const features: Feature[] = [];

    for (const metadata of allMetadata) {
      const dependencies = allDependencies.get(metadata.filePath) || {
        internal: [],
        external: [],
        routes: [],
        apis: []
      };

      const node = dependencyGraph.nodes.get(metadata.filePath);
      const relatedFeatures = node ? node.dependents : [];

      const feature: Feature = {
        name: metadata.name,
        filePath: metadata.filePath,
        category: metadata.category,
        description: metadata.description,
        dependencies,
        exports: metadata.exports,
        complexity: metadata.complexity,
        migrationNotes: metadata.migrationNotes,
        relatedFeatures
      };

      features.push(feature);
    }

    return features;
  }

  groupByCategory(features: Feature[]): CategorizedFeatures {
    const categorized: CategorizedFeatures = {
      pages: [],
      components: [],
      services: [],
      hooks: [],
      utilities: [],
      types: [],
      modules: []
    };

    for (const feature of features) {
      switch (feature.category) {
        case 'page':
          categorized.pages.push(feature);
          break;
        case 'component':
          const componentFeature: ComponentFeature = {
            ...feature,
            routes: feature.dependencies.routes.map(r => r.path),
            usedBy: feature.relatedFeatures
          };
          categorized.components.push(componentFeature);
          break;
        case 'service':
          categorized.services.push(feature);
          break;
        case 'hook':
          categorized.hooks.push(feature);
          break;
        case 'utility':
          categorized.utilities.push(feature);
          break;
        case 'type':
          categorized.types.push(feature);
          break;
        case 'module':
        case 'config':
        case 'context':
        case 'server':
          const moduleFeature: ModuleFeature = {
            ...feature,
            subFeatures: [],
            moduleType: this.inferModuleType(feature.filePath)
          };
          categorized.modules.push(moduleFeature);
          break;
      }
    }

    return categorized;
  }

  // UPDATED: Use configurable module types instead of hard-coded values
  private inferModuleType(filePath: string): string {
    const lowerPath = filePath.toLowerCase();
    
    // Check against configured module types
    for (const type of this.moduleTypes) {
      if (lowerPath.includes(type.toLowerCase())) {
        return type;
      }
    }
    
    // Default fallback
    return this.moduleTypes[this.moduleTypes.length - 1] || 'other';
  }

  generateSummary(
    features: CategorizedFeatures,
    allDependencies: Map<string, Dependencies>
  ): CatalogSummary {
    const externalDepsSet = new Set<string>();
    
    for (const deps of allDependencies.values()) {
      for (const ext of deps.external) {
        externalDepsSet.add(ext.package);
      }
    }

    const keyTechnologies = this.identifyKeyTechnologies(Array.from(externalDepsSet));

    return {
      pages: features.pages.length,
      components: features.components.length,
      services: features.services.length,
      hooks: features.hooks.length,
      utilities: features.utilities.length,
      types: features.types.length,
      externalDependencies: Array.from(externalDepsSet).sort(),
      keyTechnologies
    };
  }

  private identifyKeyTechnologies(packages: string[]): string[] {
    const technologies: string[] = [];
    
    // Enhanced React ecosystem technology map
    const techMap: Record<string, string> = {
      'react': 'React',
      'typescript': 'TypeScript',
      'express': 'Express.js',
      'vite': 'Vite',
      '@tanstack/react-query': 'TanStack Query',
      'react-query': 'React Query',
      'wouter': 'Wouter',
      'react-router': 'React Router',
      'react-router-dom': 'React Router',
      'tailwindcss': 'Tailwind CSS',
      '@radix-ui': 'Radix UI',
      'drizzle-orm': 'Drizzle ORM',
      'prisma': 'Prisma',
      'zod': 'Zod',
      'next': 'Next.js',
      'remix': 'Remix',
      'gatsby': 'Gatsby',
      'redux': 'Redux',
      'zustand': 'Zustand',
      'jotai': 'Jotai',
      'recoil': 'Recoil',
      'styled-components': 'Styled Components',
      '@emotion': 'Emotion',
      'next-themes': 'Next Themes'
    };

    for (const pkg of packages) {
      for (const [key, tech] of Object.entries(techMap)) {
        if (pkg.includes(key) && !technologies.includes(tech)) {
          technologies.push(tech);
        }
      }
    }

    return technologies;
  }

  private createMetadata(totalFiles: number): CatalogMetadata {
    const packageJson = this.readPackageJson();
    
    return {
      projectName: packageJson?.name || 'Unknown Project',
      generatedAt: new Date().toISOString(),
      totalFiles,
      totalFeatures: totalFiles,
      version: packageJson?.version || '1.0.0'
    };
  }

  private readPackageJson(): any {
    try {
      const packagePath = path.join(this.rootDir, 'package.json');
      const content = fs.readFileSync(packagePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  createMigrationGuide(
    features: CategorizedFeatures,
    dependencyGraph: DependencyGraph
  ): MigrationGuide {
    const challenges = this.identifyMigrationChallenges(features);
    const migrationOrder = this.suggestMigrationOrder(dependencyGraph);
    const recommendations = this.generateRecommendations(features, challenges);

    return {
      overview: this.generateMigrationOverview(features),
      recommendations,
      challenges,
      migrationOrder
    };
  }

  private generateMigrationOverview(features: CategorizedFeatures): string {
    const total = features.pages.length + features.components.length + 
                  features.services.length + features.hooks.length +
                  features.utilities.length + features.types.length +
                  features.modules.length;

    return `This project contains ${total} features across ${features.pages.length} pages, ` +
           `${features.components.length} components, ${features.services.length} services, ` +
           `${features.hooks.length} hooks, ${features.utilities.length} utilities, ` +
           `${features.types.length} type definitions, and ${features.modules.length} modules. ` +
           `The application follows a modern React architecture.`;
  }

  // UPDATED: Use generic wording instead of mentioning specific platforms
  private identifyMigrationChallenges(features: CategorizedFeatures): MigrationChallenge[] {
    const challenges: MigrationChallenge[] = [];
    const allFeatures = [
      ...features.pages,
      ...features.components,
      ...features.services,
      ...features.hooks,
      ...features.utilities,
      ...features.types,
      ...features.modules
    ];

    // Identify features with environment-specific code (UPDATED: generic wording)
    const envSpecific = allFeatures.filter(f => 
      f.migrationNotes.some(note => note.includes('environment'))
    );
    if (envSpecific.length > 0) {
      challenges.push({
        feature: 'Environment Detection',
        challenge: `${envSpecific.length} files contain environment-specific code`,
        recommendation: 'Create environment abstraction layer and configuration management system'
      });
    }

    // Identify features with external service integrations
    const externalServices = allFeatures.filter(f =>
      f.migrationNotes.some(note => note.includes('external service'))
    );
    if (externalServices.length > 0) {
      challenges.push({
        feature: 'External Service Integration',
        challenge: `${externalServices.length} files integrate with external services`,
        recommendation: 'Ensure API keys and service configurations are properly migrated'
      });
    }

    // Identify database-related features
    const dbFeatures = allFeatures.filter(f =>
      f.migrationNotes.some(note => note.includes('database'))
    );
    if (dbFeatures.length > 0) {
      challenges.push({
        feature: 'Database Operations',
        challenge: `${dbFeatures.length} files perform database operations`,
        recommendation: 'Verify database schema compatibility and run migrations in target environment'
      });
    }

    // Identify session management
    const sessionFeatures = allFeatures.filter(f =>
      f.migrationNotes.some(note => note.includes('session'))
    );
    if (sessionFeatures.length > 0) {
      challenges.push({
        feature: 'Session Management',
        challenge: `${sessionFeatures.length} files use session management`,
        recommendation: 'Configure session store (PostgreSQL or Redis) in target environment'
      });
    }

    // Identify large files
    const largeFiles = allFeatures.filter(f =>
      f.complexity.linesOfCode > 500
    );
    if (largeFiles.length > 0) {
      challenges.push({
        feature: 'Code Complexity',
        challenge: `${largeFiles.length} files exceed 500 lines of code`,
        recommendation: 'Consider refactoring large files into smaller, more maintainable modules'
      });
    }

    return challenges;
  }

  private suggestMigrationOrder(dependencyGraph: DependencyGraph): string[] {
    // Sort by number of dependencies (ascending) - migrate least dependent first
    const nodes = Array.from(dependencyGraph.nodes.values());
    nodes.sort((a, b) => a.dependencies.length - b.dependencies.length);

    // Group by category priority
    const priority: Record<string, number> = {
      'type': 1,
      'utility': 2,
      'hook': 3,
      'context': 4,
      'service': 5,
      'component': 6,
      'page': 7,
      'server': 8,
      'module': 9,
      'config': 10
    };

    nodes.sort((a, b) => {
      const priorityDiff = (priority[a.type] || 11) - (priority[b.type] || 11);
      if (priorityDiff !== 0) return priorityDiff;
      return a.dependencies.length - b.dependencies.length;
    });

    return nodes.slice(0, 20).map(n => n.filePath);
  }

  private generateRecommendations(
    features: CategorizedFeatures,
    challenges: MigrationChallenge[]
  ): string[] {
    const recommendations: string[] = [
      'Start by migrating type definitions and shared utilities first',
      'Migrate services and API integrations before UI components',
      'Test authentication and session management thoroughly in target environment',
      'Verify all environment variables are properly configured',
      'Run database migrations before deploying application code'
    ];

    if (challenges.some(c => c.feature === 'Code Complexity')) {
      recommendations.push('Consider refactoring large files before migration to improve maintainability');
    }

    if (challenges.some(c => c.feature === 'External Service Integration')) {
      recommendations.push('Create a checklist of all external service credentials and configurations');
    }

    return recommendations;
  }
}
