# [Site IA Layout] Implementation Plan

**Goal:** Custom three-column book layout + data-driven nav + system/light/dark theme toggle.

**Architecture:** `data/nav.yaml` for categories; `content/books/<id>/` for nested chapters; self-built layouts; CSS variables + localStorage theme.

## Tasks

- [x] Scaffold nav + sample book + hugo config
- [x] Layouts, partials, theme script
- [x] CSS (site + glossary variables) + build verify
