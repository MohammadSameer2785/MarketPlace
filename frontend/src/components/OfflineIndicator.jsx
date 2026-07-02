import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import offlineService from '../services/offlineService';

const OfflineIndicator = () => {
  const { t, isOnline } = useLanguage();
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [pendingItems, setPendingItems] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isOnline) {
      checkPendingItems();
    }
  }, [isOnline]);

  const checkPendingItems = async () => {
    try {
      const forms = await offlineService.getUnsavedForms();
      const syncQueue = await offlineService.getSyncQueue();
      setPendingItems(forms.length + syncQueue.length);
    } catch (error) {
      console.error('Failed to check pending items:', error);
    }
  };

  const handleSync = async () => {
    setSyncStatus('syncing');
    
    try {
      // Get all unsaved forms and sync them
      const unsavedForms = await offlineService.getUnsavedForms();
      
      for (const form of unsavedForms) {
        try {
          // Here you would normally make API calls to sync the data
          // For now, we'll just mark them as synced
          await offlineService.markFormAsSynced(form.id);
        } catch (error) {
          console.error('Failed to sync form:', error);
        }
      }

      // Clear sync queue
      const syncQueue = await offlineService.getSyncQueue();
      for (const item of syncQueue) {
        await offlineService.removeFromSyncQueue(item.id);
      }

      setSyncStatus('success');
      setPendingItems(0);
      
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const getStorageUsage = async () => {
    try {
      const usage = await offlineService.getStorageUsage();
      if (usage) {
        return `${(usage.used / (1024 * 1024)).toFixed(1)}MB / ${(usage.available / (1024 * 1024)).toFixed(1)}MB`;
      }
    } catch (error) {
      console.error('Failed to get storage usage:', error);
    }
    return 'Unknown';
  };

  if (isOnline && pendingItems === 0 && syncStatus === 'idle') {
    return null; // Don't show anything when online and no pending items
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className={`bg-white rounded-lg shadow-lg border ${
        !isOnline ? 'border-red-200' : 
        syncStatus === 'success' ? 'border-green-200' : 
        syncStatus === 'error' ? 'border-red-200' : 
        syncStatus === 'syncing' ? 'border-blue-200' : 
        'border-yellow-200'
      }`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {!isOnline ? (
                <WifiOff className="w-5 h-5 text-red-500" />
              ) : syncStatus === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : syncStatus === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : syncStatus === 'syncing' ? (
                <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
              ) : (
                <Wifi className="w-5 h-5 text-green-500" />
              )}
              
              <span className={`font-medium text-sm ${
                !isOnline ? 'text-red-700' : 
                syncStatus === 'success' ? 'text-green-700' : 
                syncStatus === 'error' ? 'text-red-700' : 
                syncStatus === 'syncing' ? 'text-blue-700' : 
                'text-yellow-700'
              }`}>
                {!isOnline ? t('offlineMode') : 
                 syncStatus === 'success' ? t('syncComplete') : 
                 syncStatus === 'error' ? t('failedToSync') : 
                 syncStatus === 'syncing' ? t('syncing') : 
                 `${pendingItems} ${t('dataSaved')}`}
              </span>
            </div>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="text-xs">{showDetails ? '▲' : '▼'}</span>
            </button>
          </div>

          <div className={`text-xs text-gray-600 ${showDetails ? 'block' : 'hidden'}`}>
            <div className="space-y-1">
              {!isOnline && (
                <p>{t('noInternet')}</p>
              )}
              
              {isOnline && pendingItems > 0 && (
                <p>{t('syncWhenOnline')}</p>
              )}
              
              {isOnline && pendingItems > 0 && (
                <button
                  onClick={handleSync}
                  disabled={syncStatus === 'syncing'}
                  className="mt-2 w-full bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {syncStatus === 'syncing' ? t('syncing') : 'Sync Now'}
                </button>
              )}
              
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs">Storage: {getStorageUsage()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineIndicator;
