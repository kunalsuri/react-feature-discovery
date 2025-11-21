import { describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { DiffMarkdownGenerator } from '../../src/generators/DiffMarkdownGenerator';
import { DiffJSONGenerator } from '../../src/generators/DiffJSONGenerator';
import { DiffHTMLGenerator } from '../../src/generators/DiffHTMLGenerator';
import { DiffResult } from '../../src/types/diff';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Diff Generators', () => {
  const mockDiff: DiffResult = {
    timestamp: '2024-01-01T00:00:00.000Z',
    sourceA: 'Project A',
    sourceB: 'Project B',
    summary: {
      added: 5,
      removed: 3,
      modified: 2,
      total: 10
    },
    changes: {
      pages: [
        {
          type: 'added',
          feature: {
            name: 'HomePage',
            filePath: 'src/pages/HomePage.tsx',
            category: 'page',
            description: 'Main landing page',
            dependencies: {
              internal: [],
              external: [{ package: 'react', imports: ['useState'], version: '18.0.0' }],
              routes: [],
              apis: []
            },
            exports: [{ name: 'HomePage', type: 'default', kind: 'function' }],
            complexity: { linesOfCode: 100, dependencies: 1 },
            migrationNotes: [],
            relatedFeatures: []
          }
        }
      ],
      components: [
        {
          type: 'modified',
          feature: {
            name: 'Button',
            filePath: 'src/components/Button.tsx',
            category: 'component',
            description: 'Reusable button component',
            dependencies: {
              internal: [],
              external: [],
              routes: [],
              apis: []
            },
            exports: [{ name: 'Button', type: 'default', kind: 'function' }],
            complexity: { linesOfCode: 50, dependencies: 0 },
            migrationNotes: [],
            relatedFeatures: [],
            props: [
              { name: 'onClick', type: 'function', required: true },
              { name: 'label', type: 'string', required: true }
            ],
            routes: [],
            usedBy: []
          },
          diff: [
            { field: 'linesOfCode', oldValue: 45, newValue: 50 }
          ]
        }
      ],
      services: [],
      hooks: [],
      utilities: [],
      types: []
    }
  };

  describe('DiffMarkdownGenerator', () => {
    let generator: DiffMarkdownGenerator;

    beforeEach(() => {
      generator = new DiffMarkdownGenerator();
    });

    it('should generate markdown with header', () => {
      const markdown = generator.generateMarkdown(mockDiff);
      
      expect(markdown).toContain('# Feature Comparison Report');
      expect(markdown).toContain('Project A');
      expect(markdown).toContain('Project B');
    });

    it('should include summary statistics', () => {
      const markdown = generator.generateMarkdown(mockDiff);
      
      expect(markdown).toContain('5');  // added
      expect(markdown).toContain('3');  // removed
      expect(markdown).toContain('2');  // modified
      expect(markdown).toContain('10'); // total
    });

    it('should include changes by category', () => {
      const markdown = generator.generateMarkdown(mockDiff);
      
      expect(markdown).toContain('Pages');
      expect(markdown).toContain('Components');
      expect(markdown).toContain('HomePage');
      expect(markdown).toContain('Button');
    });

    it('should show diff details for modified features', () => {
      const markdown = generator.generateMarkdown(mockDiff);
      
      expect(markdown).toContain('linesOfCode');
      expect(markdown).toContain('45');
      expect(markdown).toContain('50');
    });
  });

  describe('DiffJSONGenerator', () => {
    let generator: DiffJSONGenerator;

    beforeEach(() => {
      generator = new DiffJSONGenerator();
    });

    it('should generate valid JSON', () => {
      const json = generator.generateJSON(mockDiff);
      
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should include metadata', () => {
      const json = generator.generateJSON(mockDiff);
      const parsed = JSON.parse(json);
      
      expect(parsed.metadata).toBeDefined();
      expect(parsed.metadata.sourceA).toBe('Project A');
      expect(parsed.metadata.sourceB).toBe('Project B');
      expect(parsed.metadata.reportType).toBe('feature-comparison');
    });

    it('should include summary with percentages', () => {
      const json = generator.generateJSON(mockDiff);
      const parsed = JSON.parse(json);
      
      expect(parsed.summary).toBeDefined();
      expect(parsed.summary.totalChanges).toBe(10);
      expect(parsed.summary.changeRate).toBeDefined();
      expect(parsed.summary.changeRate.addedPercent).toBe(50);
    });

    it('should include statistics by category', () => {
      const json = generator.generateJSON(mockDiff);
      const parsed = JSON.parse(json);
      
      expect(parsed.statistics).toBeDefined();
      expect(parsed.statistics.byCategory).toBeDefined();
      expect(parsed.statistics.byCategory.pages).toBeDefined();
      expect(parsed.statistics.byCategory.components).toBeDefined();
    });
  });

  describe('DiffHTMLGenerator', () => {
    let generator: DiffHTMLGenerator;

    beforeEach(() => {
      generator = new DiffHTMLGenerator();
    });

    it('should generate valid HTML', () => {
      const html = generator.generateHTML(mockDiff);
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('</html>');
    });

    it('should include title with source names', () => {
      const html = generator.generateHTML(mockDiff);
      
      expect(html).toContain('Project A');
      expect(html).toContain('Project B');
    });

    it('should include summary statistics', () => {
      const html = generator.generateHTML(mockDiff);
      
      expect(html).toContain('5');  // added
      expect(html).toContain('3');  // removed
      expect(html).toContain('2');  // modified
    });

    it('should include interactive filters', () => {
      const html = generator.generateHTML(mockDiff);
      
      expect(html).toContain('filter-btn');
      expect(html).toContain('data-filter');
      expect(html).toContain('search-box');
    });

    it('should include change items', () => {
      const html = generator.generateHTML(mockDiff);
      
      expect(html).toContain('HomePage');
      expect(html).toContain('Button');
      expect(html).toContain('change-item');
    });

    it('should include JavaScript for interactivity', () => {
      const html = generator.generateHTML(mockDiff);
      
      expect(html).toContain('<script>');
      expect(html).toContain('applyFilters');
      expect(html).toContain('addEventListener');
    });

    it('should escape HTML in feature names', () => {
      const diffWithSpecialChars: DiffResult = {
        ...mockDiff,
        changes: {
          ...mockDiff.changes,
          pages: [
            {
              type: 'added',
              feature: {
                ...mockDiff.changes.pages[0].feature,
                name: '<script>alert("xss")</script>',
                description: 'Test & "quotes"'
              }
            }
          ]
        }
      };

      const html = generator.generateHTML(diffWithSpecialChars);
      
      expect(html).not.toContain('<script>alert("xss")</script>');
      expect(html).toContain('&lt;script&gt;');
      expect(html).toContain('&amp;');
      expect(html).toContain('&quot;');
    });
  });

  describe('File Writing', () => {
    const testOutputDir = path.join(__dirname, '..', '..', 'test-output');
    
    beforeAll(() => {
      if (!fs.existsSync(testOutputDir)) {
        fs.mkdirSync(testOutputDir, { recursive: true });
      }
    });

    afterAll(() => {
      // Clean up test files
      if (fs.existsSync(testOutputDir)) {
        fs.rmSync(testOutputDir, { recursive: true, force: true });
      }
    });

    it('should write markdown to file', () => {
      const generator = new DiffMarkdownGenerator();
      const markdown = generator.generateMarkdown(mockDiff);
      const outputPath = path.join(testOutputDir, 'test-diff.md');
      
      generator.writeToFile(markdown, outputPath);
      
      expect(fs.existsSync(outputPath)).toBe(true);
      const content = fs.readFileSync(outputPath, 'utf-8');
      expect(content).toContain('# Feature Comparison Report');
    });

    it('should write JSON to file', () => {
      const generator = new DiffJSONGenerator();
      const json = generator.generateJSON(mockDiff);
      const outputPath = path.join(testOutputDir, 'test-diff.json');
      
      generator.writeToFile(json, outputPath);
      
      expect(fs.existsSync(outputPath)).toBe(true);
      const content = fs.readFileSync(outputPath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('should write HTML to file', () => {
      const generator = new DiffHTMLGenerator();
      const html = generator.generateHTML(mockDiff);
      const outputPath = path.join(testOutputDir, 'test-diff.html');
      
      generator.writeToFile(html, outputPath);
      
      expect(fs.existsSync(outputPath)).toBe(true);
      const content = fs.readFileSync(outputPath, 'utf-8');
      expect(content).toContain('<!DOCTYPE html>');
    });
  });
});
