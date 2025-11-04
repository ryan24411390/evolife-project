/**
 * ===================================================================
 * NAVIGATION JAVASCRIPT
 * Minimal vanilla JS for navbar and footer interactions
 * Evolife Wellness Design System
 * ===================================================================
 *
 * Features:
 * - Mobile menu toggle
 * - Scroll shrink effect
 * - Dropdown interactions
 * - Back to top button
 * - Auto-update copyright year
 * - Keyboard navigation support (Esc to close)
 * - No external dependencies
 *
 * Total: ~60 lines of clean code
 * ===================================================================
 */

(function() {
  'use strict';

  // ===================================================================
  // MOBILE MENU TOGGLE
  // ===================================================================

  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navOverlay = document.getElementById('nav-overlay');
  const body = document.body;

  if (navToggle && navMenu && navOverlay) {
    // Toggle menu on button click
    navToggle.addEventListener('click', function() {
      const isOpen = navMenu.classList.contains('is-open');

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close menu when clicking overlay
    navOverlay.addEventListener('click', closeMenu);

    // Close menu on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
        closeMenu();
      }
    });

    function openMenu() {
      navMenu.classList.add('is-open');
      navToggle.classList.add('is-active');
      navOverlay.classList.add('is-visible');
      navToggle.setAttribute('aria-expanded', 'true');
      body.style.overflow = 'hidden'; // Prevent scroll
    }

    function closeMenu() {
      navMenu.classList.remove('is-open');
      navToggle.classList.remove('is-active');
      navOverlay.classList.remove('is-visible');
      navToggle.setAttribute('aria-expanded', 'false');
      body.style.overflow = ''; // Restore scroll
    }
  }

  // ===================================================================
  // DROPDOWN MENU (Mobile)
  // ===================================================================

  const dropdown = document.getElementById('treatments-dropdown');
  if (dropdown) {
    const dropdownButton = dropdown.querySelector('button');
    const dropdownMenu = dropdown.querySelector('.nav__dropdown-menu');

    if (dropdownButton && dropdownMenu) {
      dropdownButton.addEventListener('click', function(e) {
        e.preventDefault();
        const isOpen = dropdown.classList.contains('is-open');

        dropdown.classList.toggle('is-open');
        dropdownButton.setAttribute('aria-expanded', !isOpen);
      });
    }
  }

  // ===================================================================
  // SCROLL SHRINK EFFECT
  // ===================================================================

  const nav = document.getElementById('main-nav');
  let lastScroll = 0;

  if (nav) {
    window.addEventListener('scroll', function() {
      const currentScroll = window.pageYOffset;

      // Add shrink class when scrolled down more than 80px
      if (currentScroll > 80) {
        nav.classList.add('nav--shrink');
      } else {
        nav.classList.remove('nav--shrink');
      }

      lastScroll = currentScroll;
    });
  }

  // ===================================================================
  // BACK TO TOP BUTTON
  // ===================================================================

  const backToTop = document.getElementById('back-to-top');

  if (backToTop) {
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        backToTop.classList.add('is-visible');
      } else {
        backToTop.classList.remove('is-visible');
      }
    });

    // Smooth scroll to top on click
    backToTop.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ===================================================================
  // AUTO-UPDATE COPYRIGHT YEAR
  // ===================================================================

  const copyrightYear = document.getElementById('copyright-year');
  if (copyrightYear) {
    copyrightYear.textContent = new Date().getFullYear();
  }

  // ===================================================================
  // ACTIVE LINK HIGHLIGHTING
  // ===================================================================

  // Get current page path
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop() || 'index.html';

  // Find and mark active link
  const navLinks = document.querySelectorAll('.nav__menu a');
  navLinks.forEach(function(link) {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPage ||
        (currentPage === '' && linkPath === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ===================================================================
  // CLOSE DROPDOWN ON OUTSIDE CLICK (Desktop)
  // ===================================================================

  document.addEventListener('click', function(e) {
    if (dropdown && !dropdown.contains(e.target)) {
      dropdown.classList.remove('is-open');
      const button = dropdown.querySelector('button');
      if (button) {
        button.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // ===================================================================
  // ACCORDION FUNCTIONALITY (FAQ Section)
  // ===================================================================

  /**
   * Toggle accordion open/closed state
   * Exposed to global scope for inline onclick handlers
   * @param {HTMLElement} button - The accordion button that was clicked
   */
  window.toggleAccordion = function(button) {
    if (!button) return;

    const content = button.nextElementSibling;
    if (!content) return;

    const isOpen = button.classList.contains('active');

    // Close all other accordions (single-open mode)
    // Comment out this block if you want multiple accordions open at once
    document.querySelectorAll('.accordion__header.active').forEach(function(item) {
      if (item !== button) {
        item.classList.remove('active');
        const itemContent = item.nextElementSibling;
        if (itemContent) {
          itemContent.classList.remove('active');
        }
      }
    });

    // Toggle current accordion
    button.classList.toggle('active');
    content.classList.toggle('active');

    // Update ARIA attribute for accessibility
    button.setAttribute('aria-expanded', !isOpen);
  };

})();
