/**
 * Glossary tip: fixed portal, stays in viewport, above header.
 */
(function () {
  const GAP = 10;
  const PAD = 16;
  const ARROW = 8;
  const HIDE_MS = 360;
  let activeTerm = null;
  let activeTip = null;
  let bridgeEl = null;
  let hideTimer = 0;
  let lastX = 0;
  let lastY = 0;

  function clearHide() {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = 0;
    }
  }

  function viewport() {
    const doc = document.documentElement;
    return {
      w: doc.clientWidth || window.innerWidth,
      h: doc.clientHeight || window.innerHeight,
    };
  }

  function headerBottom() {
    const header = document.querySelector(".site-header");
    if (!header) return PAD;
    const bottom = header.getBoundingClientRect().bottom;
    return Math.max(PAD, Math.ceil(bottom) + 8);
  }

  function ensureBridge() {
    if (bridgeEl) return bridgeEl;
    bridgeEl = document.createElement("div");
    bridgeEl.className = "glossary-tip-bridge";
    bridgeEl.setAttribute("aria-hidden", "true");
    bridgeEl.addEventListener("pointerenter", clearHide);
    bridgeEl.addEventListener("pointerleave", scheduleHide);
    document.body.appendChild(bridgeEl);
    return bridgeEl;
  }

  function underPointer(x, y) {
    const el = document.elementFromPoint(x, y);
    if (!el) return false;
    if (activeTip && (el === activeTip || activeTip.contains(el))) return true;
    if (activeTerm && (el === activeTerm || activeTerm.contains(el))) return true;
    if (bridgeEl && (el === bridgeEl || bridgeEl.contains(el))) return true;
    return false;
  }

  function place(tip, term) {
    const r = term.getBoundingClientRect();
    const { w: vw, h: vh } = viewport();
    const topMin = headerBottom();
    const bottomMax = vh - PAD;
    const leftMin = PAD;
    const rightMax = vw - PAD;
    const availW = Math.max(120, rightMax - leftMin);
    const availH = Math.max(80, bottomMax - topMin);

    tip.style.minWidth = "";
    tip.style.width = "";
    tip.style.maxWidth = `${Math.min(28 * 16, availW)}px`;
    tip.style.maxHeight = `${availH}px`;

    // First measure unconstrained height within max bounds.
    let tw = tip.offsetWidth;
    let th = tip.offsetHeight;

    // Prefer the side with more free space; require room for tip + gap + arrow.
    const spaceAbove = r.top - topMin - GAP - ARROW;
    const spaceBelow = bottomMax - r.bottom - GAP - ARROW;
    let below = false;
    if (spaceAbove >= th || (spaceAbove >= spaceBelow && spaceAbove > 48)) {
      below = false;
    } else if (spaceBelow >= th || spaceBelow > spaceAbove) {
      below = true;
    } else {
      // Both tight: pick larger side and shrink tip to fit.
      below = spaceBelow > spaceAbove;
    }

    const sideSpace = below ? spaceBelow : spaceAbove;
    const fitH = Math.max(80, Math.min(th, Math.max(sideSpace, availH)));
    tip.style.maxHeight = `${Math.floor(fitH)}px`;
    tw = tip.offsetWidth;
    th = tip.offsetHeight;

    // Horizontal: center on term, then clamp fully into viewport.
    let left = r.left + r.width / 2 - tw / 2;
    if (left < leftMin) left = leftMin;
    if (left + tw > rightMax) left = rightMax - tw;
    if (left < leftMin) {
      left = leftMin;
      tip.style.maxWidth = `${availW}px`;
      tip.style.width = `${availW}px`;
      tw = tip.offsetWidth;
      th = tip.offsetHeight;
    }

    // Vertical placement relative to term, then clamp.
    let top;
    if (!below) {
      top = r.top - GAP - ARROW - th;
      if (top < topMin) {
        // Not enough room above → flip below.
        below = true;
        top = r.bottom + GAP + ARROW;
      }
    } else {
      top = r.bottom + GAP + ARROW;
      if (top + th > bottomMax) {
        // Not enough room below → try above.
        const aboveTop = r.top - GAP - ARROW - th;
        if (aboveTop >= topMin) {
          below = false;
          top = aboveTop;
        } else {
          top = Math.max(topMin, bottomMax - th);
        }
      }
    }

    // Final clamp: never leave the safe rect.
    if (top < topMin) top = topMin;
    if (top + th > bottomMax) top = Math.max(topMin, bottomMax - th);
    if (left < leftMin) left = leftMin;
    if (left + tw > rightMax) left = Math.max(leftMin, rightMax - tw);

    left = Math.round(left);
    top = Math.round(top);

    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
    tip.classList.toggle("glossary-tip--below", below);

    // Point arrow toward the term center (clamped inside tip).
    const termCx = r.left + r.width / 2;
    const arrowX = Math.min(tw - 16, Math.max(16, termCx - left));
    tip.style.setProperty("--tip-arrow-x", `${Math.round(arrowX)}px`);

    const bridge = ensureBridge();
    const tipBottom = top + th;
    const tipRight = left + tw;
    const bridgeLeft = Math.min(left, r.left) - 8;
    const bridgeRight = Math.max(tipRight, r.right) + 8;
    bridge.style.left = `${Math.round(bridgeLeft)}px`;
    bridge.style.width = `${Math.round(bridgeRight - bridgeLeft)}px`;
    if (below) {
      bridge.style.top = `${Math.round(r.bottom)}px`;
      bridge.style.height = `${Math.max(0, Math.round(top - r.bottom))}px`;
    } else {
      bridge.style.top = `${Math.round(tipBottom)}px`;
      bridge.style.height = `${Math.max(0, Math.round(r.top - tipBottom))}px`;
    }
    bridge.classList.add("is-open");
  }

  function tipFor(term) {
    const nested = term.querySelector(":scope > .glossary-tip");
    if (nested) return nested;
    if (activeTerm === term && activeTip) return activeTip;
    return null;
  }

  function show(term) {
    const tip = tipFor(term);
    if (!tip) return;

    clearHide();
    if (activeTip && activeTip !== tip) {
      hideNow();
    }

    tip.classList.add("is-open");
    tip.style.position = "fixed";
    tip.style.left = `${PAD}px`;
    tip.style.top = `${headerBottom()}px`;

    if (tip.parentElement !== document.body) {
      document.body.appendChild(tip);
    }

    term.classList.add("is-tip-open");
    activeTerm = term;
    activeTip = tip;

    place(tip, term);
    place(tip, term);
  }

  function hideNow() {
    clearHide();
    if (!activeTip) return;
    const tip = activeTip;
    const term = activeTerm;
    tip.classList.remove("is-open", "glossary-tip--below");
    tip.style.position = "";
    tip.style.left = "";
    tip.style.top = "";
    tip.style.width = "";
    tip.style.minWidth = "";
    tip.style.maxWidth = "";
    tip.style.maxHeight = "";
    tip.style.removeProperty("--tip-arrow-x");
    if (bridgeEl) {
      bridgeEl.classList.remove("is-open");
      bridgeEl.style.height = "0px";
    }
    if (term) {
      term.classList.remove("is-tip-open");
      term.appendChild(tip);
    }
    activeTip = null;
    activeTerm = null;
  }

  function scheduleHide() {
    clearHide();
    hideTimer = window.setTimeout(() => {
      if (underPointer(lastX, lastY)) {
        hideTimer = 0;
        return;
      }
      hideNow();
    }, HIDE_MS);
  }

  function onEnterTerm(e) {
    show(e.currentTarget);
  }

  function onLeaveTerm(e) {
    if (
      activeTip &&
      e.relatedTarget &&
      (e.relatedTarget === activeTip ||
        activeTip.contains(e.relatedTarget) ||
        e.relatedTarget === bridgeEl)
    ) {
      return;
    }
    scheduleHide();
  }

  function onEnterTip() {
    clearHide();
  }

  function onLeaveTip(e) {
    if (
      activeTerm &&
      e.relatedTarget &&
      (e.relatedTarget === activeTerm ||
        activeTerm.contains(e.relatedTarget) ||
        e.relatedTarget === bridgeEl)
    ) {
      return;
    }
    scheduleHide();
  }

  function bind() {
    document.querySelectorAll(".glossary-term").forEach((term) => {
      if (term.dataset.glossaryBound) return;
      term.dataset.glossaryBound = "1";
      term.addEventListener("pointerenter", onEnterTerm);
      term.addEventListener("pointerleave", onLeaveTerm);
      term.addEventListener("focusin", () => show(term));
      term.addEventListener("focusout", (e) => {
        if (
          activeTip &&
          e.relatedTarget &&
          (e.relatedTarget === activeTip || activeTip.contains(e.relatedTarget))
        ) {
          return;
        }
        scheduleHide();
      });

      const tip = term.querySelector(":scope > .glossary-tip");
      if (tip && !tip.dataset.glossaryBound) {
        tip.dataset.glossaryBound = "1";
        tip.addEventListener("pointerenter", onEnterTip);
        tip.addEventListener("pointerleave", onLeaveTip);
      }
    });
  }

  document.addEventListener(
    "pointermove",
    (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (hideTimer && underPointer(lastX, lastY)) {
        clearHide();
      }
    },
    { passive: true },
  );

  window.addEventListener(
    "scroll",
    () => {
      if (activeTip && activeTerm) place(activeTip, activeTerm);
    },
    { passive: true, capture: true },
  );

  window.addEventListener("resize", () => {
    if (activeTip && activeTerm) place(activeTip, activeTerm);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
