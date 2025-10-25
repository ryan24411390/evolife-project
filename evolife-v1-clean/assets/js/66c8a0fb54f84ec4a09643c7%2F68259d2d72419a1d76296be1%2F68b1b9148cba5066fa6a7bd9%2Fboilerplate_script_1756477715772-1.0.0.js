// Dummy tracking functions to prevent errors
if (typeof gtag === 'undefined') { window.gtag = function(){}; }
if (typeof fbq === 'undefined') { window.fbq = function(){}; }
if (typeof ga === 'undefined') { window.ga = function(){}; }
if (typeof dataLayer === 'undefined') { window.dataLayer = []; }

window.cp={essential:!0,analytics:!0,marketing:!0};
    function loadAnalytics() {
     if (!window.cp?.analytics) return;
      
         if(!document.querySelector('script[src*="googletagmanager.com/gtag/js?id=G-S0EQYY866Z"]')){let a=document.createElement("script");a.async=!0,a.src="https://www.googletagmanager.com/gtag/js?id=G-S0EQYY866Z",document.head.appendChild(a);let t=document.createElement("script");t.text="window.dataLayer=window.dataLayer||[];function /* tracking call removed */{/* tracking call removed */(arguments);}/* tracking call removed */);/* tracking call removed */;",document.head.appendChild(t)}
        
    }
    function loadMarketing() {
      if (!window.cp?.marketing) return;
      
    }
    function updateToggles(){let e=e=>document.getElementById(e),t=e("analytics-toggle"),g=e("analytics-slider"),a=e("marketing-toggle"),i=e("marketing-slider");t&&(t.checked=window.cp.analytics),g&&g.classList.toggle("cookied-toggle-active",window.cp.analytics),a&&(a.checked=window.cp.marketing),i&&i.classList.toggle("cookied-toggle-active",window.cp.marketing)}
      window.loadAnalytics=loadAnalytics,window.loadMarketing=loadMarketing,window.updateToggles=updateToggles;