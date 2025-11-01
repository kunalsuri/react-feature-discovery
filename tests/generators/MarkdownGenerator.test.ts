/**
 * MarkdownGenerator Tests
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { MarkdownWriter } from '../../src/generators/MarkdownGenerator';
import { FeatureCatalog, Feature } from '../../src/types/index';

// Mock fs module
jest.mock('fs');

describe('MarkdownWriter', () => {
  let writer: MarkdownWriter;
  let mockCatalog: FeatureCatalog;

  beforeEach(() => {
    writer = new MarkdownWriter();
    
    mockCatalog = {
      metadata: {
        projectName: 'Test Project',
        version: '1.0.0',
        generatedAt: new Date('2024-01-01T00:00:00Z').toISOString(),
        totalFiles: 10,
        totalFeatures: 5
      },
      summary: {
        pages: 0,
        components: 3,
        services: 1,
        hooks: 1,
        utilities: 0,
        types: 0,
        externalDependencies: ['react'],
        keyTechnologies: ['react', 'typescript']
      },
      features: {
        pages: [],
        components: [
          {
            name: 'Button',
            filePath: 'components/Button.tsx',
            category: 'component',
            description: 'A button component',
            props: ['label', 'onClick'],
            dependencies: {
              internal: [],
              external: [{ package: 'react', imports: ['React'] }],
              routes: [],
              apis: []
            },
            exports: [{ name: 'Button', type: 'named', kind: 'const' }],
            complexity: {
              linesOfCode: 10,
              dependencies: 1,
              cyclomaticComplexity: 1
            },
            migrationNotes: [],
            relatedFeatures: []
          } as any
        ],
        services: [],
        hooks: [],
        utilities: [],
        types: [],
        modules: []
      },
      dependencyGraph: {
        nodes: new Map([
          ['components/Button.tsx', { 
            id: 'components/Button.tsx', 
            filePath: 'components/Button.tsx',
            type: 'component',
            dependencies: [],
            dependents: []
          }]
        ]),
        edges: []
      },
      migrationGuide: {
        overview: 'Low complexity migration',
        recommendations: [],
        challenges: [],
        migrationOrder: []
      }
    };
  });

  describe('generateMarkdown', () => {
    it('should generate complete markdown document', () => {
      const markdown = writer.generateMarkdown(mockCatalog);
      
      expect(markdown).toContain('# Feature Catalog - Test Project');
      expect(markdown).toContain('## Table of Contents');
      expect(markdown).toContain('## Metadata');
      expect(markdown).toContain('## Summary');
      expect(markdown).toContain('## Components');
      expect(markdown).toContain('## Migration Guide');
      expect(markdown).toContain('## Dependency Graph');
    });

    it('should include project metadata', () => {
      const markdown = writer.generateMarkdown(mockCatalog);
      
      expect(markdown).toContain('Test Project');
      expect(markdown).toContain('Version: 1.0.0');
      expect(markdown).toContain('Generated:');
    });

    it('should include table of contents with all sections', () => {
      const markdown = writer.generateMarkdown(mockCatalog);
      
      expect(markdown).toContain('[Metadata](#metadata)');
      expect(markdown).toContain('[Summary](#summary)');
      expect(markdown).toContain('[Components](#components)');
    });

    it('should include summary statistics', () => {
      const markdown = writer.generateMarkdown(mockCatalog);
      
      expect(markdown).toContain('Total Features: 5');
      expect(markdown).toContain('Components: 3');
      expect(markdown).toContain('Services: 1');
      expect(markdown).toContain('Hooks: 1');
    });

    it('should include component details', () => {
      const markdown = writer.generateMarkdown(mockCatalog);
      
      expect(markdown).toContain('### Button');
      expect(markdown).toContain('components/Button.tsx');
      expect(markdown).toContain('A button component');
      expect(markdown).toContain('Props: label, onClick');
      expect(markdown).toContain('Complexity: 1');
      expect(markdown).toContain('Lines of Code: 10');
    });

    it('should handle empty features gracefully', () => {
      const emptyCatalog = {
        ...mockCatalog,
        features: {
          pages: [],
          components: [],
          services: [],
          hooks: [],
          utilities: [],
          types: [],
          modules: []
        }
      };

      const markdown = writer.generateMarkdown(emptyCatalog);
      
      expect(markdown).toContain('No components found');
      expect(markdown).toContain('No services found');
      expect(markdown).toContain('No hooks found');
    });

    it('should include dependency graph information', () => {
      const markdown = writer.generateMarkdown(mockCatalog);
      
      expect(markdown).toContain('## Dependency Graph');
      expect(markdown).toContain('Total Nodes: 1');
      expect(markdown).toContain('Total Edges: 0');
    });

    it('should include migration guide', () => {
      const markdown = writer.generateMarkdown(mockCatalog);
      
      expect(markdown).toContain('## Migration Guide');
      expect(markdown).toContain('Complexity: low');
      expect(markdown).toContain('Estimated Effort: 1-2 days');
    });

    it('should format technologies correctly', () => {
      const markdown = writer.generateMarkdown(mockCatalog);
      
      expect(markdown).toContain('**Frontend:** react, typescript');
      expect(markdown).toContain('**Testing:** jest');
    });
  });

  describe('Component Details Generation', () => {
    it('should generate detailed component information with dependencies', () => {
      const componentWithDeps = {
        ...mockCatalog,
        features: {
          ...mockCatalog.features,
          components: [
            {
              name: 'ComplexComponent',
              path: 'components/ComplexComponent.tsx',
              type: 'component',
              description: 'A complex component',
              props: ['data', 'onUpdate'],
              dependencies: {
                internal: [
                  { path: '../utils/helper', imports: ['helper'] }
                ],
                external: [
                  { name: 'react', imports: ['useState', 'useEffect'] },
                  { name: 'lodash', imports: ['debounce'] }
                ],
                routes: [],
                apis: []
              },
              complexity: 5,
              linesOfCode: 50,
              features: []
            } as any
          ]
        }
      };

      const markdown = writer.generateMarkdown(componentWithDeps);
      
      expect(markdown).toContain('### ComplexComponent');
      expect(markdown).toContain('**Internal Dependencies:**');
      expect(markdown).toContain('../utils/helper');
      expect(markdown).toContain('**External Dependencies:**');
      expect(markdown).toContain('react (useState, useEffect)');
      expect(markdown).toContain('lodash (debounce)');
    });
  });

  describe('Service Details Generation', () => {
    it('should generate service information', () => {
      const catalogWithServices = {
        ...mockCatalog,
        features: {
          ...mockCatalog.features,
          services: [
            {
              name: 'ApiService',
              path: 'services/ApiService.ts',
              type: 'service',
              description: 'API service for data fetching',
              methods: ['getData', 'postData'],
              dependencies: {
                internal: [],
                external: [{ name: 'axios', imports: ['axios'] }],
                routes: [],
                apis: []
              },
              complexity: 3,
              linesOfCode: 30,
              features: []
            } as any
          ]
        }
      };

      const markdown = writer.generateMarkdown(catalogWithServices);
      
      expect(markdown).toContain('### ApiService');
      expect(markdown).toContain('API service for data fetching');
      expect(markdown).toContain('Methods: getData, postData');
    });
  });

  describe('Hook Details Generation', () => {
    it('should generate hook information', () => {
      const catalogWithHooks = {
        ...mockCatalog,
        features: {
          ...mockCatalog.features,
          hooks: [
            {
              name: 'useCustomHook',
              path: 'hooks/useCustomHook.ts',
              type: 'hook',
              description: 'Custom hook for state management',
              dependencies: {
                internal: [],
                external: [{ name: 'react', imports: ['useState'] }],
                routes: [],
                apis: []
              },
              complexity: 2,
              linesOfCode: 15,
              features: []
            } as any
          ]
        }
      };

      const markdown = writer.generateMarkdown(catalogWithHooks);
      
      expect(markdown).toContain('### useCustomHook');
      expect(markdown).toContain('Custom hook for state management');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing optional properties', () => {
      const minimalCatalog = {
        metadata: mockCatalog.metadata,
        summary: mockCatalog.summary,
        features: mockCatalog.features,
        dependencyGraph: mockCatalog.dependencyGraph,
        migrationGuide: mockCatalog.migrationGuide
      };

      const markdown = writer.generateMarkdown(minimalCatalog);
      
      expect(markdown).toBeDefined();
      expect(markdown).toContain('# Feature Catalog');
    });

    it('should handle very long component names', () => {
      const longNameComponent = {
        ...mockCatalog,
        features: {
          ...mockCatalog.features,
          components: [
            {
              name: 'VeryLongComponentNameThatExceedsNormalLengthExpectations',
              path: 'components/VeryLongComponentName.tsx',
              type: 'component',
              description: 'A component with a very long name',
              props: [],
              dependencies: { internal: [], external: [], routes: [], apis: [] },
              complexity: 1,
              linesOfCode: 10,
              features: []
            } as any
          ]
        }
      };

      const markdown = writer.generateMarkdown(longNameComponent);
      
      expect(markdown).toContain('VeryLongComponentNameThatExceedsNormalLengthExpectations');
    });
  });
});
