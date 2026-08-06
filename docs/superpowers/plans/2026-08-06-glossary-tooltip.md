# Glossary Tooltip Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox syntax.

**Goal:** Build-time HTML injection of glossary term highlights with hover tooltips.

**Architecture:** Hugo builds `public/`; `scripts/glossary-inject.mjs` reads `data/glossary/*.yaml` + content front matter, rewrites article HTML; CSS tooltips in `static/css/glossary.css`.

**Tech Stack:** Node.js (ESM), cheerio, js-yaml, gray-matter, fast-glob; Hugo; GitHub Actions.

## Global Constraints

- Build order: hugo → glossary-inject → deploy
- Every occurrence highlighted; skip code-like tags; longest-match first
- Conflict tips show 通用 + each domain
- Theme-agnostic: configurable selectors; inject CSS link if missing

## Tasks

- [x] Task 1: Scaffold data, config, package.json, sample glossaries + demo post + minimal layout hook
- [x] Task 2: Implement `glossary-inject.mjs` + verify on demo HTML
- [x] Task 3: Add `glossary.css`, npm scripts, CI step, update spec status
