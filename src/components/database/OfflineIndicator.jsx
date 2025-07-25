import React from 'react';
import { useApp } from '../AppProvider';  // ✅ Correct path
import { WifiOff } from 'lucide-react';   // ✅ Removed unused Download import

export const OfflineIndicator = () => {
  const { connectionStatus } = useApp();

  if (connectionStatus.isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm z-50">
      <div className="flex items-center justify-center space-x-2">
        <WifiOff className="w-4 h-4" />
        <span>You're offline. Changes will sync when reconnected.</span>
      </div>
    </div>
  );
};