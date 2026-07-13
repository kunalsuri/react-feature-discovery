---
name: multi-agent-docs
description: Creates or refreshes CLAUDE.md and AGENTS.md at a repo's root — both carrying the same real project context (stack, build/test/lint commands, structure, conventions) — plus scaffolds the accompanying .claude/ and .agents/ project directories, so Claude Code, Antigravity, Cursor, GitHub Copilot, Codex, and other AI coding tools all start from identical instructions instead of silently drifting out of sync. Use this whenever the user wants to set up a repo for multiple AI coding assistants, asks for both a CLAUDE.md and an AGENTS.md (or just one but mentions wanting the project to also work in another tool), wants a project-level .agents/ or .claude/ folder created, or says things like "make this repo work in Claude Code and Antigravity", "add agent instructions for VS Code", "this project needs to work across coding assistants", or "sync my AI context files". Also trigger if a repo already has a CLAUDE.md or AGENTS.md that looks stale, contradicts the other, or was never kept in sync.
license: Apache-2.0
metadata:
  author: kunalsuri
  version: "1.0"
---

# Multi-agent project docs

Different AI coding tools look in different places for project context. Claude
Code reads `CLAUDE.md` and a `.claude/` project folder. A growing set of other
tools — Antigravity, Cursor, Copilot, Codex, and others — have converged on the
open `AGENTS.md` convention, and some also check a project-level `.agents/`
folder the same way Claude Code checks `.claude/`. Nothing keeps these in sync
automatically, and hand-maintained pairs drift fast: one file gets updated
after a refactor and the other quietly goes stale. This skill produces both
from one pass over the real codebase, so they start (and stay, each time you
rerun this) saying the same thing.

## Step 1 — Check what's already there

Look for an existing `CLAUDE.md`, `AGENTS.md`, `.claude/`, and `.agents/` at
the repo root. If any exist, read them fully before writing anything — they
may contain hand-written rules, gotchas, or conventions a fresh scan of the
code would never surface (e.g. "don't touch the generated client in
`src/gen/`"). Treat that content as things to preserve and fold in, not to
discard. If the two files have clearly diverged (different commands, stale
paths, contradictory instructions), that's exactly the drift this skill
exists to fix — point it out briefly when you report back.

Never delete or overwrite `.claude/` or `.agents/` subfolders that already
hold real content (custom commands, subagents, skills, workflows). Only add
what's missing.

## Step 2 — Gather real facts about the codebase

Don't template-fill with guesses. Spend a few minutes actually looking:
- README and any existing docs, for the one-paragraph "what is this"
- Manifest files (`package.json`, `pyproject.toml`, `requirements.txt`,
  `Cargo.toml`, etc.) for the stack and dependencies
- The actual scripts/commands used to install, build, test, and lint —
  quote the real ones you found, not generic placeholders like `npm test`
  if the project actually uses `pnpm test:unit`
- Top-level directory structure, with a one-line purpose per folder that
  isn't self-explanatory
- Conventions the code already follows consistently (naming, error
  handling, testing patterns, i18n, whatever's actually there) — only
  include ones you observed directly, not aspirational rules nobody follows
- Anything that would trip up an agent working blind: generated/vendored
  code not to hand-edit, required env vars, secrets handling, unusual
  monorepo layout

Keep the output proportional to the project. A small script repo gets a
short doc; padding it with boilerplate sections nobody will read just adds
noise an agent has to page past every session.

## Step 3 — Write CLAUDE.md and AGENTS.md

Write the same underlying facts into both files — same commands, same
structure notes, same conventions — so an agent gets the full picture
regardless of which file its tool reads. Don't make one a stub that
`@imports` or links to the other: several tools (and older Claude Code
setups) won't resolve that, and it defeats the point of writing both. A
light difference in framing is fine and expected:
- `CLAUDE.md` can speak to Claude Code specifically (mention subagents,
  slash commands, or `.claude/` contents if the repo has them)
- `AGENTS.md` should speak tool-agnostically ("AI coding agents" generally),
  since that's the file Antigravity, Cursor, Copilot, and Codex-style tools
  actually read

Add a one-line HTML comment at the top of each file noting they're a pair
kept in sync, e.g. `<!-- Companion to AGENTS.md — update both together. -->`
(and the mirror line in AGENTS.md pointing back). That's the cheapest
insurance against the drift described above — the next person or agent who
edits one is reminded the other exists.

Use plain file copies, not symlinks. Symlinks need elevated privileges on
Windows by default and plenty of tools don't follow them anyway — a real
duplicate is what actually works everywhere.

## Step 4 — Scaffold the project directories

Create each only if it doesn't already exist:

- **`.claude/`** — Claude Code's project config home. A bare directory is
  enough to start; don't manufacture empty `commands/`, `agents/`, or
  `skills/` subfolders speculatively. Add a one-line `README.md` inside
  explaining what the folder is for and that those subfolders get added
  once there's an actual command/subagent/skill to put in one.
- **`.agents/`** — the cross-tool counterpart. Include `.agents/AGENTS.md`
  as a copy of the root `AGENTS.md` (some tools look inside this folder
  specifically rather than at repo root — mirroring it costs nothing and
  covers both). Add a short `README.md` noting the same thing as above.

This convention is newer and less standardized than Claude Code's, and
different tools are still converging on exact expectations. If the user
names a specific tool whose folder convention you're not sure about, say so
plainly rather than asserting it with false confidence — a wrong guess
stated as fact is worse than an honest "check that tool's current docs."

## Step 5 — Report back

Summarize what was created vs. updated, and if you found existing content
worth calling out (drift between the two files, hand-written rules you
preserved), mention it. Note that nothing watches for drift automatically —
if the project's stack or commands change materially later, rerunning this
skill is the way to resync both files rather than hand-editing just one.
