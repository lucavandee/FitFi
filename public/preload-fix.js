/**
 * This script fixes the preload warning for fetch.worker.js
 * Add this to your index.html before the closing body tag
 */
(function() {
  // Check if the browser supports preload
  const supportsPreload = function() {
    try {
      return document.createElement('link').relList.supports('preload');
    } catch (e) {
      return false;
    }
  };

  // Only run if preload is supported
  if (supportsPreload()) {
    // Create a preload link for fetch.worker.js
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.href = '/fetch.worker.js';
    preloadLink.as = 'script';
    preloadLink.crossOrigin = 'anonymous';
    
    // Append to head
    document.head.appendChild(preloadLink);
  }
})();