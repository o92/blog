/**
 * Glossary YAML static checks: summary / source / link / aliases.
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import fg from "fast-glob";
import {
  ROOT,
  crit,
  step,
  loadGlossaryConfig,
  resolveContentFile,
  parseFrontMatter,
  extractHeadingSection,
} from "./lib.mjs";

function isExternalLink(href) {
  return /^https?:\/\//i.test(href);
}

/**
 * @returns {Promise<void>}
 */
export async function checkGlossaryYaml() {
  step("1/4 词库 YAML（summary / source / link / aliases）");
  const config = loadGlossaryConfig();
  const dir = path.join(ROOT, config.glossaryDir || "data/glossary");
  const globalPath = path.join(dir, "global.yaml");
  if (!fs.existsSync(globalPath)) {
    crit("缺少 data/glossary/global.yaml");
    return;
  }

  const files = await fg(["*.yaml", "*.yml"], { cwd: dir, absolute: true });
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

    /** @type {Map<string, string>} alias/term -> owner term */
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

      const termKey = term;
      if (names.has(termKey)) {
        crit(`${relEntry}: 与 ${names.get(termKey)} 撞名`);
      } else {
        names.set(termKey, term);
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
          const abs = resolveContentFile(filePart, config.contentDir);
          if (!abs) {
            crit(`${relEntry}: source 文件不存在 → ${filePart}`);
          } else if (heading) {
            const { content } = parseFrontMatter(fs.readFileSync(abs, "utf8"));
            if (!extractHeadingSection(content, heading)) {
              crit(
                `${relEntry}: source 锚点标题不存在 → ${filePart}#${heading}`,
              );
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
