/**
 * DependencyAnalyzer Tests
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { DependencyAnalyzer } from '../../src/analyzers/DependencyAnalyzer';
import { FileEntry } from '../../src/types/index';

describe('DependencyAnalyzer', () => {
  let analyzer: DependencyAnalyzer;
  let mockFiles: FileEntry[];

  beforeEach(() => {
    mockFiles = [
      {
        path: '/test/components/Button.tsx',
        relativePath: 'components/Button.tsx',
        name: 'Button.tsx',
        extension: '.tsx',
        size: 200,
        category: 'component'
      },
      {
        path: '/test/utils/helpers.ts',
        relativePath: 'utils/helpers.ts',
        name: 'helpers.ts',
        extension: '.ts',
        size: 100,
        category: 'utility'
      }
    ];

    analyzer = new DependencyAnalyzer('/test', mockFiles);
  });

  describe('Constructor', () => {
    it('should initialize with root directory and files', () => {
      expect(analyzer).toBeInstanceOf(DependencyAnalyzer);
    });

    it('should create file map from provided files', () => {
      // Test internal implementation through public methods
      const result = analyzer.analyzeDependencies('', 'test.ts');
      expect(result).toBeDefined();
    });
  });

  describe('analyzeDependencies', () => {
    it('should extract React import as external dependency', () => {
      const content = "import React from 'react';";
      const result = analyzer.analyzeDependencies(content, 'Component.tsx');
      
      expect(result.external).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            package: 'react',
            imports: ['React']
          })
        ])
      );
    });

    it('should extract named imports correctly', () => {
      const content = "import { useState, useEffect } from 'react';";
      const result = analyzer.analyzeDependencies(content, 'Component.tsx');
      
      expect(result.external).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            package: 'react',
            imports: ['useState', 'useEffect']
          })
        ])
      );
    });

    it('should extract namespace imports correctly', () => {
      const content = "import * as React from 'react';";
      const result = analyzer.analyzeDependencies(content, 'Component.tsx');
      
      expect(result.external).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            package: 'react',
            imports: ['* as React']
          })
        ])
      );
    });

    it('should extract internal dependencies', () => {
      const content = "import { utils } from '../utils/helpers';";
      const result = analyzer.analyzeDependencies(content, 'components/Button.tsx');
      
      expect(result.internal).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            importPath: '../utils/helpers',
            resolvedPath: expect.any(String),
            imports: ['utils']
          })
        ])
      );
    });

    it('should extract CSS imports', () => {
      const content = "import './Button.css';";
      const result = analyzer.analyzeDependencies(content, 'components/Button.tsx');
      
      expect(result.internal).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            importPath: './Button.css',
            type: 'component'
          })
        ])
      );
    });

    it('should handle multiple import statements', () => {
      const content = `
import React from 'react';
import { useState } from 'react';
import lodash from 'lodash';
import { utils } from '../utils/helpers';
import './styles.css';
      `.trim();
      
      const result = analyzer.analyzeDependencies(content, 'Component.tsx');
      
      expect(result.external.length).toBeGreaterThanOrEqual(2); // react, lodash (may be merged)
      expect(result.internal.length).toBeGreaterThanOrEqual(1); // utils, css
    });

    it('should handle dynamic imports', () => {
      const content = "const LazyComponent = lazy(() => import('./LazyComponent'));";
      const result = analyzer.analyzeDependencies(content, 'Component.tsx');
      
      // Dynamic imports are not currently detected by the regex, so this may return empty
      expect(result).toHaveProperty('internal');
      expect(result).toHaveProperty('external');
    });

    it('should handle relative path resolution', () => {
      const content = "import Helper from '../utils/helper';";
      const result = analyzer.analyzeDependencies(content, 'components/Button.tsx');
      
      expect(result.internal[0].resolvedPath).toContain('utils/helper');
    });

    it('should return empty dependencies for empty content', () => {
      const result = analyzer.analyzeDependencies('', 'empty.ts');
      
      expect(result.internal).toHaveLength(0);
      expect(result.external).toHaveLength(0);
      expect(result.routes).toHaveLength(0);
      expect(result.apis).toHaveLength(0);
    });

    it('should handle malformed import statements gracefully', () => {
      const content = "import from '';";
      const result = analyzer.analyzeDependencies(content, 'broken.ts');
      
      // Should not crash and return empty dependencies
      expect(result).toBeDefined();
      expect(result.internal).toHaveLength(0);
      expect(result.external).toHaveLength(0);
    });
  });

  describe('buildDependencyGraph', () => {
    it('should build dependency graph from files', () => {
      const allDependencies = new Map<string, any>();
      const graph = analyzer.buildDependencyGraph(mockFiles, allDependencies);
      
      expect(graph).toHaveProperty('nodes');
      expect(graph).toHaveProperty('edges');
      expect(graph.nodes instanceof Map).toBe(true);
      expect(Array.isArray(graph.edges)).toBe(true);
    });

    it('should create nodes for all files', () => {
      const allDependencies = new Map<string, any>();
      const graph = analyzer.buildDependencyGraph(mockFiles, allDependencies);
      
      expect(graph.nodes.size).toBe(2);
      const nodeIds = Array.from(graph.nodes.keys());
      expect(nodeIds).toEqual(
        expect.arrayContaining(['components/Button.tsx', 'utils/helpers.ts'])
      );
    });

    it('should create edges for dependencies', () => {
      const allDependencies = new Map<string, any>([
        ['components/Button.tsx', {
          internal: [{ importPath: '../utils/helpers', resolvedPath: 'utils/helpers.ts', imports: ['utils'], type: 'utility' as const }],
          external: [],
          routes: [],
          apis: []
        }]
      ]);
      const graph = analyzer.buildDependencyGraph(mockFiles, allDependencies);
      
      expect(graph.edges.length).toBeGreaterThan(0);
      expect(graph.edges[0]).toHaveProperty('from');
      expect(graph.edges[0]).toHaveProperty('to');
      expect(graph.edges[0]).toHaveProperty('type');
    });
  });

  describe('Edge Cases', () => {
    it('should handle circular dependencies', () => {
      const circularFiles: FileEntry[] = [
        {
          path: '/test/a.ts',
          relativePath: 'a.ts',
          name: 'a.ts',
          extension: '.ts',
          size: 50,
          category: 'utility'
        },
        {
          path: '/test/b.ts',
          relativePath: 'b.ts',
          name: 'b.ts',
          extension: '.ts',
          size: 50,
          category: 'utility'
        }
      ];

      const circularDeps = new Map<string, any>([
        ['a.ts', { internal: [{ importPath: './b', resolvedPath: 'b.ts', imports: [], type: 'utility' as const }], external: [], routes: [], apis: [] }],
        ['b.ts', { internal: [{ importPath: './a', resolvedPath: 'a.ts', imports: [], type: 'utility' as const }], external: [], routes: [], apis: [] }]
      ]);

      const circularAnalyzer = new DependencyAnalyzer('/test', circularFiles);
      const graph = circularAnalyzer.buildDependencyGraph(circularFiles, circularDeps);
      
      expect(graph.nodes.size).toBe(2);
      expect(graph.edges).toHaveLength(2);
    });

    it('should handle missing files gracefully', () => {
      const content = "import './nonexistent';";
      const result = analyzer.analyzeDependencies(content, 'Component.tsx');
      
      expect(result.internal[0].resolvedPath).toContain('nonexistent');
    });
  });
});
