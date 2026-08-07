/**
 * Full-site temp build: hugo + glossary-inject (does not touch local public/).
 */
import fs from "node:fs";
import path from "node:path";
import {
  ROOT,
  crit,
  log,
  step,
  execSync,
  makeTempDir,
} from "./lib.mjs";

const PAGES_BASEURL = "https://o92.github.io/blog/";

/**
 * @returns {{ publicDir: string, buildLog: string, tmpRoot: string } | null}
 */
export function buildTempSite() {
  step("3/4 临时全站构建（hugo + glossary-inject）");

  if (!fs.existsSync(path.join(ROOT, "node_modules"))) {
    log("npm ci（缺少 node_modules）…");
    execSync("npm ci --ignore-scripts", { cwd: ROOT, stdio: "inherit" });
  }

  const tmpRoot = makeTempDir();
  const publicDir = path.join(tmpRoot, "public-audit");
  const buildLog = path.join(tmpRoot, "build.log");
  fs.mkdirSync(publicDir, { recursive: true });

  const env = {
    ...process.env,
    PATH: [
      `${process.env.HOME}/.proto/shims`,
      `${process.env.HOME}/.proto/bin`,
      "/opt/homebrew/bin",
      "/usr/local/bin",
      process.env.PATH || "",
    ].join(":"),
    HUGO_ENVIRONMENT: "production",
    HUGO_BASEURL: PAGES_BASEURL,
    GLOSSARY_PUBLIC_DIR: publicDir,
  };

  log(`构建到临时目录：${publicDir}`);
  try {
    const hugoOut = execSync(
      `hugo --gc --minify --printPathWarnings --cleanDestinationDir -d "${publicDir}"`,
      { cwd: ROOT, env, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
    );
    fs.writeFileSync(buildLog, hugoOut, "utf8");
  } catch (e) {
    const out = `${e.stdout || ""}${e.stderr || ""}${e.message}`;
    fs.writeFileSync(buildLog, out, "utf8");
    crit("临时目录 hugo 构建失败");
    log(`构建日志：${buildLog}`);
    console.error(out.slice(-4000));
    return { publicDir, buildLog, tmpRoot, failed: true };
  }

  try {
    const injectOut = execSync(
      `node "${path.join(ROOT, "scripts/glossary-inject.mjs")}" --public-dir="${publicDir}"`,
      { cwd: ROOT, env, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
    );
    fs.appendFileSync(buildLog, "\n" + injectOut, "utf8");
  } catch (e) {
    const out = `${e.stdout || ""}${e.stderr || ""}${e.message}`;
    fs.appendFileSync(buildLog, "\n" + out, "utf8");
    crit("glossary-inject 失败");
    console.error(out.slice(-4000));
    return { publicDir, buildLog, tmpRoot, failed: true };
  }

  const logText = fs.readFileSync(buildLog, "utf8");
  const glossaryBad =
    /\[glossary\] (source file not found|heading not found|skip invalid entry|alias collision|unexpected no content root)/;
  if (glossaryBad.test(logText)) {
    crit("glossary-inject 日志含错误");
    for (const line of logText.split("\n")) {
      if (glossaryBad.test(line)) console.error(line);
    }
  }
  if (/ERROR|fatal/i.test(logText) || /WARN.*(Ref|ref\.|link|page not found|Path Warning)/i.test(logText)) {
    crit("Hugo 构建日志含 ERROR / path-link 告警");
    for (const line of logText.split("\n")) {
      if (/ERROR|fatal/i.test(line) || /WARN.*(Ref|ref\.|link|page not found|Path Warning)/i.test(line)) {
        console.error(line);
      }
    }
  }

  return { publicDir, buildLog, tmpRoot, failed: false };
}
