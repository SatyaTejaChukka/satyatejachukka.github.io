/**
 * Service Worker Registration Utility
 * Handles registration, updates, and offline status
 */

export const registerServiceWorker = async () => {
  // Never run or register Service Worker in dev mode to prevent stale bundle caching!
  if (import.meta.env.DEV) {
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      } catch (e) {
        console.warn('[SW] Could not unregister SW in dev:', e);
      }
    }
    if ('caches' in window) {
      try {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      } catch (e) {
        console.warn('[SW] Could not clear caches in dev:', e);
      }
    }
    console.log('[SW] Dev mode: Service Worker and caches disabled');
    return null;
  }

  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service workers not supported');
    return null;
  }

  try {
    // Use the base path for GitHub Pages deployment
    const basePath = import.meta.env.BASE_URL || '/';
    const swUrl = `${basePath}sw.js`;
    
    const registration = await navigator.serviceWorker.register(swUrl, {
      scope: basePath,
    });

    console.log('[SW] Service worker registered:', registration.scope);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('[SW] Update found, installing...');

      newWorker?.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New content available
          console.log('[SW] New content available, refresh to update');
          
          // Optionally dispatch event for UI to show update prompt
          window.dispatchEvent(new CustomEvent('swUpdate', { detail: registration }));
        }
      });
    });

    return registration;
  } catch (error) {
    console.error('[SW] Registration failed:', error);
    return null;
  }
};

/**
 * Check if app is running offline
 */
export const isOffline = () => !navigator.onLine;

/**
 * Listen for online/offline status changes
 */
export const onOnlineStatusChange = (callback) => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

/**
 * Request persistent storage (for better caching)
 */
export const requestPersistentStorage = async () => {
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persist();
    console.log(`[SW] Persistent storage ${isPersisted ? 'granted' : 'denied'}`);
    return isPersisted;
  }
  return false;
};
