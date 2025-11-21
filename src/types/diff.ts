import { Feature, ComponentFeature } from "./index.js";

export interface FeatureChange {
  type: "added" | "removed" | "modified";
  feature: Feature | ComponentFeature;
  diff?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export interface DiffResult {
  timestamp: string;
  sourceA: string;
  sourceB: string;
  summary: {
    added: number;
    removed: number;
    modified: number;
    total: number;
  };
  changes: {
    pages: FeatureChange[];
    components: FeatureChange[];
    services: FeatureChange[];
    hooks: FeatureChange[];
    utilities: FeatureChange[];
    types: FeatureChange[];
  };
}
