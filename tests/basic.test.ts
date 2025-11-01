/**
 * Basic Test to Verify Jest Setup
 */

import { describe, it, expect, jest } from '@jest/globals';

describe('Jest Setup', () => {
  it('should run basic tests', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle async operations', async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });

  it('should mock functions', () => {
    const mockFn = jest.fn(() => 'mocked');
    mockFn();
    expect(mockFn).toHaveBeenCalled();
    expect(mockFn()).toBe('mocked');
  });
});
