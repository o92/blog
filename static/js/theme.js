(function () {
  var KEY = "theme-preference";
  var labels = { light: "浅", dark: "深" };

  function systemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function getStored() {
    try {
      var v = sessionStorage.getItem(KEY);
      return v === "light" || v === "dark" ? v : null;
    } catch (e) {
      return null;
    }
  }

  function effectiveTheme() {
    return getStored() || systemTheme();
  }

  function updateButton(theme) {
    var btn = document.getElementById("theme-toggle-btn");
    if (!btn) return;
    var text = btn.querySelector(".theme-toggle__text");
    if (text) text.textContent = labels[theme] || "浅";
    btn.setAttribute(
      "aria-label",
      "切换为" + (theme === "dark" ? "浅色" : "深色"),
    );
    btn.title =
      "当前：" +
      (labels[theme] || "浅") +
      "（点击切换；关闭浏览器后恢复跟随系统）";
  }

  function applyFromStorage() {
    var stored = getStored();
    var root = document.documentElement;
    if (stored) {
      root.setAttribute("data-theme", stored);
      updateButton(stored);
    } else {
      root.removeAttribute("data-theme");
      updateButton(systemTheme());
    }
  }

  // Clear legacy localStorage key from older builds
  try {
    localStorage.removeItem(KEY);
  } catch (e) {}

  document.addEventListener("DOMContentLoaded", function () {
    applyFromStorage();

    var btn = document.getElementById("theme-toggle-btn");
    if (!btn) return;

    btn.addEventListener("click", function () {
      var next = effectiveTheme() === "dark" ? "light" : "dark";
      try {
        sessionStorage.setItem(KEY, next);
      } catch (e) {}
      document.documentElement.setAttribute("data-theme", next);
      updateButton(next);
    });

    try {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", function () {
          if (!getStored()) applyFromStorage();
        });
    } catch (e) {}
  });
})();
