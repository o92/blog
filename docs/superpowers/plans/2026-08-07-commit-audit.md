# Commit Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the blog repo commit audit with a pure Node pipeline: glossary YAML + empty paths + temp full-site bubble DOM check + macOS confirm.

**Architecture:** Single entry `scripts/audit/run.mjs` orchestrates modular checkers; pre-commit calls `--commit`. No cursor-git wrapper.

**Tech Stack:** Node ESM, js-yaml, gray-matter, cheerio, fast-glob, hugo, osascript

## Global Constraints

- No AI in audit
- No local `public/` mutation (temp build only)
- Match glossary-inject heading/source/matching semantics
- `SKIP_COMMIT_AUDIT=1` skips all
- Chinese user-facing messages OK; code identifiers English

---

### Task 1: Delete old audit + write shared lib + install/hook/npm/rules

**Files:**
- Delete: all current `scripts/audit/*`, `scripts/git-pre-commit-audit.sh`, `scripts/install-hooks.sh`, `scripts/cursor-git` if present
- Create: `scripts/audit/lib.mjs`, `scripts/audit/install.sh`, `scripts/audit/*.mjs` (stubs wired in later tasks)
- Modify: `.githooks/pre-commit`, `package.json`, `.vscode/settings.json`, `.cursor/rules/pre-commit-audit.mdc`

- [ ] **Step 1:** Remove old files; write `lib.mjs` (root, log, crit, report helpers, resolveContentFile, extractHeadingSection, loadConfig)
- [ ] **Step 2:** Wire install + pre-commit + package scripts + clear git.path + update rule doc
- [ ] **Step 3:** Implement glossary-check, links-check, build-temp, bubbles-check, confirm, run.mjs
- [ ] **Step 4:** Run `npm run audit` and fix failures until green (or document pre-existing content bugs)

---

### Task 2: Verify end-to-end

- [ ] **Step 1:** `npm run audit` exit 0
- [ ] **Step 2:** Confirm `hooks:install` points to new runner
- [ ] **Step 3:** Spot-check that cancel path / SKIP env are documented in rule
