/**
 * components.js
 * Loads header.html and footer.html from /assets/ into every page,
 * then wires up all nav interactions (dropdown toggle, outside-click close,
 * go() / goHome() navigation). Works from any subdirectory depth.
 */
(function () {
  "use strict";

  /* ── Resolve root-relative paths from any directory depth ────── */
  function rootRelative(path) {
    const parts = window.location.pathname.replace(/\/+$/, "").split("/");
    // depth = number of directory levels below the root
    // e.g. /index.html         → depth 0  → prefix "./"
    //      /installations/x.html → depth 1  → prefix "../"
    const depth = parts.length - 2;
    const prefix = depth > 0 ? "../".repeat(depth) : "./";
    return prefix + path.replace(/^\//, "");
  }

  /* ── Fetch and inject a component ───────────────────────────── */
  async function loadComponent(placeholderId, assetPath) {
    const el = document.getElementById(placeholderId);
    if (!el) return;
    try {
      const res = await fetch(rootRelative(assetPath));
      if (!res.ok) throw new Error(res.status);
      el.innerHTML = await res.text();
    } catch (e) {
      console.error("[components.js] Could not load", assetPath, e);
    }
  }

  /* ── Navigation helpers (exposed globally for onclick attrs) ── */

  /**
   * Navigates to a page relative to the SITE ROOT, regardless of
   * which subdirectory the current page is in.
   *
   * Usage in header.html:  onclick="go('installations/windows95.html')"
   */
  window.go = function (rootPath) {
    window.location.href = rootRelative(rootPath);
  };

  window.goHome = function () {
    window.location.href = rootRelative("index.html");
  };

  /* ── Dropdown toggle ─────────────────────────────────────────── */
  window.toggleMenu = function (id) {
    // Close all other open dropdowns first
    document.querySelectorAll(".dropdown").forEach(function (menu) {
      if (menu.id !== id) menu.style.display = "none";
    });
    var menu = document.getElementById(id);
    if (!menu) return;
    menu.style.display = menu.style.display === "flex" ? "none" : "flex";
  };

  /* ── Close dropdowns when clicking outside ───────────────────── */
  function bindOutsideClick() {
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".menu")) {
        document.querySelectorAll(".dropdown").forEach(function (menu) {
          menu.style.display = "none";
        });
      }
    });
  }

  /* ── Footer year ─────────────────────────────────────────────── */
  function setFooterYear() {
    var el = document.getElementById("footer-year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ── Bootstrap ───────────────────────────────────────────────── */
  async function init() {
    await Promise.all([
      loadComponent("site-header", "assets/header.html"),
      loadComponent("site-footer", "assets/footer.html"),
    ]);
    bindOutsideClick();
    setFooterYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
