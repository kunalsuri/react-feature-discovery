/**
 * HTMLGenerator Tests
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { HTMLGenerator } from '../../src/generators/HTMLGenerator.js';
import { FeatureCatalog } from '../../src/types/index.js';

// Mock fs module
jest.mock('fs');

describe('HTMLGenerator', () => {
  let generator: HTMLGenerator;
  let mockCatalog: FeatureCatalog;

  beforeEach(() => {
    generator = new HTMLGenerator();
    
    mockCatalog = {
      metadata: {
        projectName: 'Test Project',
        version: '1.0.0',
        generatedAt: new Date('2024-01-01T00:00:00Z').toISOString(),
        rootDir: '/test',
        totalFiles: 10,
        totalLines: 1000,
        technologies: {
          frontend: ['react', 'typescript'],
          backend: [],
          database: [],
          testing: ['jest'],
          deployment: []
        }
      },
      summary: {
        totalFeatures: 5,
        componentCount: 3,
        serviceCount: 1,
        hookCount: 1,
        utilityCount: 0,
        typeCount: 0,
        moduleCount: 0,
        pageCount: 0
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
              external: [{ name: 'react', imports: ['React'] }],
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
          ['components/Button.tsx', { id: 'components/Button.tsx', type: 'component' }]
        ]),
        edges: []
      },
      migrationGuide: {
        complexity: 'low',
        estimatedEffort: '1-2 days',
        risks: [],
        recommendations: []
      }
    };
  });

  describe('generateHTML', () => {
    it('should generate valid HTML document', () => {
      const html = generator.generateHTML(mockCatalog);
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('<head>');
      expect(html).toContain('<body>');
      expect(html).toContain('</html>');
    });

    it('should include proper meta tags', () => {
      const html = generator.generateHTML(mockCatalog);
      
      expect(html).toContain('<meta charset="UTF-8">');
      expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
    });

    it('should include project title', () => {
      const html = generator.generateHTML(mockCatalog);
      
      expect(html).toContain('<title>Feature Catalog - Test Project</title>');
    });

    it('should include header with project information', () => {
      const html = generator.generateHTML(mockCatalog);
      
      expect(html).toContain('<header>');
      expect(html).toContain('Feature Catalog');
      expect(html).toContain('Test Project');
      expect(html).toContain('Generated:');
      expect(html).toContain('Version: 1.0.0');
    });

    it('should include summary statistics', () => {
      const html = generator.generateHTML(mockCatalog);
      
      expect(html).toContain('<h2>Summary</h2>');
      expect(html).toContain('Total Features');
      expect(html).toContain('Components');
      expect(html).toContain('Services');
      expect(html).toContain('Hooks');
    });

    it('should include statistics grid', () => {
      const html = generator.generateHTML(mockCatalog);
      
      expect(html).toContain('class="stats"');
      expect(html).toContain('class="stat"');
      expect(html).toContain('class="stat-value"');
      expect(html).toContain('class="stat-label"');
    });

    it('should include feature sections', () => {
      const html = generator.generateHTML(mockCatalog);
      
      expect(html).toContain('Components');
      expect(html).toContain('Services');
      expect(html).toContain('Hooks');
    });

    it('should include component details', () => {
      const html = generator.generateHTML(mockCatalog);
      
      expect(html).toContain('Button');
      expect(html).toContain('components/Button.tsx');
      expect(html).toContain('A button component');
    });

    it('should include CSS styles', () => {
      const html = generator.generateHTML(mockCatalog);
      
      expect(html).toContain('<style>');
      expect(html).toContain('font-family:');
      expect(html).toContain('background:');
      expect(html).toContain('color:');
      expect(html).toContain('</style>');
    });

    it('should include responsive design styles', () => {
      const html = generator.generateHTML(mockCatalog);
      
      expect(html).toContain('max-width:');
      expect(html).toContain('grid-template-columns:');
      expect(html).toContain('flex-wrap:');
    });

    it('should include technology badges', () => {
      const html = generator.generateHTML(mockCatalog);
      
      expect(html).toContain('class="tech-list"');
      expect(html).toContain('class="tech-badge"');
      expect(html).toContain('react');
      expect(html).toContain('typescript');
      expect(html).toContain('jest');
    });

    it('should include feature cards with proper styling', () => {
      const html = generator.generateHTML(mockCatalog);
      
      expect(html).toContain('class="feature"');
      expect(html).toContain('class="feature-name"');
      expect(html).toContain('class="feature-path"');
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

      const html = generator.generateHTML(emptyCatalog);
      
      expect(html).toContain('No components found');
      expect(html).toContain('No services found');
      expect(html).toContain('No hooks found');
    });

    it('should include migration guide section', () => {
      const html = generator.generateHTML(mockCatalog);
      
      expect(html).toContain('Migration Guide');
      expect(html).toContain('Complexity: low');
      expect(html).toContain('Estimated Effort: 1-2 days');
    });

    it('should escape HTML special characters in project name', () => {
      const specialCharCatalog = {
        ...mockCatalog,
        metadata: {
          ...mockCatalog.metadata,
          projectName: 'Test <Project> & "Special" Characters'
        }
      };

      const html = generator.generateHTML(specialCharCatalog);
      
      // Should contain escaped characters
      expect(html).toContain('Test &lt;Project&gt; &amp; &quot;Special&quot; Characters');
    });

    it('should include dependency graph information', () => {
      const html = generator.generateHTML(mockCatalog);
      
      expect(html).toContain('Dependency Graph');
      expect(html).toContain('Total Nodes: 1');
      expect(html).toContain('Total Edges: 0');
    });

    it('should generate semantic HTML structure', () => {
      const html = generator.generateHTML(mockCatalog);
      
      expect(html).toContain('<h1>');
      expect(html).toContain('<h2>');
      expect(html).toContain('<h3>');
      expect(html).toContain('<div>');
      expect(html).toContain('<span>');
      expect(html).toContain('<strong>');
    });
  });

  describe('Component Details in HTML', () => {
    it('should include component complexity and metrics', () => {
      const html = generator.generateHTML(mockCatalog);
      
      expect(html).toContain('Complexity: 1');
      expect(html).toContain('Lines of Code: 10');
    });

    it('should include component dependencies', () => {
      const catalogWithDeps = {
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

      const html = generator.generateHTML(catalogWithDeps);
      
      expect(html).toContain('Internal Dependencies');
      expect(html).toContain('External Dependencies');
      expect(html).toContain('utils/helper');
      expect(html).toContain('react');
      expect(html).toContain('lodash');
    });
  });

  describe('HTML Structure and Accessibility', () => {
    it('should include proper language attribute', () => {
      const html = generator.generateHTML(mockCatalog);
      
      expect(html).toContain('<html lang="en">');
    });

    it('should include viewport meta tag for responsiveness', () => {
      const html = generator.generateHTML(mockCatalog);
      
      expect(html).toContain('name="viewport" content="width=device-width, initial-scale=1.0"');
    });

    it('should use semantic HTML5 elements', () => {
      const html = generator.generateHTML(mockCatalog);
      
      expect(html).toContain('<header>');
      expect(html).toContain('<section>');
      expect(html).toContain('<article>');
    });

    it('should include proper heading hierarchy', () => {
      const html = generator.generateHTML(mockCatalog);
      
      // Should have h1 for main title, h2 for sections, h3 for subsections
      expect(html).toMatch(/<h1>/);
      expect(html).toMatch(/<h2>/);
      expect(html).toMatch(/<h3>/);
    });
  });

  describe('Styling and Visual Design', () => {
    it('should include modern CSS styling', () => {
      const html = generator.generateHTML(mockCatalog);
      
      expect(html).toContain('box-sizing: border-box');
      expect(html).toContain('border-radius:');
      expect(html).toContain('box-shadow:');
      expect(html).toContain('grid-template-columns:');
    });

    it('should include responsive grid layouts', () => {
      const html = generator.generateHTML(mockCatalog);
      
      expect(html).toContain('display: grid');
      expect(html).toContain('repeat(auto-fit, minmax(');
    });

    it('should include card-based design for features', () => {
      const html = generator.generateHTML(mockCatalog);
      
      expect(html).toContain('background: white');
      expect(html).toContain('border-radius: 8px');
      expect(html).toContain('box-shadow: 0 2px 4px rgba(0,0,0,0.1)');
    });

    it('should include color scheme for different elements', () => {
      const html = generator.generateHTML(mockCatalog);
      
      expect(html).toContain('#2563eb'); // Primary blue color
      expect(html).toContain('#64748b'); // Secondary gray color
      expect(html).toContain('#f8fafc'); // Light background
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long project names', () => {
      const longNameCatalog = {
        ...mockCatalog,
        metadata: {
          ...mockCatalog.metadata,
          projectName: 'Very Long Project Name That Exceeds Normal Length Expectations And Might Break Layout'
        }
      };

      const html = generator.generateHTML(longNameCatalog);
      
      expect(html).toContain('Very Long Project Name That Exceeds Normal Length Expectations');
    });

    it('should handle empty metadata gracefully', () => {
      const minimalCatalog = {
        ...mockCatalog,
        metadata: {
          projectName: '',
          version: '',
          generatedAt: '',
          rootDir: '',
          totalFiles: 0,
          totalLines: 0,
          technologies: {
            frontend: [],
            backend: [],
            database: [],
            testing: [],
            deployment: []
          }
        }
      };

      const html = generator.generateHTML(minimalCatalog);
      
      expect(html).toContain('<title>Feature Catalog - </title>');
      expect(html).toBeDefined();
    });

    it('should handle special characters in descriptions', () => {
      const catalogWithSpecialChars = {
        ...mockCatalog,
        features: {
          ...mockCatalog.features,
          components: [
            {
              name: 'SpecialComponent',
              path: 'components/SpecialComponent.tsx',
              type: 'component',
              description: 'Component with <script>alert("xss")</script> and & special chars',
              props: [],
              dependencies: { internal: [], external: [], routes: [], apis: [] },
              complexity: 1,
              linesOfCode: 10,
              features: []
            } as any
          ]
        }
      };

      const html = generator.generateHTML(catalogWithSpecialChars);
      
      // Should escape potentially dangerous HTML
      expect(html).not.toContain('<script>alert("xss")</script>');
      expect(html).toContain('&lt;script&gt;');
    });
  });
});
