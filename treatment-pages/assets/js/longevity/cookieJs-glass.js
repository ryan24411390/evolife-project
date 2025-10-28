// Cookie Dialog System - Fixed Toggle Buttons
(function () {
  'use strict';

  // Prevent multiple installations
  if (window.cookieDialogInstalled) {
    return;
  }
  window.cookieDialogInstalled = true;

  // CSS Styles - FIXED
  const styles = `
  #cookie-consent-dialog {
      backdrop-filter: blur(10px);
      background: rgba(255, 255, 255, 0.9);
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      padding: 24px;
      width: 360px;
      max-width: 90%;
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      font-family: 'Segoe UI', sans-serif;
      color: #222;
      display: flex;
      flex-direction: column;
    }

  #essential-toggle,
  #analytics-toggle,
  #marketing-toggle {
      display: none; /* Hide the actual checkbox */
  }

    .cookied-consent-header-title {
      font-size: 20px;
      font-weight: 600;
      color: #111;
    }

    .cookied-consent-text {
      font-size: 14px;
      margin: 12px 0;
      color: #333;
    }

    .cookied-consent-link {
      color: #0056d2;
      text-decoration: underline;
    }

    .cookied-consent-buttons {
      display: flex;
      gap: 10px;
      margin-top: 16px;
      flex-wrap: wrap;
    }

    .cookied-accept-button {
      background-color: #0056d2;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 10px 12px;
      flex: 1;
      font-size: 14px;
      cursor: pointer;
    }

    .cookied-accept-button:hover {
      background-color: #003e99;
    }

    .cookied-decline-button,
    .cookied-customize-button {
      background-color: transparent;
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 10px 12px;
      flex: 1;
      font-size: 14px;
      color: #333;
      cursor: pointer;
    }

    .cookied-decline-button:hover,
    .cookied-customize-button:hover {
      background-color: #f0f0f0;
    }

    .cookied-preferences-container {
      display: none;
      margin-top: 16px;
      flex-direction: column;
      gap: 12px;
    }

    .cookied-preference-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
    }

    /* FIXED TOGGLE SWITCH STYLES */
    .cookied-switch {
      position: relative;
      display: inline-block;
      width: 56px;
      height: 28px;
    }

    .cookied-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      border-radius: 24px;
      transition: .3s;
    }

    .cookied-slider:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      border-radius: 50%;
      transition: .3s;
    }

    /* Active state styles */
    .cookied-toggle-active {
      background-color: #0056d2 !important;
    }

    .cookied-toggle-active:before {
      transform: translateX(28px);
    }

    /* Disabled state for essential cookies */
    .cookied-switch.disabled .cookied-slider {
      background-color: #333 !important;
      opacity: 0.7;
      cursor: not-allowed;
    }

    .cookied-save-button {
      background-color: #0056d2;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 10px;
      font-size: 14px;
      margin-top: 8px;
      cursor: pointer;
    }

    .cookied-save-button:hover {
      background-color: #003e99;
    }
`;

  // Create and inject styles
  function injectStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  // Create the dialog HTML - FIXED
  function createDialog() {
    const dialog = document.createElement('div');
    dialog.id = 'cookie-consent-dialog';
    dialog.innerHTML = `
      <div class="cookied-consent-header">
        <span class="cookied-consent-header-title">Cookie Settings</span>
      </div>
      
      <p class="cookied-consent-text">
        We use cookies to improve your experience and analyze traffic. Click "Accept All" to consent, or manage your preferences anytime.
      </p>

      <div class="cookied-consent-buttons">
        <button class="cookied-accept-button" id="cookie-accept">Accept All</button>
        <button class="cookied-decline-button" id="cookie-decline">Reject All</button>
        <button class="cookied-customize-button" id="cookie-customize">Customize</button>
      </div>

      <div class="cookied-preferences-container" id="cookie-preferences">
        <div class="cookied-preference-item">
          <span>Essential (Required)</span>
          <label class="cookied-switch disabled">
            <input type="checkbox" id="essential-toggle" checked disabled>
            <span class="cookied-slider cookied-toggle-active"></span>
          </label>
        </div>

        <div class="cookied-preference-item">
          <span>Analytics</span>
          <label class="cookied-switch">
            <input type="checkbox" id="analytics-toggle">
            <span class="cookied-slider" id="analytics-slider"></span>
          </label>
        </div>

        <div class="cookied-preference-item">
          <span>Marketing</span>
          <label class="cookied-switch">
            <input type="checkbox" id="marketing-toggle">
            <span class="cookied-slider" id="marketing-slider"></span>
          </label>
        </div>

        <button class="cookied-save-button" id="cookie-save">Save Preferences</button>
      </div>
    `;

    return dialog;
  }

  // Initialize the functionality - FIXED
  function initializeFunctionality() {
    const g = (id) => document.getElementById(id);

    // Cookie helpers - EXACT same as original
    const setCookie = (name, value, days = 365) => {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax; Secure`;
    };

    const getCookie = (name) => {
      const found = document.cookie.split('; ').find(row => row.startsWith(name + '='));
      return found ? decodeURIComponent(found.split('=')[1]) : null;
    };

    const deleteCookie = (name) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    };

    // EXACT same initialization as original
    const cpDefault = { essential: true, analytics: true, marketing: true };
    window.cp = { ...cpDefault };

    const consent = getCookie('cookieConsent');
    const timestamp = getCookie('cookieConsentTimestamp');
    const prefs = getCookie('cookiePreferences');
    const dialog = g('cookie-consent-dialog');
    const prefPanel = g('cookie-preferences');
    const expired = () => !timestamp || (Date.now() - parseInt(timestamp, 10)) > 1000 * 60 * 60 * 24 * 30;

    // ADDED: Update toggles function
    window.updateToggles = function() {
      const analyticsToggle = g('analytics-toggle');
      const marketingToggle = g('marketing-toggle');
      const analyticsSlider = g('analytics-slider');
      const marketingSlider = g('marketing-slider');

      if (analyticsToggle && analyticsSlider) {
        analyticsToggle.checked = window.cp.analytics;
        if (window.cp.analytics) {
          analyticsSlider.classList.add('cookied-toggle-active');
        } else {
          analyticsSlider.classList.remove('cookied-toggle-active');
        }
      }

      if (marketingToggle && marketingSlider) {
        marketingToggle.checked = window.cp.marketing;
        if (window.cp.marketing) {
          marketingSlider.classList.add('cookied-toggle-active');
        } else {
          marketingSlider.classList.remove('cookied-toggle-active');
        }
      }
    };

    // Load consent - EXACT same logic as original
    if (consent && timestamp && prefs && !expired()) {
      if (consent === 'accepted') {
        window.cp = { essential: true, analytics: true, marketing: true };
        window.loadAnalytics?.();
        window.loadMarketing?.();

      } else if (consent === 'declined') {
        window.cp = { ...cpDefault };
      } else if (consent === 'customized' && prefs) {
        try {
          window.cp = { ...window.cp, ...JSON.parse(prefs) };
          if (window.cp.analytics) window.loadAnalytics?.();
          if (window.cp.marketing) window.loadMarketing?.();

        } catch (e) {}
      }
      if (dialog) dialog.style.display = 'none';
    } else {
      ['cookieConsent', 'cookieConsentTimestamp', 'cookiePreferences'].forEach(deleteCookie);
      if (dialog) dialog.style.display = 'flex';
    }

    // EXACT same event handlers as original
    g('cookie-accept')?.addEventListener('click', () => {
      window.cp = { essential: true, analytics: true, marketing: true };
      setCookie('cookieConsent', 'accepted');
      setCookie('cookieConsentTimestamp', Date.now().toString());
      setCookie('cookiePreferences', JSON.stringify(window.cp));
      window.loadAnalytics?.();
      window.loadMarketing?.();
      if (dialog) dialog.style.display = 'none';
    });

    g('cookie-decline')?.addEventListener('click', () => {
      window.cp = { ...cpDefault };
      setCookie('cookieConsent', 'declined');
      setCookie('cookieConsentTimestamp', Date.now().toString());
      setCookie('cookiePreferences', JSON.stringify(window.cp));
      if (dialog) dialog.style.display = 'none';
    });

    g('cookie-customize')?.addEventListener('click', () => {
      if (prefPanel) {
        prefPanel.style.display = prefPanel.style.display === 'flex' ? 'none' : 'flex';
        if (prefPanel.style.display === 'flex') {
          window.updateToggles();
        }
      }
    });

    // FIXED: Toggle event handlers
    g('analytics-toggle')?.addEventListener('change', function () {
      window.cp.analytics = this.checked;
      const slider = g('analytics-slider');
      if (slider) {
        slider.classList.toggle('cookied-toggle-active', this.checked);
      }
    });
    
    g('marketing-toggle')?.addEventListener('change', function () {
      window.cp.marketing = this.checked;
      const slider = g('marketing-slider');
      if (slider) {
        slider.classList.toggle('cookied-toggle-active', this.checked);
      }
    });

    // ADDED: Click handlers for sliders to trigger checkbox changes
    g('analytics-slider')?.addEventListener('click', function(e) {
      e.preventDefault();
      const toggle = g('analytics-toggle');
      if (toggle) {
        toggle.checked = !toggle.checked;
        toggle.dispatchEvent(new Event('change'));
      }
    });

    g('marketing-slider')?.addEventListener('click', function(e) {
      e.preventDefault();
      const toggle = g('marketing-toggle');
      if (toggle) {
        toggle.checked = !toggle.checked;
        toggle.dispatchEvent(new Event('change'));
      }
    });

    g('cookie-save')?.addEventListener('click', () => {
      setCookie('cookieConsent', 'customized');
      setCookie('cookieConsentTimestamp', Date.now().toString());
      setCookie('cookiePreferences', JSON.stringify(window.cp));
      if (window.cp.analytics) window.loadAnalytics?.();
      if (window.cp.marketing) window.loadMarketing?.();
      if (dialog) dialog.style.display = 'none';
    });

    // Initialize toggle states
    setTimeout(() => {
      window.updateToggles();
    }, 50);
  }

  // Public API for manual control
  window.CookieDialog = {
    show: function () {
      const dialog = document.getElementById('cookie-consent-dialog');
      if (dialog) {
        dialog.style.display = 'flex';
      }
    },

    hide: function () {
      const dialog = document.getElementById('cookie-consent-dialog');
      if (dialog) {
        dialog.style.display = 'none';
      }
    },

    getConsent: function () {
      return window.cp || null;
    },

    hasConsent: function () {
      const getCookie = (name) => {
        const found = document.cookie.split('; ').find(row => row.startsWith(name + '='));
        return found ? decodeURIComponent(found.split('=')[1]) : null;
      };
      return getCookie('cookieConsent') !== null;
    },

    resetConsent: function () {
      const deleteCookie = (name) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      };
      ['cookieConsent', 'cookieConsentTimestamp', 'cookiePreferences'].forEach(deleteCookie);
      const dialog = document.getElementById('cookie-consent-dialog');
      if (dialog) {
        dialog.style.display = 'flex';
      }
    }
  };

  // Initialize the complete system
  function init() {
    injectStyles();
    const dialog = createDialog();
    document.body.appendChild(dialog);

    // Initialize functionality after DOM is ready
    setTimeout(() => {
      initializeFunctionality();
    }, 10);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

