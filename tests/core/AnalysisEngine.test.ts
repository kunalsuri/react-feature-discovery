/**
 * AnalysisEngine Tests
 */

import { describe, it, expect, jest, beforeEach, afterEach, beforeAll } from '@jest/globals';
import type { ToolConfig } from '../../src/types';
import * as path from 'path';

// jest.unstable_mockModule needs a specifier that resolves to the exact same
// module the code under test imports. Relative specifiers combined with this
// project's moduleNameMapper (which strips the .js suffix off relative
// imports) don't resolve reliably from unstable_mockModule's call site, so
// mock registration uses absolute paths to the TS sources instead.
const srcPath = (relativeToSrc: string) => path.resolve(process.cwd(), 'src', relativeToSrc);

// --- ESM-compatible mocking -------------------------------------------------
// This file exercises AnalysisEngine's orchestration of several collaborator
// classes plus fs.promises. Under this project's ESM Jest setup
// (--experimental-vm-modules), top-level synchronous jest.mock(...) +
// require(...) (the CJS pattern this file used previously) doesn't hoist/
// intercept ES module imports. The documented ESM-compatible replacement is
// jest.unstable_mockModule(...) registered before dynamically importing the
// module under test.
const FileScannerMock = jest.fn();
const DependencyAnalyzerMock = jest.fn();
const MetadataExtractorMock = jest.fn();
const CatalogBuilderMock = jest.fn();
const MarkdownWriterMock = jest.fn();
const JSONGeneratorMock = jest.fn();
const HTMLGeneratorMock = jest.fn();
const ErrorHandlerMock = jest.fn();

const mockValidateEnvironment = jest.fn();
const mockValidateConfig = jest.fn();
const mockValidateOutputPath = jest.fn();
const mockValidateReadPath = jest.fn();
const mockEnsureSafeOutputDirectory = jest.fn();

const mockReadFile = jest.fn() as any;

jest.unstable_mockModule(srcPath('scanners/FileScanner.ts'), () => ({
  FileScanner: FileScannerMock
}));
jest.unstable_mockModule(srcPath('analyzers/DependencyAnalyzer.ts'), () => ({
  DependencyAnalyzer: DependencyAnalyzerMock
}));
jest.unstable_mockModule(srcPath('analyzers/MetadataExtractor.ts'), () => ({
  MetadataExtractor: MetadataExtractorMock
}));
jest.unstable_mockModule(srcPath('analyzers/CatalogBuilder.ts'), () => ({
  CatalogBuilder: CatalogBuilderMock
}));
jest.unstable_mockModule(srcPath('generators/MarkdownGenerator.ts'), () => ({
  MarkdownWriter: MarkdownWriterMock
}));
jest.unstable_mockModule(srcPath('generators/JSONGenerator.ts'), () => ({
  JSONGenerator: JSONGeneratorMock
}));
jest.unstable_mockModule(srcPath('generators/HTMLGenerator.ts'), () => ({
  HTMLGenerator: HTMLGeneratorMock
}));
jest.unstable_mockModule(srcPath('utils/ErrorHandler.ts'), () => ({
  ErrorHandler: ErrorHandlerMock
}));
jest.unstable_mockModule(srcPath('utils/SafetyValidator.ts'), () => ({
  SafetyValidator: {
    validateEnvironment: mockValidateEnvironment,
    validateConfig: mockValidateConfig,
    validateOutputPath: mockValidateOutputPath,
    validateReadPath: mockValidateReadPath,
    ensureSafeOutputDirectory: mockEnsureSafeOutputDirectory
  }
}));
jest.unstable_mockModule('fs', () => ({
  ...(jest.requireActual('fs') as object),
  promises: {
    readFile: mockReadFile
  }
}));

let AnalysisEngine: typeof import('../../src/core/AnalysisEngine').AnalysisEngine;

beforeAll(async () => {
  ({ AnalysisEngine } = await import('../../src/core/AnalysisEngine'));
});

describe('AnalysisEngine', () => {
  let analysisEngine: InstanceType<typeof AnalysisEngine>;
  let mockConfig: ToolConfig;
  // Re-spied fresh every test: afterEach below calls jest.restoreAllMocks(),
  // which un-wraps spies created via jest.spyOn (unlike jest.clearAllMocks(),
  // which only clears call history) - a module-level spy would only survive
  // the first test in this file.
  let mockConsoleLog: ReturnType<typeof jest.spyOn>;
  let mockConsoleError: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockValidateOutputPath.mockReturnValue({ valid: true });
    mockValidateReadPath.mockReturnValue(true);
    mockValidateEnvironment.mockReturnValue({ valid: true, warnings: [] });
    mockValidateConfig.mockReturnValue({ valid: true, errors: [] });
    mockEnsureSafeOutputDirectory.mockReturnValue(undefined);
    mockReadFile.mockResolvedValue('export const Test = () => null;');

    ErrorHandlerMock.mockImplementation(() => ({
      logError: jest.fn()
    }));

    mockConfig = {
      rootDir: '/test/root',
      outputPath: '/test/output.md',
      outputFormats: ['markdown'],
      excludeDirs: ['node_modules', 'dist'],
      filePatterns: ['**/*.{ts,tsx,js,jsx}'],
      detectReactPatterns: true,
      detectHooks: true,
      detectContexts: true,
      detectHOCs: true,
      clientDirs: ['src', 'client'],
      serverDirs: ['server', 'api'],
      cacheEnabled: true,
      cacheDir: '.cache',
      parallel: true,
      environmentPatterns: [],
      customMigrationRules: []
    };

    analysisEngine = new AnalysisEngine(mockConfig);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with provided config', () => {
      expect(analysisEngine).toBeInstanceOf(AnalysisEngine);
    });

    it('should create error handler instance', () => {
      expect(ErrorHandlerMock).toHaveBeenCalled();
    });
  });

  describe('analyze()', () => {
    const mockFiles = [
      { path: '/test/root/test.tsx', relativePath: 'test.tsx', name: 'test.tsx', extension: '.tsx', size: 10, category: 'component' }
    ];

    beforeEach(() => {
      // Mock FileScanner
      const mockScanner = {
        scanDirectory: (jest.fn() as any).mockResolvedValue(mockFiles),
        getErrors: jest.fn().mockReturnValue([])
      };
      FileScannerMock.mockImplementation(() => mockScanner);

      // Mock other dependencies
      DependencyAnalyzerMock.mockImplementation(() => ({
        analyzeDependencies: jest.fn().mockReturnValue({
          internal: [],
          external: [],
          routes: [],
          apis: []
        }),
        buildDependencyGraph: jest.fn().mockReturnValue({
          nodes: new Map(),
          edges: []
        })
      }));

      MetadataExtractorMock.mockImplementation(() => ({
        extractMetadata: jest.fn().mockReturnValue({
          name: 'Test',
          filePath: 'test.tsx',
          category: 'component',
          description: '',
          exports: [],
          complexity: { linesOfCode: 10, dependencies: 0 },
          migrationNotes: []
        })
      }));

      CatalogBuilderMock.mockImplementation(() => ({
        buildCatalog: jest.fn().mockReturnValue({
          metadata: { projectName: 'Test', generatedAt: new Date().toISOString(), totalFiles: 1, totalFeatures: 1, version: '1.0.0' },
          summary: { pages: 0, components: 0, services: 0, hooks: 0, utilities: 0, types: 0, externalDependencies: [], keyTechnologies: [] },
          features: { pages: [], components: [], services: [], hooks: [], utilities: [], types: [], modules: [] },
          dependencyGraph: { nodes: new Map(), edges: [] },
          migrationGuide: { overview: '', recommendations: [], challenges: [], migrationOrder: [] }
        })
      }));

      MarkdownWriterMock.mockImplementation(() => ({
        generateMarkdown: jest.fn().mockReturnValue('# Catalog'),
        writeToFile: jest.fn()
      }));
    });

    it('should run analysis successfully', async () => {
      await expect(analysisEngine.analyze()).resolves.not.toThrow();
    });

    it('should log analysis start information', async () => {
      await analysisEngine.analyze();

      expect(mockConsoleLog).toHaveBeenCalledWith('🔍 Starting React Feature Discovery Analysis...\n');
      expect(mockConsoleLog).toHaveBeenCalledWith('🛡️  Safety Mode: ENABLED (Read-only analysis, no code modifications)\n');
      expect(mockConsoleLog).toHaveBeenCalledWith(`📁 Root Directory: ${mockConfig.rootDir}`);
      expect(mockConsoleLog).toHaveBeenCalledWith(`📄 Output Path: ${mockConfig.outputPath}\n`);
    });

    it('should handle scanner errors gracefully', async () => {
      const mockScanner = {
        scanDirectory: (jest.fn() as any).mockResolvedValue(mockFiles),
        getErrors: jest.fn().mockReturnValue(['File not found: test.tsx'])
      };
      FileScannerMock.mockImplementation(() => mockScanner);

      const mockErrorHandler = {
        logError: jest.fn()
      };
      ErrorHandlerMock.mockImplementation(() => mockErrorHandler);
      analysisEngine = new AnalysisEngine(mockConfig);

      await analysisEngine.analyze();

      expect(mockErrorHandler.logError).toHaveBeenCalledWith('FILE_NOT_FOUND', 'File not found: test.tsx', 'warning');
    });

    it('should handle analysis errors', async () => {
      FileScannerMock.mockImplementation(() => ({
        scanDirectory: (jest.fn() as any).mockRejectedValue(new Error('Scanner error')),
        getErrors: jest.fn().mockReturnValue([])
      }));

      await expect(analysisEngine.analyze()).rejects.toThrow('Scanner error');
    });
  });

  describe('Configuration Validation', () => {
    it('should work with minimal config', () => {
      const minimalConfig: ToolConfig = {
        rootDir: '.',
        outputPath: 'output.md',
        outputFormats: ['markdown'],
        excludeDirs: [],
        filePatterns: [],
        detectReactPatterns: false,
        detectHooks: false,
        detectContexts: false,
        detectHOCs: false,
        clientDirs: [],
        serverDirs: [],
        cacheEnabled: false,
        cacheDir: '.cache',
        parallel: false,
        environmentPatterns: [],
        customMigrationRules: []
      };

      expect(() => new AnalysisEngine(minimalConfig)).not.toThrow();
    });
  });
});
