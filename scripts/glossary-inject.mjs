/**
 * Build-time glossary injector.
 * Spec: docs/superpowers/specs/2026-08-06-glossary-tooltip-design.md
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";
import fg from "fast-glob";
import matter from "gray-matter";
import yaml from "js-yaml";
import toml from "@iarna/toml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const SKIP_TAGS = new Set([
  "pre",
  "code",
  "kbd",
  "samp",
  "script",
  "style",
  "textarea",
  "svg",
]);

const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "glossary.config.json"), "utf8"),
);

function loadGlossaries() {
  const dir = path.join(root, config.glossaryDir);
  const files = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
    : [];
  /** @type {Record<string, Record<string, { summary: string, link?: string }>>} */
  const byDomain = {};
  for (const file of files) {
    const domain = path.basename(file, path.extname(file));
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const data = yaml.load(raw) || {};
    byDomain[domain] = {};
    for (const [term, value] of Object.entries(data)) {
      if (!value || typeof value !== "object" || !value.summary) {
        console.warn(`[glossary] skip invalid entry ${domain}/${term}`);
        continue;
      }
      byDomain[domain][term] = {
        summary: String(value.summary),
        ...(value.link ? { link: String(value.link) } : {}),
      };
    }
  }
  return byDomain;
}

function parseFrontMatter(raw) {
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

function contentToPublicHtml(relPosix) {
  // content/posts/foo.md -> public/posts/foo/index.html
  // content/books/foo/_index.md -> public/books/foo/index.html
  let rel = relPosix.replace(/^content\//, "");
  if (
    rel.endsWith("/index.md") ||
    rel.endsWith("/index.markdown") ||
    rel.endsWith("/_index.md") ||
    rel.endsWith("/_index.markdown")
  ) {
    rel = rel.replace(/\/_?index\.md(arkdown)?$/, "");
  } else {
    rel = rel.replace(/\.md(arkdown)?$/, "");
  }
  return path.join(root, config.publicDir, rel, "index.html");
}

function loadPageGlossaries(contentDir) {
  const abs = path.join(root, contentDir);
  const files = fg.sync(["**/*.md", "**/*.markdown"], {
    cwd: abs,
    absolute: true,
  });
  /** @type {Map<string, string[]>} */
  const map = new Map();
  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const { data } = parseFrontMatter(raw);
    const domains = Array.isArray(data.glossary)
      ? data.glossary.map(String)
      : [];
    const rel = path.relative(root, file).split(path.sep).join("/");
    const htmlPath = contentToPublicHtml(rel);
    map.set(path.normalize(htmlPath), domains);
  }
  return map;
}

function isAsciiTerm(term) {
  return /^[\x00-\x7F]+$/.test(term);
}

/**
 * Merge global + domains into term -> sources[]
 * @param {Record<string, Record<string, { summary: string, link?: string }>>} byDomain
 * @param {string[]} domains
 */
function buildTermIndex(byDomain, domains) {
  /** @type {Map<string, { term: string, sources: { domain: string, summary: string, link?: string }[] }>} */
  const index = new Map();
  const order = ["global", ...domains.filter((d) => d !== "global")];

  for (const domain of order) {
    const entries = byDomain[domain];
    if (!entries) {
      if (domain !== "global") {
        console.warn(`[glossary] domain not found: ${domain}`);
      }
      continue;
    }
    for (const [term, meta] of Object.entries(entries)) {
      const key = isAsciiTerm(term) ? term.toLowerCase() : term;
      if (!index.has(key)) {
        index.set(key, { term, sources: [] });
      }
      const item = index.get(key);
      // keep display term as first-seen casing from earliest domain in order
      item.sources.push({
        domain,
        summary: meta.summary,
        ...(meta.link ? { link: meta.link } : {}),
      });
    }
  }
  return index;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildMatcher(termIndex) {
  const terms = [...termIndex.values()].map((v) => v.term);
  terms.sort((a, b) => b.length - a.length);
  if (terms.length === 0) return null;

  const parts = terms.map((term) => {
    const escaped = escapeRegExp(term);
    if (isAsciiTerm(term)) {
      return `\\b(?:${escaped})\\b`;
    }
    return escaped;
  });
  return new RegExp(`(${parts.join("|")})`, "gi");
}

function lookupSources(termIndex, matched) {
  const key = isAsciiTerm(matched) ? matched.toLowerCase() : matched;
  return termIndex.get(key) || null;
}

function tipHtml(sources) {
  const blocks = sources.map((s) => {
    const label = s.domain === "global" ? "通用" : s.domain;
    const body = s.link
      ? `${escapeHtml(s.summary)} <a href="${escapeAttr(s.link)}" target="_blank" rel="noopener">链接</a>`
      : escapeHtml(s.summary);
    return `<span class="glossary-tip-block"><strong>${escapeHtml(label)}</strong>：${body}</span>`;
  });
  return blocks.join("");
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, "&#39;");
}

function shouldSkipTextNode(elem) {
  let cur = elem;
  while (cur) {
    const name = cur.type === "tag" ? cur.name?.toLowerCase() : null;
    if (name && SKIP_TAGS.has(name)) return true;
    if (name === "span" && cur.attribs?.class?.split(/\s+/).includes("glossary-term")) {
      return true;
    }
    cur = cur.parent;
  }
  return false;
}

function injectInRoot($, root, termIndex) {
  const re = buildMatcher(termIndex);
  if (!re) return 0;
  let count = 0;

  const walk = (node) => {
    if (!node) return;
    if (node.type === "text") {
      if (shouldSkipTextNode(node.parent)) return;
      const text = node.data;
      if (!text || !re.test(text)) {
        re.lastIndex = 0;
        return;
      }
      re.lastIndex = 0;
      const frag = [];
      let last = 0;
      let m;
      while ((m = re.exec(text)) !== null) {
        const matched = m[1];
        const entry = lookupSources(termIndex, matched);
        if (!entry) continue;
        if (m.index > last) {
          frag.push($.parseHTML(escapeHtml(text.slice(last, m.index)))[0]);
        }
        const tip = tipHtml(entry.sources);
        const html = `<span class="glossary-term">${escapeHtml(matched)}<span class="glossary-tip" role="tooltip">${tip}</span></span>`;
        frag.push(...$.parseHTML(html));
        count += 1;
        last = m.index + matched.length;
      }
      if (last < text.length) {
        frag.push($.parseHTML(escapeHtml(text.slice(last)))[0]);
      }
      // filter undefined from empty parse
      const nodes = frag.filter(Boolean);
      if (nodes.length) {
        $(node).replaceWith(nodes);
      }
      return;
    }
    if (node.type === "tag") {
      const name = node.name?.toLowerCase();
      if (SKIP_TAGS.has(name)) return;
      if (name === "span" && node.attribs?.class?.split(/\s+/).includes("glossary-term")) {
        return;
      }
      const children = [...(node.children || [])];
      for (const child of children) walk(child);
    }
  };

  const children = [...(root.children || [])];
  for (const child of children) walk(child);
  return count;
}

function ensureStylesheet($) {
  const href = config.cssHref;
  const exists = $(`link[rel="stylesheet"][href="${href}"]`).length > 0
    || $(`link[rel="stylesheet"][href$="glossary.css"]`).length > 0;
  if (!exists) {
    $("head").append(`<link rel="stylesheet" href="${href}">`);
  }
}

function findContentRoot($) {
  for (const sel of config.contentSelectors) {
    const el = $(sel).first();
    if (el.length) return el.get(0);
  }
  return null;
}

function processFile(htmlPath, domains, byDomain) {
  const html = fs.readFileSync(htmlPath, "utf8");
  const $ = cheerio.load(html, { decodeEntities: false });
  const root = findContentRoot($);
  if (!root) {
    console.warn(`[glossary] no content root in ${path.relative(root, htmlPath)}`);
    return 0;
  }
  const termIndex = buildTermIndex(byDomain, domains);
  const n = injectInRoot($, root, termIndex);
  ensureStylesheet($);
  fs.writeFileSync(htmlPath, $.html(), "utf8");
  return n;
}

function main() {
  const byDomain = loadGlossaries();
  if (!byDomain.global) {
    console.warn("[glossary] missing data/glossary/global.yaml (continuing)");
    byDomain.global = {};
  }
  const pageMap = loadPageGlossaries(config.contentDir);
  let files = 0;
  let terms = 0;
  for (const [htmlPath, domains] of pageMap) {
    if (!fs.existsSync(htmlPath)) {
      continue;
    }
    const n = processFile(htmlPath, domains, byDomain);
    files += 1;
    terms += n;
    console.log(
      `[glossary] ${path.relative(root, htmlPath)} domains=[${["global", ...domains].join(",")}] hits=${n}`,
    );
  }
  console.log(`[glossary] done files=${files} hits=${terms}`);
}

main();
