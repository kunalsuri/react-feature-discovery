import { AnalysisError, ErrorType } from '../types/index.js';

export class ErrorHandler {
  private errors: AnalysisError[] = [];

  logError(
    type: ErrorType,
    message: string,
    severity: 'error' | 'warning' | 'info' = 'error',
    file?: string,
    suggestion?: string
  ): void {
    this.errors.push({
      type,
      severity,
      file,
      message,
      suggestion
    });

    // Console logging
    const prefix = severity === 'error' ? '❌' : severity === 'warning' ? '⚠️' : 'ℹ️';
    const fileInfo = file ? ` [${file}]` : '';
    console.log(`${prefix}${fileInfo} ${message}`);
    if (suggestion) {
      console.log(`   💡 ${suggestion}`);
    }
  }

  getErrors(): AnalysisError[] {
    return this.errors;
  }

  getErrorsByType(type: ErrorType): AnalysisError[] {
    return this.errors.filter(e => e.type === type);
  }

  getErrorsBySeverity(severity: 'error' | 'warning' | 'info'): AnalysisError[] {
    return this.errors.filter(e => e.severity === severity);
  }

  hasErrors(): boolean {
    return this.errors.some(e => e.severity === 'error');
  }

  generateErrorSummary(): string {
    const errorCount = this.getErrorsBySeverity('error').length;
    const warningCount = this.getErrorsBySeverity('warning').length;
    const infoCount = this.getErrorsBySeverity('info').length;

    let summary = `## Analysis Errors and Warnings\n\n`;
    summary += `- Errors: ${errorCount}\n`;
    summary += `- Warnings: ${warningCount}\n`;
    summary += `- Info: ${infoCount}\n\n`;

    if (errorCount > 0) {
      summary += `### Errors\n\n`;
      for (const error of this.getErrorsBySeverity('error')) {
        summary += `- **${error.type}**${error.file ? ` in \`${error.file}\`` : ''}: ${error.message}\n`;
        if (error.suggestion) {
          summary += `  - Suggestion: ${error.suggestion}\n`;
        }
      }
      summary += `\n`;
    }

    if (warningCount > 0) {
      summary += `### Warnings\n\n`;
      for (const warning of this.getErrorsBySeverity('warning')) {
        summary += `- **${warning.type}**${warning.file ? ` in \`${warning.file}\`` : ''}: ${warning.message}\n`;
        if (warning.suggestion) {
          summary += `  - Suggestion: ${warning.suggestion}\n`;
        }
      }
      summary += `\n`;
    }

    return summary;
  }

  clear(): void {
    this.errors = [];
  }
}
