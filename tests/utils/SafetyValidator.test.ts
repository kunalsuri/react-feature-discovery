/**
 * SafetyValidator Tests
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { SafetyValidator } from '../../src/utils/SafetyValidator';
import { ToolConfig } from '../../src/types/index';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs and path modules
jest.mock('fs');
jest.mock('path');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;

describe('SafetyValidator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockPath.resolve.mockImplementation((p: string) => p);
    mockFs.existsSync.mockReturnValue(true);
    mockFs.statSync.mockReturnValue({
      isDirectory: () => true
    } as fs.Stats);
  });

  describe('validateRootDirectory', () => {
    it('should validate existing directory', () => {
      const result = SafetyValidator.validateRootDirectory('/valid/path');
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject non-existent directory', () => {
      mockFs.existsSync.mockReturnValue(false);
      
      const result = SafetyValidator.validateRootDirectory('/nonexistent');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Directory does not exist: /nonexistent');
    });

    it('should reject file instead of directory', () => {
      mockFs.statSync.mockReturnValue({
        isDirectory: () => false
      } as fs.Stats);
      
      const result = SafetyValidator.validateRootDirectory('/file.txt');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Path is not a directory: /file.txt');
    });

    it('should reject system directories on Unix', () => {
      const systemDirs = ['/', '/bin', '/usr', '/etc', '/var'];
      
      for (const sysDir of systemDirs) {
        const result = SafetyValidator.validateRootDirectory(sysDir);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Cannot analyze system directories for safety reasons');
      }
    });

    it('should reject system directories on Windows', () => {
      const windowsDirs = ['C:\\Windows', 'C:\\Program Files'];
      
      for (const winDir of windowsDirs) {
        const result = SafetyValidator.validateRootDirectory(winDir);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Cannot analyze system directories for safety reasons');
      }
    });

    it('should reject subdirectories of system directories', () => {
      mockPath.resolve.mockImplementation((p: string) => p);
      
      const result = SafetyValidator.validateRootDirectory('/usr/local/bin');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Cannot analyze system directories for safety reasons');
    });

    it('should handle file system errors gracefully', () => {
      mockFs.existsSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });
      
      const result = SafetyValidator.validateRootDirectory('/restricted');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Permission denied');
    });
  });

  describe('validateOutputPath', () => {
    it('should validate safe output paths', () => {
      const safePaths = [
        '/output/report.md',
        '/docs/analysis.json',
        './results.html',
        'report.txt'
      ];
      
      for (const safePath of safePaths) {
        const result = SafetyValidator.validateOutputPath(safePath, '/test/root');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      }
    });

    it('should reject dangerous output paths', () => {
      const dangerousPaths = [
        '/etc/passwd',
        'package.json',
        '.env',
        'node_modules/index.js',
        '/bin/sh',
        'C:\\Windows\\system32\\config'
      ];
      
      for (const dangerousPath of dangerousPaths) {
        const result = SafetyValidator.validateOutputPath(dangerousPath, '/test/root');
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      }
    });

    it('should reject paths with dangerous patterns', () => {
      const dangerousPatterns = [
        '../../../etc/passwd',
        '..\\..\\windows\\system32',
        '/path/node_modules/output.js',
        '/project/.git/config'
      ];
      
      for (const pattern of dangerousPatterns) {
        const result = SafetyValidator.validateOutputPath(pattern, '/test/root');
        expect(result.valid).toBe(false);
      }
    });

    it('should allow safe file extensions', () => {
      const safeExtensions = ['.md', '.json', '.html', '.txt'];
      
      for (const ext of safeExtensions) {
        const result = SafetyValidator.validateOutputPath(`/output/report${ext}`, '/test/root');
        expect(result.valid).toBe(true);
      }
    });

    it('should reject unsafe file extensions', () => {
      const unsafeExtensions = ['.exe', '.sh', '.bat', '.js', '.ts'];
      
      for (const ext of unsafeExtensions) {
        const result = SafetyValidator.validateOutputPath(`/output/script${ext}`, '/test/root');
        expect(result.valid).toBe(false);
      }
    });
  });

  describe('validateConfig', () => {
    let mockConfig: ToolConfig;

    beforeEach(() => {
      mockConfig = {
        rootDir: '/safe/path',
        outputPath: '/safe/output.md',
        outputFormats: ['markdown'],
        excludeDirs: ['node_modules', '.git'],
        filePatterns: ['**/*.{ts,tsx}'],
        detectReactPatterns: true,
        detectHooks: true,
        detectContexts: true,
        detectHOCs: true,
        clientDirs: ['src'],
        serverDirs: ['server'],
        cacheEnabled: true,
        cacheDir: '.cache',
        parallel: true,
        environmentPatterns: [],
        customMigrationRules: []
      };
    });

    it('should validate safe configuration', () => {
      const result = SafetyValidator.validateConfig(mockConfig);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject unsafe root directory', () => {
      mockConfig.rootDir = '/etc';
      
      const result = SafetyValidator.validateConfig(mockConfig);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject unsafe output path', () => {
      mockConfig.outputPath = 'package.json';
      
      const result = SafetyValidator.validateConfig(mockConfig);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid output formats', () => {
      mockConfig.outputFormats = ['exe', 'sh'] as any;
      
      const result = SafetyValidator.validateConfig(mockConfig);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject missing critical excludeDirs', () => {
      mockConfig.excludeDirs = [];
      
      const result = SafetyValidator.validateConfig(mockConfig);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should collect multiple validation errors', () => {
      mockConfig.rootDir = '/etc';
      mockConfig.outputPath = 'package.json';
      mockConfig.excludeDirs = [];
      
      const result = SafetyValidator.validateConfig(mockConfig);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(2);
    });
  });

  describe('validateEnvironment', () => {
    it('should validate safe environment', () => {
      const result = SafetyValidator.validateEnvironment();
      
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should warn about running as root on Unix', () => {
      // Mock process.getuid
      Object.defineProperty(process, 'getuid', {
        value: () => 0,
        configurable: true
      });
      
      const result = SafetyValidator.validateEnvironment();
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('running as root');
    });

    it('should validate Node.js version', () => {
      // Mock process.versions
      Object.defineProperty(process, 'versions', {
        value: { node: '16.0.0' },
        configurable: true
      });
      
      const result = SafetyValidator.validateEnvironment();
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('Node.js version');
    });
  });

  describe('validateReadPath', () => {
    it('should validate safe read paths within root', () => {
      const result = SafetyValidator.validateReadPath('/test/root/file.ts', '/test/root');
      
      expect(result).toBe(true);
    });

    it('should reject paths outside root directory', () => {
      const result = SafetyValidator.validateReadPath('/outside/file.ts', '/test/root');
      
      expect(result).toBe(false);
    });

    it('should reject dangerous file paths', () => {
      const dangerousPaths = [
        '/test/root/node_modules/file.js',
        '/test/root/.git/config',
        '/test/root/package.json'
      ];
      
      for (const dangerousPath of dangerousPaths) {
        const result = SafetyValidator.validateReadPath(dangerousPath, '/test/root');
        expect(result).toBe(false);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings', () => {
      const result = SafetyValidator.validateRootDirectory('');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle null/undefined inputs', () => {
      const result1 = SafetyValidator.validateRootDirectory(null as any);
      const result2 = SafetyValidator.validateRootDirectory(undefined as any);
      
      expect(result1.valid).toBe(false);
      expect(result2.valid).toBe(false);
    });

    it('should handle very long paths', () => {
      const longPath = '/very/long/path/' + 'a'.repeat(1000);
      mockFs.existsSync.mockReturnValue(true);
      
      const result = SafetyValidator.validateRootDirectory(longPath);
      
      expect(result.valid).toBe(true);
    });

    it('should handle special characters in paths', () => {
      const specialPath = '/path/with spaces/and-dashes/and_underscores';
      mockFs.existsSync.mockReturnValue(true);
      
      const result = SafetyValidator.validateRootDirectory(specialPath);
      
      expect(result.valid).toBe(true);
    });
  });
});
