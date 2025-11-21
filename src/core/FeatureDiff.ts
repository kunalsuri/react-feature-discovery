import { FeatureCatalog, Feature, CategorizedFeatures } from '../types/index.js';
import { DiffResult } from '../types/diff.js';

export class FeatureDiff {
  static compare(catalogA: FeatureCatalog, catalogB: FeatureCatalog): DiffResult {
    const changes: DiffResult['changes'] = {
      pages: [],
      components: [],
      services: [],
      hooks: [],
      utilities: [],
      types: []
    };

    const summary = {
      added: 0,
      removed: 0,
      modified: 0,
      total: 0
    };

    // Helper to compare a category
    const compareCategory = (
      category: keyof Omit<CategorizedFeatures, 'modules'>,
      listA: Feature[],
      listB: Feature[]
    ) => {
      const mapA = new Map(listA.map(f => [f.filePath, f]));
      const mapB = new Map(listB.map(f => [f.filePath, f]));

      // Check for removed (in A but not B)
      for (const [path, feature] of mapA) {
        if (!mapB.has(path)) {
          changes[category].push({
            type: 'removed',
            feature
          });
          summary.removed++;
        }
      }

      // Check for added (in B but not A) and modified
      for (const [path, featureB] of mapB) {
        const featureA = mapA.get(path);
        if (!featureA) {
          changes[category].push({
            type: 'added',
            feature: featureB
          });
          summary.added++;
        } else {
          // Compare content
          const diffs = this.compareFeatures(featureA, featureB);
          if (diffs.length > 0) {
            changes[category].push({
              type: 'modified',
              feature: featureB,
              diff: diffs
            });
            summary.modified++;
          }
        }
      }
    };

    compareCategory('pages', catalogA.features.pages, catalogB.features.pages);
    compareCategory('components', catalogA.features.components, catalogB.features.components);
    compareCategory('services', catalogA.features.services, catalogB.features.services);
    compareCategory('hooks', catalogA.features.hooks, catalogB.features.hooks);
    compareCategory('utilities', catalogA.features.utilities, catalogB.features.utilities);
    compareCategory('types', catalogA.features.types, catalogB.features.types);

    summary.total = summary.added + summary.removed + summary.modified;

    return {
      timestamp: new Date().toISOString(),
      sourceA: catalogA.metadata.projectName || 'Source A',
      sourceB: catalogB.metadata.projectName || 'Source B',
      summary,
      changes
    };
  }

  private static compareFeatures(a: Feature, b: Feature): { field: string, oldValue: any, newValue: any }[] {
    const diffs: { field: string, oldValue: any, newValue: any }[] = [];

    // Compare description
    if (a.description !== b.description) {
      diffs.push({ field: 'description', oldValue: a.description, newValue: b.description });
    }

    // Compare exports length
    if (a.exports.length !== b.exports.length) {
      diffs.push({ field: 'exports', oldValue: a.exports.length, newValue: b.exports.length });
    }

    // Compare dependencies count
    const depsA = a.dependencies.internal.length + a.dependencies.external.length;
    const depsB = b.dependencies.internal.length + b.dependencies.external.length;
    if (depsA !== depsB) {
      diffs.push({ field: 'dependencies', oldValue: depsA, newValue: depsB });
    }

    // Compare complexity
    if (a.complexity.linesOfCode !== b.complexity.linesOfCode) {
      diffs.push({ field: 'linesOfCode', oldValue: a.complexity.linesOfCode, newValue: b.complexity.linesOfCode });
    }

    return diffs;
  }
}
