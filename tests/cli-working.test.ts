/**
 * CLI Test using compiled JavaScript files
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

describe('CLI Functionality', () => {
  let mockConsoleLog: any;
  let mockConsoleError: any;
  let mockProcessExit: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockProcessExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit was called');
    }) as any;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('parseCLIArgs', () => {
    it('should parse empty arguments', async () => {
      const { parseCLIArgs } = await import('../dist/cli.js');
      const result = parseCLIArgs([]);
      expect(result).toEqual({});
    });

    it('should parse root directory argument', async () => {
      const { parseCLIArgs } = await import('../dist/cli.js');
      const result = parseCLIArgs(['--root', './test']);
      expect(result.rootDir).toBe('./test');
    });

    it('should parse output path argument', async () => {
      const { parseCLIArgs } = await import('../dist/cli.js');
      const result = parseCLIArgs(['--output', 'output.md']);
      expect(result.outputPath).toBe('output.md');
    });

    it('should parse format argument', async () => {
      const { parseCLIArgs } = await import('../dist/cli.js');
      const result = parseCLIArgs(['--format', 'json']);
      expect(result.outputFormats).toEqual(['json']);
    });

    it('should parse multiple formats', async () => {
      const { parseCLIArgs } = await import('../dist/cli.js');
      const result = parseCLIArgs(['--format', 'markdown,json,html']);
      expect(result.outputFormats).toEqual(['markdown', 'json', 'html']);
    });

    it('should parse boolean flags', async () => {
      const { parseCLIArgs } = await import('../dist/cli.js');
      const result = parseCLIArgs(['--no-cache', '--no-parallel']);
      expect(result.cacheEnabled).toBe(false);
      expect(result.parallel).toBe(false);
    });
  });

  describe('showHelp', () => {
    it('should display help information', async () => {
      const { showHelp } = await import('../dist/cli.js');
      showHelp();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('React Feature Discovery Tool')
      );
    });
  });
});
