#!/usr/bin/env node
/**
 * Commit audit entrypoint.
 *   node scripts/audit/run.mjs           # check only
 *   node scripts/audit/run.mjs --commit  # check + macOS confirm
 *
 * Spec: docs/superpowers/specs/2026-08-07-commit-audit-design.md
 */
import fs from "node:fs";
import {
  ROOT,
  log,
  crit,
  errors,
  writeReport,
} from "./lib.mjs";
import { checkGlossaryYaml } from "./glossary-check.mjs";
import { checkSiteLinks } from "./links-check.mjs";
import { buildTempSite } from "./build-temp.mjs";
import { checkBubbles } from "./bubbles-check.mjs";
import { confirmMacDialog } from "./confirm.mjs";

function usage() {
  console.log(`Usage: node scripts/audit/run.mjs [--commit]

  --commit    审计通过后 macOS 二次确认（供 .githooks/pre-commit）
`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("-h") || args.includes("--help")) {
    usage();
    process.exit(0);
  }
  const isCommit = args.includes("--commit");

  if (process.env.SKIP_COMMIT_AUDIT === "1") {
    log("SKIP_COMMIT_AUDIT=1 — 已跳过");
    process.exit(0);
  }

  log("========== 提交审计 ==========");
  log(`root=${ROOT}`);

  await checkGlossaryYaml();
  await checkSiteLinks();

  const build = buildTempSite();
  if (build && !build.failed) {
    await checkBubbles(build.publicDir);
  } else if (!build) {
    crit("临时构建未返回结果");
  }

  const result = errors.length === 0 ? "PASS" : "FAIL";
  writeReport({
    publicDir: build?.publicDir,
    buildLog: build?.buildLog,
    result,
  });

  // Best-effort cleanup of temp tree (keep logs copied to .git)
  if (build?.tmpRoot) {
    try {
      fs.rmSync(build.tmpRoot, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }

  if (errors.length > 0) {
    log(`========== 审计失败（${errors.length}）==========`);
    process.exit(1);
  }

  if (isCommit) {
    if (!confirmMacDialog()) {
      process.exit(1);
    }
    log("========== 审计通过，继续 commit ==========");
  } else {
    log("========== 审计通过 ==========");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
