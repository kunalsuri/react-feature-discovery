/**
 * Simple CLI Test to verify imports work
 */

import { describe, it, expect } from '@jest/globals';
import { parseCLIArgs } from '../src/cli.js';

describe('CLI Import Test', () => {
  it('should import parseCLIArgs function', () => {
    expect(typeof parseCLIArgs).toBe('function');
  });

  it('should parse empty arguments', () => {
    const result = parseCLIArgs([]);
    expect(result).toEqual({});
  });

  it('should parse basic arguments', () => {
    const result = parseCLIArgs(['--root', './test']);
    expect(result.rootDir).toBe('./test');
  });
});
