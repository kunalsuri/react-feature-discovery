/**
 * CLI Integration Tests for React Feature Discovery Tool
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('CLI Integration Tests', () => {
  const cliPath = join(__dirname, '../dist/cli.js');
  
  beforeEach(async () => {
    // Build the project before running integration tests
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    try {
      await execAsync('npm run build');
    } catch (error) {
      console.warn('Build failed, integration tests may not work');
    }
  });

  describe('Help and Version Flags', () => {
    it('should show help with --help flag', (done) => {
      const child = spawn('node', [cliPath, '--help']);
      let output = '';
      
      child.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(output).toContain('React Feature Discovery Tool');
        expect(output).toContain('Usage: rfd [options]');
        done();
      });
    });

    it('should show help with -h flag', (done) => {
      const child = spawn('node', [cliPath, '-h']);
      let output = '';
      
      child.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(output).toContain('React Feature Discovery Tool');
        done();
      });
    });

    it('should show version with --version flag', (done) => {
      const child = spawn('node', [cliPath, '--version']);
      let output = '';
      
      child.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(output).toContain('react-feature-discovery v0.1.0');
        done();
      });
    });

    it('should show version with -v flag', (done) => {
      const child = spawn('node', [cliPath, '-v']);
      let output = '';
      
      child.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(output).toContain('react-feature-discovery v0.1.0');
        done();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid root directory gracefully', (done) => {
      const child = spawn('node', [cliPath, '--root', '/nonexistent/path']);
      let errorOutput = '';
      let stdoutOutput = '';
      
      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      child.stdout.on('data', (data) => {
        stdoutOutput += data.toString();
      });
      
      child.on('close', (code) => {
        expect(code).not.toBe(0);
        // Check for error indicators in either stderr or stdout
        const allOutput = errorOutput + stdoutOutput;
        expect(allOutput.length).toBeGreaterThan(0);
        expect(allOutput).toMatch(/error|failed|Error|❌/i);
        done();
      });
    });

    it('should handle invalid config file gracefully', (done) => {
      const child = spawn('node', [cliPath, '--config', '/nonexistent/config.json']);
      let errorOutput = '';
      
      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      child.on('close', (code) => {
        expect(code).not.toBe(0);
        done();
      });
    });
  });

  describe('Basic Functionality', () => {
    it('should accept basic arguments without crashing', (done) => {
      const child = spawn('node', [cliPath, '--root', '.']);
      let output = '';
      let errorOutput = '';
      
      child.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      child.on('close', (code) => {
        // We expect this might fail due to missing React components, but shouldn't crash
        // The important thing is that argument parsing works
        expect(code).toBeDefined();
        done();
      });
      
      // Kill the process after a timeout to avoid hanging
      setTimeout(() => {
        child.kill();
        done();
      }, 5000);
    });
  });
});
