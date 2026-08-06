(function () {
  var KEY = "layout-widths";
  var VARS = {
    content: "--content-max",
    menu: "--menu-width",
    toc: "--toc-width",
  };
  var LIMITS = {
    content: { min: 28, max: 72, step: 1, def: 48 },
    menu: { min: 12, max: 24, step: 0.5, def: 17 },
    toc: { min: 10, max: 22, step: 0.5, def: 15 },
  };
  var LEGACY = {
    content: { sm: 36, md: 48, lg: 64 },
    menu: { sm: 14, md: 17, lg: 20 },
    toc: { sm: 12, md: 15, lg: 18 },
  };
  var DEFAULTS = {
    content: LIMITS.content.def,
    menu: LIMITS.menu.def,
    toc: LIMITS.toc.def,
    menuCollapsed: false,
    tocCollapsed: false,
  };

  function clamp(key, value) {
    var lim = LIMITS[key];
    var n = Number(value);
    if (!isFinite(n)) n = lim.def;
    if (n < lim.min) n = lim.min;
    if (n > lim.max) n = lim.max;
    // Snap to step
    var steps = Math.round((n - lim.min) / lim.step);
    n = lim.min + steps * lim.step;
    // Avoid float noise
    n = Math.round(n * 1000) / 1000;
    if (n < lim.min) n = lim.min;
    if (n > lim.max) n = lim.max;
    return n;
  }

  function migrateValue(key, raw) {
    if (typeof raw === "number") return clamp(key, raw);
    if (typeof raw === "string" && LEGACY[key] && LEGACY[key][raw] != null) {
      return clamp(key, LEGACY[key][raw]);
    }
    if (typeof raw === "string" && /rem$/.test(raw)) {
      return clamp(key, parseFloat(raw));
    }
    return LIMITS[key].def;
  }

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return Object.assign({}, DEFAULTS);
      var parsed = JSON.parse(raw);
      return {
        content: migrateValue("content", parsed.content),
        menu: migrateValue("menu", parsed.menu),
        toc: migrateValue("toc", parsed.toc),
        menuCollapsed: !!parsed.menuCollapsed,
        tocCollapsed: !!parsed.tocCollapsed,
      };
    } catch (e) {
      return Object.assign({}, DEFAULTS);
    }
  }

  function write(state) {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          content: state.content,
          menu: state.menu,
          toc: state.toc,
          menuCollapsed: !!state.menuCollapsed,
          tocCollapsed: !!state.tocCollapsed,
        }),
      );
    } catch (e) {}
  }

  function rem(n) {
    return n + "rem";
  }

  function apply(state) {
    var root = document.documentElement;
    root.style.setProperty(VARS.content, rem(state.content));
    root.style.setProperty(
      VARS.menu,
      state.menuCollapsed ? "0px" : rem(state.menu),
    );
    root.style.setProperty(
      VARS.toc,
      state.tocCollapsed ? "0px" : rem(state.toc),
    );

    root.setAttribute("data-menu-collapsed", state.menuCollapsed ? "true" : "false");
    root.setAttribute("data-toc-collapsed", state.tocCollapsed ? "true" : "false");

    var bookToc = document.getElementById("book-toc");
    var pageToc = document.getElementById("page-toc");
    if (bookToc)
      bookToc.setAttribute("aria-hidden", state.menuCollapsed ? "true" : "false");
    if (pageToc)
      pageToc.setAttribute("aria-hidden", state.tocCollapsed ? "true" : "false");

    syncRails(state);
    syncCollapseButtons(state);
    syncSliders(state);
  }

  function formatValue(key, n) {
    return LIMITS[key].step < 1 ? String(n) : String(Math.round(n));
  }

  function syncSliders(state) {
    document.querySelectorAll(".width-control__slider").forEach(function (el) {
      var key = el.getAttribute("data-width-key");
      if (!key || state[key] == null) return;
      el.value = String(state[key]);
    });
    document.querySelectorAll("[data-width-value]").forEach(function (el) {
      var key = el.getAttribute("data-width-value");
      if (!key || state[key] == null) return;
      el.textContent = formatValue(key, state[key]);
    });
  }

  function syncCollapseButtons(state) {
    document.querySelectorAll("[data-collapse-toggle]").forEach(function (btn) {
      var which = btn.getAttribute("data-collapse-toggle");
      var collapsed =
        which === "menu" ? state.menuCollapsed : state.tocCollapsed;
      btn.setAttribute("aria-pressed", collapsed ? "true" : "false");
      btn.classList.toggle("is-collapsed", collapsed);
      btn.hidden = collapsed;
    });
  }

  function ensureRails() {
    if (!document.querySelector(".page-shell--book")) return null;
    var left = document.getElementById("rail-expand-menu");
    var right = document.getElementById("rail-expand-toc");
    if (!left) {
      left = document.createElement("button");
      left.type = "button";
      left.id = "rail-expand-menu";
      left.className = "rail-expand rail-expand--left";
      left.setAttribute("aria-label", "展开左栏");
      left.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z"/></svg>';
      document.body.appendChild(left);
      left.addEventListener("click", function () {
        state.menuCollapsed = false;
        write(state);
        apply(state);
      });
    }
    if (!right) {
      right = document.createElement("button");
      right.type = "button";
      right.id = "rail-expand-toc";
      right.className = "rail-expand rail-expand--right";
      right.setAttribute("aria-label", "展开右栏");
      right.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M9.78 3.22a.75.75 0 00-1.06 0L4.47 7.47a.75.75 0 000 1.06l4.25 4.25a.75.75 0 001.06-1.06L6.06 8l3.72-3.72a.75.75 0 000-1.06z"/></svg>';
      document.body.appendChild(right);
      right.addEventListener("click", function () {
        state.tocCollapsed = false;
        write(state);
        apply(state);
      });
    }
    return { left: left, right: right };
  }

  function syncRails(state) {
    var rails = ensureRails();
    if (!rails) return;
    rails.left.hidden = !state.menuCollapsed;
    rails.right.hidden = !state.tocCollapsed;
  }

  var state = read();
  apply(state);

  function syncScrollbarWidth() {
    var sb = window.innerWidth - document.documentElement.clientWidth;
    if (sb < 0) sb = 0;
    document.documentElement.style.setProperty("--scrollbar-width", sb + "px");
  }
  syncScrollbarWidth();

  document.addEventListener("DOMContentLoaded", function () {
    syncScrollbarWidth();
    apply(state);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        syncScrollbarWidth();
        document.documentElement.classList.add("layout-anim");
      });
    });

    window.addEventListener("resize", syncScrollbarWidth);

    var toggle = document.getElementById("width-control-toggle");
    var panel = document.getElementById("width-control-panel");
    var rootEl = document.querySelector("[data-width-control]");
    if (!toggle || !panel) return;

    function openPanel() {
      panel.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
    }

    function closePanel() {
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    }

    function setDragging(on) {
      document.documentElement.classList.toggle("layout-dragging", on);
      if (!on) document.documentElement.classList.add("layout-anim");
    }

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      if (panel.hidden) openPanel();
      else closePanel();
    });

    panel.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    document.addEventListener("click", function (e) {
      var collapseBtn = e.target.closest("[data-collapse-toggle]");
      if (collapseBtn) {
        var which = collapseBtn.getAttribute("data-collapse-toggle");
        if (which === "menu") state.menuCollapsed = true;
        if (which === "toc") state.tocCollapsed = true;
        write(state);
        apply(state);
        return;
      }
      if (!panel.hidden && !(rootEl && rootEl.contains(e.target))) {
        closePanel();
      }
    });

    panel.addEventListener("input", function (e) {
      var el = e.target.closest(".width-control__slider");
      if (!el) return;
      var key = el.getAttribute("data-width-key");
      if (!LIMITS[key]) return;
      state[key] = clamp(key, el.value);
      if (key === "menu") state.menuCollapsed = false;
      if (key === "toc") state.tocCollapsed = false;
      apply(state);
    });

    panel.addEventListener("change", function (e) {
      var el = e.target.closest(".width-control__slider");
      if (!el) return;
      var key = el.getAttribute("data-width-key");
      if (!LIMITS[key]) return;
      state[key] = clamp(key, el.value);
      write(state);
      apply(state);
      setDragging(false);
    });

    panel.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".width-control__slider")) setDragging(true);
    });

    window.addEventListener("pointerup", function () {
      if (document.documentElement.classList.contains("layout-dragging")) {
        write(state);
        setDragging(false);
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) closePanel();
    });
  });
})();
