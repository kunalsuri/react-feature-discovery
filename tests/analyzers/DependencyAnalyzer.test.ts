/**
 * DependencyAnalyzer Tests
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { DependencyAnalyzer } from '../../src/analyzers/DependencyAnalyzer.js';
import { FileEntry } from '../../src/types/index.js';

describe('DependencyAnalyzer', () => {
  let analyzer: DependencyAnalyzer;
  let mockFiles: FileEntry[];

  beforeEach(() => {
    mockFiles = [
      {
        relativePath: 'components/Button.tsx',
        fullPath: '/test/components/Button.tsx',
        content: `
import React from 'react';
import { utils } from '../utils/helpers';
import lodash from 'lodash';
import './Button.css';

export const Button: React.FC = () => {
  return <button>Click me</button>;
};
        `.trim()
      },
      {
        relativePath: 'utils/helpers.ts',
        fullPath: '/test/utils/helpers.ts',
        content: `
export const utils = {
  format: (str: string) => str.trim()
};
        `.trim()
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
            name: 'react',
            type: 'external',
            version: undefined
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
            name: 'react',
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
            name: 'react',
            imports: ['React']
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
            path: '../utils/helpers',
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
            path: './Button.css',
            type: 'css'
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
      
      expect(result.external).toHaveLength(2); // react, lodash
      expect(result.internal).toHaveLength(2); // utils, css
    });

    it('should handle dynamic imports', () => {
      const content = "const LazyComponent = lazy(() => import('./LazyComponent'));";
      const result = analyzer.analyzeDependencies(content, 'Component.tsx');
      
      expect(result.internal).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: './LazyComponent',
            dynamic: true
          })
        ])
      );
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
      const graph = analyzer.buildDependencyGraph();
      
      expect(graph).toHaveProperty('nodes');
      expect(graph).toHaveProperty('edges');
      expect(Array.isArray(graph.nodes)).toBe(true);
      expect(Array.isArray(graph.edges)).toBe(true);
    });

    it('should create nodes for all files', () => {
      const graph = analyzer.buildDependencyGraph();
      
      expect(graph.nodes).toHaveLength(2);
      expect(graph.nodes.map((n: any) => n.id)).toEqual(
        expect.arrayContaining(['components/Button.tsx', 'utils/helpers.ts'])
      );
    });

    it('should create edges for dependencies', () => {
      const graph = analyzer.buildDependencyGraph();
      
      expect(graph.edges.length).toBeGreaterThan(0);
      expect(graph.edges[0]).toHaveProperty('source');
      expect(graph.edges[0]).toHaveProperty('target');
      expect(graph.edges[0]).toHaveProperty('type');
    });
  });

  describe('Edge Cases', () => {
    it('should handle circular dependencies', () => {
      const circularFiles = [
        {
          relativePath: 'a.ts',
          fullPath: '/test/a.ts',
          content: "import './b';"
        },
        {
          relativePath: 'b.ts',
          fullPath: '/test/b.ts',
          content: "import './a';"
        }
      ];

      const circularAnalyzer = new DependencyAnalyzer('/test', circularFiles);
      const graph = circularAnalyzer.buildDependencyGraph();
      
      expect(graph.nodes).toHaveLength(2);
      expect(graph.edges).toHaveLength(2);
    });

    it('should handle missing files gracefully', () => {
      const content = "import './nonexistent';";
      const result = analyzer.analyzeDependencies(content, 'Component.tsx');
      
      expect(result.internal[0].resolvedPath).toContain('nonexistent');
    });
  });
});
