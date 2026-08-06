/**
 * Render ```mermaid blocks; keep page hidden until first paint of diagrams.
 * Theme re-renders do not re-hide the page.
 *
 * Font follows body text. Diagrams keep natural size (taller when content-rich);
 * only clamp to content column width.
 */
(function () {
  var CDN =
    "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
  var FAILSAFE_MS = 8000;
  var mermaidPromise = null;
  var running = false;
  var initialRevealDone = false;
  var failsafeTimer = 0;

  function isDark() {
    var root = document.documentElement;
    var forced = root.getAttribute("data-theme");
    if (forced === "dark") return true;
    if (forced === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function bodyType() {
    var cs = window.getComputedStyle(document.body);
    return {
      fontSize: cs.fontSize || "16px",
      fontFamily: cs.fontFamily || "sans-serif",
    };
  }

  function nodes() {
    return Array.prototype.slice.call(document.querySelectorAll("pre.mermaid"));
  }

  function needsGate() {
    return document.documentElement.classList.contains("mermaid-pending");
  }

  function reveal() {
    if (initialRevealDone) return;
    initialRevealDone = true;
    if (failsafeTimer) {
      clearTimeout(failsafeTimer);
      failsafeTimer = 0;
    }
    document.documentElement.classList.remove("mermaid-pending");
    document.documentElement.classList.add("mermaid-ready");
  }

  function armFailsafe() {
    if (!needsGate() || failsafeTimer) return;
    failsafeTimer = setTimeout(reveal, FAILSAFE_MS);
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
      var svg = el.querySelector("svg");
      if (svg) svg.remove();
    });
  }

  function clampSvgToColumn(list) {
    list.forEach(function (el) {
      var svg = el.querySelector("svg");
      if (!svg) return;
      svg.style.maxWidth = "100%";
      svg.style.height = "auto";
      svg.style.width = "auto";
      svg.style.display = "block";
      svg.style.marginInline = "auto";
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

  function renderAll(isInitial) {
    var list = nodes();
    if (!list.length) {
      if (isInitial) reveal();
      return Promise.resolve();
    }
    if (running) return Promise.resolve();
    running = true;
    if (isInitial) armFailsafe();
    rememberSource(list);
    restoreSources(list);
    var type = bodyType();
    return loadMermaid()
      .then(function (mermaid) {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: isDark() ? "dark" : "default",
          themeVariables: {
            fontSize: type.fontSize,
            fontFamily: type.fontFamily,
          },
          flowchart: {
            htmlLabels: true,
            curve: "basis",
            useMaxWidth: false,
            nodeSpacing: 24,
            rankSpacing: 40,
            padding: 12,
          },
          sequence: {
            useMaxWidth: false,
            actorFontSize: type.fontSize,
            noteFontSize: type.fontSize,
            messageFontSize: type.fontSize,
            actorMargin: 40,
            messageMargin: 28,
            boxMargin: 8,
            noteMargin: 8,
          },
        });
        return mermaid.run({ nodes: list });
      })
      .then(function () {
        clampSvgToColumn(list);
      })
      .catch(function (err) {
        console.warn("[mermaid]", err);
      })
      .finally(function () {
        running = false;
        if (isInitial) {
          requestAnimationFrame(function () {
            requestAnimationFrame(reveal);
          });
        }
      });
  }

  function boot() {
    if (!nodes().length) {
      reveal();
      return;
    }
    renderAll(true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  document.addEventListener("click", function (e) {
    if (!e.target.closest("#theme-toggle-btn")) return;
    setTimeout(function () {
      renderAll(false);
    }, 0);
  });
})();
