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
const EXCERPT_MAX = Number(config.excerptMaxLength) || 100;

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

/** Approximate Hugo github-style anchorize */
function anchorize(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}\-_]/gu, "");
}

function isExternalLink(href) {
  return /^https?:\/\//i.test(href);
}

function resolveContentFile(rel) {
  let p = rel.replace(/^\//, "").replace(/^content\//, "");
  const abs = path.join(root, config.contentDir, p);
  if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return abs;
  if (!p.endsWith(".md") && !p.endsWith(".markdown")) {
    for (const ext of [".md", ".markdown"]) {
      const cand = abs + ext;
      if (fs.existsSync(cand)) return cand;
    }
  }
  return null;
}

/** content-relative md path -> site pathname ending with / */
function contentFileToPermalink(absFile) {
  let rel = path.relative(path.join(root, config.contentDir), absFile);
  rel = rel.split(path.sep).join("/");
  if (
    rel.endsWith("/_index.md") ||
    rel.endsWith("/_index.markdown") ||
    rel.endsWith("/index.md") ||
    rel.endsWith("/index.markdown")
  ) {
    rel = rel.replace(/\/_?index\.md(arkdown)?$/, "");
  } else {
    rel = rel.replace(/\.md(arkdown)?$/, "");
  }
  return `/${rel}/`.replace(/\/+/g, "/");
}

/**
 * Extract markdown body under a heading (same or higher level ends section).
 * Returns { text, heading } or null.
 */
function extractHeadingSection(mdBody, headingTitle) {
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

  const buf = [];
  for (let i = start; i < lines.length; i++) {
    const m = /^(#{1,6})\s+/.exec(lines[i]);
    if (m && m[1].length <= level) break;
    buf.push(lines[i]);
  }
  const text = buf
    .join("\n")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/[#>*_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { text, heading: target };
}

function truncateText(text, max) {
  if (!text) return { text: "", truncated: false };
  if (text.length <= max) return { text, truncated: false };
  let cut = text.slice(0, max);
  const sp = cut.lastIndexOf(" ");
  if (sp > max * 0.6) cut = cut.slice(0, sp);
  return { text: cut.replace(/[，,;；、.\s]+$/g, "") + "…", truncated: true };
}

function resolveSource(source) {
  if (!source) return null;
  const raw = String(source).trim();
  const hash = raw.indexOf("#");
  const filePart = hash >= 0 ? raw.slice(0, hash) : raw;
  const heading = hash >= 0 ? decodeURIComponent(raw.slice(hash + 1)).trim() : "";
  const abs = resolveContentFile(filePart);
  if (!abs) {
    console.warn(`[glossary] source file not found: ${filePart}`);
    return null;
  }
  const rawMd = fs.readFileSync(abs, "utf8");
  const { content } = parseFrontMatter(rawMd);
  const permalink = contentFileToPermalink(abs);
  let excerpt = "";
  let moreHref = permalink;

  if (heading) {
    const sec = extractHeadingSection(content, heading);
    if (!sec) {
      console.warn(`[glossary] heading not found in ${filePart}: #${heading}`);
    } else {
      const t = truncateText(sec.text, EXCERPT_MAX);
      excerpt = t.text;
      moreHref = `${permalink}#${anchorize(sec.heading)}`;
    }
  } else {
    const plain = content
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/[#>*_\-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const t = truncateText(plain, EXCERPT_MAX);
    excerpt = t.text;
    moreHref = permalink;
  }

  // Always offer 显示更多 when source is set
  return { excerpt, moreHref };
}

function loadGlossaries() {
  const dir = path.join(root, config.glossaryDir);
  const files = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
    : [];
  /** @type {Record<string, Record<string, object>>} */
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
      const entry = {
        summary: String(value.summary),
      };
      if (value.source) {
        const resolved = resolveSource(value.source);
        if (resolved) {
          entry.excerpt = resolved.excerpt;
          entry.moreHref = resolved.moreHref;
        }
      }
      if (value.link && isExternalLink(String(value.link))) {
        entry.externalLink = String(value.link);
      } else if (value.link) {
        console.warn(
          `[glossary] ignore non-external link for ${domain}/${term} (use source + 显示更多 for in-site)`,
        );
      }
      byDomain[domain][term] = entry;
      const aliases = Array.isArray(value.aliases)
        ? value.aliases.map(String).filter(Boolean)
        : [];
      for (const alias of aliases) {
        if (alias === term) continue;
        if (byDomain[domain][alias]) {
          console.warn(
            `[glossary] alias collision ${domain}/${alias} (from ${term})`,
          );
          continue;
        }
        byDomain[domain][alias] = { ...entry };
      }
    }
  }
  return byDomain;
}

function contentToPublicHtml(relPosix) {
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

function mergeDomains(...lists) {
  const out = [];
  const seen = new Set();
  for (const list of lists) {
    for (const d of list || []) {
      const id = String(d);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

/**
 * Load glossary domains per generated HTML page.
 * Domains inherit from ancestor section `_index.md` / `index.md` up to content root,
 * then merge the page's own front matter `glossary`.
 */
function loadPageGlossaries(contentDir) {
  const abs = path.join(root, contentDir);
  const files = fg.sync(["**/*.md", "**/*.markdown"], {
    cwd: abs,
    absolute: true,
  });
  /** @type {Map<string, string[]>} own front matter by abs path */
  const ownByFile = new Map();
  /** @type {Map<string, string[]>} section domains by content-relative dir ("", "go-concurrency", ...) */
  const byDir = new Map();

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const { data } = parseFrontMatter(raw);
    const domains = Array.isArray(data.glossary)
      ? data.glossary.map(String)
      : [];
    ownByFile.set(file, domains);

    const rel = path.relative(abs, file).split(path.sep).join("/");
    const base = path.posix.basename(rel);
    if (/^_?index\.md(arkdown)?$/.test(base)) {
      const dir =
        rel.includes("/") ? rel.replace(/\/_?index\.md(arkdown)?$/, "") : "";
      if (domains.length) {
        byDir.set(dir, mergeDomains(byDir.get(dir), domains));
      }
    }
  }

  /** @type {Map<string, string[]>} */
  const map = new Map();
  for (const file of files) {
    const relRoot = path.relative(root, file).split(path.sep).join("/");
    const htmlPath = contentToPublicHtml(relRoot);
    const rel = path.relative(abs, file).split(path.sep).join("/");
    const base = path.posix.basename(rel);
    let dir;
    if (/^_?index\.md(arkdown)?$/.test(base)) {
      dir = rel.includes("/")
        ? rel.replace(/\/_?index\.md(arkdown)?$/, "")
        : "";
    } else {
      dir = path.posix.dirname(rel);
      if (dir === ".") dir = "";
    }

    const inherited = [];
    let walk = dir;
    for (;;) {
      if (byDir.has(walk)) inherited.push(...byDir.get(walk));
      if (!walk) break;
      const parent = path.posix.dirname(walk);
      walk = parent === "." ? "" : parent;
    }

    map.set(
      path.normalize(htmlPath),
      mergeDomains(inherited, ownByFile.get(file)),
    );
  }
  return map;
}

function isAsciiTerm(term) {
  return /^[\x00-\x7F]+$/.test(term);
}

function buildTermIndex(byDomain, domains) {
  /** @type {Map<string, { term: string, sources: object[] }>} */
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
      index.get(key).sources.push({ domain, ...meta });
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
    const label =
      s.domain === "global"
        ? "通用"
        : s.domain === "scrum"
          ? "Scrum"
          : s.domain;
    const parts = [
      `<span class="glossary-tip-domain">${escapeHtml(label)}</span>`,
      `<span class="glossary-tip-summary">${escapeHtml(s.summary)}</span>`,
    ];
    if (s.excerpt) {
      parts.push(
        `<span class="glossary-tip-excerpt">${escapeHtml(s.excerpt)}</span>`,
      );
    }
    const actions = [];
    if (s.moreHref) {
      actions.push(
        `<a class="glossary-tip-more" href="${escapeAttr(s.moreHref)}">显示更多</a>`,
      );
    }
    if (s.externalLink) {
      actions.push(
        `<a class="glossary-tip-ext" href="${escapeAttr(s.externalLink)}" target="_blank" rel="noopener">外部链接</a>`,
      );
    }
    if (actions.length) {
      parts.push(
        `<span class="glossary-tip-actions">${actions.join("")}</span>`,
      );
    }
    return `<span class="glossary-tip-block">${parts.join("")}</span>`;
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
    if (
      name === "span" &&
      cur.attribs?.class?.split(/\s+/).includes("glossary-term")
    ) {
      return true;
    }
    cur = cur.parent;
  }
  return false;
}

function injectInRoot($, rootEl, termIndex) {
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
      const nodes = frag.filter(Boolean);
      if (nodes.length) {
        $(node).replaceWith(nodes);
      }
      return;
    }
    if (node.type === "tag") {
      const name = node.name?.toLowerCase();
      if (SKIP_TAGS.has(name)) return;
      if (
        name === "span" &&
        node.attribs?.class?.split(/\s+/).includes("glossary-term")
      ) {
        return;
      }
      const children = [...(node.children || [])];
      for (const child of children) walk(child);
    }
  };

  const children = [...(rootEl.children || [])];
  for (const child of children) walk(child);
  return count;
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
  const contentRoot = findContentRoot($);
  if (!contentRoot) {
    console.warn(
      `[glossary] no content root in ${path.relative(root, htmlPath)}`,
    );
    return 0;
  }
  const termIndex = buildTermIndex(byDomain, domains);
  const n = injectInRoot($, contentRoot, termIndex);
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
