(function () {
  var KEY = "theme-preference";
  var order = ["system", "light", "dark"];
  var labels = { system: "系统", light: "浅色", dark: "深色" };

  function getPref() {
    try {
      return localStorage.getItem(KEY) || "system";
    } catch (e) {
      return "system";
    }
  }

  function apply(pref) {
    var root = document.documentElement;
    if (pref === "light" || pref === "dark") {
      root.setAttribute("data-theme", pref);
    } else {
      root.removeAttribute("data-theme");
      pref = "system";
    }
    try {
      if (pref === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, pref);
    } catch (e) {}
    var btn = document.getElementById("theme-toggle-btn");
    if (btn) {
      var text = btn.querySelector(".theme-toggle__text");
      if (text) text.textContent = labels[pref] || "系统";
      btn.setAttribute("aria-label", "主题：" + (labels[pref] || "系统") + "（点击切换）");
    }
  }

  function next(pref) {
    var i = order.indexOf(pref);
    if (i < 0) i = 0;
    return order[(i + 1) % order.length];
  }

  document.addEventListener("DOMContentLoaded", function () {
    var pref = getPref();
    apply(pref);
    var btn = document.getElementById("theme-toggle-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      pref = next(getPref());
      apply(pref);
    });
  });
})();
