/**
 * EVOLIFE V1 - Offline Form Handler
 * Stores form submissions in localStorage when offline
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'evolife_form_submissions';

  // Initialize form handling on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFormHandler);
  } else {
    initFormHandler();
  }

  function initFormHandler() {
    // Intercept all form submissions
    document.addEventListener('submit', handleFormSubmit, true);

    // Add offline indicator
    addOfflineIndicator();

    console.log('✓ EVOLIFE Form Handler: Offline mode active');
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;

    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }

    const submission = {
      timestamp: new Date().toISOString(),
      formId: form.id || `form-${Date.now()}`,
      formAction: form.action || window.location.href,
      formName: form.name || 'unnamed',
      data: data
    };

    try {
      const submissions = getSubmissions();
      submissions.push(submission);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
      showMessage(form, 'success', '✓ Form saved locally (offline mode)');
      form.reset();
      console.log('Form submission saved:', submission);
    } catch (error) {
      showMessage(form, 'error', '✗ Error saving form. Please try again.');
      console.error('Form save error:', error);
    }

    return false;
  }

  function getSubmissions() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading stored submissions:', error);
      return [];
    }
  }

  function showMessage(form, type, message) {
    // Remove existing messages
    const existing = form.querySelector('.form-message');
    if (existing) existing.remove();

    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `form-message form-message-${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
      padding: 12px 16px;
      margin: 16px 0;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      ${type === 'success' ?
        'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' :
        'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
      }
    `;

    // Insert message
    if (form.firstChild) {
      form.insertBefore(messageEl, form.firstChild);
    } else {
      form.appendChild(messageEl);
    }

    // Auto-remove after 5 seconds
    setTimeout(() => messageEl.remove(), 5000);
  }

  function addOfflineIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'offline-indicator';
    indicator.textContent = '📴 Offline Mode - Forms save to localStorage';
    indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #2196F3;
      color: white;
      padding: 10px 16px;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 9999;
      opacity: 0.9;
    `;
    document.body.appendChild(indicator);
  }

  // Expose utility functions to window for console access
  window.getOfflineFormSubmissions = function() {
    const submissions = getSubmissions();
    console.table(submissions);
    return submissions;
  };

  window.exportOfflineFormSubmissions = function() {
    const submissions = getSubmissions();
    const dataStr = JSON.stringify(submissions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `form-submissions-${Date.now()}.json`;
    link.click();
    console.log(`✓ Exported ${submissions.length} form submissions`);
  };

  window.clearOfflineFormSubmissions = function() {
    if (confirm('Clear all stored form submissions?')) {
      localStorage.removeItem(STORAGE_KEY);
      console.log('✓ All form submissions cleared');
      return true;
    }
    return false;
  };

  console.log('Form Handler Utilities:');
  console.log('  - getOfflineFormSubmissions()    View all stored forms');
  console.log('  - exportOfflineFormSubmissions() Download as JSON');
  console.log('  - clearOfflineFormSubmissions()  Clear all stored forms');

})();
