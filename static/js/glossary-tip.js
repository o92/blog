/**
 * Glossary tip: fixed portal, viewport-aware, above header, no inner scrollbar.
 */
(function () {
  const GAP = 10;
  const PAD = 16;
  const ARROW = 8;
  const HIDE_MS = 360;
  const MAX_TIP_REM = 36;
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
    return Math.max(PAD, Math.ceil(header.getBoundingClientRect().bottom) + 8);
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
    const availW = Math.max(180, rightMax - leftMin);
    const availH = Math.max(120, bottomMax - topMin);

    tip.style.width = "";
    tip.style.minWidth = "";
    tip.style.maxWidth = `${Math.min(MAX_TIP_REM * 16, availW)}px`;
    // Cap to safe viewport only — never shrink to a scrolling pane.
    tip.style.maxHeight = `${availH}px`;
    tip.style.overflow = "hidden";

    void tip.offsetWidth; // measure once after constraints
    let tw = tip.offsetWidth;
    let th = tip.offsetHeight;

    const spaceAbove = r.top - topMin - GAP - ARROW;
    const spaceBelow = bottomMax - r.bottom - GAP - ARROW;
    let below =
      spaceAbove < th && (spaceBelow >= th || spaceBelow > spaceAbove);

    let left = r.left + r.width / 2 - tw / 2;
    if (left < leftMin) left = leftMin;
    if (left + tw > rightMax) left = rightMax - tw;
    if (left < leftMin) {
      left = leftMin;
      tip.style.maxWidth = `${availW}px`;
      tip.style.width = `${availW}px`;
      tw = tip.offsetWidth;
      th = tip.offsetHeight;
      below = spaceAbove < th && (spaceBelow >= th || spaceBelow > spaceAbove);
    }

    let top;
    if (!below) {
      top = r.top - GAP - ARROW - th;
      if (top < topMin) {
        below = true;
        top = r.bottom + GAP + ARROW;
      }
    } else {
      top = r.bottom + GAP + ARROW;
      if (top + th > bottomMax) {
        const aboveTop = r.top - GAP - ARROW - th;
        if (aboveTop >= topMin) {
          below = false;
          top = aboveTop;
        } else {
          top = Math.max(topMin, bottomMax - th);
        }
      }
    }

    if (top < topMin) top = topMin;
    if (top + th > bottomMax) top = Math.max(topMin, bottomMax - th);
    if (left < leftMin) left = leftMin;
    if (left + tw > rightMax) left = Math.max(leftMin, rightMax - tw);

    left = Math.round(left);
    top = Math.round(top);
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
    tip.classList.toggle("glossary-tip--below", below);

    const termCx = r.left + r.width / 2;
    const arrowX = Math.min(tw - 16, Math.max(16, termCx - left));
    tip.style.setProperty("--tip-arrow-x", `${Math.round(arrowX)}px`);

    const bridge = ensureBridge();
    const tipBottom = top + tip.offsetHeight;
    const tipRight = left + tip.offsetWidth;
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
    if (activeTip && activeTip !== tip) hideNow();

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
    tip.style.overflow = "";
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
      if (hideTimer && underPointer(lastX, lastY)) clearHide();
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
