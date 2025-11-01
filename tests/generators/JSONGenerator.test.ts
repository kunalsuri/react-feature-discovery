/**
 * JSONGenerator Tests
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { JSONGenerator } from '../../src/generators/JSONGenerator';
import { FeatureCatalog } from '../../src/types/index';
import * as fs from 'fs';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('JSONGenerator', () => {
  let generator: JSONGenerator;
  let mockCatalog: FeatureCatalog;

  beforeEach(() => {
    generator = new JSONGenerator();
    
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
            path: 'components/Button.tsx',
            type: 'component',
            description: 'A button component',
            props: ['label', 'onClick'],
            dependencies: {
              internal: [],
              external: [{ package: 'react', imports: ['React'] }],
              routes: [],
              apis: []
            },
            complexity: 1,
            linesOfCode: 10,
            features: []
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
          }],
          ['utils/helper.ts', { 
            id: 'utils/helper.ts', 
            filePath: 'utils/helper.ts',
            type: 'utility',
            dependencies: [],
            dependents: []
          }]
        ]),
        edges: [
          { from: 'components/Button.tsx', to: 'utils/helper.ts', type: 'import' }
        ]
      },
      migrationGuide: {
        overview: 'Low complexity migration',
        recommendations: [],
        challenges: [],
        migrationOrder: []
      }
    };
  });

  describe('generateJSON', () => {
    it('should generate valid JSON string', () => {
      const json = generator.generateJSON(mockCatalog);
      
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should include all catalog properties', () => {
      const json = generator.generateJSON(mockCatalog);
      const parsed = JSON.parse(json);
      
      expect(parsed).toHaveProperty('metadata');
      expect(parsed).toHaveProperty('summary');
      expect(parsed).toHaveProperty('features');
      expect(parsed).toHaveProperty('dependencyGraph');
      expect(parsed).toHaveProperty('migrationGuide');
    });

    it('should convert Map to array for dependency graph nodes', () => {
      const json = generator.generateJSON(mockCatalog);
      const parsed = JSON.parse(json);
      
      expect(Array.isArray(parsed.dependencyGraph.nodes)).toBe(true);
      expect(parsed.dependencyGraph.nodes).toHaveLength(2);
      
      expect(parsed.dependencyGraph.nodes[0]).toHaveProperty('key');
      expect(parsed.dependencyGraph.nodes[0]).toHaveProperty('id');
      expect(parsed.dependencyGraph.nodes[0]).toHaveProperty('type');
    });

    it('should preserve dependency graph edges as array', () => {
      const json = generator.generateJSON(mockCatalog);
      const parsed = JSON.parse(json);
      
      expect(Array.isArray(parsed.dependencyGraph.edges)).toBe(true);
      expect(parsed.dependencyGraph.edges).toHaveLength(1);
      expect(parsed.dependencyGraph.edges[0]).toEqual({
        source: 'components/Button.tsx',
        target: 'utils/helper.ts',
        type: 'internal'
      });
    });

    it('should generate pretty formatted JSON by default', () => {
      const json = generator.generateJSON(mockCatalog);
      
      expect(json).toContain('  "metadata"');
      expect(json).toContain('\n');
      expect(json.split('\n').length).toBeGreaterThan(1);
    });

    it('should generate compact JSON when pretty is false', () => {
      const json = generator.generateJSON(mockCatalog, false);
      
      expect(json).not.toContain('  "metadata"');
      expect(json).not.toContain('\n');
    });

    it('should handle empty dependency graph', () => {
      const emptyGraphCatalog = {
        ...mockCatalog,
        dependencyGraph: {
          nodes: new Map(),
          edges: []
        }
      };

      const json = generator.generateJSON(emptyGraphCatalog);
      const parsed = JSON.parse(json);
      
      expect(parsed.dependencyGraph.nodes).toEqual([]);
      expect(parsed.dependencyGraph.edges).toEqual([]);
    });

    it('should preserve complex nested structures', () => {
      const complexCatalog = {
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
                  { path: '../utils/helper', imports: ['helper'], resolvedPath: 'utils/helper.ts' }
                ],
                external: [
                  { name: 'react', imports: ['useState', 'useEffect'], version: '^18.0.0' }
                ],
                routes: [
                  { path: '/users', component: 'UserPage' }
                ],
                apis: [
                  { endpoint: '/api/data', method: 'GET' }
                ]
              },
              complexity: 5,
              linesOfCode: 50,
              features: ['state-management', 'api-integration']
            } as any
          ]
        }
      };

      const json = generator.generateJSON(complexCatalog);
      const parsed = JSON.parse(json);
      
      expect(parsed.features.components[0].dependencies.internal[0]).toEqual({
        path: '../utils/helper',
        imports: ['helper'],
        resolvedPath: 'utils/helper.ts'
      });
      
      expect(parsed.features.components[0].dependencies.external[0]).toEqual({
        name: 'react',
        imports: ['useState', 'useEffect'],
        version: '^18.0.0'
      });
      
      expect(parsed.features.components[0].dependencies.routes[0]).toEqual({
        path: '/users',
        component: 'UserPage'
      });
      
      expect(parsed.features.components[0].dependencies.apis[0]).toEqual({
        endpoint: '/api/data',
        method: 'GET'
      });
    });

    it('should handle special characters in strings', () => {
      const specialCharCatalog = {
        ...mockCatalog,
        metadata: {
          ...mockCatalog.metadata,
          projectName: 'Test "Project" with \'special\' chars\nand\ttabs'
        }
      };

      const json = generator.generateJSON(specialCharCatalog);
      const parsed = JSON.parse(json);
      
      expect(parsed.metadata.projectName).toBe('Test "Project" with \'special\' chars\nand\ttabs');
    });

    it('should handle null and undefined values', () => {
      const catalogWithNulls = {
        ...mockCatalog,
        features: {
          ...mockCatalog.features,
          components: [
            {
              name: 'ComponentWithNulls',
              path: 'components/ComponentWithNulls.tsx',
              type: 'component',
              description: null,
              props: undefined,
              dependencies: {
                internal: [],
                external: [],
                routes: [],
                apis: []
              },
              complexity: 1,
              linesOfCode: 10,
              features: []
            } as any
          ]
        }
      };

      const json = generator.generateJSON(catalogWithNulls);
      const parsed = JSON.parse(json);
      
      expect(parsed.features.components[0].description).toBe(null);
      expect(parsed.features.components[0].props).toBeUndefined();
    });
  });

  describe('writeToFile', () => {
    it('should write JSON to file system', () => {
      const mockJson = '{"test": "data"}';
      const mockOutputPath = '/test/output.json';
      
      generator.writeToFile(mockJson, mockOutputPath);
      
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        mockOutputPath,
        mockJson,
        'utf-8'
      );
    });

    it('should handle file system errors', () => {
      const mockJson = '{"test": "data"}';
      const mockOutputPath = '/invalid/path/output.json';
      
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });
      
      expect(() => {
        generator.writeToFile(mockJson, mockOutputPath);
      }).toThrow('Permission denied');
    });
  });

  describe('Integration', () => {
    it('should generate and write complete catalog', () => {
      const mockOutputPath = '/test/feature-catalog.json';
      
      const json = generator.generateJSON(mockCatalog);
      generator.writeToFile(json, mockOutputPath);
      
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        mockOutputPath,
        json,
        'utf-8'
      );
      
      const writtenContent = mockFs.writeFileSync.mock.calls[0][1] as string;
      expect(() => JSON.parse(writtenContent)).not.toThrow();
    });
  });
});
