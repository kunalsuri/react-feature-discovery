import * as fs from 'fs';
import { DiffResult, FeatureChange } from '../types/diff.js';
import { Feature, ComponentFeature } from '../types/index.js';

/**
 * DiffMarkdownGenerator - Generates human-readable Markdown reports for feature comparisons
 */
export class DiffMarkdownGenerator {
  /**
   * Generate a complete Markdown diff report
   */
  generateMarkdown(diff: DiffResult): string {
    const sections = [
      this.generateHeader(diff),
      this.generateSummary(diff),
      this.generateTableOfContents(),
      this.generateChanges(diff),
      this.generateFooter()
    ];

    return sections.join('\n\n');
  }

  /**
   * Generate the report header
   */
  private generateHeader(diff: DiffResult): string {
    return `# Feature Comparison Report

**Generated**: ${new Date(diff.timestamp).toLocaleString()}

**Source A**: \`${diff.sourceA}\`  
**Source B**: \`${diff.sourceB}\`

---`;
  }

  /**
   * Generate the executive summary
   */
  private generateSummary(diff: DiffResult): string {
    const { summary } = diff;
    
    return `## 📊 Executive Summary

| Metric | Count |
|--------|-------|
| 🟢 **Features Added** | ${summary.added} |
| 🔴 **Features Removed** | ${summary.removed} |
| 🟡 **Features Modified** | ${summary.modified} |
| 📈 **Total Changes** | ${summary.total} |

${this.generateSummaryInsights(diff)}`;
  }

  /**
   * Generate insights from the summary
   */
  private generateSummaryInsights(diff: DiffResult): string {
    const { summary } = diff;
    const insights: string[] = [];

    if (summary.total === 0) {
      insights.push('✅ **No changes detected** - The codebases are identical.');
    } else {
      if (summary.added > summary.removed) {
        insights.push(`📈 **Growing codebase** - ${summary.added} new features added vs ${summary.removed} removed.`);
      } else if (summary.removed > summary.added) {
        insights.push(`📉 **Shrinking codebase** - ${summary.removed} features removed vs ${summary.added} added.`);
      }

      if (summary.modified > 0) {
        const modifiedPercent = Math.round((summary.modified / summary.total) * 100);
        insights.push(`🔧 **${modifiedPercent}% of changes** are modifications to existing features.`);
      }
    }

    return insights.length > 0 ? `\n### Insights\n\n${insights.join('\n')}` : '';
  }

  /**
   * Generate table of contents
   */
  private generateTableOfContents(): string {
    return `## 📑 Table of Contents

1. [Pages](#-pages)
2. [Components](#-components)
3. [Services](#-services)
4. [Hooks](#-hooks)
5. [Utilities](#-utilities)
6. [Types](#-types)

---`;
  }

  /**
   * Generate all changes sections
   */
  private generateChanges(diff: DiffResult): string {
    const sections: string[] = [];

    sections.push(this.generateCategorySection('Pages', '📄', diff.changes.pages));
    sections.push(this.generateCategorySection('Components', '🧩', diff.changes.components));
    sections.push(this.generateCategorySection('Services', '⚙️', diff.changes.services));
    sections.push(this.generateCategorySection('Hooks', '🪝', diff.changes.hooks));
    sections.push(this.generateCategorySection('Utilities', '🔧', diff.changes.utilities));
    sections.push(this.generateCategorySection('Types', '📐', diff.changes.types));

    return sections.join('\n\n');
  }

  /**
   * Generate a category section (e.g., Pages, Components)
   */
  private generateCategorySection(
    categoryName: string,
    icon: string,
    changes: FeatureChange[]
  ): string {
    if (changes.length === 0) {
      return `## ${icon} ${categoryName}

*No changes in this category.*`;
    }

    const added = changes.filter(c => c.type === 'added');
    const removed = changes.filter(c => c.type === 'removed');
    const modified = changes.filter(c => c.type === 'modified');

    let section = `## ${icon} ${categoryName}

**Summary**: ${added.length} added, ${removed.length} removed, ${modified.length} modified

---
`;

    if (added.length > 0) {
      section += '\n### 🟢 Added\n\n';
      added.forEach(change => {
        section += this.formatChange(change);
      });
    }

    if (removed.length > 0) {
      section += '\n### 🔴 Removed\n\n';
      removed.forEach(change => {
        section += this.formatChange(change);
      });
    }

    if (modified.length > 0) {
      section += '\n### 🟡 Modified\n\n';
      modified.forEach(change => {
        section += this.formatChange(change);
      });
    }

    return section;
  }

  /**
   * Format a single feature change
   */
  private formatChange(change: FeatureChange): string {
    const feature = change.feature;
    let output = `#### ${feature.name}\n\n`;
    output += `**File**: \`${feature.filePath}\`\n\n`;

    if (feature.description) {
      output += `**Description**: ${feature.description}\n\n`;
    }

    // For modified features, show what changed
    if (change.type === 'modified' && change.diff && change.diff.length > 0) {
      output += '**Changes**:\n\n';
      change.diff.forEach(d => {
        output += `- **${d.field}**: \`${this.formatValue(d.oldValue)}\` → \`${this.formatValue(d.newValue)}\`\n`;
      });
      output += '\n';
    }

    // Show basic feature info
    if (change.type !== 'removed') {
      output += this.formatFeatureDetails(feature);
    }

    output += '\n---\n\n';
    return output;
  }

  /**
   * Format feature details
   */
  private formatFeatureDetails(feature: Feature | ComponentFeature): string {
    let details = '';

    // Exports
    if (feature.exports.length > 0) {
      details += `**Exports**: ${feature.exports.map(e => `\`${e.name}\``).join(', ')}\n\n`;
    }

    // Dependencies
    const totalDeps = feature.dependencies.internal.length + feature.dependencies.external.length;
    if (totalDeps > 0) {
      details += `**Dependencies**: ${totalDeps} total (${feature.dependencies.internal.length} internal, ${feature.dependencies.external.length} external)\n\n`;
    }

    // Complexity
    details += `**Complexity**: ${feature.complexity.linesOfCode} LOC\n\n`;

    // Component-specific: Props
    if ('props' in feature && feature.props && feature.props.length > 0) {
      details += `**Props**: ${feature.props.length} prop(s)\n\n`;
    }

    return details;
  }

  /**
   * Format a value for display
   */
  private formatValue(value: any): string {
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  /**
   * Generate footer
   */
  private generateFooter(): string {
    return `---

## 📝 Notes

- 🟢 **Added**: Features that exist in Source B but not in Source A
- 🔴 **Removed**: Features that exist in Source A but not in Source B
- 🟡 **Modified**: Features that exist in both but have changed

---

*Generated by React Feature Discovery - Comparison Pipeline*`;
  }

  /**
   * Write the markdown to a file
   */
  writeToFile(markdown: string, outputPath: string): void {
    try {
      fs.writeFileSync(outputPath, markdown, 'utf-8');
      console.log(`✅ Diff report written to ${outputPath}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to write diff report: ${message}`);
      throw error;
    }
  }
}
