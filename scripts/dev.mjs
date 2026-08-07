#!/usr/bin/env node
/**
 * 本地预览（构建期 glossary-inject）：
 *   hugo server 写盘 → 自动跑 scripts/glossary-inject.mjs
 *
 * 不要裸跑 `hugo server`：每次重建会覆盖 public/，词条高亮会丢。
 * 用法：npm run dev
 */
import { spawn } from "node:child_process";
import { watch, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HUGO_BASEURL = process.env.HUGO_BASEURL || "http://localhost:1313/";

let timer = null;
let injecting = false;
let pending = false;
/** 忽略 inject 自己写回 public 触发的 watch */
let suppressWatchUntil = 0;

function log(msg) {
  console.log(`[dev] ${msg}`);
}

function runInject() {
  if (injecting) {
    pending = true;
    return;
  }
  injecting = true;
  pending = false;
  log(`glossary-inject … (HUGO_BASEURL=${HUGO_BASEURL})`);
  const child = spawn("node", ["scripts/glossary-inject.mjs"], {
    cwd: root,
    env: { ...process.env, HUGO_BASEURL },
    stdio: "inherit",
  });
  child.on("exit", (code) => {
    suppressWatchUntil = Date.now() + 2000;
    injecting = false;
    if (code !== 0) log(`glossary-inject exit ${code}`);
    if (pending) scheduleInject(100);
  });
}

function scheduleInject(ms = 600) {
  clearTimeout(timer);
  timer = setTimeout(runInject, ms);
}

function shouldWatchHtml(filename) {
  if (!filename) return false;
  const f = filename.replace(/\\/g, "/");
  if (!f.endsWith(".html")) return false;
  if (f.includes("pagefind/")) return false;
  return true;
}

/** hugo 刚写出的页通常还没有 glossary-term；已注入的忽略，避免空转 */
function needsInject(relHtml) {
  const abs = path.join(root, "public", relHtml);
  if (!existsSync(abs)) return false;
  try {
    const html = readFileSync(abs, "utf8");
    if (!html.includes("post-content")) return false;
    return !html.includes("glossary-term");
  } catch {
    return false;
  }
}

const hugo = spawn(
  "hugo",
  [
    "server",
    "-D",
    "-d",
    "public",
    "--bind",
    "127.0.0.1",
    "--baseURL",
    HUGO_BASEURL,
    "--disableFastRender",
  ],
  { cwd: root, stdio: "inherit", env: process.env },
);

hugo.on("exit", (code) => {
  log(`hugo exited ${code ?? 0}`);
  process.exit(code ?? 0);
});

try {
  watch(path.join(root, "public"), { recursive: true }, (_ev, filename) => {
    if (injecting || Date.now() < suppressWatchUntil) return;
    if (!shouldWatchHtml(filename)) return;
    if (!needsInject(filename)) return;
    scheduleInject();
  });
} catch (e) {
  log(`watch public failed: ${e.message}`);
}

try {
  watch(path.join(root, "data", "glossary"), { recursive: true }, () => {
    if (injecting) return;
    scheduleInject(300);
  });
} catch (e) {
  log(`watch glossary failed: ${e.message}`);
}

scheduleInject(1200);

function shutdown() {
  hugo.kill("SIGTERM");
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
