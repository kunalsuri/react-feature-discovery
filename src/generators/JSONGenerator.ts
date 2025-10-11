/**
 * JSONGenerator - Generates JSON output
 */

import * as fs from 'fs';
import { FeatureCatalog } from '../types/index.js';

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
        edges: catalog.dependencyGraph.edges
      }
    };

    return JSON.stringify(serializable, null, pretty ? 2 : 0);
  }

  writeToFile(json: string, outputPath: string): void {
    fs.writeFileSync(outputPath, json, 'utf-8');
  }
}
