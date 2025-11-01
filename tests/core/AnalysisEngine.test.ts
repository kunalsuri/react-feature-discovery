/**
 * AnalysisEngine Tests
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { AnalysisEngine } from '../../src/core/AnalysisEngine';
import { ToolConfig } from '../../src/types';
import * as fs from 'fs';

// Mock dependencies
jest.mock('../../src/scanners/FileScanner');
jest.mock('../../src/analyzers/DependencyAnalyzer');
jest.mock('../../src/analyzers/MetadataExtractor');
jest.mock('../../src/analyzers/CatalogBuilder');
jest.mock('../../src/generators/MarkdownGenerator');
jest.mock('../../src/generators/JSONGenerator');
jest.mock('../../src/generators/HTMLGenerator');
jest.mock('../../src/utils/ErrorHandler');
jest.mock('../../src/utils/SafetyValidator');
jest.mock('fs');

const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('AnalysisEngine', () => {
  let analysisEngine: AnalysisEngine;
  let mockConfig: ToolConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    
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
      const { ErrorHandler } = require('../../src/utils/ErrorHandler');
      expect(ErrorHandler).toHaveBeenCalled();
    });
  });

  describe('analyze()', () => {
    const mockFiles = [
      { relativePath: 'test.tsx', fullPath: '/test/root/test.tsx', content: 'export const Test = () => null;' }
    ];

    beforeEach(() => {
      // Mock FileScanner
      const { FileScanner } = require('../../src/scanners/FileScanner');
      const mockScanner = {
        // @ts-ignore - Mock type mismatch
        scanDirectory: jest.fn().mockResolvedValue(mockFiles),
        // @ts-ignore - Mock type mismatch
        getErrors: jest.fn().mockReturnValue([])
      };
      (FileScanner as any).mockImplementation(() => mockScanner);

      // Mock other dependencies
      const { DependencyAnalyzer } = require('../../src/analyzers/DependencyAnalyzer');
      const { MetadataExtractor } = require('../../src/analyzers/MetadataExtractor');
      const { CatalogBuilder } = require('../../src/analyzers/CatalogBuilder');
      const { MarkdownWriter } = require('../../src/generators/MarkdownGenerator');
      const { SafetyValidator } = require('../../src/utils/SafetyValidator');

      (DependencyAnalyzer as any).mockImplementation(() => ({
        analyzeDependencies: jest.fn().mockReturnValue({
          internal: [],
          external: [],
          routes: [],
          apis: []
        }),
        buildDependencyGraph: jest.fn().mockReturnValue({
          nodes: [],
          edges: []
        })
      }));

      (MetadataExtractor as any).mockImplementation(() => ({
        // @ts-ignore - Mock type mismatch
        extractMetadata: jest.fn().mockResolvedValue({
          complexity: 1,
          linesOfCode: 10,
          features: []
        })
      }));

      (CatalogBuilder as any).mockImplementation(() => ({
        // @ts-ignore - Mock type mismatch
        buildCatalog: jest.fn().mockResolvedValue({
          title: 'Test Catalog',
          features: []
        })
      }));

      (MarkdownWriter as any).mockImplementation(() => ({
        // @ts-ignore - Mock type mismatch
        write: jest.fn().mockResolvedValue(undefined)
      }));

      SafetyValidator.validateEnvironment = jest.fn().mockReturnValue({
        valid: true,
        warnings: []
      });

      SafetyValidator.validateConfig = jest.fn().mockReturnValue({
        valid: true,
        errors: []
      });
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
      const { FileScanner } = require('../../src/scanners/FileScanner');
      const mockScanner = {
        // @ts-ignore - Mock type mismatch
        scanDirectory: jest.fn().mockResolvedValue(mockFiles),
        // @ts-ignore - Mock type mismatch
        getErrors: jest.fn().mockReturnValue(['File not found: test.tsx'])
      };
      (FileScanner as any).mockImplementation(() => mockScanner);

      const { ErrorHandler } = require('../../src/utils/ErrorHandler');
      const mockErrorHandler = {
        logError: jest.fn()
      };
      (ErrorHandler as any).mockImplementation(() => mockErrorHandler);

      await analysisEngine.analyze();
      
      expect(mockErrorHandler.logError).toHaveBeenCalledWith('FILE_NOT_FOUND', 'File not found: test.tsx', 'warning');
    });

    it('should handle analysis errors', async () => {
      const { FileScanner } = require('../../src/scanners/FileScanner');
      (FileScanner as any).mockImplementation(() => ({
        // @ts-ignore - Mock type mismatch
        scanDirectory: jest.fn().mockRejectedValue(new Error('Scanner error')),
        // @ts-ignore - Mock type mismatch
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
