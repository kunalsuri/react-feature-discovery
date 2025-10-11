/**
 * HTMLGenerator - Generates interactive HTML output
 */

import * as fs from 'fs';
import { FeatureCatalog } from '../types/index.js';

export class HTMLGenerator {
  generateHTML(catalog: FeatureCatalog): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Feature Catalog - ${catalog.metadata.projectName}</title>
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
    .section { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
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
      <div class="meta">
        <strong>${catalog.metadata.projectName}</strong> | 
        Generated: ${new Date(catalog.metadata.generatedAt).toLocaleString()} | 
        Version: ${catalog.metadata.version}
      </div>
    </div>
  </header>
  
  <div class="container">
    <div class="summary">
      <h2>Summary</h2>
      <div class="stats">
        <div class="stat"><div class="stat-value">${catalog.summary.pages}</div><div class="stat-label">Pages</div></div>
        <div class="stat"><div class="stat-value">${catalog.summary.components}</div><div class="stat-label">Components</div></div>
        <div class="stat"><div class="stat-value">${catalog.summary.services}</div><div class="stat-label">Services</div></div>
        <div class="stat"><div class="stat-value">${catalog.summary.hooks}</div><div class="stat-label">Hooks</div></div>
        <div class="stat"><div class="stat-value">${catalog.summary.utilities}</div><div class="stat-label">Utilities</div></div>
        <div class="stat"><div class="stat-value">${catalog.summary.types}</div><div class="stat-label">Types</div></div>
      </div>
      
      <h3>Key Technologies</h3>
      <div class="tech-list">
        ${catalog.summary.keyTechnologies.map(tech => `<span class="tech-badge">${tech}</span>`).join('')}
      </div>
    </div>
    
    <div class="section">
      <h2>Components (${catalog.features.components.length})</h2>
      ${catalog.features.components.slice(0, 20).map(comp => `
        <div class="feature">
          <div class="feature-name">${comp.name}</div>
          <div class="feature-path">${comp.filePath}</div>
          <p>${comp.description}</p>
        </div>
      `).join('')}
      ${catalog.features.components.length > 20 ? `<p>... and ${catalog.features.components.length - 20} more</p>` : ''}
    </div>
    
    <div class="section">
      <h2>Migration Guide</h2>
      <p>${catalog.migrationGuide.overview}</p>
      <h3>Recommendations</h3>
      <ol>
        ${catalog.migrationGuide.recommendations.map(rec => `<li>${rec}</li>`).join('')}
      </ol>
    </div>
  </div>
</body>
</html>`;
  }

  writeToFile(html: string, outputPath: string): void {
    fs.writeFileSync(outputPath, html, 'utf-8');
  }
}
