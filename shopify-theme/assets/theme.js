/* LAB Prints — theme.js
   Shared behaviors: nav scroll, mobile menu, FAQ accordion, smooth scroll, PDP tabs/swatches.
   Shopify port: this becomes assets/theme.js, loaded in layout/theme.liquid. */

(function () {
  'use strict';

  // ---------- NAV SCROLL ----------
  var nav = document.getElementById('nav');
  if (nav) {
    var setNavState = function () {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', setNavState, { passive: true });
    setNavState();
  }

  // ---------- MOBILE MENU ----------
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('open');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mobileMenu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
  window.closeMobile = function () {
    if (mobileMenu) {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  // ---------- FAQ ACCORDION ----------
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.parentElement;
      var wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function (i) {
        i.classList.remove('open');
      });
      if (!wasOpen) item.classList.add('open');
    });
  });

  // ---------- SMOOTH ANCHOR SCROLL ----------
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      if (!href || href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---------- PDP TABS ----------
  document.querySelectorAll('[data-tabs]').forEach(function (tabs) {
    var triggers = tabs.querySelectorAll('.pdp-tab');
    var panels = tabs.querySelectorAll('.pdp-tab-panel');
    triggers.forEach(function (trigger, idx) {
      trigger.addEventListener('click', function () {
        triggers.forEach(function (t) { t.classList.remove('active'); });
        panels.forEach(function (p) { p.classList.remove('active'); });
        trigger.classList.add('active');
        if (panels[idx]) panels[idx].classList.add('active');
      });
    });
  });

  // ---------- PDP SWATCHES (single-select per group) ----------
  document.querySelectorAll('[data-swatch-group]').forEach(function (group) {
    var swatches = group.querySelectorAll('.pdp-swatch');
    swatches.forEach(function (swatch) {
      swatch.addEventListener('click', function () {
        swatches.forEach(function (s) { s.classList.remove('active'); });
        swatch.classList.add('active');
        var input = group.querySelector('input[type="hidden"]');
        if (input) input.value = swatch.dataset.value || swatch.textContent.trim();
      });
    });
  });

  // ---------- QUANTITY STEPPER (PDP) ----------
  document.querySelectorAll('[data-qty]').forEach(function (group) {
    var input = group.querySelector('input[type="number"]');
    if (!input) return;
    var min = parseInt(input.min || '1', 10);
    var max = parseInt(input.max || '999', 10);
    group.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var current = parseInt(input.value || '1', 10);
        if (btn.dataset.qty === 'inc' && current < max) input.value = current + 1;
        if (btn.dataset.qty === 'dec' && current > min) input.value = current - 1;
        input.dispatchEvent(new Event('change'));
      });
    });
  });
})();
