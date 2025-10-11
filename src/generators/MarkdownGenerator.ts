import * as fs from 'fs';
import {
  FeatureCatalog,
  Feature,
  ComponentFeature,
  Dependencies,
  MigrationGuide
} from '../types/index.js';

export class MarkdownWriter {
  generateMarkdown(catalog: FeatureCatalog): string {
    const sections: string[] = [];

    sections.push(this.generateHeader(catalog));
    sections.push(this.generateTableOfContents());
    sections.push(this.generateMetadata(catalog));
    sections.push(this.generateSummary(catalog));
    sections.push(this.generatePages(catalog.features.pages));
    sections.push(this.generateComponents(catalog.features.components));
    sections.push(this.generateServices(catalog.features.services));
    sections.push(this.generateHooks(catalog.features.hooks));
    sections.push(this.generateUtilities(catalog.features.utilities));
    sections.push(this.generateTypes(catalog.features.types));
    sections.push(this.generateModules(catalog.features.modules));
    sections.push(this.generateMigrationGuide(catalog.migrationGuide));
    sections.push(this.generateDependencyGraph(catalog));

    return sections.join('\n\n');
  }

  private generateHeader(catalog: FeatureCatalog): string {
    return `# Feature Catalog - ${catalog.metadata.projectName}\n\n` +
           `> Comprehensive feature documentation for migration and development reference\n\n` +
           `**Generated:** ${new Date(catalog.metadata.generatedAt).toLocaleString()}\n` +
           `**Version:** ${catalog.metadata.version}`;
  }

  private generateTableOfContents(): string {
    return `## Table of Contents\n\n` +
           `- [Metadata](#metadata)\n` +
           `- [Summary](#summary)\n` +
           `- [Pages](#pages)\n` +
           `- [Components](#components)\n` +
           `- [Services](#services)\n` +
           `- [Hooks](#hooks)\n` +
           `- [Utilities](#utilities)\n` +
           `- [Types](#types)\n` +
           `- [Modules](#modules)\n` +
           `- [Migration Guide](#migration-guide)\n` +
           `- [Dependency Graph](#dependency-graph)`;
  }

  private generateMetadata(catalog: FeatureCatalog): string {
    return `## Metadata\n\n` +
           `| Property | Value |\n` +
           `|----------|-------|\n` +
           `| Project Name | ${catalog.metadata.projectName} |\n` +
           `| Total Files | ${catalog.metadata.totalFiles} |\n` +
           `| Total Features | ${catalog.metadata.totalFeatures} |\n` +
           `| Generated At | ${new Date(catalog.metadata.generatedAt).toLocaleString()} |\n` +
           `| Version | ${catalog.metadata.version} |`;
  }

  private generateSummary(catalog: FeatureCatalog): string {
    const summary = catalog.summary;
    let md = `## Summary\n\n`;
    
    md += `### Feature Breakdown\n\n`;
    md += `| Category | Count |\n`;
    md += `|----------|-------|\n`;
    md += `| Pages | ${summary.pages} |\n`;
    md += `| Components | ${summary.components} |\n`;
    md += `| Services | ${summary.services} |\n`;
    md += `| Hooks | ${summary.hooks} |\n`;
    md += `| Utilities | ${summary.utilities} |\n`;
    md += `| Types | ${summary.types} |\n\n`;

    md += `### Key Technologies\n\n`;
    for (const tech of summary.keyTechnologies) {
      md += `- ${tech}\n`;
    }

    md += `\n### External Dependencies (${summary.externalDependencies.length})\n\n`;
    md += `<details>\n<summary>Click to expand</summary>\n\n`;
    for (const dep of summary.externalDependencies) {
      md += `- \`${dep}\`\n`;
    }
    md += `\n</details>`;

    return md;
  }

  private generatePages(pages: Feature[]): string {
    if (pages.length === 0) return `## Pages\n\nNo pages found.`;

    let md = `## Pages\n\n`;
    md += `Total: ${pages.length}\n\n`;

    for (const page of pages) {
      md += this.formatFeature(page);
    }

    return md;
  }

  private generateComponents(components: ComponentFeature[]): string {
    if (components.length === 0) return `## Components\n\nNo components found.`;

    let md = `## Components\n\n`;
    md += `Total: ${components.length}\n\n`;

    for (const component of components) {
      md += this.formatFeature(component);
      
      if (component.routes && component.routes.length > 0) {
        md += `**Routes:**\n`;
        for (const route of component.routes) {
          md += `- \`${route}\`\n`;
        }
        md += `\n`;
      }

      if (component.usedBy && component.usedBy.length > 0) {
        md += `**Used By:** ${component.usedBy.length} file(s)\n\n`;
      }
    }

    return md;
  }

  private generateServices(services: Feature[]): string {
    if (services.length === 0) return `## Services\n\nNo services found.`;

    let md = `## Services\n\n`;
    md += `Total: ${services.length}\n\n`;

    for (const service of services) {
      md += this.formatFeature(service);
      
      if (service.dependencies.apis.length > 0) {
        md += `**API Endpoints:**\n`;
        for (const api of service.dependencies.apis) {
          md += `- \`${api.method} ${api.endpoint}\`\n`;
        }
        md += `\n`;
      }
    }

    return md;
  }

  private generateHooks(hooks: Feature[]): string {
    if (hooks.length === 0) return `## Hooks\n\nNo hooks found.`;

    let md = `## Hooks\n\n`;
    md += `Total: ${hooks.length}\n\n`;

    for (const hook of hooks) {
      md += this.formatFeature(hook);
    }

    return md;
  }

  private generateUtilities(utilities: Feature[]): string {
    if (utilities.length === 0) return `## Utilities\n\nNo utilities found.`;

    let md = `## Utilities\n\n`;
    md += `Total: ${utilities.length}\n\n`;

    for (const utility of utilities) {
      md += this.formatFeature(utility);
    }

    return md;
  }

  private generateTypes(types: Feature[]): string {
    if (types.length === 0) return `## Types\n\nNo type definitions found.`;

    let md = `## Types\n\n`;
    md += `Total: ${types.length}\n\n`;

    for (const type of types) {
      md += this.formatFeature(type);
    }

    return md;
  }

  private generateModules(modules: Feature[]): string {
    if (modules.length === 0) return `## Modules\n\nNo modules found.`;

    let md = `## Modules\n\n`;
    md += `Total: ${modules.length}\n\n`;

    for (const module of modules) {
      md += this.formatFeature(module);
    }

    return md;
  }

  private formatFeature(feature: Feature): string {
    let md = `### ${feature.name}\n\n`;
    md += `**File Path:** \`${feature.filePath}\`\n\n`;
    md += `**Category:** ${feature.category}\n\n`;
    md += `**Description:** ${feature.description}\n\n`;

    // Exports
    if (feature.exports.length > 0) {
      md += `**Exports:**\n`;
      for (const exp of feature.exports) {
        md += `- \`${exp.name}\` (${exp.type} ${exp.kind})\n`;
      }
      md += `\n`;
    }

    // Dependencies
    md += this.formatDependencies(feature.dependencies);

    // Complexity
    md += `**Complexity:**\n`;
    md += `- Lines of Code: ${feature.complexity.linesOfCode}\n`;
    md += `- Dependencies: ${feature.complexity.dependencies}\n\n`;

    // Migration Notes
    if (feature.migrationNotes.length > 0) {
      md += `**Migration Notes:**\n`;
      for (const note of feature.migrationNotes) {
        md += `- ${note}\n`;
      }
      md += `\n`;
    }

    md += `---\n\n`;
    return md;
  }

  private formatDependencies(deps: Dependencies): string {
    let md = `**Dependencies:**\n\n`;

    if (deps.internal.length > 0) {
      md += `*Internal (${deps.internal.length}):*\n`;
      for (const dep of deps.internal.slice(0, 10)) {
        md += `- \`${dep.importPath}\` (${dep.type})\n`;
      }
      if (deps.internal.length > 10) {
        md += `- ... and ${deps.internal.length - 10} more\n`;
      }
      md += `\n`;
    }

    if (deps.external.length > 0) {
      md += `*External (${deps.external.length}):*\n`;
      for (const dep of deps.external.slice(0, 10)) {
        md += `- \`${dep.package}\`\n`;
      }
      if (deps.external.length > 10) {
        md += `- ... and ${deps.external.length - 10} more\n`;
      }
      md += `\n`;
    }

    return md;
  }

  private generateMigrationGuide(guide: MigrationGuide): string {
    let md = `## Migration Guide\n\n`;
    
    md += `### Overview\n\n${guide.overview}\n\n`;

    md += `### Recommendations\n\n`;
    for (let i = 0; i < guide.recommendations.length; i++) {
      md += `${i + 1}. ${guide.recommendations[i]}\n`;
    }
    md += `\n`;

    if (guide.challenges.length > 0) {
      md += `### Migration Challenges\n\n`;
      for (const challenge of guide.challenges) {
        md += `#### ${challenge.feature}\n\n`;
        md += `**Challenge:** ${challenge.challenge}\n\n`;
        md += `**Recommendation:** ${challenge.recommendation}\n\n`;
      }
    }

    if (guide.migrationOrder.length > 0) {
      md += `### Suggested Migration Order\n\n`;
      md += `Migrate in the following order (least dependent first):\n\n`;
      for (let i = 0; i < guide.migrationOrder.length; i++) {
        md += `${i + 1}. \`${guide.migrationOrder[i]}\`\n`;
      }
      md += `\n`;
    }

    return md;
  }

  private generateDependencyGraph(catalog: FeatureCatalog): string {
    let md = `## Dependency Graph\n\n`;
    
    const graph = catalog.dependencyGraph;
    md += `**Total Nodes:** ${graph.nodes.size}\n`;
    md += `**Total Edges:** ${graph.edges.length}\n\n`;

    md += `### Most Depended Upon Files\n\n`;
    const nodeArray = Array.from(graph.nodes.values());
    nodeArray.sort((a: any, b: any) => b.dependents.length - a.dependents.length);
    
    for (let i = 0; i < Math.min(10, nodeArray.length); i++) {
      const node: any = nodeArray[i];
      md += `${i + 1}. \`${node.filePath}\` - ${node.dependents.length} dependents\n`;
    }

    return md;
  }

  writeToFile(markdown: string, outputPath: string): void {
    fs.writeFileSync(outputPath, markdown, 'utf-8');
  }
}
