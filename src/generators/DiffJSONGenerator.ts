import * as fs from 'fs';
import { DiffResult } from '../types/diff.js';

/**
 * DiffJSONGenerator - Generates machine-readable JSON reports for feature comparisons
 * Perfect for CI/CD integration and automated processing
 */
export class DiffJSONGenerator {
  /**
   * Generate a complete JSON diff report
   */
  generateJSON(diff: DiffResult): string {
    // Create a clean, structured JSON object
    const report = {
      metadata: {
        generatedAt: diff.timestamp,
        sourceA: diff.sourceA,
        sourceB: diff.sourceB,
        tool: 'React Feature Discovery',
        version: '1.0.0',
        reportType: 'feature-comparison'
      },
      summary: {
        totalChanges: diff.summary.total,
        added: diff.summary.added,
        removed: diff.summary.removed,
        modified: diff.summary.modified,
        changeRate: this.calculateChangeRate(diff)
      },
      changes: {
        pages: this.formatChangesForJSON(diff.changes.pages),
        components: this.formatChangesForJSON(diff.changes.components),
        services: this.formatChangesForJSON(diff.changes.services),
        hooks: this.formatChangesForJSON(diff.changes.hooks),
        utilities: this.formatChangesForJSON(diff.changes.utilities),
        types: this.formatChangesForJSON(diff.changes.types)
      },
      statistics: this.generateStatistics(diff)
    };

    return JSON.stringify(report, null, 2);
  }

  /**
   * Format changes array for JSON output
   */
  private formatChangesForJSON(changes: any[]): any[] {
    return changes.map(change => ({
      type: change.type,
      feature: {
        name: change.feature.name,
        filePath: change.feature.filePath,
        category: change.feature.category,
        description: change.feature.description,
        exports: change.feature.exports,
        dependencies: {
          internal: change.feature.dependencies.internal.length,
          external: change.feature.dependencies.external.length,
          externalPackages: change.feature.dependencies.external.map((d: any) => d.package)
        },
        complexity: change.feature.complexity,
        ...(change.feature.props && { props: change.feature.props })
      },
      ...(change.diff && { diff: change.diff })
    }));
  }

  /**
   * Calculate change rate percentage
   */
  private calculateChangeRate(diff: DiffResult): {
    addedPercent: number;
    removedPercent: number;
    modifiedPercent: number;
  } {
    const total = diff.summary.total || 1; // Avoid division by zero
    
    return {
      addedPercent: Math.round((diff.summary.added / total) * 100),
      removedPercent: Math.round((diff.summary.removed / total) * 100),
      modifiedPercent: Math.round((diff.summary.modified / total) * 100)
    };
  }

  /**
   * Generate detailed statistics
   */
  private generateStatistics(diff: DiffResult): any {
    const stats: any = {
      byCategory: {},
      byType: {
        added: diff.summary.added,
        removed: diff.summary.removed,
        modified: diff.summary.modified
      }
    };

    // Calculate statistics by category
    const categories = ['pages', 'components', 'services', 'hooks', 'utilities', 'types'] as const;
    
    categories.forEach(category => {
      const changes = diff.changes[category];
      stats.byCategory[category] = {
        total: changes.length,
        added: changes.filter(c => c.type === 'added').length,
        removed: changes.filter(c => c.type === 'removed').length,
        modified: changes.filter(c => c.type === 'modified').length
      };
    });

    return stats;
  }

  /**
   * Write the JSON to a file
   */
  writeToFile(json: string, outputPath: string): void {
    try {
      fs.writeFileSync(outputPath, json, 'utf-8');
      console.log(`✅ Diff JSON written to ${outputPath}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to write diff JSON: ${message}`);
      throw error;
    }
  }
}
