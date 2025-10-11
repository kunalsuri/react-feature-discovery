/**
 * SafetyValidator - Ensures safe operations and prevents malicious behavior
 * This module provides guardrails to protect user code from any modifications
 */

import * as path from 'path';
import * as fs from 'fs';

export class SafetyValidator {
  private static readonly DANGEROUS_PATTERNS = [
    /node_modules/i,
    /\.git/i,
    /package\.json$/i,
    /package-lock\.json$/i,
    /yarn\.lock$/i,
    /pnpm-lock\.yaml$/i,
    /\.env/i,
    /\.npmrc$/i,
    /\.yarnrc$/i
  ];

  private static readonly SAFE_OUTPUT_EXTENSIONS = ['.md', '.json', '.html', '.txt'];

  /**
   * Validates that the root directory is safe to analyze
   * Prevents analyzing system directories or sensitive locations
   */
  static validateRootDirectory(rootDir: string): { valid: boolean; error?: string } {
    try {
      const resolvedPath = path.resolve(rootDir);
      
      // Check if directory exists
      if (!fs.existsSync(resolvedPath)) {
        return { valid: false, error: `Directory does not exist: ${rootDir}` };
      }

      // Check if it's actually a directory
      const stats = fs.statSync(resolvedPath);
      if (!stats.isDirectory()) {
        return { valid: false, error: `Path is not a directory: ${rootDir}` };
      }

      // Prevent analyzing system directories
      const systemDirs = ['/', '/bin', '/sbin', '/usr', '/etc', '/var', '/sys', '/proc', 'C:\\Windows', 'C:\\Program Files'];
      if (systemDirs.some(sysDir => resolvedPath === sysDir || resolvedPath.startsWith(sysDir + path.sep))) {
        return { valid: false, error: 'Cannot analyze system directories for safety reasons' };
      }

      return { valid: true };
    } catch (error: any) {
      return { valid: false, error: `Error validating directory: ${error.message}` };
    }
  }

  /**
   * Validates that the output path is safe to write to
   * Prevents overwriting critical files
   */
  static validateOutputPath(outputPath: string, rootDir: string): { valid: boolean; error?: string } {
    try {
      const resolvedPath = path.resolve(outputPath);
      const resolvedRoot = path.resolve(rootDir);
      
      // Check if output is within or relative to root directory (safer)
      const relativePath = path.relative(resolvedRoot, resolvedPath);
      const isInRoot = !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
      
      // Allow output in root or current directory
      if (!isInRoot && !resolvedPath.startsWith(process.cwd())) {
        console.warn('⚠️  Warning: Output path is outside the project directory');
      }

      // Check for dangerous file patterns
      const fileName = path.basename(resolvedPath);
      for (const pattern of this.DANGEROUS_PATTERNS) {
        if (pattern.test(resolvedPath) || pattern.test(fileName)) {
          return { valid: false, error: `Cannot write to protected file: ${fileName}` };
        }
      }

      // Validate file extension
      const ext = path.extname(resolvedPath);
      if (!this.SAFE_OUTPUT_EXTENSIONS.includes(ext)) {
        return { valid: false, error: `Unsafe output file extension: ${ext}. Allowed: ${this.SAFE_OUTPUT_EXTENSIONS.join(', ')}` };
      }

      // Check if we're about to overwrite an important file
      if (fs.existsSync(resolvedPath)) {
        const stats = fs.statSync(resolvedPath);
        if (stats.isDirectory()) {
          return { valid: false, error: 'Output path is a directory, not a file' };
        }
        // File exists but it's okay to overwrite output files
        console.log(`ℹ️  Output file exists and will be overwritten: ${outputPath}`);
      }

      return { valid: true };
    } catch (error: any) {
      return { valid: false, error: `Error validating output path: ${error.message}` };
    }
  }

  /**
   * Validates that a file path is safe to read
   * Prevents reading sensitive files
   */
  static validateReadPath(filePath: string, rootDir: string): boolean {
    try {
      const resolvedPath = path.resolve(filePath);
      const resolvedRoot = path.resolve(rootDir);
      
      // Ensure file is within the root directory
      const relativePath = path.relative(resolvedRoot, resolvedPath);
      if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        return false;
      }

      // Check for dangerous patterns
      for (const pattern of this.DANGEROUS_PATTERNS) {
        if (pattern.test(resolvedPath)) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitizes user input to prevent path traversal attacks
   */
  static sanitizePath(inputPath: string): string {
    // Remove any path traversal attempts
    return inputPath.replace(/\.\./g, '').replace(/[<>:"|?*]/g, '');
  }

  /**
   * Validates configuration to ensure it's safe
   */
  static validateConfig(config: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate root directory
    if (config.rootDir) {
      const rootValidation = this.validateRootDirectory(config.rootDir);
      if (!rootValidation.valid) {
        errors.push(rootValidation.error!);
      }
    }

    // Validate output path
    if (config.outputPath && config.rootDir) {
      const outputValidation = this.validateOutputPath(config.outputPath, config.rootDir);
      if (!outputValidation.valid) {
        errors.push(outputValidation.error!);
      }
    }

    // Ensure exclude dirs includes critical directories
    const criticalDirs = ['node_modules', '.git'];
    if (config.excludeDirs) {
      for (const dir of criticalDirs) {
        if (!config.excludeDirs.includes(dir)) {
          errors.push(`Critical directory "${dir}" must be in excludeDirs for safety`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Checks if the tool is running in a safe environment
   */
  static validateEnvironment(): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];

    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion < 18) {
      warnings.push(`Node.js ${nodeVersion} detected. Version 18+ is recommended.`);
    }

    // Check if running with elevated privileges (not recommended)
    if (process.getuid && process.getuid() === 0) {
      warnings.push('⚠️  Running as root is not recommended for security reasons');
    }

    return {
      valid: true,
      warnings
    };
  }

  /**
   * Creates a safe output directory if it doesn't exist
   */
  static ensureSafeOutputDirectory(outputPath: string): void {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
    }
  }
}
