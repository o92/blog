/**
 * Post-inject bubble DOM checks on temp public/.
 */
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import fg from "fast-glob";
import yaml from "js-yaml";
import {
  ROOT,
  crit,
  step,
  loadGlossaryConfig,
  parseFrontMatter,
  isAsciiTerm,
  escapeRegExp,
} from "./lib.mjs";

const SKIP_TAGS = new Set([
  "pre",
  "code",
  "kbd",
  "samp",
  "script",
  "style",
  "textarea",
  "svg",
  "a",
]);

function loadGlossariesRaw(glossaryDir) {
  const dir = path.join(ROOT, glossaryDir);
  const files = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => /\.ya?ml$/i.test(f))
    : [];
  /** @type {Record<string, Record<string, { summary: string, hasSource: boolean }>>} */
  const byDomain = {};
  for (const file of files) {
    const domain = path.basename(file, path.extname(file));
    const data = yaml.load(fs.readFileSync(path.join(dir, file), "utf8")) || {};
    byDomain[domain] = {};
    if (typeof data !== "object" || Array.isArray(data)) continue;
    for (const [term, value] of Object.entries(data)) {
      if (!value || typeof value !== "object" || !value.summary) continue;
      const entry = {
        summary: String(value.summary),
        hasSource: Boolean(value.source && String(value.source).trim()),
      };
      byDomain[domain][term] = entry;
      const aliases = Array.isArray(value.aliases)
        ? value.aliases.map(String).filter(Boolean)
        : [];
      for (const alias of aliases) {
        if (alias === term) continue;
        if (!byDomain[domain][alias]) byDomain[domain][alias] = { ...entry };
      }
    }
  }
  return byDomain;
}

function contentToPublicHtml(publicDir, relPosix) {
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
  return path.join(publicDir, rel, "index.html");
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

function loadPageGlossaries(contentDir, publicDir) {
  const abs = path.join(ROOT, contentDir);
  const files = fg.sync(["**/*.md", "**/*.markdown"], {
    cwd: abs,
    absolute: true,
  });

  /** @type {Map<string, string[]>} */
  const ownByFile = new Map();
  /** @type {Map<string, string[]>} */
  const byDir = new Map();

  for (const file of files) {
    const { data } = parseFrontMatter(fs.readFileSync(file, "utf8"));
    const domains = Array.isArray(data.glossary)
      ? data.glossary.map(String)
      : [];
    ownByFile.set(file, domains);

    const rel = path.relative(abs, file).split(path.sep).join("/");
    const base = path.posix.basename(rel);
    if (/^_?index\.md(arkdown)?$/.test(base)) {
      const dir = rel.includes("/")
        ? rel.replace(/\/_?index\.md(arkdown)?$/, "")
        : "";
      if (domains.length) {
        byDir.set(dir, mergeDomains(byDir.get(dir), domains));
      }
    }
  }

  /** @type {Map<string, string[]>} */
  const map = new Map();
  for (const file of files) {
    const rel = path.relative(abs, file).split(path.sep).join("/");
    const htmlPath = contentToPublicHtml(publicDir, rel);
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

function buildTermIndex(byDomain, domains) {
  /** @type {Map<string, { term: string, hasSource: boolean }>} */
  const index = new Map();
  const order = ["global", ...domains.filter((d) => d !== "global")];
  for (const domain of order) {
    const entries = byDomain[domain];
    if (!entries) continue;
    for (const [term, meta] of Object.entries(entries)) {
      const key = isAsciiTerm(term) ? term.toLowerCase() : term;
      if (!index.has(key)) {
        index.set(key, { term, hasSource: Boolean(meta.hasSource) });
      } else if (meta.hasSource) {
        index.get(key).hasSource = true;
      }
    }
  }
  return index;
}

function buildMatcher(termIndex) {
  const terms = [...termIndex.values()].map((v) => v.term);
  terms.sort((a, b) => b.length - a.length);
  if (terms.length === 0) return null;
  const parts = terms.map((term) => {
    const escaped = escapeRegExp(term);
    if (isAsciiTerm(term)) return `\\b(?:${escaped})\\b`;
    return escaped;
  });
  return new RegExp(`(${parts.join("|")})`, "gi");
}

function lookup(termIndex, matched) {
  const key = isAsciiTerm(matched) ? matched.toLowerCase() : matched;
  return termIndex.get(key) || null;
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

function findUnwrappedMatches(contentRoot, termIndex) {
  const re = buildMatcher(termIndex);
  if (!re) return [];
  const found = [];

  const walk = (node) => {
    if (!node) return;
    if (node.type === "text") {
      if (shouldSkipTextNode(node.parent)) return;
      const text = node.data;
      if (!text) return;
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(text)) !== null) {
        const matched = m[1];
        if (lookup(termIndex, matched)) found.push(matched);
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
      for (const child of node.children || []) walk(child);
    }
  };

  for (const child of contentRoot.children || []) walk(child);
  return found;
}

/**
 * @param {string} publicDir
 */
export async function checkBubbles(publicDir) {
  step("4/4 HTML 泡泡 DOM（.glossary-term / .glossary-tip）");
  if (!publicDir || !fs.existsSync(publicDir)) {
    crit("泡泡检查：publicDir 不存在（构建可能失败）");
    return;
  }

  const config = loadGlossaryConfig();
  const byDomain = loadGlossariesRaw(config.glossaryDir || "data/glossary");
  const pageMap = loadPageGlossaries(config.contentDir || "content", publicDir);
  const selectors = config.contentSelectors || [".post-content"];

  const htmlFiles = await fg("**/*.html", {
    cwd: publicDir,
    absolute: true,
    ignore: ["**/pagefind/**"],
  });

  let checked = 0;
  for (const htmlPath of htmlFiles) {
    const html = fs.readFileSync(htmlPath, "utf8");
    const $ = cheerio.load(html, { decodeEntities: false });
    let rootEl = null;
    for (const sel of selectors) {
      const el = $(sel).first();
      if (el.length) {
        rootEl = el.get(0);
        break;
      }
    }
    if (!rootEl) continue;

    checked += 1;
    const rel = path.relative(publicDir, htmlPath);
    const domains = pageMap.get(path.normalize(htmlPath)) || [];
    const termIndex = buildTermIndex(byDomain, domains);

    $(rootEl)
      .find(".glossary-term")
      .each((_, el) => {
        const $term = $(el);
        const tip = $term.find(".glossary-tip").first();
        if (!tip.length) {
          crit(`${rel}: .glossary-term 缺少 .glossary-tip（${$term.text().slice(0, 40)}）`);
          return;
        }
        // Direct text of term = first text node roughly; use clone without tip
        const $clone = $term.clone();
        $clone.find(".glossary-tip").remove();
        const termText = $clone.text();
        const entry = lookup(termIndex, termText);
        if (entry?.hasSource) {
          const more = tip.find("a.glossary-tip-more").first();
          const href = more.attr("href") || "";
          if (!more.length || !String(href).trim()) {
            crit(
              `${rel}: 术语「${termText}」声明了 source 但「显示更多」href 为空`,
            );
          }
        }
      });

    const unwrapped = findUnwrappedMatches(rootEl, termIndex);
    if (unwrapped.length) {
      const sample = [...new Set(unwrapped)].slice(0, 8).join(", ");
      crit(
        `${rel}: 仍有未包裹术语 ${unwrapped.length} 处（例：${sample}）`,
      );
    }
  }

  if (checked === 0) {
    crit("泡泡检查：未找到含正文选择器的 HTML（构建产物异常）");
  }
}
