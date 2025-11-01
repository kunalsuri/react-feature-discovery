/**
 * ErrorHandler Tests
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { ErrorHandler } from '../../src/utils/ErrorHandler';
import { ErrorType, AnalysisError } from '../../src/types/index';

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;
  let mockConsoleLog: jest.SpiedFunction<typeof console.log>;

  beforeEach(() => {
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorHandler = new ErrorHandler();
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
  });

  describe('logError', () => {
    it('should log error with default severity', () => {
      errorHandler.logError('SYNTAX_ERROR', 'Test error message');
      
      const errors = errorHandler.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual({
        type: 'SYNTAX_ERROR',
        severity: 'error',
        file: undefined,
        message: 'Test error message',
        suggestion: undefined
      });
    });

    it('should log warning severity', () => {
      errorHandler.logError('FILE_NOT_FOUND', 'Warning message', 'warning');
      
      const errors = errorHandler.getErrors();
      expect(errors[0].severity).toBe('warning');
    });

    it('should log info severity', () => {
      errorHandler.logError('INFO_MESSAGE', 'Info message', 'info');
      
      const errors = errorHandler.getErrors();
      expect(errors[0].severity).toBe('info');
    });

    it('should include file information', () => {
      errorHandler.logError('PARSE_ERROR', 'Error in file', 'error', 'test.ts');
      
      const errors = errorHandler.getErrors();
      expect(errors[0].file).toBe('test.ts');
    });

    it('should include suggestion', () => {
      errorHandler.logError('CONFIG_ERROR', 'Config error', 'error', undefined, 'Check config file');
      
      const errors = errorHandler.getErrors();
      expect(errors[0].suggestion).toBe('Check config file');
    });

    it('should log to console with appropriate prefix', () => {
      errorHandler.logError('SYNTAX_ERROR', 'Test error', 'error', 'test.ts', 'Fix syntax');
      
      expect(mockConsoleLog).toHaveBeenCalledWith('❌ [test.ts] Test error');
      expect(mockConsoleLog).toHaveBeenCalledWith('   💡 Fix syntax');
    });

    it('should log warning with warning prefix', () => {
      errorHandler.logError('FILE_NOT_FOUND', 'File missing', 'warning');
      
      expect(mockConsoleLog).toHaveBeenCalledWith('⚠️ File missing');
    });

    it('should log info with info prefix', () => {
      errorHandler.logError('INFO_MESSAGE', 'Just info', 'info');
      
      expect(mockConsoleLog).toHaveBeenCalledWith('ℹ️ Just info');
    });

    it('should not log suggestion if not provided', () => {
      errorHandler.logError('SYNTAX_ERROR', 'Error without suggestion');
      
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mockConsoleLog).toHaveBeenCalledWith('❌ Error without suggestion');
    });

    it('should handle multiple errors', () => {
      errorHandler.logError('ERROR_1', 'First error');
      errorHandler.logError('ERROR_2', 'Second error', 'warning');
      errorHandler.logError('ERROR_3', 'Third error', 'info');
      
      const errors = errorHandler.getErrors();
      expect(errors).toHaveLength(3);
      expect(errors[0].type).toBe('ERROR_1');
      expect(errors[1].type).toBe('ERROR_2');
      expect(errors[2].type).toBe('ERROR_3');
    });
  });

  describe('getErrors', () => {
    it('should return all logged errors', () => {
      errorHandler.logError('ERROR_1', 'First');
      errorHandler.logError('ERROR_2', 'Second');
      
      const errors = errorHandler.getErrors();
      expect(errors).toHaveLength(2);
      expect(errors.map((e: any) => e.message)).toEqual(['First', 'Second']);
    });

    it('should return empty array when no errors', () => {
      const errors = errorHandler.getErrors();
      expect(errors).toHaveLength(0);
    });
  });

  describe('getErrorsByType', () => {
    it('should filter errors by type', () => {
      errorHandler.logError('SYNTAX_ERROR', 'Syntax issue');
      errorHandler.logError('FILE_NOT_FOUND', 'Missing file');
      errorHandler.logError('SYNTAX_ERROR', 'Another syntax issue');
      
      const syntaxErrors = errorHandler.getErrorsByType('SYNTAX_ERROR');
      expect(syntaxErrors).toHaveLength(2);
      expect(syntaxErrors.every((e: any) => e.type === 'SYNTAX_ERROR')).toBe(true);
    });

    it('should return empty array for non-existent type', () => {
      errorHandler.logError('SYNTAX_ERROR', 'Syntax issue');
      
      const configErrors = errorHandler.getErrorsByType('CONFIG_ERROR');
      expect(configErrors).toHaveLength(0);
    });
  });

  describe('getErrorsBySeverity', () => {
    it('should filter errors by severity', () => {
      errorHandler.logError('ERROR_1', 'Error message', 'error');
      errorHandler.logError('ERROR_2', 'Warning message', 'warning');
      errorHandler.logError('ERROR_3', 'Info message', 'info');
      errorHandler.logError('ERROR_4', 'Another error', 'error');
      
      const errorMessages = errorHandler.getErrorsBySeverity('error');
      const warningMessages = errorHandler.getErrorsBySeverity('warning');
      const infoMessages = errorHandler.getErrorsBySeverity('info');
      
      expect(errorMessages).toHaveLength(2);
      expect(warningMessages).toHaveLength(1);
      expect(infoMessages).toHaveLength(1);
      
      expect(errorMessages.every((e: any) => e.severity === 'error')).toBe(true);
      expect(warningMessages.every((e: any) => e.severity === 'warning')).toBe(true);
      expect(infoMessages.every((e: any) => e.severity === 'info')).toBe(true);
    });
  });

  describe('hasErrors', () => {
    it('should return true when errors are present', () => {
      errorHandler.logError('SYNTAX_ERROR', 'Error message', 'error');
      
      expect(errorHandler.hasErrors()).toBe(true);
    });

    it('should return false when only warnings are present', () => {
      errorHandler.logError('FILE_NOT_FOUND', 'Warning message', 'warning');
      
      expect(errorHandler.hasErrors()).toBe(false);
    });

    it('should return false when only info messages are present', () => {
      errorHandler.logError('INFO_MESSAGE', 'Info message', 'info');
      
      expect(errorHandler.hasErrors()).toBe(false);
    });

    it('should return false when no messages are present', () => {
      expect(errorHandler.hasErrors()).toBe(false);
    });
  });

  describe('generateErrorSummary', () => {
    it('should generate summary with counts', () => {
      errorHandler.logError('ERROR_1', 'Error 1', 'error');
      errorHandler.logError('ERROR_2', 'Warning 1', 'warning');
      errorHandler.logError('ERROR_3', 'Info 1', 'info');
      
      const summary = errorHandler.generateErrorSummary();
      
      expect(summary).toContain('## Analysis Errors and Warnings');
      expect(summary).toContain('Errors: 1');
      expect(summary).toContain('Warnings: 1');
      expect(summary).toContain('Info: 1');
    });

    it('should include error details', () => {
      errorHandler.logError('SYNTAX_ERROR', 'Syntax issue', 'error', 'test.ts', 'Fix syntax');
      
      const summary = errorHandler.generateErrorSummary();
      
      expect(summary).toContain('### Errors');
      expect(summary).toContain('**SYNTAX_ERROR** in `test.ts`: Syntax issue');
      expect(summary).toContain('Suggestion: Fix syntax');
    });

    it('should include warning details', () => {
      errorHandler.logError('FILE_NOT_FOUND', 'Missing file', 'warning', 'missing.ts');
      
      const summary = errorHandler.generateErrorSummary();
      
      expect(summary).toContain('### Warnings');
      expect(summary).toContain('**FILE_NOT_FOUND** in `missing.ts`: Missing file');
    });

    it('should handle errors without file', () => {
      errorHandler.logError('GENERAL_ERROR', 'General error', 'error');
      
      const summary = errorHandler.generateErrorSummary();
      
      expect(summary).toContain('**GENERAL_ERROR**: General error');
    });

    it('should handle errors without suggestion', () => {
      errorHandler.logError('SIMPLE_ERROR', 'Simple error', 'error', 'test.ts');
      
      const summary = errorHandler.generateErrorSummary();
      
      expect(summary).toContain('**SIMPLE_ERROR** in `test.ts`: Simple error');
      expect(summary).not.toContain('Suggestion:');
    });

    it('should generate empty summary when no errors', () => {
      const summary = errorHandler.generateErrorSummary();
      
      expect(summary).toContain('## Analysis Errors and Warnings');
      expect(summary).toContain('Errors: 0');
      expect(summary).toContain('Warnings: 0');
      expect(summary).toContain('Info: 0');
    });

    it('should handle multiple errors of same type', () => {
      errorHandler.logError('SYNTAX_ERROR', 'First syntax error', 'error', 'file1.ts');
      errorHandler.logError('SYNTAX_ERROR', 'Second syntax error', 'error', 'file2.ts');
      
      const summary = errorHandler.generateErrorSummary();
      
      expect(summary).toContain('**SYNTAX_ERROR** in `file1.ts`: First syntax error');
      expect(summary).toContain('**SYNTAX_ERROR** in `file2.ts`: Second syntax error');
    });
  });

  describe('clear', () => {
    it('should clear all errors', () => {
      errorHandler.logError('ERROR_1', 'First error');
      errorHandler.logError('ERROR_2', 'Second error');
      
      expect(errorHandler.getErrors()).toHaveLength(2);
      
      errorHandler.clear();
      
      expect(errorHandler.getErrors()).toHaveLength(0);
    });

    it('should reset hasErrors state', () => {
      errorHandler.logError('ERROR_1', 'Error message', 'error');
      
      expect(errorHandler.hasErrors()).toBe(true);
      
      errorHandler.clear();
      
      expect(errorHandler.hasErrors()).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message', () => {
      errorHandler.logError('EMPTY_ERROR', '');
      
      const errors = errorHandler.getErrors();
      expect(errors[0].message).toBe('');
    });

    it('should handle very long messages', () => {
      const longMessage = 'a'.repeat(1000);
      errorHandler.logError('LONG_ERROR', longMessage);
      
      const errors = errorHandler.getErrors();
      expect(errors[0].message).toBe(longMessage);
    });

    it('should handle special characters in messages', () => {
      const specialMessage = 'Error with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
      errorHandler.logError('SPECIAL_ERROR', specialMessage);
      
      const errors = errorHandler.getErrors();
      expect(errors[0].message).toBe(specialMessage);
    });

    it('should handle unicode characters', () => {
      const unicodeMessage = 'Error with unicode: 🚀 ñáéíóú 中文';
      errorHandler.logError('UNICODE_ERROR', unicodeMessage);
      
      const errors = errorHandler.getErrors();
      expect(errors[0].message).toBe(unicodeMessage);
    });
  });
});
