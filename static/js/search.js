/**
 * Pagefind custom search UI: ⌘K / Ctrl+K modal.
 * Index is built after hugo + glossary-inject; load client on first open.
 */
(function () {
  var openBtn = document.getElementById("search-open");
  var dialog = document.getElementById("search-dialog");
  var input = document.getElementById("search-input");
  var resultsEl = document.getElementById("search-results");
  var statusEl = document.getElementById("search-status");
  var root = document.getElementById("site-search");

  if (!openBtn || !dialog || !input || !resultsEl || !statusEl) return;

  // Escape header stacking context (backdrop-filter) so overlay covers the viewport
  if (dialog.parentElement !== document.body) {
    document.body.appendChild(dialog);
  }

  var pagefindBase = (root && root.getAttribute("data-pagefind-base")) || "/pagefind/";
  if (pagefindBase.slice(-1) !== "/") pagefindBase += "/";

  var isApple =
    /Mac|iPhone|iPad|iPod/.test(navigator.platform || "") ||
    (navigator.userAgentData && navigator.userAgentData.platform === "macOS");
  var shortcutEl = openBtn.querySelector("[data-search-shortcut]");
  if (shortcutEl) shortcutEl.textContent = isApple ? "⌘K" : "Ctrl K";
  openBtn.title = "搜索（" + (isApple ? "⌘K" : "Ctrl+K") + "）";

  var pagefindPromise = null;
  var debounceTimer = null;
  var activeIndex = -1;
  var currentResults = [];
  var lastQuery = "";

  function ensurePagefind() {
    if (!pagefindPromise) {
      pagefindPromise = import(pagefindBase + "pagefind.js")
        .then(function (mod) {
          return mod;
        })
        .catch(function (err) {
          pagefindPromise = null;
          throw err;
        });
    }
    return pagefindPromise;
  }

  function setStatus(text) {
    statusEl.textContent = text || "";
  }

  function clearResults() {
    resultsEl.innerHTML = "";
    currentResults = [];
    activeIndex = -1;
  }

  function setActive(index) {
    var items = resultsEl.querySelectorAll(".site-search__result");
    if (!items.length) {
      activeIndex = -1;
      return;
    }
    if (index < 0) index = items.length - 1;
    if (index >= items.length) index = 0;
    activeIndex = index;
    items.forEach(function (el, i) {
      var on = i === activeIndex;
      el.classList.toggle("is-active", on);
      el.setAttribute("aria-selected", on ? "true" : "false");
      if (on) el.scrollIntoView({ block: "nearest" });
    });
  }

  function renderResults(query, rows) {
    clearResults();
    if (!query) {
      setStatus("输入关键词搜索");
      return;
    }
    if (!rows.length) {
      setStatus("无结果");
      return;
    }
    setStatus(rows.length + " 条结果");
    var frag = document.createDocumentFragment();
    rows.forEach(function (row, i) {
      var li = document.createElement("li");
      li.className = "site-search__result";
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", "false");
      li.id = "search-result-" + i;

      var a = document.createElement("a");
      a.className = "site-search__result-link";
      a.href = row.url;
      a.innerHTML =
        '<div class="site-search__result-title"></div>' +
        '<div class="site-search__result-meta"></div>' +
        '<div class="site-search__result-excerpt"></div>';
      a.querySelector(".site-search__result-title").textContent =
        row.meta.title || row.url;
      a.querySelector(".site-search__result-meta").textContent = row.url;
      a.querySelector(".site-search__result-excerpt").innerHTML =
        row.excerpt || "";

      a.addEventListener("mouseenter", function () {
        setActive(i);
      });

      li.appendChild(a);
      frag.appendChild(li);
    });
    resultsEl.appendChild(frag);
    setActive(0);
  }

  function runSearch(query) {
    lastQuery = query;
    if (!query) {
      clearResults();
      setStatus("输入关键词搜索");
      return;
    }
    setStatus("搜索中…");
    ensurePagefind()
      .then(function (pagefind) {
        return pagefind.search(query);
      })
      .then(function (search) {
        if (query !== lastQuery) return null;
        var slice = (search.results || []).slice(0, 12);
        return Promise.all(
          slice.map(function (r) {
            return r.data();
          }),
        );
      })
      .then(function (rows) {
        if (rows == null || query !== lastQuery) return;
        currentResults = rows;
        renderResults(query, rows);
      })
      .catch(function () {
        if (query !== lastQuery) return;
        clearResults();
        setStatus("搜索不可用（请先完整构建：npm run build）");
      });
  }

  function scheduleSearch() {
    var q = (input.value || "").trim();
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      runSearch(q);
    }, 160);
  }

  function openSearch() {
    if (!dialog.hidden) return;
    dialog.hidden = false;
    document.body.classList.add("search-open");
    openBtn.setAttribute("aria-expanded", "true");
    setStatus("输入关键词搜索");
    clearResults();
    input.value = "";
    lastQuery = "";
    ensurePagefind().catch(function () {});
    requestAnimationFrame(function () {
      input.focus();
    });
  }

  function closeSearch() {
    if (dialog.hidden) return;
    dialog.hidden = true;
    document.body.classList.remove("search-open");
    openBtn.setAttribute("aria-expanded", "false");
    clearTimeout(debounceTimer);
    clearResults();
    setStatus("");
    openBtn.focus();
  }

  function activateSelected() {
    var items = resultsEl.querySelectorAll(".site-search__result-link");
    if (activeIndex >= 0 && items[activeIndex]) {
      items[activeIndex].click();
    }
  }

  openBtn.addEventListener("click", function () {
    openSearch();
  });

  dialog.addEventListener("click", function (e) {
    if (e.target === dialog || e.target.hasAttribute("data-search-close")) {
      closeSearch();
    }
  });

  var panel = dialog.querySelector(".site-search__panel");
  if (panel) {
    panel.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }

  input.addEventListener("input", scheduleSearch);

  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(activeIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(activeIndex - 1);
    } else if (e.key === "Enter") {
      if (activeIndex >= 0) {
        e.preventDefault();
        activateSelected();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeSearch();
    }
  });

  document.addEventListener("keydown", function (e) {
    var metaK = (e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K");
    if (metaK) {
      e.preventDefault();
      if (dialog.hidden) openSearch();
      else closeSearch();
      return;
    }
    if (e.key === "Escape" && !dialog.hidden) {
      e.preventDefault();
      closeSearch();
    }
  });
})();
