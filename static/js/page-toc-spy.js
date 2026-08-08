/**
 * Right-rail TOC: fixed fish-eye (scale + bg only), bidirectional sync.
 * Scroll math uses layout offsets (no transform) to avoid jitter.
 */
(function () {
  var MAX_SCALE = 1.75;
  var SIGMA_PX = 52;
  var LENS_AT = 0.36;
  var LENS_UP_VH = 0.2;
  var LERP = 0.2;
  var SCROLL_EPS = 1.5;

  function headerOffset() {
    var header = document.querySelector(".site-header");
    if (!header) return 56;
    return Math.ceil(header.getBoundingClientRect().height);
  }

  function targetFromHash(href) {
    if (!href || href.charAt(0) !== "#") return null;
    var raw = href.slice(1);
    if (!raw) return null;
    var id;
    try {
      id = decodeURIComponent(raw);
    } catch (e) {
      id = raw;
    }
    return document.getElementById(id);
  }

  function clamp01(t) {
    if (t < 0) return 0;
    if (t > 1) return 1;
    return t;
  }

  function init() {
    var panel = document.getElementById("page-toc");
    if (!panel) return;

    document.documentElement.classList.add("hide-doc-scrollbar");

    var scroller = panel.querySelector(".toc-panel__scroll") || panel;
    var links = Array.prototype.slice.call(
      panel.querySelectorAll("a[href^='#']"),
    );
    var items = [];
    for (var i = 0; i < links.length; i++) {
      var el = targetFromHash(links[i].getAttribute("href"));
      if (!el) continue;
      items.push({ link: links[i], el: el });
    }
    if (!items.length) return;

    var smoothFocus = 0;
    var animating = false;
    var driver = "content";
    var quiet = false;
    var tocReleaseTimer = null;
    var rail = panel.querySelector(".final-page-toc, #TableOfContents");
    var lastContentTop = -1;
    var rafToc = 0;

    function lensLocalY() {
      var h = scroller.clientHeight;
      var y = h * LENS_AT - window.innerHeight * LENS_UP_VH;
      if (y < 28) y = 28;
      if (y > h - 28) y = h - 28;
      return y;
    }

    /** Content Y mid inside scroller — ignores CSS transform. */
    function layoutMidInScroller(link) {
      var y = 0;
      var node = link;
      while (node && node !== scroller) {
        y += node.offsetTop;
        node = node.offsetParent;
      }
      return y + link.offsetHeight / 2;
    }

    function syncRailPadding() {
      if (!rail) return;
      var h = scroller.clientHeight;
      var lensLocal = lensLocalY();
      rail.style.paddingTop = Math.max(0, Math.round(lensLocal - 20)) + "px";
      rail.style.paddingBottom =
        Math.max(0, Math.round(h - lensLocal - 20)) + "px";
    }

    function readTargetFocusFromContent() {
      var probe = headerOffset() + 12;
      if (items.length === 1) return 0;
      var idx = 0;
      for (var i = 0; i < items.length; i++) {
        if (items[i].el.getBoundingClientRect().top <= probe) idx = i;
        else break;
      }
      if (idx >= items.length - 1) return items.length - 1;
      var y0 = items[idx].el.getBoundingClientRect().top;
      var y1 = items[idx + 1].el.getBoundingClientRect().top;
      var span = y1 - y0;
      return idx + (span <= 0 ? 0 : clamp01((probe - y0) / span));
    }

    function readFocusFromLens() {
      var lens = lensLocalY();
      if (items.length === 1) return 0;
      var idx = 0;
      for (var i = 0; i < items.length; i++) {
        if (layoutMidInScroller(items[i].link) - scroller.scrollTop <= lens)
          idx = i;
        else break;
      }
      if (idx >= items.length - 1) return items.length - 1;
      var m0 = layoutMidInScroller(items[idx].link) - scroller.scrollTop;
      var m1 = layoutMidInScroller(items[idx + 1].link) - scroller.scrollTop;
      var span = m1 - m0;
      return idx + (span <= 0 ? 0 : clamp01((lens - m0) / span));
    }

    function scrollTopForFocus(focus) {
      var i0 = Math.max(0, Math.min(items.length - 1, Math.floor(focus)));
      var i1 = Math.min(items.length - 1, i0 + 1);
      var t = focus - i0;
      var mid =
        layoutMidInScroller(items[i0].link) +
        (layoutMidInScroller(items[i1].link) -
          layoutMidInScroller(items[i0].link)) *
          t;
      var next = mid - lensLocalY();
      var max = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
      if (next < 0) next = 0;
      if (next > max) next = max;
      return next;
    }

    function scrollContentToFocus(focus) {
      var i0 = Math.max(0, Math.min(items.length - 1, Math.floor(focus)));
      var i1 = Math.min(items.length - 1, i0 + 1);
      var t = focus - i0;
      var y0 = items[i0].el.getBoundingClientRect().top + window.scrollY;
      var y1 = items[i1].el.getBoundingClientRect().top + window.scrollY;
      var top = y0 + (y1 - y0) * t - headerOffset() - 12;
      var max = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      if (top < 0) top = 0;
      if (top > max) top = max;
      if (Math.abs(top - lastContentTop) < 1) return;
      lastContentTop = top;
      quiet = true;
      window.scrollTo({ top: top, behavior: "auto" });
      window.requestAnimationFrame(function () {
        quiet = false;
      });
    }

    function applyLensAtHotspot() {
      var lens = lensLocalY();
      for (var j = 0; j < items.length; j++) {
        var link = items[j].link;
        var mid = layoutMidInScroller(link) - scroller.scrollTop;
        var w = Math.exp(
          -((mid - lens) * (mid - lens)) / (2 * SIGMA_PX * SIGMA_PX),
        );
        if (w < 0.04) {
          link.style.setProperty("--toc-lens", "0");
          link.style.setProperty("--toc-scale", "1");
          continue;
        }
        link.style.setProperty("--toc-lens", w.toFixed(4));
        link.style.setProperty(
          "--toc-scale",
          (1 + (MAX_SCALE - 1) * w).toFixed(4),
        );
      }
    }

    function setPanelScroll(top) {
      if (Math.abs(top - scroller.scrollTop) < SCROLL_EPS) return false;
      quiet = true;
      scroller.scrollTop = top;
      window.requestAnimationFrame(function () {
        quiet = false;
      });
      return true;
    }

    function tick() {
      if (driver !== "content") {
        animating = false;
        return;
      }
      var targetFocus = readTargetFocusFromContent();
      smoothFocus += (targetFocus - smoothFocus) * LERP;
      if (Math.abs(targetFocus - smoothFocus) < 0.001) smoothFocus = targetFocus;

      var targetScroll = scrollTopForFocus(smoothFocus);
      var cur = scroller.scrollTop;
      var next = cur + (targetScroll - cur) * LERP;
      if (Math.abs(targetScroll - cur) < SCROLL_EPS) next = targetScroll;
      setPanelScroll(next);
      applyLensAtHotspot();

      if (
        driver === "content" &&
        (Math.abs(targetFocus - smoothFocus) > 0.001 ||
          Math.abs(targetScroll - scroller.scrollTop) > SCROLL_EPS)
      ) {
        window.requestAnimationFrame(tick);
      } else {
        animating = false;
        applyLensAtHotspot();
      }
    }

    function kickFromContent() {
      if (quiet || driver !== "content" || animating) return;
      animating = true;
      window.requestAnimationFrame(tick);
    }

    function takeTocDriver() {
      driver = "toc";
      animating = false;
      if (tocReleaseTimer) clearTimeout(tocReleaseTimer);
      tocReleaseTimer = setTimeout(function () {
        driver = "content";
        tocReleaseTimer = null;
        smoothFocus = readTargetFocusFromContent();
      }, 240);
    }

    function onPanelScroll() {
      if (quiet) {
        applyLensAtHotspot();
        return;
      }
      takeTocDriver();
      if (rafToc) return;
      rafToc = window.requestAnimationFrame(function () {
        rafToc = 0;
        var focus = readFocusFromLens();
        smoothFocus = focus;
        scrollContentToFocus(focus);
        applyLensAtHotspot();
      });
    }

    scroller.addEventListener("wheel", takeTocDriver, { passive: true });
    scroller.addEventListener("touchstart", takeTocDriver, { passive: true });
    scroller.addEventListener("pointerdown", takeTocDriver);
    scroller.addEventListener("scroll", onPanelScroll, { passive: true });
    window.addEventListener("scroll", kickFromContent, { passive: true });
    window.addEventListener(
      "resize",
      function () {
        syncRailPadding();
        if (driver === "content") kickFromContent();
        else applyLensAtHotspot();
      },
      { passive: true },
    );

    syncRailPadding();
    smoothFocus = readTargetFocusFromContent();
    setPanelScroll(scrollTopForFocus(smoothFocus));
    applyLensAtHotspot();
    kickFromContent();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
