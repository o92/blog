#!/usr/bin/env python3
"""全库结构 / 内容一致性检查（针对工作区根目录）。"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    yaml = None

ROOT = Path(".").resolve()
errors: list[str] = []
warnings: list[str] = []

SKIP_DIR_NAMES = {
    ".git",
    "node_modules",
    "public",
    ".hugo_build.lock",
    "resources",
}


def err(msg: str) -> None:
    errors.append(msg)
    print(f"[audit] Critical: {msg}", file=sys.stderr)


def warn(msg: str) -> None:
    warnings.append(msg)
    print(f"[audit] Warning: {msg}", file=sys.stderr)


def should_skip(path: Path) -> bool:
    return any(part in SKIP_DIR_NAMES for part in path.parts)


def iter_files(*globs: str):
    for g in globs:
        for p in ROOT.glob(g):
            if p.is_file() and not should_skip(p):
                yield p


def check_yaml_json() -> None:
    if yaml is None:
        err("缺少 PyYAML（pip3 install pyyaml）")
        return
    for p in iter_files("data/**/*.yaml", "data/**/*.yml"):
        try:
            yaml.safe_load(p.read_text(encoding="utf-8"))
        except Exception as e:
            err(f"YAML 无法解析 {p.relative_to(ROOT)}: {e}")
    for p in [ROOT / "package.json", ROOT / "scripts" / "glossary.config.json"]:
        if not p.is_file():
            continue
        try:
            json.loads(p.read_text(encoding="utf-8"))
        except Exception as e:
            err(f"JSON 无法解析 {p.relative_to(ROOT)}: {e}")


def check_package_scripts() -> None:
    pkg = ROOT / "package.json"
    if not pkg.is_file():
        err("缺少 package.json")
        return
    data = json.loads(pkg.read_text(encoding="utf-8"))
    scripts = data.get("scripts") or {}
    for need in ("build", "pagefind", "glossary:inject", "audit"):
        if need not in scripts:
            err(f"package.json scripts 缺少 {need!r}")
    if not (ROOT / "package-lock.json").is_file():
        err("缺少 package-lock.json")


def check_toml_config() -> None:
    for cand in (
        ROOT / "hugo.toml",
        ROOT / "config.toml",
        ROOT / "hugo.yaml",
        ROOT / "hugo.yml",
        ROOT / "config" / "_default" / "hugo.toml",
        ROOT / "config" / "_default" / "config.toml",
    ):
        if cand.is_file():
            text = cand.read_text(encoding="utf-8")
            if "baseURL" not in text and "baseurl" not in text.lower():
                warn(f"{cand.relative_to(ROOT)} 未声明 baseURL（依赖 HUGO_BASEURL/CI）")
            return
    err("未找到 Hugo 配置（hugo.toml / config.toml / config/_default）")


def check_nav_books() -> None:
    if yaml is None:
        return
    nav = ROOT / "data" / "nav.yaml"
    if not nav.is_file():
        err("缺少 data/nav.yaml")
        return
    data = yaml.safe_load(nav.read_text(encoding="utf-8")) or {}

    def walk(nodes, path=""):
        if not nodes:
            return
        for n in nodes:
            title = n.get("title", "?")
            here = f"{path}/{title}"
            books = []
            if n.get("book"):
                books.append(str(n["book"]))
            if n.get("books"):
                books.extend(str(b) for b in n["books"])
            for b in books:
                d = ROOT / "content" / b
                if not d.is_dir() and not (ROOT / "content" / f"{b}.md").is_file():
                    err(f"nav 引用的书不存在: {b} （节点 {here}）")
            walk(n.get("children") or [], here)

    walk(data.get("categories") or [])


def resolve_content(file_part: str) -> Path | None:
    for c in (
        ROOT / "content" / file_part,
        ROOT / "content" / (file_part + ".md"),
        ROOT / "content" / (file_part + ".markdown"),
    ):
        if c.is_file():
            return c
    return None


def strip_front_matter(raw: str) -> str:
    if raw.startswith("+++"):
        end = raw.find("\n+++", 3)
        if end != -1:
            return raw[end + 4 :]
    if raw.startswith("---"):
        end = raw.find("\n---", 3)
        if end != -1:
            return raw[end + 4 :]
    return raw


def extract_heading_section(md_body: str, heading_title: str) -> bool:
    target = heading_title.strip()
    for line in md_body.replace("\r\n", "\n").split("\n"):
        m = re.match(r"^(#{1,6})\s+(.+?)\s*$", line)
        if not m:
            continue
        title = m.group(2).strip()
        if title == target or title.lower() == target.lower():
            return True
    return False


def check_glossary() -> None:
    if yaml is None:
        return
    yamls = list(iter_files("data/glossary/*.yaml", "data/glossary/*.yml"))
    if not yamls:
        err("未找到 data/glossary/*.yaml")
        return
    for p in yamls:
        data = yaml.safe_load(p.read_text(encoding="utf-8")) or {}
        for term, val in data.items():
            if not isinstance(val, dict) or not val.get("summary"):
                err(f"{p.name}: 词条 {term!r} 缺少 summary")
                continue
            src = val.get("source")
            if not src:
                continue
            raw = str(src).strip()
            file_part, _, heading = raw.partition("#")
            file_part = file_part.strip()
            path = resolve_content(file_part)
            if not path:
                err(f"{p.name}: source 文件不存在 — {file_part} （词条 {term}）")
                continue
            if heading.strip():
                body = strip_front_matter(path.read_text(encoding="utf-8"))
                if not extract_heading_section(body, heading.strip()):
                    err(
                        f"{p.name}: source 标题不存在 — {file_part}#{heading.strip()} （词条 {term}）"
                    )


def check_duplicate_glossary_aliases() -> None:
    if yaml is None:
        return
    for p in iter_files("data/glossary/*.yaml"):
        data = yaml.safe_load(p.read_text(encoding="utf-8")) or {}
        seen: dict[str, str] = {}
        for term, val in data.items():
            keys = [str(term)]
            if isinstance(val, dict):
                for a in val.get("aliases") or []:
                    keys.append(str(a))
            for k in keys:
                low = k.casefold().strip()
                if not low:
                    continue
                if low in seen:
                    err(f"{p.name}: 词条/别名冲突 {k!r} （与 {seen[low]!r}）")
                else:
                    seen[low] = str(term)


def check_mermaid_fences() -> None:
    for p in iter_files("content/**/*.md"):
        text = p.read_text(encoding="utf-8")
        if "```mermaid" not in text:
            continue
        if len(re.findall(r"^```", text, re.M)) % 2 != 0:
            err(f"Markdown 代码围栏未闭合: {p.relative_to(ROOT)}")
        for m in re.finditer(r"^```mermaid[^\n]*\n([\s\S]*?)^```", text, re.M):
            if not m.group(1).strip():
                err(f"空的 mermaid 代码块: {p.relative_to(ROOT)}")


def check_content_front_matter() -> None:
    for p in iter_files("content/**/*.md"):
        raw = p.read_text(encoding="utf-8")
        if not (raw.startswith("---") or raw.startswith("+++")):
            warn(f"无 front matter: {p.relative_to(ROOT)}")
            continue
        delim = raw[:3]
        if raw.find("\n" + delim, 3) == -1:
            err(f"front matter 未闭合: {p.relative_to(ROOT)}")


def check_large_files(limit: int = 1_000_000) -> None:
    for p in ROOT.rglob("*"):
        if not p.is_file() or should_skip(p):
            continue
        try:
            sz = p.stat().st_size
        except OSError:
            continue
        if sz > limit:
            err(f"过大文件 ({sz} bytes > {limit}): {p.relative_to(ROOT)}")


def content_path_exists(rel: str) -> bool:
    """rel like /scrum/01-terms/ or scrum/01-terms.md"""
    rel = rel.split("#", 1)[0].split("?", 1)[0].strip()
    if not rel or rel == "/":
        return True
    rel = rel.lstrip("/")
    if rel.startswith("blog/"):
        rel = rel[5:]
    # static asset
    if (ROOT / "static" / rel).is_file():
        return True
    # content page / section
    cand = ROOT / "content" / rel
    if cand.is_dir() or cand.is_file():
        return True
    for ext in (".md", ".markdown"):
        if (ROOT / "content" / f"{rel}{ext}").is_file():
            return True
        if (ROOT / "content" / rel / f"_index{ext}").is_file():
            return True
        if (ROOT / "content" / rel / f"index{ext}").is_file():
            return True
    # drop trailing slash retry
    if rel.endswith("/"):
        return content_path_exists(rel[:-1])
    return False


def check_markdown_internal_links() -> None:
    """扫描 content 内 markdown 链接指向的站内路径是否大致存在。"""
    link_re = re.compile(r"\[([^\]]*)\]\(([^)]+)\)")
    for p in iter_files("content/**/*.md"):
        body = strip_front_matter(p.read_text(encoding="utf-8"))
        for m in link_re.finditer(body):
            href = m.group(2).strip()
            if not href or href.startswith("#"):
                continue
            if re.match(r"^(https?:|mailto:|tel:)", href, re.I):
                continue
            if href.startswith("{{") or href.startswith("`"):
                continue
            # 相对路径：相对当前 md 所在 content 目录解析较复杂，先只严查绝对站内路径
            if href.startswith("/"):
                if not content_path_exists(href):
                    err(f"站内断链 {p.relative_to(ROOT)} → {href}")


def main() -> int:
    global ROOT
    ap = argparse.ArgumentParser(description="Full-repo deep audit")
    ap.add_argument("--root", default=".", help="Repository worktree root")
    args = ap.parse_args()
    ROOT = Path(args.root).resolve()
    if not ROOT.is_dir():
        print(f"[audit] Critical: --root 不是目录: {ROOT}", file=sys.stderr)
        return 1

    print(f"[audit] deep: root={ROOT} (worktree)")
    steps = [
        ("YAML/JSON", check_yaml_json),
        ("package scripts", check_package_scripts),
        ("hugo config", check_toml_config),
        ("nav books", check_nav_books),
        ("glossary source+heading", check_glossary),
        ("glossary alias uniqueness", check_duplicate_glossary_aliases),
        ("mermaid fences", check_mermaid_fences),
        ("markdown internal links", check_markdown_internal_links),
        ("large files", check_large_files),
        ("content front matter", check_content_front_matter),
    ]
    for name, fn in steps:
        print(f"[audit] deep: {name} …")
        fn()

    if errors:
        print(
            f"[audit] deep: {len(errors)} critical, {len(warnings)} warnings",
            file=sys.stderr,
        )
        return 1
    print(f"[audit] deep: OK ({len(warnings)} warnings)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
