/**
 * JonTech Electronics - Storefront Core JS
 * Minimal, fast, accessible vanilla JavaScript
 */

(function () {
  'use strict';

  // Mobile Navigation Toggle
  function initMobileNav() {
    const toggleBtn = document.querySelector('[data-mobile-menu-toggle]');
    const navMenu = document.querySelector('[data-site-nav]');
    if (!toggleBtn || !navMenu) return;

    toggleBtn.addEventListener('click', function () {
      const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('site-nav--open');
      document.body.classList.toggle('nav-locked', !isExpanded);
    });
  }

  // Cart Form Handler (AJAX Add-To-Cart & Feedback)
  function initCartForms() {
    document.addEventListener('submit', function (e) {
      const form = e.target.closest('[data-product-form]');
      if (!form) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      if (!submitBtn) return;

      // Let normal POST occur unless fetch cart is explicitly desired
      // We also display a responsive click state
      const originalText = submitBtn.innerHTML;
      submitBtn.classList.add('btn--loading');
      submitBtn.disabled = true;

      // Allow quick submission or fallback
      setTimeout(function () {
        submitBtn.classList.remove('btn--loading');
        submitBtn.disabled = false;
      }, 1200);
    });
  }

  // Quantity Selectors
  function initQuantitySelectors() {
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-qty-btn]');
      if (!btn) return;

      const wrapper = btn.closest('[data-qty-wrapper]');
      if (!wrapper) return;

      const input = wrapper.querySelector('input[type="number"]');
      if (!input) return;

      const step = btn.dataset.qtyBtn === 'plus' ? 1 : -1;
      const min = parseInt(input.getAttribute('min') || '1', 10);
      let currentVal = parseInt(input.value || '1', 10);
      const newVal = Math.max(min, currentVal + step);

      input.value = newVal;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  // Enforce Philippine Peso (₱) across any dynamic or static price elements
  function enforcePesoCurrency() {
    const priceSelectors = [
      '.price-current',
      '.price-compare',
      '.price-container',
      '.cart-table td',
      '.cart-summary-row span',
      '.product-info__price-block',
      '[data-price]'
    ];

    document.querySelectorAll(priceSelectors.join(',')).forEach(function (el) {
      if (el.children.length === 0 && el.textContent && el.textContent.includes('$')) {
        el.textContent = el.textContent.replace(/\$/g, '₱');
      }
    });
  }

  // Accordion Toggles
  function initAccordions() {
    document.addEventListener('click', function (e) {
      const header = e.target.closest('.specs-tab-header');
      if (!header) return;
      const content = header.nextElementSibling;
      if (content && content.classList.contains('specs-tab-content')) {
        const isHidden = content.style.display === 'none';
        content.style.display = isHidden ? 'block' : 'none';
        const arrow = header.querySelector('span:last-child');
        if (arrow) arrow.textContent = isHidden ? '▾' : '▸';
      }
    });
  }

  // Initialize all theme handlers on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initCartForms();
    initQuantitySelectors();
    initAccordions();
    enforcePesoCurrency();

    // Re-verify currency if DOM dynamically mutates (e.g. cart adjustments)
    if ('MutationObserver' in window) {
      const observer = new MutationObserver(function () {
        enforcePesoCurrency();
      });
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    }
  });
})();
