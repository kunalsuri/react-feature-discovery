/**
 * JSONGenerator - Generates JSON output
 */

import * as fs from 'fs';
import { FeatureCatalog } from '../types/index.js';

const EDGE_TYPE_MAP: Record<string, string> = {
  import: 'internal',
  route: 'route',
  api: 'api'
};

export class JSONGenerator {
  generateJSON(catalog: FeatureCatalog, pretty: boolean = true): string {
    // Convert Map to object for JSON serialization
    const serializable = {
      ...catalog,
      dependencyGraph: {
        nodes: Array.from(catalog.dependencyGraph.nodes.entries()).map(([key, value]) => ({
          key,
          ...value
        })),
        edges: catalog.dependencyGraph.edges.map(edge => ({
          source: edge.from,
          target: edge.to,
          type: EDGE_TYPE_MAP[edge.type] || edge.type
        }))
      }
    };

    return JSON.stringify(serializable, null, pretty ? 2 : 0);
  }

  writeToFile(json: string, outputPath: string): void {
    fs.writeFileSync(outputPath, json, 'utf-8');
  }
}
