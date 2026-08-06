/**
 * Render ```mermaid codeblocks (pre.mermaid) after load.
 * Theme follows html[data-theme] / prefers-color-scheme.
 */
(function () {
  var CDN =
    "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
  var mermaidPromise = null;
  var running = false;

  function isDark() {
    var root = document.documentElement;
    var forced = root.getAttribute("data-theme");
    if (forced === "dark") return true;
    if (forced === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function nodes() {
    return Array.prototype.slice.call(document.querySelectorAll("pre.mermaid"));
  }

  function rememberSource(list) {
    list.forEach(function (el) {
      if (!el.getAttribute("data-mermaid-src")) {
        el.setAttribute("data-mermaid-src", el.textContent);
      }
    });
  }

  function restoreSources(list) {
    list.forEach(function (el) {
      var src = el.getAttribute("data-mermaid-src");
      if (src == null) return;
      el.removeAttribute("data-processed");
      el.removeAttribute("data-mermaid-id");
      el.textContent = src;
      el.removeAttribute("data-mermaid-svg");
    });
  }

  function loadMermaid() {
    if (!mermaidPromise) {
      mermaidPromise = import(CDN).then(function (mod) {
        return mod.default;
      });
    }
    return mermaidPromise;
  }

  function renderAll() {
    var list = nodes();
    if (!list.length || running) return;
    running = true;
    rememberSource(list);
    restoreSources(list);
    loadMermaid()
      .then(function (mermaid) {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: isDark() ? "dark" : "default",
          flowchart: { htmlLabels: true, curve: "basis" },
        });
        return mermaid.run({ nodes: list });
      })
      .catch(function (err) {
        console.warn("[mermaid]", err);
      })
      .finally(function () {
        running = false;
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderAll);
  } else {
    renderAll();
  }

  document.addEventListener("click", function (e) {
    if (!e.target.closest("#theme-toggle-btn")) return;
    // theme.js updates data-theme synchronously in the same click
    setTimeout(renderAll, 0);
  });
})();
