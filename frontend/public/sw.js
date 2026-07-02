const CACHE_NAME = 'agri-marketplace-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch Event - Network first, then cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle API requests differently
  if (url.pathname.startsWith('/api/')) {
    // For API requests, try network first, then return cached or offline response
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached response if network fails
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // Return offline response for API requests
              if (url.pathname.includes('/crops')) {
                return new Response(JSON.stringify([]), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' }
                });
              }
              
              return new Response(JSON.stringify({ 
                error: 'Offline mode - data not available',
                offline: true 
              }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              });
            });
        })
    );
  } else {
    // For static assets, use cache first strategy
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version or fetch from network
          return response || fetch(event.request);
        })
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Push notifications (optional)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('AgriMarketplace', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Background sync function
async function doBackgroundSync() {
  try {
    // Get all pending sync actions from IndexedDB
    const pendingActions = await getPendingSyncActions();
    
    for (const action of pendingActions) {
      try {
        await performSyncAction(action);
        await removeSyncAction(action.id);
      } catch (error) {
        console.error('Failed to sync action:', error);
        // Increment attempt count and retry later
        action.attempts = (action.attempts || 0) + 1;
        if (action.attempts < 3) {
          await updateSyncAction(action);
        } else {
          await removeSyncAction(action.id);
        }
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Helper functions for IndexedDB operations
async function getPendingSyncActions() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('agriMarketplaceDB', 1);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    request.onerror = () => reject(request.error);
  });
}

async function performSyncAction(action) {
  const { action: actionType, data } = action;
  
  switch (actionType) {
    case 'register':
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      break;
      
    case 'addCrop':
      await fetch('/api/crops', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.token}`
        },
        body: JSON.stringify(data.formData)
      });
      break;
      
    case 'updateCrop':
      await fetch(`/api/crops/${data.cropId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.token}`
        },
        body: JSON.stringify(data.formData)
      });
      break;
      
    case 'deleteCrop':
      await fetch(`/api/crops/${data.cropId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${data.token}`
        }
      });
      break;
      
    case 'placeOrder':
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.token}`
        },
        body: JSON.stringify(data.orderData)
      });
      break;
      
    default:
      throw new Error(`Unknown action type: ${actionType}`);
  }
}

async function removeSyncAction(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('agriMarketplaceDB', 1);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
    request.onerror = () => reject(request.error);
  });
}

async function updateSyncAction(action) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('agriMarketplaceDB', 1);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const putRequest = store.put(action);
      
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };
    request.onerror = () => reject(request.error);
  });
}
