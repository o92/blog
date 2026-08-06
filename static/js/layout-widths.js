/**
 * Shared layout-width limits + FOUC apply.
 * Loaded sync in <head>; also used by width.js.
 */
(function (global) {
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
  // One-time migration from older sm/md/lg presets.
  var LEGACY = {
    content: { sm: 36, md: 48, lg: 64 },
    menu: { sm: 14, md: 17, lg: 20 },
    toc: { sm: 12, md: 15, lg: 18 },
  };

  function clamp(key, value) {
    var lim = LIMITS[key];
    var n = Number(value);
    if (!isFinite(n)) n = lim.def;
    if (n < lim.min) n = lim.min;
    if (n > lim.max) n = lim.max;
    if (lim.step) {
      var steps = Math.round((n - lim.min) / lim.step);
      n = lim.min + steps * lim.step;
      n = Math.round(n * 1000) / 1000;
    }
    if (n < lim.min) n = lim.min;
    if (n > lim.max) n = lim.max;
    return n;
  }

  function migrateValue(key, raw) {
    if (typeof raw === "number") return clamp(key, raw);
    if (typeof raw === "string" && LEGACY[key] && LEGACY[key][raw] != null) {
      return clamp(key, LEGACY[key][raw]);
    }
    if (typeof raw === "string") return clamp(key, parseFloat(raw));
    return LIMITS[key].def;
  }

  function applyFromStorage() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return;
      var w = JSON.parse(raw);
      var root = document.documentElement;
      if (w.content != null) {
        root.style.setProperty(VARS.content, migrateValue("content", w.content) + "rem");
      }
      if (w.menuCollapsed) {
        root.style.setProperty(VARS.menu, "0px");
        root.setAttribute("data-menu-collapsed", "true");
      } else if (w.menu != null) {
        root.style.setProperty(VARS.menu, migrateValue("menu", w.menu) + "rem");
        root.setAttribute("data-menu-collapsed", "false");
      }
      if (w.tocCollapsed) {
        root.style.setProperty(VARS.toc, "0px");
        root.setAttribute("data-toc-collapsed", "true");
      } else if (w.toc != null) {
        root.style.setProperty(VARS.toc, migrateValue("toc", w.toc) + "rem");
        root.setAttribute("data-toc-collapsed", "false");
      }
    } catch (e) {}
  }

  global.LayoutWidths = {
    KEY: KEY,
    VARS: VARS,
    LIMITS: LIMITS,
    clamp: clamp,
    migrateValue: migrateValue,
    applyFromStorage: applyFromStorage,
  };

  applyFromStorage();
})(window);
