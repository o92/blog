/**
 * macOS secondary confirm dialog after audit passes.
 */
import { stagedFiles, log, execSync, ROOT } from "./lib.mjs";

/**
 * @returns {boolean} true if user confirmed
 */
export function confirmMacDialog() {
  const files = stagedFiles();
  const fileBlock =
    files.length > 0
      ? files.slice(0, 40).join("\n") + (files.length > 40 ? "\n…" : "")
      : "(无暂存文件)";

  let stat = "";
  try {
    stat = execSync("git diff --cached --stat", {
      cwd: ROOT,
      encoding: "utf8",
    })
      .trim()
      .split("\n")
      .slice(0, 30)
      .join("\n");
  } catch {
    stat = "(无法读取暂存 stat)";
  }

  const message = [
    "术语/空路径审计已通过（含临时全站构建 + 泡泡检查）。确认提交本次暂存？",
    "",
    "【本次暂存】",
    stat || "(empty)",
    "",
    fileBlock,
    "",
    "报告：.git/last-pre-commit-audit.txt",
  ].join("\n");

  // Pass message via argv to avoid AppleScript quoting hell
  const b64 = Buffer.from(message, "utf8").toString("base64");
  const script = `
set decoded to do shell script "echo ${b64} | base64 -D"
try
  display dialog decoded buttons {"取消", "确认提交"} default button "确认提交" cancel button "取消" with title "Commit Audit"
  return "ok"
on error
  return "cancel"
end try
`;

  try {
    const out = execSync("osascript", {
      input: script,
      encoding: "utf8",
      cwd: ROOT,
    }).trim();
    if (out === "ok") {
      log("已确认提交");
      return true;
    }
    log("已取消提交");
    return false;
  } catch {
    log("已取消提交");
    return false;
  }
}
