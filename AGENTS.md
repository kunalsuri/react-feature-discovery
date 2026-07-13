<!-- Companion to CLAUDE.md — update both together. -->

# AGENTS.md

Guidance for AI coding agents (Antigravity, Cursor, Copilot, Codex, Claude Code, and similar) working in this repository.

## What this is

**React Feature Discovery** (`rfd`) is a Node.js/TypeScript CLI + web GUI that statically analyzes React codebases (TS/JS) and generates feature catalogs: component/hook/page/service inventories, dependency graphs, complexity metrics, and migration guidance. It's read-only — it never modifies the analyzed project. Output formats: Markdown, JSON, HTML.

Package name: `react-feature-discovery`, binary name: `rfd`. ESM throughout (`"type": "module"` in `package.json`).

## Commands

- `npm install` — install deps (also runs `postinstall` → `npm run build`)
- `npm run build` — compile TypeScript (`tsc`) to `dist/`
- `npm run dev` — `tsc --watch`
- `npm test` — run the Jest suite (`NODE_OPTIONS='--experimental-vm-modules' jest`, required for ESM + ts-jest)
- `npm run test:watch` — Jest in watch mode
- `npm run test:coverage` — Jest with coverage report (this is what CI runs)
- `npx tsc --noEmit` — type-check only, no output (this is what CI runs for type checking)
- `npm run gui` — build then start the web GUI server (`node dist/server.js`), opens at `http://localhost:3000`

There is no configured lint script and no ESLint/Prettier config in the repo — don't invent lint commands.

Run the CLI itself via `node dist/cli.js --root ./src` (after building), or `rfd --root ./src` once linked (`npm link`).

## CI

`.github/workflows/ci.yml` runs on push/PR to `main`/`master`/`develop`, on Node 18.x/20.x/22.x: `npm ci`, `npx tsc --noEmit`, `npm run test:coverage`. Match these locally before pushing.

## Structure

- `src/cli.ts` — CLI entry point (arg parsing, calls into `core/`)
- `src/server.ts` — web GUI server entry point
- `src/index.ts` — programmatic/library entry point (currently minimal)
- `src/core/` — `AnalysisEngine.ts` (orchestrates a full analysis run) and `FeatureDiff.ts` (diffing two catalogs)
- `src/scanners/` — `FileScanner.ts`, walks the target project's filesystem
- `src/analyzers/` — `CatalogBuilder.ts`, `DependencyAnalyzer.ts`, `MetadataExtractor.ts`, `ReactPatternDetector.ts` (turn scanned files into catalog entries, dependency graphs, React-pattern detection)
- `src/generators/` — output writers: `MarkdownGenerator.ts`, `JSONGenerator.ts`, `HTMLGenerator.ts`, and diff-specific counterparts (`Diff*Generator.ts`)
- `src/config/` — `ConfigLoader.ts`, `ConfigMerger.ts`, `ConfigValidator.ts`, plus `defaults.ts`, `categoryRules.ts`, `technologyMap.ts` (loads/merges/validates `.rfdrc.json` or `package.json#rfd` config)
- `src/utils/` — `SafetyValidator.ts` (enforces read-only behavior, excludes `.git`/`node_modules`/`.env`/etc.), `ErrorHandler.ts`, `locationDetector.ts`
- `src/types/` — shared TypeScript types (`config.ts`, `diff.ts`, `index.ts`)
- `tests/` — Jest tests mirroring `src/` (`tests/core`, `tests/analyzers`, `tests/generators`, `tests/utils`); `tests/setup.ts` is Jest's `setupFilesAfterEnv`
- `gui/` — static web GUI assets (`index.html`) served by `src/server.ts`
- `docs/` — `project-info.md` is the full user-facing docs (linked from README); also audit/report docs
- `scripts/` — `install.sh` / `install.bat` (clone+build+link helper) and `verify-safety.sh` (checks the built CLI's safety guarantees)
- `migration-2026/` — planning notes, not shipped code
- `.agent/workflows/` — pre-existing agent workflow notes (unrelated to this `.agents/`/`.claude/` pairing — leave as-is)

## Conventions observed in this codebase

- Strict TypeScript (`strict: true` in `tsconfig.json`), ES2022 target, Node16 module resolution. Relative imports use explicit `.js` extensions (ESM requirement), e.g. `from './config/index.js'` even though the source file is `.ts`.
- Tests live under `tests/`, not colocated with source, and follow `*.test.ts` / `__tests__/` naming (see `jest.config.js` `testMatch`).
- `src/index.ts` is intentionally minimal — it's the reserved programmatic entry point, most logic lives behind `AnalysisEngine`.
- Safety is a first-class concern: this tool is marketed as 100% read-only/no-network. Don't add code paths that write to or execute code from the analyzed target project, and route any new exclusion/validation logic through `SafetyValidator.ts` rather than duplicating checks.

## Working in this repo

- Build (`npm run build`) before running the CLI or GUI directly against `dist/`; `npm test` runs against `src/` via `ts-jest` and doesn't require a prior build.
- This repo also has a project-level `.claude/` folder (Claude Code specific) and `.agents/` folder (this file, mirrored, for tools that look there specifically) — keep both in sync with this file if either changes.
