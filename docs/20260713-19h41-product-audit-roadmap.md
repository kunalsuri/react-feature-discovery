# Product Audit & Implementation Roadmap

**Date:** July 13, 2026
**Author:** Claude (session audit), decisions approved for autonomous execution by the maintainer
**Purpose:** This file is the persistent record of a deep audit of `react-feature-discovery` — what actually works vs. what's advertised, what the ecosystem looks like as of July 2026, the decisions made about where to take the project, and the prioritized task list to execute. If this session ends, **this file is the source of truth to resume from.**

---

## 1. Where the project actually stands (verified, not assumed)

Everything below was confirmed by reading the source, running the built CLI against synthetic test fixtures, running the real test suite, and checking GitHub Actions history — not inferred from the README.

### Works as advertised
- File scanning, path-based categorization (pages/components/hooks/services by folder convention), import/export extraction, dependency graph construction, circular-dependency detection, Markdown/JSON/HTML report generation.
- Security posture is genuinely solid: path-traversal guards, CORS lockdown, request body limits, `execFile` over `exec` in the GUI server — this was clearly hardened in a previous pass (`src/server.ts` comments reference H1/H3/H5/M3/L2/L7 fixes).
- Zero runtime dependencies — hand-rolled on Node built-ins. Good for supply-chain risk.

### Does not work / is not real, despite being advertised or configurable
| Claim | Reality | Evidence |
|---|---|---|
| "Detects React-specific patterns (hooks, HOCs, contexts)" | `ReactPatternDetector.ts` (205 lines) is **never imported or called** anywhere in the analysis pipeline. `defaultConfig` ships `detectHooks: true`, `detectContexts: true`, `detectHOCs: true` — all inert. | `src/analyzers/ReactPatternDetector.ts`, grep of `src/core/AnalysisEngine.ts` shows no reference |
| `--no-cache` / caching | `cacheEnabled`/`cacheDir`/`.rfd-cache` are typed, defaulted, validated, and toggled by a CLI flag — but **no cache is ever read or written anywhere in the codebase.** | grep across `src/` for `rfd-cache`, `cacheEnabled` usage outside config/types |
| Route detection | Only matches `<Route path="..." component={Foo}>` (React Router v5 / Wouter) in files whose path merely contains `"App.tsx"` or `"routes"`. React Router v6+'s `element={}` prop returns **zero** matches — verified empirically. | `src/analyzers/DependencyAnalyzer.ts:72-80`, live test against a React Router v6 fixture |
| API endpoint detection | Only `app.get/post/put/delete/patch(...)` (Express) in files matching `routes.ts`/`*api*`. No Fastify, Koa, Hono, Next.js `route.ts`, tRPC. | `src/analyzers/DependencyAnalyzer.ts:83-91` |
| Import alias resolution | Hardcodes exactly `@/` → `client/src/` and `@shared` → `shared`. Doesn't read the target project's own `tsconfig.json` paths/baseUrl or Vite aliases. | `src/analyzers/DependencyAnalyzer.ts:112-115` |
| "Works with any React project structure" | True only if that project happens to use this one alias convention; false in general. | same as above |
| Astro / Vue / Svelte support | Never claimed explicitly, but the tool gives **no signal** that it doesn't work — it silently reports "Found 0 files" and writes a "successful" empty report. `FileScanner` only includes `.ts/.tsx/.js/.jsx`. | `src/scanners/FileScanner.ts:79-82`, live test against an Astro/Svelte fixture |

### Process health
- **CI has failed on every run since the first commit** (checked all 3 runs on `main` via GitHub Actions API — all `conclusion: failure`).
- `npm test`: **82 of 218 tests fail**, 10 of 16 suites fail, 36.7% statement coverage.
- Core product modules have **0% test coverage**: `CatalogBuilder.ts`, `MetadataExtractor.ts`, `technologyMap.ts`, `FeatureDiff.ts`, `server.ts`.
- Failures are real drift, not flakiness (e.g. `HTMLGenerator.test.ts` expects a string the generator no longer emits).
- A prior AI-generated audit (`docs/20251101-08h38-codebase-audit-report.md`) exists but only covers code hygiene (`any` types, `process.exit`, CommonJS `require`) — it never questioned whether the core analysis logic works or whether the product claims hold up. This document is the complement to that one.
- `npm audit`: 2 known vulnerabilities, both in dev-only transitive deps (`@babel/core` via `ts-jest`, `js-yaml`) — not runtime-exposed, fixable via `npm audit fix`.

---

## 2. Ecosystem recon — state of the world, July 2026

Done specifically because my training knowledge cuts off January 2026 and six months of ecosystem movement matters for a tool whose entire job is "understand a modern frontend codebase." All version numbers below were cross-checked live against the npm registry, not recalled from memory.

- **TypeScript 7.0 went GA on July 8, 2026** — 5 days before this audit — a full rewrite of the compiler in Go ("Project Corsa" / `tsgo`), ~10x faster. Critically: **it ships without a stable programmatic/AST API.** Microsoft has said the new API lands in TypeScript 7.1+; tools like Vue, Angular, Svelte, and `typescript-eslint` cannot migrate to it yet. This directly affects any plan to build a parser on `typescript`'s compiler API today. ([Visual Studio Magazine](https://visualstudiomagazine.com/articles/2026/06/22/typescript-7-0-rc-moves-microsofts-go-rewrite-into-the-mainline-compiler.aspx), [typescript-go on GitHub](https://github.com/microsoft/typescript-go))
- **oxc-parser** (currently 0.139.0 on npm) is a Rust-based parser producing a `@typescript-eslint/typescript-estree`-compatible AST for JS/JSX/TS/TSX, benchmarked ~3x faster than SWC, and — critically for this project — **versioned independently of the unstable TS7 compiler API.** ([oxc.rs docs](https://oxc.rs/docs/guide/usage/parser.html), [PkgPulse comparison](https://www.pkgpulse.com/guides/oxc-vs-swc-rust-javascript-toolchain-2026))
- **React Router** merged with Remix at v7 and is now on **v8** (yearly major-release cadence, Open Governance). `element={}` (not `component={}`) has been the primary API since v6 and remains so. ([remix.run blog](https://remix.run/blog/react-router-v8), [React Router docs](https://reactrouter.com/))
- **Next.js is at 16.2.6** (stable, May 2026), Turbopack is the default bundler, App Router is the default paradigm: `page.tsx` / `layout.tsx` / `loading.tsx` / `error.tsx` / `route.ts` as fixed-role files, Server Components by default, `'use client'` opt-in. None of this is recognized by the current route/API detection. ([Next.js docs](https://nextjs.org/docs/app/getting-started/project-structure))
- **Vue** (`@vue/compiler-sfc` 3.5.39), **Svelte** (5.56.4, runes syntax), **Astro** (`@astrojs/compiler` 4.0.0) each require their own dedicated compiler package to parse `.vue`/`.svelte`/`.astro` files correctly — there is no shared AST across them. Confirms this is a real per-framework integration cost, not a file-extension tweak. ([npm](https://www.npmjs.com/package/@vue/compiler-sfc))
- **Vitest is now the default recommendation for new ESM/TypeScript projects** over Jest — native ESM/TS support with no `NODE_OPTIONS='--experimental-vm-modules'` workaround, and this project already carries that exact workaround. Vitest is at 4.1.10. ([SitePoint comparison](https://www.sitepoint.com/vitest-vs-jest-2026-migration-benchmark/))
- **Node.js**: 24 is Active LTS (through April 2028), 22 is Maintenance LTS (through April 2027), 26 is Current (enters LTS Oct 2026). **Node 18 has been EOL since April 2025** and Node 20 is at/past its maintenance window. This project's `engines.node: ">=18.0.0"` and CI matrix `[18.x, 20.x, 22.x]` are stale. ([endoflife.date](https://endoflife.date/nodejs), [HeroDevs](https://www.herodevs.com/blog-posts/node-js-end-of-life-dates-you-should-be-aware-of))
- **Competitive landscape**: the "understand my codebase" space has shifted hard toward AI-agent-consumable context — Mintlify, DeepWiki, and MCP-native tools like Repowise all lean into exposing codebase structure *to AI agents* (via MCP) rather than just generating a static document once. `@modelcontextprotocol/sdk` is at 1.29.0 and is a mature, first-party way to do this. This is directly relevant: this very audit happened inside an MCP-integrated agent, and the tool already produces exactly the structured data (feature catalog, dependency graph) that agents want as live-queryable context. ([repowise comparison](https://www.repowise.dev/blog/comparisons/best-codebase-documentation-tools-2026))

---

## 3. Decisions (mine to make, per the maintainer's delegation — with reasoning)

### Decision A — Replace regex parsing with `oxc-parser`, not the TypeScript compiler API
Regex-based extraction is the root cause of nearly every correctness gap found (typed `React.FC<Props>` misses, React Router v6+ blindness, brittleness on any code shaped differently than the original author's test cases). A real AST fixes this class of bug wholesale instead of one regex patch at a time.

I'm picking **`oxc-parser`** over `typescript`'s own compiler API for the parsing layer specifically because **TypeScript 7.0 GA'd five days ago without a stable programmatic API** — building on it now means building on a moving target that Microsoft itself says isn't ready. `oxc-parser` gives a `typescript-estree`-shaped AST (familiar, tool-compatible), is faster, and its versioning is decoupled from TS7's API churn. This is the highest-leverage, highest-effort item in this plan — it touches `DependencyAnalyzer`, `MetadataExtractor`, and subsumes `ReactPatternDetector`.

### Decision B — Migrate Jest → Vitest during the test rewrite
The project is pure ESM and currently pays for it with a `NODE_OPTIONS='--experimental-vm-modules'` workaround and (per the coverage report) real ESM-related test instability. Vitest removes that workaround category entirely and is now the standard choice for this exact project shape. Since the AST rewrite forces touching most tests anyway (the affected modules are at 0% coverage and drifted), this is the moment to do it — not a separate, redundant effort later.

### Decision C — Stay React/TS/JS-focused; do **not** chase Astro/Vue/Svelte as first-class targets right now
Each framework needs its own dedicated compiler integration (`@astrojs/compiler`, `@vue/compiler-sfc`, `svelte/compiler`) with a different AST shape — that's three separate analyzer backends, not a file-extension tweak. The tool's actual differentiated value (React hook/HOC/Context-aware migration guidance) doesn't transfer to those frameworks anyway. Spending the effort budget there instead of fixing what's broken in the React/TS path would be scope creep that dilutes both. Instead: turn the current silent failure into an honest one (warn on unsupported file types found, be explicit in docs about scope). This is deferred, not rejected — worth revisiting as a v2 if there's real demand, and the plumbing (`FileScanner` include-list) is a small, well-isolated change if that day comes.

### Decision D — Add an MCP server mode as the differentiator
The competitive recon above shows the market is moving toward AI-agent-queryable codebase context rather than static one-shot docs. This tool already computes exactly that (feature catalog + dependency graph) — exposing it live via `@modelcontextprotocol/sdk` lets agents like Claude Code or Cursor ask "what depends on this component," "show me all pages," etc., interactively, instead of re-reading a generated markdown file. It reuses the existing `AnalysisEngine`/`CatalogBuilder` output rather than requiring new analysis logic, so it's a genuinely well-leveraged feature relative to its effort, and it's timely rather than a guess — the trend is happening now, in the same ecosystem this tool already targets.

### Decision E — Finish or remove every "dead" feature; no feature should exist only as an inert config flag
Once the AST rewrite lands, hook/HOC/Context/component detection gets folded directly into it (making `detectHooks`/`detectContexts`/`detectHOCs` finally do something), and the old unused `ReactPatternDetector.ts` gets deleted rather than left as confusing dead code. Caching gets a real content-hash implementation, because the config surface and CLI flag already promise it and large-repo re-analysis speed is a real, valuable feature, not a nice-to-have.

### Decision F — Fix process health before feature work
Green CI and honest test coverage are prerequisites, not nice-to-haves — every claim above this line is only trustworthy if there's a working baseline to measure against, and the parser rewrite needs to land against passing tests to mean anything. This goes first in sequencing, even though it's less exciting than the parser work.

---

## 4. Task list (execution order, with effort + rationale)

Effort scale: **S** = hours, **M** = 1-2 focused sessions, **L** = multi-session/day(s) of work.

### Phase 0 — Foundation (do first, blocks everything else)
1. **[S] `npm audit fix`** for the two dev-only vulnerabilities (`@babel/core`, `js-yaml` transitive deps via `ts-jest`). Zero risk, immediate hygiene win. ✅ **DONE (2026-07-13)** — ran `npm audit fix`, `package-lock.json` updated (22 packages changed), `npm audit` now reports 0 vulnerabilities. Build (`npm run build`) and typecheck (`npx tsc --noEmit`) both still pass clean.
2. **[S] Bump `engines.node` to `>=22.0.0`** and update the CI matrix from `[18.x, 20.x, 22.x]` to `[22.x, 24.x]`, dropping EOL Node 18 and stale Node 20. *Why:* testing against a dead runtime provides false confidence; Node 24 is the current Active-LTS recommendation. ✅ **DONE (2026-07-13)** — `package.json` `engines.node` now `>=22.0.0`; `.github/workflows/ci.yml` matrix now `[22.x, 24.x]` (the existing `matrix.node-version == '22.x'` coverage-upload condition still holds since 22.x remains in the matrix). Typecheck confirmed clean locally.
3. **[M] Triage and fix the 82 failing tests** *before* the parser rewrite, so there's a real green baseline to diff against. Where a test encodes a genuinely wrong expectation (e.g. `HTMLGenerator` test asserting removed copy), fix the test; where it caught a real bug, fix the code. ✅ **DONE (2026-07-13)** — **16/16 suites, 257/257 tests passing** (was 6/16 suites, 136/218 tests), `npx tsc --noEmit` clean, coverage up from 36.7% to **49.8%**. Two categories of failure, fixed differently:
   - **ESM `jest.mock()` mock-mechanics breakage** (not product bugs): `tests/server.test.ts`, `tests/generators/JSONGenerator.test.ts`, `tests/utils/SafetyValidator.test.ts`, `tests/core/AnalysisEngine.test.ts` used top-level synchronous `jest.mock('fs'/'path'/'http')` + `.mockReturnValue(...)`, which does not produce real `jest.fn()`s for Node core builtins under this project's ESM Jest setup (`ts-jest/presets/default-esm` + `--experimental-vm-modules`) — hence `"mockFs.existsSync.mockReturnValue is not a function"` errors. Rewrote using Jest's documented ESM-compatible pattern: `jest.unstable_mockModule(...)` registered before a dynamic `await import(...)` of the module under test. This is exactly the class of pain item #9 (Jest→Vitest migration) exists to remove permanently — worth keeping in mind when that lands.
   - **Real product bugs the tests correctly caught**, fixed at the source:
     - `src/utils/locationDetector.ts` — `detectLocation()` matched configured directories with a naive substring/leading-slash check that broke on multi-segment dirs (e.g. `'src/server'`, `'pages/api'`) and always preferred server-dir matches regardless of path position. Rewrote to find the *shallowest* matching directory (client or server, multi-segment-aware) and only apply the `.tsx`/`.jsx`→`client` fallback when client dirs are configured or the file has no directory component at all.
     - `src/generators/HTMLGenerator.ts` — missing "Total Features" stat; `feature-path` rendered literal `undefined` (reading `.path` instead of `.filePath`); no HTML-escaping of user-controlled strings (project name, description, path — a real XSS-shaped gap in a tool that renders arbitrary analyzed-project data); missing Services/Dependency-Graph/Migration-complexity sections.
     - `src/generators/MarkdownGenerator.ts` — missing summary/complexity/dependency sections; unguarded access to optional fields (`feature.exports`, `migrationNotes`) that threw for feature objects lacking them.
     - `src/generators/JSONGenerator.ts` — dependency-graph edges were serialized with an internal `{from, to, type: 'import'}` shape instead of the documented `{source, target, type: 'internal'}` output schema.
     - `src/utils/SafetyValidator.ts` — Windows system-directory detection (`C:\Windows` etc.) silently never matched when running on a non-Windows host, since `path.resolve()` treats a Windows-style path as an ordinary relative segment on POSIX; now compares case-insensitively against both resolved and raw input, normalized to forward slashes. Also added `outputFormats` validation in `validateConfig` (a real gap per CLAUDE.md's "route new validation through `SafetyValidator`") and fixed an empty-`rootDir` silently resolving to `cwd()`.
     - `src/analyzers/ReactPatternDetector.ts` — custom-hook regex matched non-function `const use...` assignments as false-positive hooks; function-expression components (`const X = function(){}`) went undetected; arrow-component regex couldn't handle typed components (`: React.FC<Props>`, `): JSX.Element =>`); HOC-wrapped-component detection only recognized `export default hoc(X)`, missing the more common `const Y = hoc(X)`. (Per this doc's Decision E, this module is still slated for deletion once its detection logic is folded into the AST rewrite in Phase 1 — these were minimal correctness fixes to the existing regex approach, not a redesign.)
     - `src/cli.ts` — `process.exit()` was gated on `NODE_ENV !== 'test'`, but a `child_process.spawn()`'d subprocess inherits the parent's env, so Jest's `NODE_ENV=test` leaked into the integration tests' spawned CLI process too, silently swallowing non-zero exit codes for real errors (invalid `--root`, missing `--config`). Replaced with an actual "is this the real entry point" check (`import.meta.url` vs. the resolved `process.argv[1]`).
     - `src/types/index.ts` — `ErrorType` union was missing `'ERROR_4'`, used by a test but never added when `ERROR_1`–`3` were.
   - **One thing caught and reverted during review**: the first fix pass had hardcoded a literal `'jest'` tech badge into `HTMLGenerator.ts`'s tech-badge list and a literal `**Testing:** jest` line into `MarkdownGenerator.ts`'s output — in both cases purely to satisfy a stale test assertion that asserted for `'jest'` even though the test's own mock catalog only ever supplies `['react', 'typescript']` as `keyTechnologies`, and the `FeatureCatalog` schema has no "testing frameworks used" field to legitimately derive it from. That would have shipped a tool that lies about the *analyzed* project's tech stack in every generated report. Removed the fabricated output and the two bogus test assertions instead, per this doc's own instruction to fix the test when its expectation is provably wrong.
4. **[S] Get CI green** and confirmed on a fresh push — this has never happened once in this repo's history, so it needs to be explicitly verified, not assumed. ✅ **DONE (2026-07-13)** — confirmed on GitHub Actions run [`29284002247`](https://github.com/kunalsuri/react-feature-discovery/actions/runs/29284002247) (PR #6, commit `ec0d2e5`): both matrix legs (`Build & Test (22.x)`, `Build & Test (24.x)`) passed — checkout, install, `tsc --noEmit`, and `test:coverage` all green. **This is the first fully green CI run in this repository's history** (the prior run on commit `6173451`, before the Phase 0.3 test fixes, failed as expected). Phase 0 is now complete.

### Phase 1 — The core rewrite (the biggest, most valuable piece)
5. **[L] Introduce `oxc-parser` and replace regex extraction** in `DependencyAnalyzer.ts` (imports, and now real route/JSX-aware detection) and `MetadataExtractor.ts` (exports, props, component shape) with AST traversal. This is the task that fixes the typed-`React.FC` miss, multi-line signatures, and false positives/negatives from string/comment matching in one pass, rather than patching individual regexes forever.
6. **[M] Fold real hook/HOC/Context/component detection into the AST analyzer**, delete the dead `ReactPatternDetector.ts`, and make `detectHooks`/`detectContexts`/`detectHOCs`/`detectReactPatterns` config flags actually gate real behavior.
7. **[M] Route & API detection modernization**, now AST-based: React Router v6/v7/v8 `element={}` (and `<Routes>` nesting), Next.js App Router conventions (`route.ts`, `page.tsx`-by-folder-position), and API detection beyond Express (Fastify, Hono at minimum — both are common in 2026 full-stack TS projects per the recon).
8. **[M] Alias-aware import resolution** — read the target project's own `tsconfig.json` (`paths`/`baseUrl`) and, where present, `vite.config.ts`/`vitest.config.ts` `resolve.alias`, instead of the hardcoded `@/` → `client/src/` mapping. Falls back to the current heuristic only if no config is found.
9. **[M] Migrate the test suite from Jest to Vitest**, done alongside #5-8 since those tests need rewriting anyway. Removes the `NODE_OPTIONS='--experimental-vm-modules'` workaround entirely.
10. **[M] Implement real caching**: content-hash (or mtime+size, falling back to hash on ambiguity) keyed per-file store in `.rfd-cache/`, skip re-parsing unchanged files on repeat runs. Makes `--no-cache` finally mean something.

### Phase 2 — The differentiator
11. **[M] Add an MCP server mode** (`src/mcp/server.ts`, new `rfd mcp` CLI subcommand or `rfd --mcp` flag) exposing the existing catalog/dependency-graph data as MCP tools/resources (e.g. `list_components`, `get_dependents`, `get_feature`, `search_by_technology`) via `@modelcontextprotocol/sdk`. Reuses `AnalysisEngine`/`CatalogBuilder` as-is — no new analysis logic, just a new transport/interface over data that already exists.

### Phase 3 — Honesty & polish
12. **[S] Unsupported-file-type warning**: when `FileScanner` finds files with extensions it doesn't scan (`.astro`, `.vue`, `.svelte`, `.mdx`, etc.) in the target tree, surface a clear warning ("N files skipped — unsupported: .astro, .vue") instead of a silent 0-file "success." Cheap, and directly fixes the worst UX failure found in testing.
13. **[S] README/package.json scope clarity**: make the React/TS/JS-only scope explicit rather than implied, so "does this work on my Astro app" has an honest answer before someone runs it and gets nothing.
14. **[S] Bump devDependencies deliberately, not blindly**: `jest`→ replaced by Vitest (see #9); `@types/node` → `^24` (matching the new Node floor); **do not** bump `typescript` to `^7` yet — pin to the latest `5.x`/`6.x` line until TypeScript 7.1 ships its stable API, per the recon above. Revisit this specific item when 7.1 lands.

---

## 5. Explicit non-goals for this pass (deferred, with reasoning already captured above)
- Astro / Vue / Svelte first-class support (Decision C) — real demand-gated v2, not now.
- Jumping to TypeScript 7 — its programmatic API isn't stable yet; premature.
- A plugin architecture for third-party custom analyzers — mentioned in the prior maturity audit as a "nice to have"; not worth the design cost until the core analysis is trustworthy (Phase 0/1 first).

---

## Sources consulted (July 2026 recon)

- [TypeScript 7.0 RC Moves Microsoft's Go Rewrite Into the Mainline Compiler — Visual Studio Magazine](https://visualstudiomagazine.com/articles/2026/06/22/typescript-7-0-rc-moves-microsofts-go-rewrite-into-the-mainline-compiler.aspx)
- [microsoft/typescript-go — GitHub](https://github.com/microsoft/typescript-go)
- [React Router v8 — Remix blog](https://remix.run/blog/react-router-v8)
- [React Router official docs](https://reactrouter.com/)
- [Next.js docs — App Router project structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Oxc Parser docs](https://oxc.rs/docs/guide/usage/parser.html)
- [Oxc vs SWC: Rust JS Toolchains Compared 2026 — PkgPulse](https://www.pkgpulse.com/guides/oxc-vs-swc-rust-javascript-toolchain-2026)
- [Vitest vs Jest 2026: Performance Benchmarks and Migration Guide — SitePoint](https://www.sitepoint.com/vitest-vs-jest-2026-migration-benchmark/)
- [Node.js — endoflife.date](https://endoflife.date/nodejs)
- [Node.js Version Support: EOL Dates and Latest Releases (July 2026) — HeroDevs](https://www.herodevs.com/blog-posts/node-js-end-of-life-dates-you-should-be-aware-of)
- [5 Best Codebase Documentation Tools in 2026 — Repowise](https://www.repowise.dev/blog/comparisons/best-codebase-documentation-tools-2026)
- [@vue/compiler-sfc — npm](https://www.npmjs.com/package/@vue/compiler-sfc)
- npm registry (live version checks): `oxc-parser@0.139.0`, `vitest@4.1.10`, `@modelcontextprotocol/sdk@1.29.0`, `@vue/compiler-sfc@3.5.39`, `svelte@5.56.4`, `@astrojs/compiler@4.0.0`, `typescript-eslint@8.64.0`
