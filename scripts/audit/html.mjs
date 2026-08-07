#!/usr/bin/env node
/**
 * 构建后 HTML 全站审计。
 * Usage: node scripts/audit/html.mjs [publicDir] [--base-path=/blog] [--skip-pagefind]
 */
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import fg from "fast-glob";

const errors = [];
const warnings = [];
const err = (m) => {
  errors.push(m);
  console.error(`[audit] Critical: ${m}`);
};
const warn = (m) => {
  warnings.push(m);
  console.error(`[audit] Warning: ${m}`);
};

const args = process.argv.slice(2);
let publicDir = path.resolve(process.cwd(), "public");
// 默认空：站点挂在域名根。Pages 子路径须由调用方显式传入 --base-path=/blog
let basePath = "";
let basePathSet = false;
let skipPagefind = false;
for (const a of args) {
  if (a.startsWith("--base-path=")) {
    basePath = a.slice("--base-path=".length) || "";
    basePathSet = true;
  } else if (a === "--skip-pagefind") {
    skipPagefind = true;
  } else if (!a.startsWith("--")) publicDir = path.resolve(a);
}
basePath = basePath.replace(/\/$/, "");
if (!basePathSet) {
  warn("未传 --base-path，按站点根路径校验（若部署在 /blog 请显式传入）");
}

if (!fs.existsSync(publicDir)) {
  err(`public 目录不存在: ${publicDir}`);
  process.exit(1);
}

const htmlFiles = await fg("**/*.html", {
  cwd: publicDir,
  absolute: true,
  ignore: ["**/pagefind/**"],
});
if (htmlFiles.length === 0) {
  err("public 下没有 HTML（构建可能未产出页面）");
  process.exit(1);
}

if (!skipPagefind && !fs.existsSync(path.join(publicDir, "pagefind"))) {
  err("缺少 public/pagefind（pagefind 未运行或失败）");
}

function urlToFs(urlPath) {
  let p = urlPath.split("?")[0].split("#")[0];
  if (!p || p === "/") p = "/";
  if (basePath && (p === basePath || p.startsWith(basePath + "/"))) {
    p = p.slice(basePath.length) || "/";
  }
  p = p.replace(/^\//, "");
  if (!p) return path.join(publicDir, "index.html");
  const asFile = path.join(publicDir, p);
  const asIndex = path.join(publicDir, p, "index.html");
  const asHtml = path.join(publicDir, `${p}.html`);
  if (fs.existsSync(asFile) && fs.statSync(asFile).isFile()) return asFile;
  if (fs.existsSync(asIndex)) return asIndex;
  if (fs.existsSync(asHtml)) return asHtml;
  return null;
}

function resolveHref(fromHtml, href) {
  if (!href || href.startsWith("#")) return { kind: "hash" };
  if (/^(mailto:|tel:|javascript:|data:)/i.test(href)) return { kind: "skip" };
  if (/^https?:\/\//i.test(href) || href.startsWith("//")) return { kind: "external" };
  const fromUrl = path.relative(publicDir, fromHtml).split(path.sep).join("/");
  const fromDir = path.posix.dirname(fromUrl === "index.html" ? "" : fromUrl);
  let abs;
  if (href.startsWith("/")) abs = href;
  else {
    const base = fromDir === "." ? "" : fromDir;
    abs = path.posix.normalize(`/${base}/${href}`.replace(/\/+/g, "/"));
  }
  return { kind: "internal", href: abs };
}

let glossaryTips = 0;
let mermaidPages = 0;

for (const file of htmlFiles) {
  const rel = path.relative(publicDir, file);
  const html = fs.readFileSync(file, "utf8");
  const $ = cheerio.load(html);

  if (!$("title").first().text().trim()) err(`缺少 <title>: ${rel}`);

  if ($("html").hasClass("mermaid-pending")) {
    mermaidPages += 1;
    if (!$('script[src*="mermaid"]').length && !html.includes("mermaid.js")) {
      err(`mermaid-pending 页面未引用 mermaid.js: ${rel}`);
    }
  }

  if (rel !== "index.html" && !$("[data-pagefind-body]").length) {
    const textLen = $("main, article, .post-content").text().replace(/\s+/g, "").length;
    if (textLen > 80) {
      warn(`有正文但无 data-pagefind-body（搜索会跳过）: ${rel}`);
    }
  }

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    const resolved = resolveHref(file, href);
    if (resolved.kind === "internal" && !urlToFs(resolved.href)) {
      err(`断链 ${rel} → ${href} （解析为 ${resolved.href}）`);
    }
  });

  $("link[href], script[src], img[src]").each((_, el) => {
    const attr = el.name === "link" ? "href" : "src";
    const v = $(el).attr(attr);
    if (!v || v.startsWith("data:") || /^https?:\/\//i.test(v) || v.startsWith("//")) return;
    // hugo server 注入；生产构建不应依赖
    if (/livereload\.js/i.test(v)) return;
    const resolved = resolveHref(file, v);
    if (resolved.kind !== "internal") return;
    if (urlToFs(resolved.href)) return;
    let p = resolved.href;
    if (basePath && (p === basePath || p.startsWith(basePath + "/"))) {
      p = p.slice(basePath.length) || "/";
    }
    p = p.replace(/^\//, "");
    if (!fs.existsSync(path.join(publicDir, p))) {
      err(`缺失静态资源 ${rel} → ${v}`);
    }
  });

  $(".glossary-tip-more").each((_, el) => {
    glossaryTips += 1;
    const href = $(el).attr("href") || "";
    if (
      basePath &&
      href.startsWith("/") &&
      !href.startsWith(basePath + "/") &&
      href !== basePath &&
      !href.startsWith("http")
    ) {
      err(`glossary「显示更多」缺少 basePath 前缀: ${rel} href=${href}`);
    }
  });
}

if (glossaryTips === 0) {
  warn("构建产物中未发现 glossary-tip-more（若本应有词条高亮则异常）");
}

console.log(
  `[audit] html: pages=${htmlFiles.length} mermaid-pending=${mermaidPages} glossary-tips=${glossaryTips} errors=${errors.length} warnings=${warnings.length}`,
);

process.exit(errors.length ? 1 : 0);
