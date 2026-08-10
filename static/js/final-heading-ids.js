/**
 * On final=true merged pages, heading ids collide across parts (same title → same id).
 * Scope each heading id with its part-* section, and rewrite TOC / in-page hashes to match.
 * Must run before anchor-offset / page-toc-spy.
 */
(function () {
  function scopeFinalHeadingIds() {
    var parts = document.querySelectorAll("section.final-part[id]");
    if (!parts.length) return;

    var idMap = Object.create(null); // oldId -> first scoped (fallback)
    var partScoped = []; // { partId, oldId, newId }

    for (var p = 0; p < parts.length; p++) {
      var part = parts[p];
      var partId = part.id;
      if (!partId) continue;
      var body = part.querySelector(":scope > .final-part__body") || part;
      var headings = body.querySelectorAll("h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]");
      for (var h = 0; h < headings.length; h++) {
        var el = headings[h];
        var oldId = el.id;
        if (!oldId || oldId.indexOf(partId + "--") === 0) continue;
        var newId = partId + "--" + oldId;
        el.id = newId;
        if (!idMap[oldId]) idMap[oldId] = newId;
        partScoped.push({ partId: partId, oldId: oldId, newId: newId });
      }
    }

    if (!partScoped.length) return;

    function rewriteHash(hash) {
      if (!hash || hash.charAt(0) !== "#") return hash;
      var raw = hash.slice(1);
      var id;
      try {
        id = decodeURIComponent(raw);
      } catch (e) {
        id = raw;
      }
      if (!id || id.indexOf("part-") === 0 && id.indexOf("--") !== -1) return hash;
      // Prefer map from first occurrence; TOC rewrite below is part-aware.
      if (idMap[id]) return "#" + idMap[id];
      return hash;
    }

    // Right-rail TOC: nest under each part link so duplicates resolve to the right part.
    var tocLis = document.querySelectorAll(".final-page-toc > ul > li");
    for (var i = 0; i < tocLis.length; i++) {
      var li = tocLis[i];
      var partA = li.querySelector(":scope > a[href^='#part-']");
      if (!partA) continue;
      var partHref = partA.getAttribute("href") || "";
      var partId = partHref.charAt(0) === "#" ? partHref.slice(1) : "";
      if (!partId) continue;
      var nested = li.querySelectorAll("a[href^='#']");
      for (var n = 0; n < nested.length; n++) {
        var a = nested[n];
        if (a === partA) continue;
        var href = a.getAttribute("href") || "";
        var hid = href.slice(1);
        try {
          hid = decodeURIComponent(hid);
        } catch (e) {}
        if (!hid || hid.indexOf(partId + "--") === 0) continue;
        if (hid.indexOf("part-") === 0 && hid.indexOf("--") === -1) continue;
        a.setAttribute("href", "#" + partId + "--" + hid);
      }
    }

    // Other same-page hashes (e.g. leftover bare ids): best-effort first match.
    var all = document.querySelectorAll('a[href^="#"]');
    for (var j = 0; j < all.length; j++) {
      var link = all[j];
      if (link.closest(".final-page-toc")) continue; // already handled
      var h0 = link.getAttribute("href");
      var h1 = rewriteHash(h0);
      if (h1 !== h0) link.setAttribute("href", h1);
    }

    // If landed with a bare hash, retarget to scoped id when possible.
    if (location.hash && location.hash.length > 1) {
      var cur = location.hash.slice(1);
      try {
        cur = decodeURIComponent(cur);
      } catch (e) {}
      if (cur && !document.getElementById(cur) && idMap[cur]) {
        history.replaceState(null, "", "#" + idMap[cur]);
      }
    }
  }

  // defer: document already parsed when this runs; run sync so TOC spy / anchor-offset see scoped ids.
  scopeFinalHeadingIds();
})();
