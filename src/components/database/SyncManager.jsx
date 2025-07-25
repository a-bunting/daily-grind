import React, { useState, useEffect } from 'react';
import { useApp } from '../AppProvider';
import apiService from '../../utils/apiService';

export const SyncManager = () => {
  const { connectionStatus, syncStatus, setSyncStatus } = useApp();
  const [syncStats, setSyncStats] = useState({ pending: 0, total: 0 });
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    if (connectionStatus.isAuthenticated && connectionStatus.isOnline) {
      checkSyncStatus();
    }
  }, [connectionStatus]);

  useEffect(() => {
    const handleRetrySync = () => {
      performSync();
    };

    window.addEventListener('retrySync', handleRetrySync);
    return () => window.removeEventListener('retrySync', handleRetrySync);
  }, []);

  const checkSyncStatus = async () => {
    try {
      const response = await fetch(`${apiService.API_BASE_URL}/sync/status`, {
        headers: {
          'Authorization': `Bearer ${apiService.token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSyncStats({ pending: data.pending_items, total: data.pending_items });
      }
    } catch (error) {
      console.error('Failed to check sync status:', error);
    }
  };

  const performSync = async () => {
    if (!connectionStatus.isAuthenticated || !connectionStatus.isOnline) {
      return;
    }

    setSyncStatus('syncing');
    
    try {
      await apiService.processSyncQueue();
      setLastSync(new Date());
      setSyncStats({ pending: 0, total: syncStats.total });
      setSyncStatus('idle');
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
    }
  };

  // Auto-sync when coming online
  useEffect(() => {
    if (connectionStatus.isOnline && connectionStatus.isAuthenticated && syncStats.pending > 0) {
      performSync();
    }
  }, [connectionStatus.isOnline]);

  return null; // This component manages sync logic but doesn't render UI
};