# Feature Catalog - react-feature-discovery

> Comprehensive feature documentation for migration and development reference

Generated: 7/13/2026, 8:49:27 PM
Version: 0.1.0

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
| Total Files | 47 |
| Total Features | 47 |
| Generated At | 7/13/2026, 8:49:27 PM |
| Version | 0.1.0 |

## Summary

Total Features: 47
Components: 0
Services: 0
Hooks: 0

### Feature Breakdown

| Category | Count |
|----------|-------|
| Pages | 0 |
| Components | 0 |
| Services | 0 |
| Hooks | 0 |
| Utilities | 6 |
| Types | 3 |

### Key Technologies

- React

**Frontend:** React

### External Dependencies (11)

<details>
<summary>Click to expand</summary>

- `@jest/globals`
- `child_process`
- `crypto`
- `fs`
- `http`
- `lodash`
- `module`
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

**Internal Dependencies:**
- `../types/index.js`

**Complexity:**
Complexity: 1
- Lines of Code: 70
- Dependencies: 1

---

### SafetyValidator

**File Path:** `src/utils/SafetyValidator.ts`

**Category:** utility

**Description:** SafetyValidator - Ensures safe operations and prevents malicious behavior

**Exports:**
- `SafetyValidator` (named class)

**External Dependencies:**
- path (* as path)
- fs (* as fs)

**Complexity:**
Complexity: 2
- Lines of Code: 192
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

**Complexity:**
Complexity: 0
- Lines of Code: 68
- Dependencies: 0

---

### ErrorHandler.test

**File Path:** `tests/utils/ErrorHandler.test.ts`

**Category:** utility

**Description:** ErrorHandler Tests

**Internal Dependencies:**
- `../../src/utils/ErrorHandler`
- `../../src/types/index`

**External Dependencies:**
- @jest/globals (describe, it, expect, jest, beforeEach, afterEach)

**Complexity:**
Complexity: 3
- Lines of Code: 230
- Dependencies: 3

---

### SafetyValidator.test

**File Path:** `tests/utils/SafetyValidator.test.ts`

**Category:** utility

**Description:** SafetyValidator Tests

**External Dependencies:**
- @jest/globals (describe, it, expect, jest, beforeEach, beforeAll, afterEach)
- path (* as path)

**Complexity:**
Complexity: 2
- Lines of Code: 293
- Dependencies: 2

**Migration Notes:**
- Performs file system operations - ensure proper permissions
- Uses WebSocket connections - verify server configuration

---

### LocationDetector.test

**File Path:** `tests/utils/locationDetector.test.ts`

**Category:** utility

**Description:** LocationDetector Tests

**Internal Dependencies:**
- `../../src/utils/locationDetector`

**External Dependencies:**
- @jest/globals (describe, it, expect, jest, beforeEach, afterEach)

**Complexity:**
Complexity: 2
- Lines of Code: 293
- Dependencies: 2

**Migration Notes:**
- Uses WebSocket connections - verify server configuration

---



## Types

Total: 3

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

**Complexity:**
Complexity: 0
- Lines of Code: 52
- Dependencies: 0

---

### Diff

**File Path:** `src/types/diff.ts`

**Category:** type

**Description:** Type definitions for Diff

**Exports:**
- `FeatureChange` (named interface)
- `DiffResult` (named interface)

**Internal Dependencies:**
- `./index.js`

**Complexity:**
Complexity: 1
- Lines of Code: 29
- Dependencies: 1

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

**Complexity:**
Complexity: 0
- Lines of Code: 181
- Dependencies: 0

---



## Modules

Total: 38

### Jest.config

**File Path:** `jest.config.js`

**Category:** config

**Description:** Configuration for Jest.config

**Exports:**
- `default` (default const)

**Complexity:**
Complexity: 0
- Lines of Code: 36
- Dependencies: 0

---

### CatalogBuilder

**File Path:** `src/analyzers/CatalogBuilder.ts`

**Category:** module

**Description:** CatalogBuilder - Builds feature catalog from analyzed data

**Exports:**
- `CatalogBuilder` (named class)

**Internal Dependencies:**
- `../types/index.js`

**External Dependencies:**
- fs (* as fs)
- path (* as path)

**Complexity:**
Complexity: 3
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

**Internal Dependencies:**
- `../types/index.js`

**External Dependencies:**
- fs (* as fs)
- path (* as path)

**Complexity:**
Complexity: 3
- Lines of Code: 202
- Dependencies: 3

---

### MetadataExtractor

**File Path:** `src/analyzers/MetadataExtractor.ts`

**Category:** module

**Description:** MetadataExtractor - Extracts metadata from source files

**Exports:**
- `MetadataExtractor` (named class)

**Internal Dependencies:**
- `../types/index.js`

**External Dependencies:**
- path (* as path)

**Complexity:**
Complexity: 2
- Lines of Code: 227
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

**Complexity:**
Complexity: 0
- Lines of Code: 169
- Dependencies: 0

**Migration Notes:**
- Uses WebSocket connections - verify server configuration

---

### Cli

**File Path:** `src/cli.ts`

**Category:** module

**Description:** CLI entry point for React Feature Discovery tool

**Exports:**
- `parseCLIArgs` (named function)
- `showHelp` (named function)

**Internal Dependencies:**
- `./config/index.js`
- `./core/AnalysisEngine.js`
- `./types/index.js`
- `./utils/SafetyValidator.js`

**External Dependencies:**
- module (createRequire)
- url (pathToFileURL)

**Complexity:**
Complexity: 6
- Lines of Code: 124
- Dependencies: 6

---

### ConfigLoader

**File Path:** `src/config/ConfigLoader.ts`

**Category:** config

**Description:** ConfigLoader - Loads configuration from multiple sources

**Exports:**
- `ConfigLoader` (named class)

**Internal Dependencies:**
- `../types/config.js`
- `./defaults.js`

**External Dependencies:**
- fs (* as fs)
- path (* as path)

**Complexity:**
Complexity: 4
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

**Internal Dependencies:**
- `../types/config.js`

**Complexity:**
Complexity: 1
- Lines of Code: 68
- Dependencies: 1

---

### ConfigValidator

**File Path:** `src/config/ConfigValidator.ts`

**Category:** config

**Description:** ConfigValidator - Validates configuration schema

**Exports:**
- `ConfigValidator` (named class)

**Internal Dependencies:**
- `../types/config.js`

**Complexity:**
Complexity: 1
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

**Internal Dependencies:**
- `../types/config.js`

**Complexity:**
Complexity: 1
- Lines of Code: 97
- Dependencies: 1

---

### Defaults

**File Path:** `src/config/defaults.ts`

**Category:** config

**Description:** Default configuration for React Feature Discovery tool

**Exports:**
- `defaultEnvironmentPatterns` (named const)
- `defaultConfig` (named const)

**Internal Dependencies:**
- `../types/config.js`

**Complexity:**
Complexity: 1
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

**Complexity:**
Complexity: 0
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

**Complexity:**
Complexity: 0
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

**Internal Dependencies:**
- `../types/index.js`
- `../scanners/FileScanner.js`
- `../analyzers/DependencyAnalyzer.js`
- `../analyzers/MetadataExtractor.js`
- `../analyzers/CatalogBuilder.js`
- `../generators/MarkdownGenerator.js`
- `../generators/JSONGenerator.js`
- `../generators/HTMLGenerator.js`
- `../utils/ErrorHandler.js`
- `../utils/SafetyValidator.js`

**External Dependencies:**
- fs (* as fs)

**Complexity:**
Complexity: 11
- Lines of Code: 178
- Dependencies: 11

**Migration Notes:**
- Performs file system operations - ensure proper permissions

---

### FeatureDiff

**File Path:** `src/core/FeatureDiff.ts`

**Category:** module

**Description:** FeatureDiff module

**Exports:**
- `FeatureDiff` (named class)

**Internal Dependencies:**
- `../types/index.js`
- `../types/diff.js`

**Complexity:**
Complexity: 2
- Lines of Code: 89
- Dependencies: 2

**Migration Notes:**
- Performs file system operations - ensure proper permissions

---

### DiffHTMLGenerator

**File Path:** `src/generators/DiffHTMLGenerator.ts`

**Category:** module

**Description:** DiffHTMLGenerator - Generates interactive HTML reports for feature comparisons

**Exports:**
- `DiffHTMLGenerator` (named class)

**Internal Dependencies:**
- `../types/diff.js`
- `../types/index.js`

**External Dependencies:**
- fs (* as fs)

**Complexity:**
Complexity: 3
- Lines of Code: 559
- Dependencies: 3

**Migration Notes:**
- Performs file system operations - ensure proper permissions
- Large file (665 lines) - consider refactoring into smaller modules

---

### DiffJSONGenerator

**File Path:** `src/generators/DiffJSONGenerator.ts`

**Category:** module

**Description:** DiffJSONGenerator - Generates machine-readable JSON reports for feature comparisons

**Exports:**
- `DiffJSONGenerator` (named class)

**Internal Dependencies:**
- `../types/diff.js`

**External Dependencies:**
- fs (* as fs)

**Complexity:**
Complexity: 2
- Lines of Code: 109
- Dependencies: 2

**Migration Notes:**
- Performs file system operations - ensure proper permissions

---

### DiffMarkdownGenerator

**File Path:** `src/generators/DiffMarkdownGenerator.ts`

**Category:** module

**Description:** DiffMarkdownGenerator - Generates human-readable Markdown reports for feature comparisons

**Exports:**
- `DiffMarkdownGenerator` (named class)

**Internal Dependencies:**
- `../types/diff.js`
- `../types/index.js`

**External Dependencies:**
- fs (* as fs)

**Complexity:**
Complexity: 3
- Lines of Code: 193
- Dependencies: 3

**Migration Notes:**
- Performs file system operations - ensure proper permissions

---

### HTMLGenerator

**File Path:** `src/generators/HTMLGenerator.ts`

**Category:** module

**Description:** HTMLGenerator - Generates interactive HTML output

**Exports:**
- `HTMLGenerator` (named class)

**Internal Dependencies:**
- `../types/index.js`

**External Dependencies:**
- fs (* as fs)

**Complexity:**
Complexity: 2
- Lines of Code: 205
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

**Internal Dependencies:**
- `../types/index.js`

**External Dependencies:**
- fs (* as fs)

**Complexity:**
Complexity: 2
- Lines of Code: 31
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

**Internal Dependencies:**
- `../types/index.js`

**External Dependencies:**
- fs (* as fs)

**Complexity:**
Complexity: 2
- Lines of Code: 323
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

**Complexity:**
Complexity: 0
- Lines of Code: 5
- Dependencies: 0

---

### FileScanner

**File Path:** `src/scanners/FileScanner.ts`

**Category:** module

**Description:** FileScanner - Scans and categorizes files in the codebase

**Exports:**
- `FileScanner` (named class)

**Internal Dependencies:**
- `../types/index.js`
- `../config/categoryRules.js`

**External Dependencies:**
- fs (* as fs)
- path (* as path)

**Complexity:**
Complexity: 4
- Lines of Code: 85
- Dependencies: 4

**Migration Notes:**
- Performs file system operations - ensure proper permissions

---

### Server

**File Path:** `src/server.ts`

**Category:** module

**Description:** Web GUI server for React Feature Discovery tool

**Internal Dependencies:**
- `./config/index.js`
- `./core/AnalysisEngine.js`
- `./core/FeatureDiff.js`
- `./utils/SafetyValidator.js`
- `./generators/DiffMarkdownGenerator.js`
- `./generators/DiffJSONGenerator.js`
- `./generators/DiffHTMLGenerator.js`

**External Dependencies:**
- http (http)
- fs (fs)
- path (path)
- url (fileURLToPath)
- child_process (execFile)
- crypto (randomUUID)

**Complexity:**
Complexity: 13
- Lines of Code: 457
- Dependencies: 13

**Migration Notes:**
- Uses environment variables
- Contains platform-specific code
- Performs file system operations - ensure proper permissions
- Uses WebSocket connections - verify server configuration
- Large file (577 lines) - consider refactoring into smaller modules

---

### DependencyAnalyzer.test

**File Path:** `tests/analyzers/DependencyAnalyzer.test.ts`

**Category:** module

**Description:** DependencyAnalyzer Tests

**Internal Dependencies:**
- `../../src/analyzers/DependencyAnalyzer`
- `../../src/types/index`
- `../utils/helpers`
- `./Button.css`
- `../utils/helpers`
- `./styles.css`
- `../utils/helper`
- `./nonexistent`

**External Dependencies:**
- @jest/globals (describe, it, expect, jest, beforeEach)
- react (React)
- react (useState, useEffect)
- react (* as React)
- react (React)
- react (useState)
- lodash (lodash)

**Complexity:**
Complexity: 15
- Lines of Code: 208
- Dependencies: 15

---

### ReactPatternDetector.test

**File Path:** `tests/analyzers/ReactPatternDetector.test.ts`

**Category:** module

**Description:** ReactPatternDetector Tests

**Exports:**
- `Input` (default function)
- `withStyle` (default const)
- `Button` (named const)

**Internal Dependencies:**
- `../../src/analyzers/ReactPatternDetector`

**External Dependencies:**
- @jest/globals (describe, it, expect, jest, beforeEach)
- react (useState, useEffect, useContext)
- react (useCallback, useMemo)

**Complexity:**
Complexity: 4
- Lines of Code: 319
- Dependencies: 4

---

### Basic.test

**File Path:** `tests/basic.test.ts`

**Category:** module

**Description:** Basic Test to Verify Jest Setup

**External Dependencies:**
- @jest/globals (describe, it, expect, jest)

**Complexity:**
Complexity: 1
- Lines of Code: 18
- Dependencies: 1

---

### CliSimple.test

**File Path:** `tests/cli-simple.test.ts`

**Category:** module

**Description:** CLI Tests

**Internal Dependencies:**
- `../src/cli`

**External Dependencies:**
- @jest/globals (describe, it, expect, jest, beforeEach)

**Complexity:**
Complexity: 2
- Lines of Code: 17
- Dependencies: 2

---

### CliWorking.test

**File Path:** `tests/cli-working.test.ts`

**Category:** module

**Description:** CLI Test using compiled JavaScript files

**External Dependencies:**
- @jest/globals (describe, it, expect, jest, beforeEach, afterEach)

**Complexity:**
Complexity: 1
- Lines of Code: 61
- Dependencies: 1

---

### Cli.integration.test

**File Path:** `tests/cli.integration.test.ts`

**Category:** module

**Description:** CLI Integration Tests for React Feature Discovery Tool

**External Dependencies:**
- @jest/globals (describe, it, expect, jest, beforeEach, afterEach)
- child_process (spawn)
- util (promisify)
- url (fileURLToPath)
- path (dirname, join)

**Complexity:**
Complexity: 5
- Lines of Code: 125
- Dependencies: 5

---

### Cli.test

**File Path:** `tests/cli.test.ts`

**Category:** module

**Description:** CLI Tests

**Internal Dependencies:**
- `../src/cli`

**External Dependencies:**
- @jest/globals (describe, it, expect, jest, beforeEach, afterEach)

**Complexity:**
Complexity: 2
- Lines of Code: 115
- Dependencies: 2

---

### AnalysisEngine.test

**File Path:** `tests/core/AnalysisEngine.test.ts`

**Category:** module

**Description:** AnalysisEngine Tests

**Exports:**
- `Test` (named const)

**External Dependencies:**
- @jest/globals (describe, it, expect, jest, beforeEach, afterEach, beforeAll)
- path (* as path)

**Complexity:**
Complexity: 2
- Lines of Code: 215
- Dependencies: 2

**Migration Notes:**
- Performs file system operations - ensure proper permissions

---

### DiffGenerators.test

**File Path:** `tests/generators/DiffGenerators.test.ts`

**Category:** module

**Description:** DiffGenerators.test module

**Internal Dependencies:**
- `../../src/generators/DiffMarkdownGenerator`
- `../../src/generators/DiffJSONGenerator`
- `../../src/generators/DiffHTMLGenerator`
- `../../src/types/diff`

**External Dependencies:**
- @jest/globals (describe, it, expect, beforeEach, beforeAll, afterAll)
- fs (* as fs)
- path (* as path)
- url (fileURLToPath)

**Complexity:**
Complexity: 8
- Lines of Code: 250
- Dependencies: 8

**Migration Notes:**
- Performs file system operations - ensure proper permissions

---

### HTMLGenerator.test

**File Path:** `tests/generators/HTMLGenerator.test.ts`

**Category:** module

**Description:** HTMLGenerator Tests

**Internal Dependencies:**
- `../../src/generators/HTMLGenerator`
- `../../src/types/index`

**External Dependencies:**
- @jest/globals (describe, it, expect, jest, beforeEach)

**Complexity:**
Complexity: 3
- Lines of Code: 351
- Dependencies: 3

---

### JSONGenerator.test

**File Path:** `tests/generators/JSONGenerator.test.ts`

**Category:** module

**Description:** JSONGenerator Tests

**External Dependencies:**
- @jest/globals (describe, it, expect, jest, beforeEach, beforeAll)

**Complexity:**
Complexity: 1
- Lines of Code: 285
- Dependencies: 1

**Migration Notes:**
- Performs file system operations - ensure proper permissions

---

### MarkdownGenerator.test

**File Path:** `tests/generators/MarkdownGenerator.test.ts`

**Category:** module

**Description:** MarkdownGenerator Tests

**Internal Dependencies:**
- `../../src/generators/MarkdownGenerator`
- `../../src/types/index`

**External Dependencies:**
- @jest/globals (describe, it, expect, jest, beforeEach)

**Complexity:**
Complexity: 3
- Lines of Code: 294
- Dependencies: 3

---

### Server.test

**File Path:** `tests/server.test.ts`

**Category:** module

**Description:** Server Tests for React Feature Discovery Tool

**External Dependencies:**
- @jest/globals (describe, it, expect, jest, beforeEach, afterEach)

**Complexity:**
Complexity: 1
- Lines of Code: 367
- Dependencies: 1

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

**External Dependencies:**
- @jest/globals (jest, afterEach)

**Complexity:**
Complexity: 1
- Lines of Code: 54
- Dependencies: 1

**Migration Notes:**
- Uses NODE_ENV for environment detection
- Uses environment variables

---



## Migration Guide

### Overview

This project contains 47 features across 0 pages, 0 components, 0 services, 0 hooks, 6 utilities, 3 type definitions, and 38 modules. The application follows a modern React architecture.

Complexity: low
Estimated Effort: 1-2 days

### Recommendations

1. Start by migrating type definitions and shared utilities first
2. Migrate services and API integrations before UI components
3. Test authentication and session management thoroughly in target environment
4. Verify all environment variables are properly configured
5. Run database migrations before deploying application code
6. Consider refactoring large files before migration to improve maintainability

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

#### Code Complexity

**Challenge:** 1 files exceed 500 lines of code

**Recommendation:** Consider refactoring large files into smaller, more maintainable modules

### Suggested Migration Order

Migrate in the following order (least dependent first):

1. `src/types/config.ts`
2. `src/types/diff.ts`
3. `src/types/index.ts`
4. `src/utils/ErrorHandler.ts`
5. `src/utils/SafetyValidator.ts`
6. `src/utils/locationDetector.ts`
7. `tests/utils/SafetyValidator.test.ts`
8. `tests/utils/locationDetector.test.ts`
9. `tests/utils/ErrorHandler.test.ts`
10. `src/analyzers/CatalogBuilder.ts`
11. `src/analyzers/DependencyAnalyzer.ts`
12. `src/analyzers/MetadataExtractor.ts`
13. `src/analyzers/ReactPatternDetector.ts`
14. `src/cli.ts`
15. `src/core/AnalysisEngine.ts`
16. `src/core/FeatureDiff.ts`
17. `src/generators/DiffHTMLGenerator.ts`
18. `src/generators/DiffJSONGenerator.ts`
19. `src/generators/DiffMarkdownGenerator.ts`
20. `src/generators/HTMLGenerator.ts`



## Dependency Graph

Total Nodes: 47
Total Edges: 16

### Most Depended Upon Files

1. `src/types/index.ts` - 4 dependents
2. `src/cli.ts` - 2 dependents
3. `src/analyzers/DependencyAnalyzer.ts` - 1 dependents
4. `src/analyzers/ReactPatternDetector.ts` - 1 dependents
5. `src/generators/DiffHTMLGenerator.ts` - 1 dependents
6. `src/generators/DiffJSONGenerator.ts` - 1 dependents
7. `src/generators/DiffMarkdownGenerator.ts` - 1 dependents
8. `src/generators/HTMLGenerator.ts` - 1 dependents
9. `src/generators/MarkdownGenerator.ts` - 1 dependents
10. `src/types/diff.ts` - 1 dependents
