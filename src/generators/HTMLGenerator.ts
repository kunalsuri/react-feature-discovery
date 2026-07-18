/**
 * HTMLGenerator - Generates interactive HTML output
 */

import * as fs from 'fs';
import { FeatureCatalog } from '../types/index.js';

export class HTMLGenerator {
  private escapeHtml(value: unknown): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private getFilePath(feature: any): string {
    return feature.filePath ?? feature.path;
  }

  private getComplexityScore(feature: any): number | undefined {
    const complexity = feature.complexity;
    if (typeof complexity === 'number') {
      return complexity;
    }
    if (complexity && typeof complexity === 'object') {
      return complexity.cyclomaticComplexity ?? complexity.dependencies;
    }
    return undefined;
  }

  private getLinesOfCode(feature: any): number | undefined {
    if (typeof feature.linesOfCode === 'number') {
      return feature.linesOfCode;
    }
    if (feature.complexity && typeof feature.complexity === 'object') {
      return feature.complexity.linesOfCode;
    }
    return undefined;
  }

  private deriveComplexityInfo(overview: string): { level: string; effort: string } {
    const lower = (overview || '').toLowerCase();

    if (lower.includes('high')) {
      return { level: 'high', effort: '2-4 weeks' };
    }
    if (lower.includes('medium')) {
      return { level: 'medium', effort: '1-2 weeks' };
    }
    if (lower.includes('low')) {
      return { level: 'low', effort: '1-2 days' };
    }

    return { level: 'medium', effort: '1-2 weeks' };
  }

  private renderDependencies(deps: any): string {
    if (!deps) return '';

    const internal = deps.internal || [];
    const external = deps.external || [];
    let html = '';

    if (internal.length > 0) {
      html += `<div class="feature-deps"><strong>Internal Dependencies</strong><ul>`;
      for (const dep of internal) {
        const depPath = dep.importPath ?? dep.path;
        html += `<li>${this.escapeHtml(depPath)}</li>`;
      }
      html += `</ul></div>`;
    }

    if (external.length > 0) {
      html += `<div class="feature-deps"><strong>External Dependencies</strong><ul>`;
      for (const dep of external) {
        const depName = dep.package ?? dep.name;
        const imports = Array.isArray(dep.imports) && dep.imports.length > 0
          ? ` (${dep.imports.join(', ')})`
          : '';
        html += `<li>${this.escapeHtml(depName)}${this.escapeHtml(imports)}</li>`;
      }
      html += `</ul></div>`;
    }

    return html;
  }

  private renderComponentCard(comp: any): string {
    const filePath = this.getFilePath(comp);
    const complexityScore = this.getComplexityScore(comp);
    const linesOfCode = this.getLinesOfCode(comp);

    let metaLine = '';
    if (complexityScore !== undefined || linesOfCode !== undefined) {
      const parts: string[] = [];
      if (complexityScore !== undefined) parts.push(`Complexity: ${complexityScore}`);
      if (linesOfCode !== undefined) parts.push(`Lines of Code: ${linesOfCode}`);
      metaLine = `<div class="feature-meta">${parts.join(' | ')}</div>`;
    }

    return `
        <article>
        <div class="feature">
          <div class="feature-name">${this.escapeHtml(comp.name)}</div>
          <div class="feature-path">${this.escapeHtml(filePath)}</div>
          <p>${this.escapeHtml(comp.description)}</p>
          ${metaLine}
          ${this.renderDependencies(comp.dependencies)}
        </div>
        </article>
      `;
  }

  generateHTML(catalog: FeatureCatalog): string {
    const totalFeatures = catalog.metadata.totalFeatures;
    const components = catalog.features.components || [];
    const services = catalog.features.services || [];
    const hooks = catalog.features.hooks || [];

    const { level: migrationLevel, effort: migrationEffort } =
      this.deriveComplexityInfo(catalog.migrationGuide.overview);

    const componentsHtml = components.length === 0
      ? '<p>No components found.</p>'
      : components.slice(0, 20).map(comp => this.renderComponentCard(comp)).join('') +
        (components.length > 20 ? `<p>... and ${components.length - 20} more</p>` : '');

    const servicesHtml = services.length === 0
      ? '<p>No services found.</p>'
      : services.slice(0, 20).map((svc: any) => this.renderComponentCard(svc)).join('') +
        (services.length > 20 ? `<p>... and ${services.length - 20} more</p>` : '');

    const hooksHtml = hooks.length === 0
      ? '<p>No hooks found.</p>'
      : hooks.slice(0, 20).map((hook: any) => this.renderComponentCard(hook)).join('') +
        (hooks.length > 20 ? `<p>... and ${hooks.length - 20} more</p>` : '');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Feature Catalog - ${this.escapeHtml(catalog.metadata.projectName)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    header { background: #2563eb; color: white; padding: 30px 0; margin-bottom: 30px; }
    h1 { font-size: 2.5em; margin-bottom: 10px; }
    .meta { opacity: 0.9; }
    .summary { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
    .stat { background: #f8fafc; padding: 15px; border-radius: 6px; text-align: center; }
    .stat-value { font-size: 2em; font-weight: bold; color: #2563eb; }
    .stat-label { color: #64748b; font-size: 0.9em; }
    section { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .feature { border-left: 3px solid #2563eb; padding: 15px; margin: 10px 0; background: #f8fafc; }
    .feature-name { font-size: 1.2em; font-weight: bold; margin-bottom: 5px; }
    .feature-path { color: #64748b; font-size: 0.9em; font-family: monospace; }
    .tech-list { display: flex; flex-wrap: wrap; gap: 10px; margin: 15px 0; }
    .tech-badge { background: #2563eb; color: white; padding: 5px 12px; border-radius: 4px; font-size: 0.9em; }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>Feature Catalog</h1>
      <div>
        <strong>${this.escapeHtml(catalog.metadata.projectName)}</strong> |
        <span>Generated:</span> ${new Date(catalog.metadata.generatedAt).toLocaleString()} |
        Version: ${this.escapeHtml(catalog.metadata.version)}
      </div>
    </div>
  </header>

  <div class="container">
    <div class="summary">
      <h2>Summary</h2>
      <div class="stats">
        <div class="stat"><div class="stat-value">${totalFeatures}</div><div class="stat-label">Total Features</div></div>
        <div class="stat"><div class="stat-value">${catalog.summary.pages}</div><div class="stat-label">Pages</div></div>
        <div class="stat"><div class="stat-value">${catalog.summary.components}</div><div class="stat-label">Components</div></div>
        <div class="stat"><div class="stat-value">${catalog.summary.services}</div><div class="stat-label">Services</div></div>
        <div class="stat"><div class="stat-value">${catalog.summary.hooks}</div><div class="stat-label">Hooks</div></div>
        <div class="stat"><div class="stat-value">${catalog.summary.utilities}</div><div class="stat-label">Utilities</div></div>
        <div class="stat"><div class="stat-value">${catalog.summary.types}</div><div class="stat-label">Types</div></div>
      </div>

      <h3>Key Technologies</h3>
      <div class="tech-list">
        ${catalog.summary.keyTechnologies.map(tech => `<span class="tech-badge">${this.escapeHtml(tech)}</span>`).join('')}
      </div>
    </div>

    <section>
      <h2>Components (${components.length})</h2>
      ${componentsHtml}
    </section>

    <section>
      <h2>Services (${services.length})</h2>
      ${servicesHtml}
    </section>

    <section>
      <h2>Hooks (${hooks.length})</h2>
      ${hooksHtml}
    </section>

    <section>
      <h2>Dependency Graph</h2>
      <p>Total Nodes: ${catalog.dependencyGraph.nodes.size}</p>
      <p>Total Edges: ${catalog.dependencyGraph.edges.length}</p>
    </section>

    <section>
      <h2>Migration Guide</h2>
      <p>${this.escapeHtml(catalog.migrationGuide.overview)}</p>
      <p>Complexity: ${migrationLevel}</p>
      <p>Estimated Effort: ${migrationEffort}</p>
      <h3>Recommendations</h3>
      <ol>
        ${catalog.migrationGuide.recommendations.map(rec => `<li>${this.escapeHtml(rec)}</li>`).join('')}
      </ol>
    </section>
  </div>
</body>
</html>`;
  }

  writeToFile(html: string, outputPath: string): void {
    fs.writeFileSync(outputPath, html, 'utf-8');
  }
}
