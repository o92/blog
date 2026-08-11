#!/usr/bin/env node
/**
 * 本地预览（构建期 glossary-inject）：
 *   hugo server 写盘 → 自动跑 scripts/glossary-inject.mjs
 *
 * 不要裸跑 `hugo server`：每次重建会覆盖 public/，词条高亮会丢。
 * 用法：npm run dev
 *
 * 端口固定为 1313（可用 PORT / HUGO_PORT 覆盖）。启动前会结束旧 dev / 释放端口，
 * 避免 Hugo 在占用时自动换到 1314+。
 */
import { spawn, execSync } from "node:child_process";
import {
  watch,
  readFileSync,
  existsSync,
  readdirSync,
  unlinkSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT || process.env.HUGO_PORT || 1313);
if (!Number.isInteger(PORT) || PORT <= 0) {
  console.error(`[dev] invalid PORT: ${process.env.PORT || process.env.HUGO_PORT}`);
  process.exit(1);
}
const HUGO_BASEURL =
  process.env.HUGO_BASEURL || `http://localhost:${PORT}/`;

let timer = null;
let injecting = false;
let pending = false;
/** 忽略 inject 自己写回 public 触发的轮询误判窗口 */
let suppressWatchUntil = 0;

function log(msg) {
  console.log(`[dev] ${msg}`);
}

function sleepSync(ms) {
  execSync(`sleep ${Math.max(0.05, ms / 1000)}`);
}

/** 结束其他 npm run dev，避免旧 hugo / 大量 watch 占住端口与 FD */
function killStaleDev() {
  let out = "";
  try {
    out = execSync("pgrep -f 'node scripts/dev.mjs'", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return;
  }
  const pids = [
    ...new Set(
      out
        .trim()
        .split(/\s+/)
        .map((s) => Number(s))
        .filter((n) => Number.isInteger(n) && n > 0 && n !== process.pid),
    ),
  ];
  if (!pids.length) return;
  log(`stopping stale dev pid ${pids.join(", ")}…`);
  for (const pid of pids) {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      /* ignore */
    }
  }
  sleepSync(400);
  for (const pid of pids) {
    try {
      process.kill(pid, "SIGKILL");
    } catch {
      /* ignore */
    }
  }
}

/** 释放端口，防止 Hugo 自动改端口 */
function freePort(port) {
  const listPids = () => {
    try {
      return [
        ...new Set(
          execSync(`lsof -tiTCP:${port} -sTCP:LISTEN`, {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
          })
            .trim()
            .split(/\s+/)
            .filter(Boolean),
        ),
      ];
    } catch {
      return [];
    }
  };

  let pids = listPids();
  if (!pids.length) return;
  log(`port ${port} in use by pid ${pids.join(", ")}; killing…`);
  for (const sig of ["TERM", "KILL"]) {
    try {
      execSync(`kill -${sig} ${pids.join(" ")}`, {
        stdio: ["ignore", "ignore", "ignore"],
      });
    } catch {
      /* some pids may already be gone */
    }
    sleepSync(sig === "TERM" ? 500 : 300);
    pids = listPids();
    if (!pids.length) return;
  }
  if (listPids().length) {
    console.error(`[dev] port ${port} still busy; refuse to start (would hop ports)`);
    process.exit(1);
  }
}

function runSiteCheck() {
  return new Promise((resolve) => {
    log("site-check …");
    const child = spawn("node", ["scripts/site-check.mjs"], {
      cwd: root,
      stdio: "inherit",
    });
    child.on("exit", (code) => {
      if (code !== 0) log(`site-check exit ${code}`);
      resolve(code === 0);
    });
  });
}

/** @type {import('node:child_process').ChildProcess | null} */
let hugo = null;
let shuttingDown = false;

function failDev(reason) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.error(`[dev] ${reason}; terminating`);
  try {
    hugo?.kill("SIGTERM");
  } catch {
    /* ignore */
  }
  process.exit(1);
}

function runInject() {
  if (injecting) {
    pending = true;
    return;
  }
  injecting = true;
  pending = false;
  runSiteCheck().then((ok) => {
    if (!ok) {
      failDev("site-check failed");
      return;
    }
    log(`glossary-inject … (HUGO_BASEURL=${HUGO_BASEURL})`);
    const child = spawn("node", ["scripts/glossary-inject.mjs"], {
      cwd: root,
      env: { ...process.env, HUGO_BASEURL },
      stdio: "inherit",
    });
    child.on("exit", (code) => {
      suppressWatchUntil = Date.now() + 2000;
      injecting = false;
      if (code !== 0) {
        failDev(`glossary-inject exit ${code}`);
        return;
      }
      if (pending) scheduleInject(100);
    });
  });
}

function scheduleInject(ms = 600) {
  clearTimeout(timer);
  timer = setTimeout(runInject, ms);
}

function walkHtml(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    if (name.name === "pagefind" || name.name.startsWith(".")) continue;
    const abs = path.join(dir, name.name);
    if (name.isDirectory()) walkHtml(abs, out);
    else if (name.name.endsWith(".html")) out.push(abs);
  }
  return out;
}

function publicNeedsInject() {
  if (Date.now() < suppressWatchUntil) return false;
  let need = false;
  for (const abs of walkHtml(path.join(root, "public"))) {
    try {
      const html = readFileSync(abs, "utf8");
      if (!html.includes("post-content")) continue;
      // 截断写盘残留：删掉让 hugo 重写干净 HTML，再注入
      if (html.includes("\uFFFD")) {
        try {
          unlinkSync(abs);
          log(`removed corrupt HTML (U+FFFD): ${path.relative(root, abs)}`);
        } catch {
          /* ignore */
        }
        need = true;
        continue;
      }
      if (!html.includes("glossary-term")) need = true;
    } catch {
      /* ignore */
    }
  }
  return need;
}

killStaleDev();
freePort(PORT);
log(`hugo server → ${HUGO_BASEURL} (port ${PORT})`);

hugo = spawn(
  "hugo",
  [
    "server",
    "-D",
    "-d",
    "public",
    "--bind",
    "127.0.0.1",
    "--port",
    String(PORT),
    "--baseURL",
    HUGO_BASEURL,
    "--appendPort=false",
    "--disableFastRender",
  ],
  { cwd: root, stdio: "inherit", env: process.env },
);

hugo.on("exit", (code) => {
  if (shuttingDown) return;
  log(`hugo exited ${code ?? 0}`);
  process.exit(code ?? 0);
});

/** 不递归 watch public（易 EMFILE）；改监视源文件 + 轻量轮询 */
function safeWatch(rel, onChange) {
  const abs = path.join(root, rel);
  if (!existsSync(abs)) return;
  try {
    const w = watch(abs, { recursive: true }, () => onChange());
    w.on("error", (e) => log(`watch ${rel} error: ${e.message}`));
  } catch (e) {
    log(`watch ${rel} failed: ${e.message}`);
  }
}

safeWatch("content", () => scheduleInject(1500));
safeWatch("data", () => scheduleInject(400));
safeWatch("layouts", () => scheduleInject(1500));

setInterval(() => {
  if (injecting) return;
  if (publicNeedsInject()) scheduleInject(200);
}, 2500);

scheduleInject(1200);

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  hugo?.kill("SIGTERM");
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
