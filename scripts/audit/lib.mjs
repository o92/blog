/**
 * Shared helpers for commit audit.
 * Spec: docs/superpowers/specs/2026-08-07-commit-audit-design.md
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import yaml from "js-yaml";
import toml from "@iarna/toml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "../..");
export const PREFIX = "[audit]";

/** @type {string[]} */
export const errors = [];
/** @type {string[]} */
export const steps = [];

export function log(msg) {
  console.log(`${PREFIX} ${msg}`);
}

export function step(msg) {
  steps.push(msg);
  console.log(`${PREFIX} --- ${msg} ---`);
}

export function crit(msg) {
  errors.push(msg);
  console.error(`${PREFIX} Critical: ${msg}`);
}

export function loadGlossaryConfig() {
  const cfgPath = path.join(ROOT, "scripts/glossary.config.json");
  return JSON.parse(fs.readFileSync(cfgPath, "utf8"));
}

export function parseFrontMatter(raw) {
  const engines = {
    yaml: (s) => yaml.load(s),
    toml: (s) => toml.parse(s),
  };
  if (raw.startsWith("+++")) {
    return matter(raw, {
      delimiters: "+++",
      language: "toml",
      engines,
    });
  }
  return matter(raw, { engines });
}

export function resolveContentFile(rel, contentDir = "content") {
  let p = String(rel).replace(/^\//, "").replace(/^content\//, "");
  const abs = path.join(ROOT, contentDir, p);
  if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return abs;
  if (!p.endsWith(".md") && !p.endsWith(".markdown")) {
    for (const ext of [".md", ".markdown"]) {
      const cand = abs + ext;
      if (fs.existsSync(cand)) return cand;
    }
  }
  return null;
}

/** Same heading match as glossary-inject.mjs */
export function extractHeadingSection(mdBody, headingTitle) {
  const lines = mdBody.replace(/\r\n/g, "\n").split("\n");
  const target = headingTitle.trim();
  let start = -1;
  let level = 0;
  for (let i = 0; i < lines.length; i++) {
    const m = /^(#{1,6})\s+(.+?)\s*$/.exec(lines[i]);
    if (!m) continue;
    const title = m[2].trim();
    if (title === target || title.toLowerCase() === target.toLowerCase()) {
      start = i + 1;
      level = m[1].length;
      break;
    }
  }
  if (start < 0) return null;
  return { heading: target };
}

export function isAsciiTerm(term) {
  return /^[\x00-\x7F]+$/.test(term);
}

export function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function stripCodeFences(md) {
  return md.replace(/```[\s\S]*?```/g, "\n").replace(/~~~[\s\S]*?~~~/g, "\n");
}

export function makeTempDir(prefix = "blog-audit-") {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

export function stagedFiles() {
  try {
    const out = execSync("git diff --cached --name-only --diff-filter=ACMR", {
      cwd: ROOT,
      encoding: "utf8",
    });
    return out
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function writeReport({ publicDir, buildLog, result }) {
  const gitDir = path.join(ROOT, ".git");
  if (!fs.existsSync(gitDir)) return null;
  const reportPath = path.join(gitDir, "last-pre-commit-audit.txt");

  let branch = "?";
  try {
    branch = fs
      .readFileSync(path.join(gitDir, "HEAD"), "utf8")
      .trim()
      .replace(/^ref:\s*refs\/heads\//, "");
  } catch {
    /* ignore */
  }

  const body = [
    `time: ${new Date().toISOString()}`,
    `branch: ${branch}`,
    `scope: glossary + site links + hugo(temp) + bubbles`,
    `result: ${result}`,
    `errors: ${errors.length}`,
    publicDir ? `publicDir: ${publicDir}` : null,
    "",
    "## steps",
    ...steps.map((s) => `- ${s}`),
    "",
    "## errors",
    ...(errors.length ? errors.map((e) => `- ${e}`) : ["(none)"]),
    "",
  ]
    .filter((x) => x !== null)
    .join("\n");

  fs.writeFileSync(reportPath, body + "\n", "utf8");
  if (buildLog && fs.existsSync(buildLog)) {
    fs.copyFileSync(buildLog, path.join(gitDir, "last-pre-commit-build.log"));
  }
  log(`报告：${reportPath}`);
  return reportPath;
}

export { execSync };
