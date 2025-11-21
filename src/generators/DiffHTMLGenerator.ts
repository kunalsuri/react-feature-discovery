import * as fs from 'fs';
import { DiffResult, FeatureChange } from '../types/diff.js';
import { Feature, ComponentFeature } from '../types/index.js';

/**
 * DiffHTMLGenerator - Generates interactive HTML reports for feature comparisons
 */
export class DiffHTMLGenerator {
  /**
   * Generate a complete HTML diff report
   */
  generateHTML(diff: DiffResult): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Feature Comparison Report - ${diff.sourceA} vs ${diff.sourceB}</title>
  ${this.generateStyles()}
</head>
<body>
  <div class="container">
    ${this.generateHeader(diff)}
    ${this.generateSummary(diff)}
    ${this.generateFilters()}
    ${this.generateChanges(diff)}
    ${this.generateFooter()}
  </div>
  ${this.generateScripts()}
</body>
</html>`;
  }

  /**
   * Generate CSS styles
   */
  private generateStyles(): string {
    return `<style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      :root {
        --primary: #61dafb;
        --primary-dark: #21a1c4;
        --secondary: #282c34;
        --background: #0d1117;
        --surface: #161b22;
        --surface-hover: #1f2937;
        --text: #e6edf3;
        --text-secondary: #8b949e;
        --success: #3fb950;
        --error: #f85149;
        --warning: #d29922;
        --border: #30363d;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", sans-serif;
        background: var(--background);
        color: var(--text);
        line-height: 1.6;
        min-height: 100vh;
      }

      .container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
      }

      header {
        text-align: center;
        margin-bottom: 3rem;
        padding: 2rem 0;
        border-bottom: 2px solid var(--border);
      }

      h1 {
        font-size: 2.5rem;
        color: var(--primary);
        margin-bottom: 1rem;
      }

      .metadata {
        color: var(--text-secondary);
        font-size: 0.95rem;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 3rem;
      }

      .stat-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 1.5rem;
        text-align: center;
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .stat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 30px rgba(97, 218, 251, 0.1);
      }

      .stat-number {
        font-size: 3rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
      }

      .stat-card.added .stat-number { color: var(--success); }
      .stat-card.removed .stat-number { color: var(--error); }
      .stat-card.modified .stat-number { color: var(--warning); }
      .stat-card.total .stat-number { color: var(--primary); }

      .stat-label {
        color: var(--text-secondary);
        font-size: 1.1rem;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .filters {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 2rem;
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        align-items: center;
      }

      .filter-label {
        font-weight: 600;
        color: var(--text);
      }

      .filter-btn {
        padding: 0.5rem 1rem;
        background: var(--background);
        border: 1px solid var(--border);
        border-radius: 6px;
        color: var(--text);
        cursor: pointer;
        transition: all 0.2s;
      }

      .filter-btn:hover {
        background: var(--surface-hover);
        border-color: var(--primary);
      }

      .filter-btn.active {
        background: var(--primary);
        color: var(--secondary);
        border-color: var(--primary);
      }

      .search-box {
        flex: 1;
        min-width: 200px;
        padding: 0.5rem 1rem;
        background: var(--background);
        border: 1px solid var(--border);
        border-radius: 6px;
        color: var(--text);
        font-size: 1rem;
      }

      .search-box:focus {
        outline: none;
        border-color: var(--primary);
      }

      .category-section {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 2rem;
        margin-bottom: 2rem;
      }

      .category-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border);
      }

      .category-title {
        font-size: 1.8rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .category-stats {
        display: flex;
        gap: 1rem;
        font-size: 0.9rem;
      }

      .badge {
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-weight: 600;
      }

      .badge.added {
        background: rgba(63, 185, 80, 0.2);
        color: var(--success);
      }

      .badge.removed {
        background: rgba(248, 81, 73, 0.2);
        color: var(--error);
      }

      .badge.modified {
        background: rgba(210, 153, 34, 0.2);
        color: var(--warning);
      }

      .change-item {
        background: var(--background);
        border: 1px solid var(--border);
        border-left: 4px solid var(--border);
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        transition: all 0.2s;
      }

      .change-item:hover {
        border-left-color: var(--primary);
        transform: translateX(4px);
      }

      .change-item.added { border-left-color: var(--success); }
      .change-item.removed { border-left-color: var(--error); }
      .change-item.modified { border-left-color: var(--warning); }

      .change-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
      }

      .change-name {
        font-size: 1.3rem;
        font-weight: 600;
        color: var(--text);
      }

      .change-type {
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
      }

      .change-type.added {
        background: var(--success);
        color: var(--secondary);
      }

      .change-type.removed {
        background: var(--error);
        color: white;
      }

      .change-type.modified {
        background: var(--warning);
        color: var(--secondary);
      }

      .change-file {
        font-family: 'Courier New', monospace;
        font-size: 0.9rem;
        color: var(--text-secondary);
        margin-bottom: 1rem;
      }

      .change-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
      }

      .detail-item {
        background: var(--surface);
        padding: 0.75rem;
        border-radius: 6px;
        border: 1px solid var(--border);
      }

      .detail-label {
        font-size: 0.85rem;
        color: var(--text-secondary);
        margin-bottom: 0.25rem;
      }

      .detail-value {
        font-weight: 600;
        color: var(--text);
      }

      .diff-list {
        margin-top: 1rem;
        padding: 1rem;
        background: var(--surface);
        border-radius: 6px;
        border: 1px solid var(--border);
      }

      .diff-item {
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--border);
      }

      .diff-item:last-child {
        border-bottom: none;
      }

      .diff-field {
        font-weight: 600;
        color: var(--primary);
      }

      .diff-values {
        font-family: 'Courier New', monospace;
        font-size: 0.9rem;
        margin-top: 0.25rem;
      }

      .old-value {
        color: var(--error);
        text-decoration: line-through;
      }

      .new-value {
        color: var(--success);
      }

      footer {
        text-align: center;
        padding: 2rem;
        color: var(--text-secondary);
        border-top: 1px solid var(--border);
        margin-top: 4rem;
      }

      .hidden {
        display: none !important;
      }

      @media (max-width: 768px) {
        .summary-grid {
          grid-template-columns: 1fr;
        }

        .filters {
          flex-direction: column;
          align-items: stretch;
        }

        .change-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
        }
      }
    </style>`;
  }

  /**
   * Generate header section
   */
  private generateHeader(diff: DiffResult): string {
    return `<header>
      <h1>⚛️ Feature Comparison Report</h1>
      <div class="metadata">
        <p><strong>Source A:</strong> ${this.escapeHtml(diff.sourceA)}</p>
        <p><strong>Source B:</strong> ${this.escapeHtml(diff.sourceB)}</p>
        <p><strong>Generated:</strong> ${new Date(diff.timestamp).toLocaleString()}</p>
      </div>
    </header>`;
  }

  /**
   * Generate summary section
   */
  private generateSummary(diff: DiffResult): string {
    return `<div class="summary-grid">
      <div class="stat-card added">
        <div class="stat-number">${diff.summary.added}</div>
        <div class="stat-label">🟢 Added</div>
      </div>
      <div class="stat-card removed">
        <div class="stat-number">${diff.summary.removed}</div>
        <div class="stat-label">🔴 Removed</div>
      </div>
      <div class="stat-card modified">
        <div class="stat-number">${diff.summary.modified}</div>
        <div class="stat-label">🟡 Modified</div>
      </div>
      <div class="stat-card total">
        <div class="stat-number">${diff.summary.total}</div>
        <div class="stat-label">📊 Total Changes</div>
      </div>
    </div>`;
  }

  /**
   * Generate filters section
   */
  private generateFilters(): string {
    return `<div class="filters">
      <span class="filter-label">Filter by Type:</span>
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="added">Added</button>
      <button class="filter-btn" data-filter="removed">Removed</button>
      <button class="filter-btn" data-filter="modified">Modified</button>
      <input type="text" class="search-box" placeholder="🔍 Search features..." id="searchBox">
    </div>`;
  }

  /**
   * Generate all changes sections
   */
  private generateChanges(diff: DiffResult): string {
    const categories = [
      { name: 'Pages', icon: '📄', key: 'pages' as const },
      { name: 'Components', icon: '🧩', key: 'components' as const },
      { name: 'Services', icon: '⚙️', key: 'services' as const },
      { name: 'Hooks', icon: '🪝', key: 'hooks' as const },
      { name: 'Utilities', icon: '🔧', key: 'utilities' as const },
      { name: 'Types', icon: '📐', key: 'types' as const }
    ];

    return categories
      .map(cat => this.generateCategorySection(cat.name, cat.icon, diff.changes[cat.key]))
      .join('\n');
  }

  /**
   * Generate a category section
   */
  private generateCategorySection(
    categoryName: string,
    icon: string,
    changes: FeatureChange[]
  ): string {
    if (changes.length === 0) {
      return `<div class="category-section">
        <div class="category-header">
          <h2 class="category-title">${icon} ${categoryName}</h2>
        </div>
        <p style="color: var(--text-secondary);">No changes in this category.</p>
      </div>`;
    }

    const added = changes.filter(c => c.type === 'added').length;
    const removed = changes.filter(c => c.type === 'removed').length;
    const modified = changes.filter(c => c.type === 'modified').length;

    return `<div class="category-section">
      <div class="category-header">
        <h2 class="category-title">${icon} ${categoryName}</h2>
        <div class="category-stats">
          ${added > 0 ? `<span class="badge added">+${added}</span>` : ''}
          ${removed > 0 ? `<span class="badge removed">-${removed}</span>` : ''}
          ${modified > 0 ? `<span class="badge modified">~${modified}</span>` : ''}
        </div>
      </div>
      ${changes.map(change => this.generateChangeItem(change)).join('\n')}
    </div>`;
  }

  /**
   * Generate a single change item
   */
  private generateChangeItem(change: FeatureChange): string {
    const feature = change.feature;
    
    return `<div class="change-item ${change.type}" data-type="${change.type}" data-name="${this.escapeHtml(feature.name).toLowerCase()}">
      <div class="change-header">
        <div class="change-name">${this.escapeHtml(feature.name)}</div>
        <div class="change-type ${change.type}">${change.type}</div>
      </div>
      <div class="change-file">📁 ${this.escapeHtml(feature.filePath)}</div>
      ${feature.description ? `<p>${this.escapeHtml(feature.description)}</p>` : ''}
      ${this.generateChangeDetails(feature, change)}
    </div>`;
  }

  /**
   * Generate change details
   */
  private generateChangeDetails(feature: Feature | ComponentFeature, change: FeatureChange): string {
    let html = '<div class="change-details">';

    // Exports
    if (feature.exports.length > 0) {
      html += `<div class="detail-item">
        <div class="detail-label">Exports</div>
        <div class="detail-value">${feature.exports.length}</div>
      </div>`;
    }

    // Dependencies
    const totalDeps = feature.dependencies.internal.length + feature.dependencies.external.length;
    if (totalDeps > 0) {
      html += `<div class="detail-item">
        <div class="detail-label">Dependencies</div>
        <div class="detail-value">${totalDeps} (${feature.dependencies.internal.length}i / ${feature.dependencies.external.length}e)</div>
      </div>`;
    }

    // Complexity
    html += `<div class="detail-item">
      <div class="detail-label">Lines of Code</div>
      <div class="detail-value">${feature.complexity.linesOfCode}</div>
    </div>`;

    // Props (for components)
    if ('props' in feature && feature.props && feature.props.length > 0) {
      html += `<div class="detail-item">
        <div class="detail-label">Props</div>
        <div class="detail-value">${feature.props.length}</div>
      </div>`;
    }

    html += '</div>';

    // Diff details for modified features
    if (change.type === 'modified' && change.diff && change.diff.length > 0) {
      html += '<div class="diff-list">';
      html += '<strong>Changes:</strong>';
      change.diff.forEach(d => {
        html += `<div class="diff-item">
          <div class="diff-field">${d.field}</div>
          <div class="diff-values">
            <span class="old-value">${this.escapeHtml(String(d.oldValue))}</span> → 
            <span class="new-value">${this.escapeHtml(String(d.newValue))}</span>
          </div>
        </div>`;
      });
      html += '</div>';
    }

    return html;
  }

  /**
   * Generate footer
   */
  private generateFooter(): string {
    return `<footer>
      <p>Generated by <strong>React Feature Discovery</strong> - Comparison Pipeline</p>
      <p style="margin-top: 0.5rem; font-size: 0.9rem;">
        🟢 Added • 🔴 Removed • 🟡 Modified
      </p>
    </footer>`;
  }

  /**
   * Generate JavaScript for interactivity
   */
  private generateScripts(): string {
    return `<script>
      // Filter functionality
      const filterBtns = document.querySelectorAll('.filter-btn');
      const changeItems = document.querySelectorAll('.change-item');
      const searchBox = document.getElementById('searchBox');

      let currentFilter = 'all';
      let currentSearch = '';

      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentFilter = btn.dataset.filter;
          applyFilters();
        });
      });

      searchBox.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        applyFilters();
      });

      function applyFilters() {
        changeItems.forEach(item => {
          const type = item.dataset.type;
          const name = item.dataset.name;
          
          const matchesFilter = currentFilter === 'all' || type === currentFilter;
          const matchesSearch = currentSearch === '' || name.includes(currentSearch);
          
          if (matchesFilter && matchesSearch) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });

        // Hide empty categories
        document.querySelectorAll('.category-section').forEach(section => {
          const visibleItems = section.querySelectorAll('.change-item:not(.hidden)');
          if (visibleItems.length === 0) {
            section.style.display = 'none';
          } else {
            section.style.display = 'block';
          }
        });
      }
    </script>`;
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Write the HTML to a file
   */
  writeToFile(html: string, outputPath: string): void {
    try {
      fs.writeFileSync(outputPath, html, 'utf-8');
      console.log(`✅ Diff HTML written to ${outputPath}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to write diff HTML: ${message}`);
      throw error;
    }
  }
}
