class OfflineService {
  constructor() {
    this.dbName = 'agriMarketplaceDB';
    this.dbVersion = 1;
    this.db = null;
    this.initDB();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create stores for different data types
        if (!db.objectStoreNames.contains('forms')) {
          const formStore = db.createObjectStore('forms', { keyPath: 'id', autoIncrement: true });
          formStore.createIndex('timestamp', 'timestamp', { unique: false });
          formStore.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains('crops')) {
          const cropStore = db.createObjectStore('crops', { keyPath: '_id' });
          cropStore.createIndex('farmerId', 'farmerId', { unique: false });
        }

        if (!db.objectStoreNames.contains('orders')) {
          const orderStore = db.createObjectStore('orders', { keyPath: '_id' });
          orderStore.createIndex('buyerId', 'buyerId', { unique: false });
          orderStore.createIndex('farmerId', 'farmerId', { unique: false });
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('action', 'action', { unique: false });
        }
      };
    });
  }

  // Save form data when offline
  async saveFormData(formData, formType) {
    if (!this.db) await this.initDB();
    
    const transaction = this.db.transaction(['forms'], 'readwrite');
    const store = transaction.objectStore('forms');
    
    const data = {
      type: formType,
      data: formData,
      timestamp: Date.now(),
      synced: false
    };

    return new Promise((resolve, reject) => {
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all unsaved form data
  async getUnsavedForms() {
    if (!this.db) await this.initDB();
    
    const transaction = this.db.transaction(['forms'], 'readonly');
    const store = transaction.objectStore('forms');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result.filter(form => !form.synced));
      request.onerror = () => reject(request.error);
    });
  }

  // Mark form as synced
  async markFormAsSynced(formId) {
    if (!this.db) await this.initDB();
    
    const transaction = this.db.transaction(['forms'], 'readwrite');
    const store = transaction.objectStore('forms');
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(formId);
      getRequest.onsuccess = () => {
        const form = getRequest.result;
        if (form) {
          form.synced = true;
          form.syncedAt = Date.now();
          const updateRequest = store.put(form);
          updateRequest.onsuccess = () => resolve(updateRequest.result);
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Form not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Save crop data for offline access
  async saveCrops(crops) {
    if (!this.db) await this.initDB();
    
    const transaction = this.db.transaction(['crops'], 'readwrite');
    const store = transaction.objectStore('crops');
    
    const promises = crops.map(crop => {
      return new Promise((resolve, reject) => {
        const request = store.put(crop);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });

    return Promise.all(promises);
  }

  // Get cached crops
  async getCachedCrops() {
    if (!this.db) await this.initDB();
    
    const transaction = this.db.transaction(['crops'], 'readonly');
    const store = transaction.objectStore('crops');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Add action to sync queue
  async addToSyncQueue(action, data) {
    if (!this.db) await this.initDB();
    
    const transaction = this.db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    
    const syncData = {
      action,
      data,
      timestamp: Date.now(),
      attempts: 0
    };

    return new Promise((resolve, reject) => {
      const request = store.add(syncData);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all items in sync queue
  async getSyncQueue() {
    if (!this.db) await this.initDB();
    
    const transaction = this.db.transaction(['syncQueue'], 'readonly');
    const store = transaction.objectStore('syncQueue');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Remove item from sync queue
  async removeFromSyncQueue(id) {
    if (!this.db) await this.initDB();
    
    const transaction = this.db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Clear all synced data (for cleanup)
  async clearSyncedData() {
    if (!this.db) await this.initDB();
    
    const stores = ['forms', 'syncQueue'];
    const transactions = stores.map(storeName => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });

    return Promise.all(transactions);
  }

  // Get storage usage
  async getStorageUsage() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage,
        available: estimate.quota,
        percentage: (estimate.usage / estimate.quota * 100).toFixed(2)
      };
    }
    return null;
  }
}

export default new OfflineService();
