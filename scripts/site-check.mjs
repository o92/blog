/**
 * 静态质量门禁（不依赖 public/）。
 * 任一项失败 → exit 1，供 npm run build / site-check 使用。
 *
 * 检查：词库 YAML（summary / source / link / aliases）+ nav book + content 站内链
 * Spec: docs/superpowers/specs/2026-08-07-site-check-design.md
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fg from "fast-glob";
import matter from "gray-matter";
import yaml from "js-yaml";
import toml from "@iarna/toml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PREFIX = "[site-check]";

/** @type {string[]} */
const errors = [];

function log(msg) {
  console.log(`${PREFIX} ${msg}`);
}

function crit(msg) {
  errors.push(msg);
  console.error(`${PREFIX} ${msg}`);
}

function loadConfig() {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, "scripts/glossary.config.json"), "utf8"),
  );
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

function resolveContentFile(rel, contentDir = "content") {
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

function extractHeadingExists(mdBody, headingTitle) {
  const lines = mdBody.replace(/\r\n/g, "\n").split("\n");
  const target = headingTitle.trim();
  for (const line of lines) {
    const m = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const title = m[2].trim();
    if (title === target || title.toLowerCase() === target.toLowerCase()) {
      return true;
    }
  }
  return false;
}

function stripCodeFences(md) {
  return md.replace(/```[\s\S]*?```/g, "\n").replace(/~~~[\s\S]*?~~~/g, "\n");
}

function isExternalLink(href) {
  return /^https?:\/\//i.test(href);
}

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
  return Boolean(resolveContentFile(`${id}/_index.md`, contentDir));
}

function isSkippableHref(href) {
  if (!href || href.startsWith("#")) return true;
  if (/^(mailto:|tel:|javascript:|data:)/i.test(href)) return true;
  if (/^https?:\/\//i.test(href) || href.startsWith("//")) return true;
  return false;
}

/**
 * @returns {string|null|undefined} abs if ok, null if missing, undefined if skipped
 */
function resolveMdTarget(fromFile, href, contentDir) {
  let target = href.split("#")[0].split("?")[0].trim();
  if (!target || isSkippableHref(href)) return undefined;

  if (target.startsWith("content/")) {
    const abs = path.join(ROOT, target);
    return fs.existsSync(abs) ? abs : null;
  }

  if (target.startsWith("/")) {
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

function checkGlossaryYaml(config) {
  log("--- 词库 YAML ---");
  const dir = path.join(ROOT, config.glossaryDir || "data/glossary");
  const globalPath = path.join(dir, "global.yaml");
  if (!fs.existsSync(globalPath)) {
    crit("缺少 data/glossary/global.yaml");
    return;
  }

  const files = fg.sync(["*.yaml", "*.yml"], { cwd: dir, absolute: true });
  for (const file of files) {
    const domain = path.basename(file, path.extname(file));
    let raw;
    try {
      raw = yaml.load(fs.readFileSync(file, "utf8")) || {};
    } catch (e) {
      crit(`YAML 无法解析 ${path.relative(ROOT, file)}: ${e.message}`);
      continue;
    }
    if (typeof raw !== "object" || Array.isArray(raw)) {
      crit(`${path.relative(ROOT, file)}: 根须为映射对象`);
      continue;
    }

    /** @type {Map<string, string>} */
    const names = new Map();

    for (const [term, value] of Object.entries(raw)) {
      const relEntry = `${domain}/${term}`;
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        crit(`${relEntry}: 词条须为对象`);
        continue;
      }
      if (typeof value.summary !== "string" || !value.summary.trim()) {
        crit(`${relEntry}: summary 必填且为非空字符串`);
      }

      if (names.has(term)) {
        crit(`${relEntry}: 与 ${names.get(term)} 撞名`);
      } else {
        names.set(term, term);
      }

      if (value.source != null) {
        if (typeof value.source !== "string" || !value.source.trim()) {
          crit(`${relEntry}: source 须为非空字符串`);
        } else {
          const src = value.source.trim();
          const hash = src.indexOf("#");
          const filePart = hash >= 0 ? src.slice(0, hash) : src;
          const heading =
            hash >= 0 ? decodeURIComponent(src.slice(hash + 1)).trim() : "";
          if (!filePart) {
            crit(`${relEntry}: source 缺少 content 路径 → ${src}`);
          } else if (hash >= 0 && !heading) {
            crit(`${relEntry}: source 的 #标题为空 → ${src}`);
          } else {
            const abs = resolveContentFile(filePart, config.contentDir);
            if (!abs) {
              crit(`${relEntry}: source 文件不存在 → ${filePart}`);
            } else if (heading) {
              const { content } = parseFrontMatter(
                fs.readFileSync(abs, "utf8"),
              );
              if (!extractHeadingExists(content, heading)) {
                crit(
                  `${relEntry}: source 锚点标题不存在 → ${filePart}#${heading}`,
                );
              }
            }
          }
        }
      }

      if (value.link != null) {
        if (typeof value.link !== "string" || !isExternalLink(value.link)) {
          crit(`${relEntry}: link 仅允许 http(s):// 外链`);
        }
      }

      if (value.aliases != null) {
        if (
          !Array.isArray(value.aliases) ||
          value.aliases.some((a) => typeof a !== "string")
        ) {
          crit(`${relEntry}: aliases 须为字符串数组`);
        } else {
          for (const alias of value.aliases) {
            if (!alias.trim()) {
              crit(`${relEntry}: aliases 含空串`);
              continue;
            }
            if (names.has(alias)) {
              crit(`${relEntry}: 别名「${alias}」与 ${names.get(alias)} 撞名`);
            } else {
              names.set(alias, term);
            }
          }
        }
      }
    }
  }
}

function checkNavAndLinks(config) {
  log("--- nav + 站内链接 ---");
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

  const mdFiles = fg.sync(["**/*.{md,markdown}"], {
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
      const cleaned = refPath.replace(/^\/+/, "");
      if (!resolveContentFile(cleaned, contentDir)) {
        crit(`${rel}: ref 目标不存在 → ${refPath}`);
      }
    }
  }
}

function main() {
  log("start");
  const config = loadConfig();
  checkGlossaryYaml(config);
  checkNavAndLinks(config);
  if (errors.length) {
    log(`FAILED (${errors.length} error(s))`);
    process.exit(1);
  }
  log("OK");
}

main();
