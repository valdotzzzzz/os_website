/**
 * components.js
 * Loads header.html and footer.html from /assets/, wires up nav logic.
 *
 * Path resolution: we derive the site root from this script's own absolute
 * src URL — browsers always resolve script.src to an absolute URL, so
 * stripping "assets/js/components.js" from the end gives the correct base
 * regardless of how deep the calling page is in the directory tree.
 * This works on localhost AND on GitHub Pages (where the repo name adds
 * an extra path segment that breaks depth-counting approaches).
 */
(function () {
  "use strict";

  /* ── Derive site base URL from this script's absolute src ───── */
  function getBase() {
    var scripts = document.querySelectorAll("script[src]");
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src.indexOf("components.js") !== -1) {
        return scripts[i].src.replace("assets/js/components.js", "");
      }
    }
    return "./";
  }

  var BASE = getBase();

  /* ── Build a URL relative to the site root ───────────────────── */
  function siteUrl(path) {
    return BASE + path.replace(/^\//, "");
  }

  /* ── Fetch and inject a component ───────────────────────────── */
  async function loadComponent(placeholderId, assetPath) {
    var el = document.getElementById(placeholderId);
    if (!el) return;
    try {
      var res = await fetch(siteUrl(assetPath));
      if (!res.ok) throw new Error(res.status);
      el.innerHTML = await res.text();
    } catch (e) {
      console.error("[components.js] Could not load", assetPath, e);
    }
  }

  /* ── Navigation helpers (global, called by onclick in header) ── */
  window.go = function (rootPath) {
    window.location.href = siteUrl(rootPath);
  };

  window.goHome = function () {
    window.location.href = siteUrl("index.html");
  };

  /* ── Dropdown toggle ─────────────────────────────────────────── */
  window.toggleMenu = function (id) {
    document.querySelectorAll(".dropdown").forEach(function (menu) {
      if (menu.id !== id) menu.style.display = "none";
    });
    var menu = document.getElementById(id);
    if (!menu) return;
    menu.style.display = menu.style.display === "flex" ? "none" : "flex";
  };

  /* ── Close dropdowns on outside click ───────────────────────── */
  function bindOutsideClick() {
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".menu")) {
        document.querySelectorAll(".dropdown").forEach(function (m) {
          m.style.display = "none";
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
