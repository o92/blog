(function () {
  function wire(btnId, panelId, bodyClass) {
    var btn = document.getElementById(btnId);
    var panel = document.getElementById(panelId);
    if (!btn || !panel) return;
    btn.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      document.body.classList.toggle(bodyClass, open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    wire("toggle-book-toc", "book-toc", "book-toc-open");
    wire("toggle-page-toc", "page-toc", "page-toc-open");

    // Next.js–like: chevron toggles nested nav; link still navigates
    document.querySelector(".book-toc")?.addEventListener("click", function (e) {
      var btn = e.target.closest(".book-toc__toggle");
      if (!btn || !e.currentTarget.contains(btn)) return;
      e.preventDefault();
      e.stopPropagation();
      var li = btn.closest(".book-toc__item--collapsible");
      if (!li) return;
      var open = li.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
})();
