/**
 * Sticky header covers fragment targets; native scroll-padding is unreliable
 * across browsers / same-page hash clicks / Mermaid reveal. Scroll with offset.
 */
(function () {
  function headerOffset() {
    var header = document.querySelector(".site-header");
    if (!header) return 56;
    return Math.ceil(header.getBoundingClientRect().height);
  }

  function targetFromHash(hash) {
    if (!hash || hash === "#") return null;
    var raw = hash.charAt(0) === "#" ? hash.slice(1) : hash;
    if (!raw) return null;
    var id;
    try {
      id = decodeURIComponent(raw);
    } catch (e) {
      id = raw;
    }
    return document.getElementById(id);
  }

  function scrollToEl(el, smooth) {
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.scrollY - headerOffset();
    if (top < 0) top = 0;
    window.scrollTo({
      top: top,
      behavior: smooth ? "smooth" : "auto",
    });
  }

  function scrollToHash(smooth) {
    scrollToEl(targetFromHash(location.hash), smooth);
  }

  function samePageHash(anchor) {
    if (!anchor || !anchor.hash) return null;
    try {
      var url = new URL(anchor.href, location.href);
      if (url.pathname !== location.pathname) return null;
      if (url.search !== location.search) return null;
      return url.hash;
    } catch (e) {
      return null;
    }
  }

  document.addEventListener(
    "click",
    function (e) {
      var a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var hash = samePageHash(a);
      if (!hash) return;
      var el = targetFromHash(hash);
      if (!el) return;
      e.preventDefault();
      if (location.hash !== hash) {
        history.pushState(null, "", hash);
      }
      scrollToEl(el, true);
    },
    true,
  );

  window.addEventListener("hashchange", function () {
    scrollToHash(true);
  });

  window.addEventListener("popstate", function () {
    scrollToHash(false);
  });

  function afterPaint(fn) {
    requestAnimationFrame(function () {
      requestAnimationFrame(fn);
    });
  }

  function onReady() {
    if (!location.hash) return;
    afterPaint(function () {
      scrollToHash(false);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
  window.addEventListener("load", function () {
    if (location.hash) afterPaint(function () {
      scrollToHash(false);
    });
  });

  // Mermaid keeps body hidden then reveals — re-apply hash offset after layout settles
  var root = document.documentElement;
  if (root.classList.contains("mermaid-pending")) {
    var obs = new MutationObserver(function () {
      if (!root.classList.contains("mermaid-ready")) return;
      obs.disconnect();
      if (location.hash) afterPaint(function () {
        scrollToHash(false);
      });
    });
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
  }
})();
