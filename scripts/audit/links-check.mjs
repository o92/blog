/**
 * Site empty-path checks: nav.yaml books + content markdown / ref links.
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import fg from "fast-glob";
import {
  ROOT,
  crit,
  step,
  loadGlossaryConfig,
  resolveContentFile,
  parseFrontMatter,
  stripCodeFences,
} from "./lib.mjs";

function walkNavBooks(node, out) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) walkNavBooks(item, out);
    return;
  }
  if (typeof node.book === "string" && node.book.trim()) {
    out.push(node.book.trim());
  }
  if (Array.isArray(node.books)) {
    for (const b of node.books) {
      if (typeof b === "string" && b.trim()) out.push(b.trim());
    }
  }
  if (Array.isArray(node.children)) walkNavBooks(node.children, out);
}

function bookExists(id, contentDir) {
  const dir = path.join(ROOT, contentDir, id);
  if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) return true;
  const idx = resolveContentFile(`${id}/_index.md`, contentDir);
  return Boolean(idx);
}

function isSkippableHref(href) {
  if (!href || href.startsWith("#")) return true;
  if (/^(mailto:|tel:|javascript:|data:)/i.test(href)) return true;
  if (/^https?:\/\//i.test(href) || href.startsWith("//")) return true;
  return false;
}

/**
 * Resolve a content-relative or repo-relative markdown target.
 * @returns {string|null} absolute path if exists, null if missing, undefined if skipped
 */
function resolveMdTarget(fromFile, href, contentDir) {
  let target = href.split("#")[0].split("?")[0].trim();
  if (!target || isSkippableHref(href)) return undefined;

  // Hugo ref-style path without shortcode (rare): content/...
  if (target.startsWith("content/")) {
    const abs = path.join(ROOT, target);
    if (fs.existsSync(abs)) return abs;
    return null;
  }

  if (target.startsWith("/")) {
    // Site path → try content/<path>
    const stripped = target.replace(/^\/+/, "").replace(/\/+$/, "");
    if (!stripped) return undefined;
    const asFile = resolveContentFile(`${stripped}.md`, contentDir);
    if (asFile) return asFile;
    const asIndex = resolveContentFile(`${stripped}/_index.md`, contentDir);
    if (asIndex) return asIndex;
    const asDir = path.join(ROOT, contentDir, stripped);
    if (fs.existsSync(asDir) && fs.statSync(asDir).isDirectory()) return asDir;
    return null;
  }

  const fromDir = path.dirname(fromFile);
  const abs = path.resolve(fromDir, target);
  if (fs.existsSync(abs)) return abs;
  if (!/\.(md|markdown)$/i.test(abs)) {
    for (const ext of [".md", ".markdown"]) {
      if (fs.existsSync(abs + ext)) return abs + ext;
    }
    const idx = path.join(abs, "_index.md");
    if (fs.existsSync(idx)) return idx;
  }
  return null;
}

function checkRefTarget(refPath, contentDir, fromRel) {
  const cleaned = refPath.replace(/^\/+/, "");
  const abs = resolveContentFile(cleaned, contentDir);
  if (!abs) {
    crit(`${fromRel}: ref 目标不存在 → ${refPath}`);
  }
}

/**
 * @returns {Promise<void>}
 */
export async function checkSiteLinks() {
  step("2/4 站内空路径（nav + content 链接）");
  const config = loadGlossaryConfig();
  const contentDir = config.contentDir || "content";

  const navPath = path.join(ROOT, "data/nav.yaml");
  if (!fs.existsSync(navPath)) {
    crit("缺少 data/nav.yaml");
  } else {
    let nav;
    try {
      nav = yaml.load(fs.readFileSync(navPath, "utf8"));
    } catch (e) {
      crit(`data/nav.yaml 无法解析: ${e.message}`);
      nav = null;
    }
    if (nav) {
      const books = [];
      walkNavBooks(nav, books);
      for (const id of books) {
        if (!bookExists(id, contentDir)) {
          crit(`nav.yaml book 不存在 content/${id}/`);
        }
      }
    }
  }

  const mdFiles = await fg(["**/*.{md,markdown}"], {
    cwd: path.join(ROOT, contentDir),
    absolute: true,
  });

  const mdLinkRe = /\[([^\]]*)\]\(([^)]+)\)/g;
  const refRe =
    /\{\{[<%]\s*rel?ref\s+(?:"([^"]+)"|'([^']+)'|(\S+))\s*[>%]\}\}/gi;

  for (const file of mdFiles) {
    const rel = path.relative(ROOT, file);
    const raw = fs.readFileSync(file, "utf8");
    const { content } = parseFrontMatter(raw);
    const body = stripCodeFences(content);

    let m;
    mdLinkRe.lastIndex = 0;
    while ((m = mdLinkRe.exec(body)) !== null) {
      const href = m[2].trim();
      // Skip Hugo shortcodes embedded as link target
      if (/\{\{/.test(href)) continue;
      const resolved = resolveMdTarget(file, href, contentDir);
      if (resolved === null) {
        crit(`${rel}: 站内链接目标不存在 → ${href}`);
      }
    }

    refRe.lastIndex = 0;
    while ((m = refRe.exec(body)) !== null) {
      const refPath = (m[1] || m[2] || m[3] || "").trim();
      if (!refPath) continue;
      checkRefTarget(refPath, contentDir, rel);
    }
  }
}
