# Feature Catalog - react-feature-discovery

> Comprehensive feature documentation for migration and development reference

**Generated:** 11/1/2025, 7:14:28 AM
**Version:** 0.1.0

## Table of Contents

- [Metadata](#metadata)
- [Summary](#summary)
- [Pages](#pages)
- [Components](#components)
- [Services](#services)
- [Hooks](#hooks)
- [Utilities](#utilities)
- [Types](#types)
- [Modules](#modules)
- [Migration Guide](#migration-guide)
- [Dependency Graph](#dependency-graph)

## Metadata

| Property | Value |
|----------|-------|
| Project Name | react-feature-discovery |
| Total Files | 41 |
| Total Features | 41 |
| Generated At | 11/1/2025, 7:14:28 AM |
| Version | 0.1.0 |

## Summary

### Feature Breakdown

| Category | Count |
|----------|-------|
| Pages | 0 |
| Components | 0 |
| Services | 0 |
| Hooks | 0 |
| Utilities | 6 |
| Types | 2 |

### Key Technologies

- React

### External Dependencies (9)

<details>
<summary>Click to expand</summary>

- `@jest/globals`
- `child_process`
- `fs`
- `http`
- `lodash`
- `path`
- `react`
- `url`
- `util`

</details>

## Pages

No pages found.

## Components

No components found.

## Services

No services found.

## Hooks

No hooks found.

## Utilities

Total: 6

### ErrorHandler

**File Path:** `src/utils/ErrorHandler.ts`

**Category:** utility

**Description:** Utility functions for ErrorHandler

**Exports:**
- `ErrorHandler` (named class)

**Dependencies:**

*Internal (1):*
- `../types/index.js` (type)

**Complexity:**
- Lines of Code: 70
- Dependencies: 1

---

### SafetyValidator

**File Path:** `src/utils/SafetyValidator.ts`

**Category:** utility

**Description:** SafetyValidator - Ensures safe operations and prevents malicious behavior

**Exports:**
- `SafetyValidator` (named class)

**Dependencies:**

*External (2):*
- `path`
- `fs`

**Complexity:**
- Lines of Code: 155
- Dependencies: 2

**Migration Notes:**
- Performs file system operations - ensure proper permissions
- Uses WebSocket connections - verify server configuration

---

### LocationDetector

**File Path:** `src/utils/locationDetector.ts`

**Category:** utility

**Description:** LocationDetector - Determines if code is client-side, server-side, or shared

**Exports:**
- `CodeLocation` (named type)
- `LocationDetector` (named class)

**Dependencies:**

**Complexity:**
- Lines of Code: 36
- Dependencies: 0

---

### ErrorHandler.test

**File Path:** `tests/utils/ErrorHandler.test.ts`

**Category:** utility

**Description:** ErrorHandler Tests

**Dependencies:**

*Internal (2):*
- `../../src/utils/ErrorHandler.js` (utility)
- `../../src/types/index.js` (type)

*External (1):*
- `@jest/globals`

**Complexity:**
- Lines of Code: 230
- Dependencies: 3

---

### SafetyValidator.test

**File Path:** `tests/utils/SafetyValidator.test.ts`

**Category:** utility

**Description:** SafetyValidator Tests

**Dependencies:**

*Internal (2):*
- `../../src/utils/SafetyValidator.js` (utility)
- `../../src/types/index.js` (type)

*External (3):*
- `@jest/globals`
- `fs`
- `path`

**Complexity:**
- Lines of Code: 259
- Dependencies: 5

**Migration Notes:**
- Performs file system operations - ensure proper permissions
- Uses WebSocket connections - verify server configuration

---

### LocationDetector.test

**File Path:** `tests/utils/locationDetector.test.ts`

**Category:** utility

**Description:** LocationDetector Tests

**Dependencies:**

*Internal (1):*
- `../../src/utils/locationDetector.js` (utility)

*External (1):*
- `@jest/globals`

**Complexity:**
- Lines of Code: 293
- Dependencies: 2

**Migration Notes:**
- Uses WebSocket connections - verify server configuration

---



## Types

Total: 2

### Config

**File Path:** `src/types/config.ts`

**Category:** type

**Description:** Configuration types for React Feature Discovery tool

**Exports:**
- `CategoryRule` (named interface)
- `EnvironmentPattern` (named interface)
- `MigrationRule` (named interface)
- `FileCategory` (named type)
- `ToolConfig` (named interface)
- `PartialToolConfig` (named type)

**Dependencies:**

**Complexity:**
- Lines of Code: 52
- Dependencies: 0

---

### Index

**File Path:** `src/types/index.ts`

**Category:** type

**Description:** Core type definitions for React Feature Discovery tool

**Exports:**
- `FileCategory` (named type)
- `FileEntry` (named interface)
- `InternalDependency` (named interface)
- `ExternalDependency` (named interface)
- `RouteReference` (named interface)
- `ApiReference` (named interface)
- `Dependencies` (named interface)
- `ExportInfo` (named interface)
- `PropDefinition` (named interface)
- `ComplexityMetrics` (named interface)
- `FeatureMetadata` (named interface)
- `Feature` (named interface)
- `ComponentFeature` (named interface)
- `ModuleFeature` (named interface)
- `CatalogMetadata` (named interface)
- `CatalogSummary` (named interface)
- `CategorizedFeatures` (named interface)
- `MigrationChallenge` (named interface)
- `MigrationGuide` (named interface)
- `GraphNode` (named interface)
- `GraphEdge` (named interface)
- `DependencyGraph` (named interface)
- `FeatureCatalog` (named interface)
- `AnalysisError` (named interface)
- `ErrorType` (named type)

**Dependencies:**

**Complexity:**
- Lines of Code: 178
- Dependencies: 0

---



## Modules

Total: 33

### Jest.config

**File Path:** `jest.config.js`

**Category:** config

**Description:** Configuration for Jest.config

**Exports:**
- `default` (default const)

**Dependencies:**

**Complexity:**
- Lines of Code: 35
- Dependencies: 0

---

### CatalogBuilder

**File Path:** `src/analyzers/CatalogBuilder.ts`

**Category:** module

**Description:** CatalogBuilder - Builds feature catalog from analyzed data

**Exports:**
- `CatalogBuilder` (named class)

**Dependencies:**

*Internal (1):*
- `../types/index.js` (type)

*External (2):*
- `fs`
- `path`

**Complexity:**
- Lines of Code: 341
- Dependencies: 3

**Migration Notes:**
- Contains database operations - ensure schema compatibility
- Performs file system operations - ensure proper permissions
- Uses WebSocket connections - verify server configuration

---

### DependencyAnalyzer

**File Path:** `src/analyzers/DependencyAnalyzer.ts`

**Category:** module

**Description:** DependencyAnalyzer module

**Exports:**
- `DependencyAnalyzer` (named class)

**Dependencies:**

*Internal (1):*
- `../types/index.js` (type)

*External (2):*
- `fs`
- `path`

**Complexity:**
- Lines of Code: 199
- Dependencies: 3

---

### MetadataExtractor

**File Path:** `src/analyzers/MetadataExtractor.ts`

**Category:** module

**Description:** MetadataExtractor - Extracts metadata from source files

**Exports:**
- `MetadataExtractor` (named class)

**Dependencies:**

*Internal (1):*
- `../types/index.js` (type)

*External (1):*
- `path`

**Complexity:**
- Lines of Code: 212
- Dependencies: 2

**Migration Notes:**
- Contains database operations - ensure schema compatibility
- Uses session management - verify session store configuration
- Performs file system operations - ensure proper permissions
- Uses WebSocket connections - verify server configuration
- Handles authentication - ensure security best practices

---

### ReactPatternDetector

**File Path:** `src/analyzers/ReactPatternDetector.ts`

**Category:** module

**Description:** ReactPatternDetector - Detects React-specific patterns in code

**Exports:**
- `withAuth` (default const)
- `HookInfo` (named interface)
- `ComponentInfo` (named interface)
- `ContextInfo` (named interface)
- `HOCInfo` (named interface)
- `ReactPatternDetector` (named class)

**Dependencies:**

**Complexity:**
- Lines of Code: 161
- Dependencies: 0

---

### Cli

**File Path:** `src/cli.ts`

**Category:** module

**Description:** CLI entry point for React Feature Discovery tool

**Exports:**
- `parseCLIArgs` (named function)
- `showHelp` (named function)

**Dependencies:**

*Internal (4):*
- `./config/index.js` (component)
- `./core/AnalysisEngine.js` (component)
- `./types/index.js` (type)
- `./utils/SafetyValidator.js` (utility)

**Complexity:**
- Lines of Code: 111
- Dependencies: 4

---

### ConfigLoader

**File Path:** `src/config/ConfigLoader.ts`

**Category:** config

**Description:** ConfigLoader - Loads configuration from multiple sources

**Exports:**
- `ConfigLoader` (named class)

**Dependencies:**

*Internal (2):*
- `../types/config.js` (type)
- `./defaults.js` (component)

*External (2):*
- `fs`
- `path`

**Complexity:**
- Lines of Code: 77
- Dependencies: 4

**Migration Notes:**
- Performs file system operations - ensure proper permissions

---

### ConfigMerger

**File Path:** `src/config/ConfigMerger.ts`

**Category:** config

**Description:** ConfigMerger - Merges configuration from multiple sources

**Exports:**
- `ConfigMerger` (named class)

**Dependencies:**

*Internal (1):*
- `../types/config.js` (type)

**Complexity:**
- Lines of Code: 68
- Dependencies: 1

---

### ConfigValidator

**File Path:** `src/config/ConfigValidator.ts`

**Category:** config

**Description:** ConfigValidator - Validates configuration schema

**Exports:**
- `ConfigValidator` (named class)

**Dependencies:**

*Internal (1):*
- `../types/config.js` (type)

**Complexity:**
- Lines of Code: 154
- Dependencies: 1

---

### CategoryRules

**File Path:** `src/config/categoryRules.ts`

**Category:** config

**Description:** Default category rules for React projects

**Exports:**
- `defaultCategoryRules` (named const)
- `applyCategoryRules` (named function)

**Dependencies:**

*Internal (1):*
- `../types/config.js` (type)

**Complexity:**
- Lines of Code: 96
- Dependencies: 1

---

### Defaults

**File Path:** `src/config/defaults.ts`

**Category:** config

**Description:** Default configuration for React Feature Discovery tool

**Exports:**
- `defaultEnvironmentPatterns` (named const)
- `defaultConfig` (named const)

**Dependencies:**

*Internal (1):*
- `../types/config.js` (type)

**Complexity:**
- Lines of Code: 59
- Dependencies: 1

---

### Index

**File Path:** `src/config/index.ts`

**Category:** config

**Description:** Configuration module exports

**Exports:**
- `ConfigLoader` (named const)
- `ConfigValidator` (named const)
- `ConfigMerger` (named const)
- `defaultConfig` (named const)
- `defaultEnvironmentPatterns` (named const)

**Dependencies:**

**Complexity:**
- Lines of Code: 6
- Dependencies: 0

---

### TechnologyMap

**File Path:** `src/config/technologyMap.ts`

**Category:** config

**Description:** Comprehensive React ecosystem technology mapping

**Exports:**
- `TechnologyMapping` (named interface)
- `reactEcosystemTechnologies` (named const)
- `detectTechnologies` (named function)
- `getTechnologiesByCategory` (named function)

**Dependencies:**

**Complexity:**
- Lines of Code: 117
- Dependencies: 0

**Migration Notes:**
- Contains database operations - ensure schema compatibility

---

### AnalysisEngine

**File Path:** `src/core/AnalysisEngine.ts`

**Category:** module

**Description:** AnalysisEngine - Main orchestrator for feature discovery analysis

**Exports:**
- `AnalysisEngine` (named class)

**Dependencies:**

*Internal (10):*
- `../types/index.js` (type)
- `../scanners/FileScanner.js` (component)
- `../analyzers/DependencyAnalyzer.js` (component)
- `../analyzers/MetadataExtractor.js` (component)
- `../analyzers/CatalogBuilder.js` (component)
- `../generators/MarkdownGenerator.js` (component)
- `../generators/JSONGenerator.js` (component)
- `../generators/HTMLGenerator.js` (component)
- `../utils/ErrorHandler.js` (utility)
- `../utils/SafetyValidator.js` (utility)

*External (1):*
- `fs`

**Complexity:**
- Lines of Code: 161
- Dependencies: 11

**Migration Notes:**
- Performs file system operations - ensure proper permissions

---

### HTMLGenerator

**File Path:** `src/generators/HTMLGenerator.ts`

**Category:** module

**Description:** HTMLGenerator - Generates interactive HTML output

**Exports:**
- `HTMLGenerator` (named class)

**Dependencies:**

*Internal (1):*
- `../types/index.js` (type)

*External (1):*
- `fs`

**Complexity:**
- Lines of Code: 86
- Dependencies: 2

**Migration Notes:**
- Performs file system operations - ensure proper permissions

---

### JSONGenerator

**File Path:** `src/generators/JSONGenerator.ts`

**Category:** module

**Description:** JSONGenerator - Generates JSON output

**Exports:**
- `JSONGenerator` (named class)

**Dependencies:**

*Internal (1):*
- `../types/index.js` (type)

*External (1):*
- `fs`

**Complexity:**
- Lines of Code: 22
- Dependencies: 2

**Migration Notes:**
- Performs file system operations - ensure proper permissions

---

### MarkdownGenerator

**File Path:** `src/generators/MarkdownGenerator.ts`

**Category:** module

**Description:** MarkdownGenerator module

**Exports:**
- `MarkdownWriter` (named class)

**Dependencies:**

*Internal (1):*
- `../types/index.js` (type)

*External (1):*
- `fs`

**Complexity:**
- Lines of Code: 254
- Dependencies: 2

**Migration Notes:**
- Performs file system operations - ensure proper permissions

---

### Index

**File Path:** `src/index.ts`

**Category:** module

**Description:** React Feature Discovery Tool

**Exports:**
- `version` (named const)

**Dependencies:**

**Complexity:**
- Lines of Code: 5
- Dependencies: 0

---

### FileScanner

**File Path:** `src/scanners/FileScanner.ts`

**Category:** module

**Description:** FileScanner - Scans and categorizes files in the codebase

**Exports:**
- `FileScanner` (named class)

**Dependencies:**

*Internal (2):*
- `../types/index.js` (type)
- `../config/categoryRules.js` (component)

*External (2):*
- `fs`
- `path`

**Complexity:**
- Lines of Code: 82
- Dependencies: 4

**Migration Notes:**
- Performs file system operations - ensure proper permissions

---

### Server

**File Path:** `src/server.ts`

**Category:** module

**Description:** Web GUI server for React Feature Discovery tool

**Dependencies:**

*Internal (3):*
- `./config/index.js` (component)
- `./core/AnalysisEngine.js` (component)
- `./utils/SafetyValidator.js` (utility)

*External (4):*
- `http`
- `fs`
- `path`
- `url`

**Complexity:**
- Lines of Code: 202
- Dependencies: 7

**Migration Notes:**
- Uses environment variables
- Contains platform-specific code
- Performs file system operations - ensure proper permissions
- Uses WebSocket connections - verify server configuration

---

### DependencyAnalyzer.test

**File Path:** `tests/analyzers/DependencyAnalyzer.test.ts`

**Category:** module

**Description:** DependencyAnalyzer Tests

**Exports:**
- `Button` (named const)
- `utils` (named const)

**Dependencies:**

*Internal (12):*
- `../../src/analyzers/DependencyAnalyzer.js` (component)
- `../../src/types/index.js` (type)
- `../utils/helpers` (utility)
- `./Button.css` (component)
- `../utils/helpers` (utility)
- `./Button.css` (component)
- `../utils/helpers` (utility)
- `./styles.css` (component)
- `../utils/helper` (utility)
- `./b` (component)
- ... and 2 more

*External (9):*
- `@jest/globals`
- `react`
- `lodash`
- `react`
- `react`
- `react`
- `react`
- `react`
- `lodash`

**Complexity:**
- Lines of Code: 200
- Dependencies: 21

**Migration Notes:**
- High number of internal dependencies (12) - may be tightly coupled

---

### ReactPatternDetector.test

**File Path:** `tests/analyzers/ReactPatternDetector.test.ts`

**Category:** module

**Description:** ReactPatternDetector Tests

**Exports:**
- `Input` (default function)
- `withStyle` (default const)
- `Button` (named const)

**Dependencies:**

*Internal (1):*
- `../../src/analyzers/ReactPatternDetector.js` (component)

*External (3):*
- `@jest/globals`
- `react`
- `react`

**Complexity:**
- Lines of Code: 319
- Dependencies: 4

---

### Basic.test

**File Path:** `tests/basic.test.ts`

**Category:** module

**Description:** Basic Test to Verify Jest Setup

**Dependencies:**

*External (1):*
- `@jest/globals`

**Complexity:**
- Lines of Code: 18
- Dependencies: 1

---

### CliSimple.test

**File Path:** `tests/cli-simple.test.ts`

**Category:** module

**Description:** Simple CLI Test to verify imports work

**Dependencies:**

*Internal (1):*
- `../src/cli.js` (component)

*External (1):*
- `@jest/globals`

**Complexity:**
- Lines of Code: 17
- Dependencies: 2

---

### CliWorking.test

**File Path:** `tests/cli-working.test.ts`

**Category:** module

**Description:** CLI Test using compiled JavaScript files

**Dependencies:**

*External (1):*
- `@jest/globals`

**Complexity:**
- Lines of Code: 61
- Dependencies: 1

---

### Cli.integration.test

**File Path:** `tests/cli.integration.test.ts`

**Category:** module

**Description:** CLI Integration Tests for React Feature Discovery Tool

**Dependencies:**

*External (5):*
- `@jest/globals`
- `child_process`
- `util`
- `url`
- `path`

**Complexity:**
- Lines of Code: 125
- Dependencies: 5

---

### Cli.test

**File Path:** `tests/cli.test.ts`

**Category:** module

**Description:** CLI Tests for React Feature Discovery Tool

**Dependencies:**

*Internal (1):*
- `../src/cli.js` (component)

*External (1):*
- `@jest/globals`

**Complexity:**
- Lines of Code: 109
- Dependencies: 2

---

### AnalysisEngine.test

**File Path:** `tests/core/AnalysisEngine.test.ts`

**Category:** module

**Description:** AnalysisEngine Tests

**Exports:**
- `Test` (named const)

**Dependencies:**

*Internal (2):*
- `../../src/core/AnalysisEngine` (component)
- `../../src/types` (type)

*External (2):*
- `@jest/globals`
- `fs`

**Complexity:**
- Lines of Code: 166
- Dependencies: 4

---

### HTMLGenerator.test

**File Path:** `tests/generators/HTMLGenerator.test.ts`

**Category:** module

**Description:** HTMLGenerator Tests

**Dependencies:**

*Internal (2):*
- `../../src/generators/HTMLGenerator.js` (component)
- `../../src/types/index.js` (type)

*External (1):*
- `@jest/globals`

**Complexity:**
- Lines of Code: 362
- Dependencies: 3

---

### JSONGenerator.test

**File Path:** `tests/generators/JSONGenerator.test.ts`

**Category:** module

**Description:** JSONGenerator Tests

**Dependencies:**

*Internal (2):*
- `../../src/generators/JSONGenerator.js` (component)
- `../../src/types/index.js` (type)

*External (1):*
- `@jest/globals`

**Complexity:**
- Lines of Code: 273
- Dependencies: 3

**Migration Notes:**
- Performs file system operations - ensure proper permissions

---

### MarkdownGenerator.test

**File Path:** `tests/generators/MarkdownGenerator.test.ts`

**Category:** module

**Description:** MarkdownGenerator Tests

**Dependencies:**

*Internal (2):*
- `../../src/generators/MarkdownGenerator.js` (component)
- `../../src/types/index.js` (type)

*External (1):*
- `@jest/globals`

**Complexity:**
- Lines of Code: 292
- Dependencies: 3

---

### Server.test

**File Path:** `tests/server.test.ts`

**Category:** module

**Description:** Server Tests for React Feature Discovery Tool

**Dependencies:**

*External (4):*
- `@jest/globals`
- `http`
- `fs`
- `path`

**Complexity:**
- Lines of Code: 367
- Dependencies: 4

**Migration Notes:**
- Uses environment variables
- Performs file system operations - ensure proper permissions
- Uses WebSocket connections - verify server configuration

---

### Setup

**File Path:** `tests/setup.ts`

**Category:** module

**Description:** Test Setup and Global Configuration

**Exports:**
- `default` (default const)
- `createMockFileEntry` (named const)
- `createMockConfig` (named const)
- `mockReactComponent` (named const)
- `mockReactHook` (named const)

**Dependencies:**

*External (1):*
- `@jest/globals`

**Complexity:**
- Lines of Code: 54
- Dependencies: 1

**Migration Notes:**
- Uses NODE_ENV for environment detection
- Uses environment variables

---



## Migration Guide

### Overview

This project contains 41 features across 0 pages, 0 components, 0 services, 0 hooks, 6 utilities, 2 type definitions, and 33 modules. The application follows a modern React architecture.

### Recommendations

1. Start by migrating type definitions and shared utilities first
2. Migrate services and API integrations before UI components
3. Test authentication and session management thoroughly in target environment
4. Verify all environment variables are properly configured
5. Run database migrations before deploying application code

### Migration Challenges

#### Environment Detection

**Challenge:** 3 files contain environment-specific code

**Recommendation:** Create environment abstraction layer and configuration management system

#### Database Operations

**Challenge:** 3 files perform database operations

**Recommendation:** Verify database schema compatibility and run migrations in target environment

#### Session Management

**Challenge:** 1 files use session management

**Recommendation:** Configure session store (PostgreSQL or Redis) in target environment

### Suggested Migration Order

Migrate in the following order (least dependent first):

1. `src/types/config.ts`
2. `src/types/index.ts`
3. `src/utils/ErrorHandler.ts`
4. `src/utils/SafetyValidator.ts`
5. `src/utils/locationDetector.ts`
6. `tests/utils/ErrorHandler.test.ts`
7. `tests/utils/SafetyValidator.test.ts`
8. `tests/utils/locationDetector.test.ts`
9. `src/analyzers/CatalogBuilder.ts`
10. `src/analyzers/DependencyAnalyzer.ts`
11. `src/analyzers/MetadataExtractor.ts`
12. `src/analyzers/ReactPatternDetector.ts`
13. `src/cli.ts`
14. `src/core/AnalysisEngine.ts`
15. `src/generators/HTMLGenerator.ts`
16. `src/generators/JSONGenerator.ts`
17. `src/generators/MarkdownGenerator.ts`
18. `src/index.ts`
19. `src/scanners/FileScanner.ts`
20. `src/server.ts`



## Dependency Graph

**Total Nodes:** 41
**Total Edges:** 2

### Most Depended Upon Files

1. `src/core/AnalysisEngine.ts` - 1 dependents
2. `src/types/index.ts` - 1 dependents
3. `jest.config.js` - 0 dependents
4. `src/analyzers/CatalogBuilder.ts` - 0 dependents
5. `src/analyzers/DependencyAnalyzer.ts` - 0 dependents
6. `src/analyzers/MetadataExtractor.ts` - 0 dependents
7. `src/analyzers/ReactPatternDetector.ts` - 0 dependents
8. `src/cli.ts` - 0 dependents
9. `src/config/ConfigLoader.ts` - 0 dependents
10. `src/config/ConfigMerger.ts` - 0 dependents
