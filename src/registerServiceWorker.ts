export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/serviceWorker.js')
        .then(registration => {
          console.log('[ServiceWorker] Registration successful with scope:', registration.scope);
        })
        .catch(error => {
          console.error('[ServiceWorker] Registration failed:', error);
          // Don't throw error to prevent app crashes due to SW issues
        });
    });
  } else {
    console.log('[ServiceWorker] Not supported in this browser');
  }
}

export default registerServiceWorker;