/**
 * CLI Tests
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { parseCLIArgs, showHelp } from '../src/cli';

describe('CLI Argument Parsing', () => {
  let mockConsoleLog: jest.SpiedFunction<typeof console.log>;
  let mockConsoleError: jest.SpiedFunction<typeof console.error>;
  let mockConsoleWarn: jest.SpiedFunction<typeof console.warn>;
  let mockProcessExit: jest.SpiedFunction<typeof process.exit>;

  beforeEach(() => {
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockProcessExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit was called');
    }) as any;
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    mockConsoleWarn.mockRestore();
    mockProcessExit.mockRestore();
  });

  describe('parseCLIArgs', () => {
    it('should parse empty arguments', () => {
      const result = parseCLIArgs([]);
      expect(result).toEqual({});
    });

    it('should parse root directory argument', () => {
      const result = parseCLIArgs(['--root', '/test/path']);
      expect(result.rootDir).toBe('/test/path');
    });

    it('should parse short form root directory argument', () => {
      const result = parseCLIArgs(['-r', '/test/path']);
      expect(result.rootDir).toBe('/test/path');
    });

    it('should parse output path argument', () => {
      const result = parseCLIArgs(['--output', '/output/path.md']);
      expect(result.outputPath).toBe('/output/path.md');
    });

    it('should parse short form output path argument', () => {
      const result = parseCLIArgs(['-o', '/output/path.md']);
      expect(result.outputPath).toBe('/output/path.md');
    });

    it('should parse format argument with multiple formats', () => {
      const result = parseCLIArgs(['--format', 'markdown,json,html']);
      expect(result.outputFormats).toEqual(['markdown', 'json', 'html']);
    });

    it('should parse short form format argument', () => {
      const result = parseCLIArgs(['-f', 'json']);
      expect(result.outputFormats).toEqual(['json']);
    });

    it('should parse config file argument', () => {
      const result = parseCLIArgs(['--config', '/path/to/config.json']);
      expect((result as any).config).toBe('/path/to/config.json');
    });

    it('should parse short form config file argument', () => {
      const result = parseCLIArgs(['-c', '/path/to/config.json']);
      expect((result as any).config).toBe('/path/to/config.json');
    });

    it('should parse no-cache flag', () => {
      const result = parseCLIArgs(['--no-cache']);
      expect(result.cacheEnabled).toBe(false);
    });

    it('should parse no-parallel flag', () => {
      const result = parseCLIArgs(['--no-parallel']);
      expect(result.parallel).toBe(false);
    });

    it('should parse multiple arguments correctly', () => {
      const args = [
        '--root', '/src',
        '--output', '/docs/features.md',
        '--format', 'markdown,json',
        '--no-cache',
        '--no-parallel'
      ];
      const result = parseCLIArgs(args);
      
      expect(result.rootDir).toBe('/src');
      expect(result.outputPath).toBe('/docs/features.md');
      expect(result.outputFormats).toEqual(['markdown', 'json']);
      expect(result.cacheEnabled).toBe(false);
      expect(result.parallel).toBe(false);
    });

    it('should handle arguments without values gracefully', () => {
      const result = parseCLIArgs(['--root']);
      expect(result).toEqual({});
    });
  });

  describe('showHelp', () => {
    it('should display help information', () => {
      showHelp();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('React Feature Discovery Tool')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Usage: rfd [options]')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('--root <path>')
      );
    });

    it('should include all available options in help', () => {
      showHelp();
      const helpOutput = mockConsoleLog.mock.calls[0][0];
      
      expect(helpOutput).toContain('--root');
      expect(helpOutput).toContain('--output');
      expect(helpOutput).toContain('--format');
      expect(helpOutput).toContain('--config');
      expect(helpOutput).toContain('--no-cache');
      expect(helpOutput).toContain('--no-parallel');
      expect(helpOutput).toContain('--version');
      expect(helpOutput).toContain('--help');
    });
  });
});
