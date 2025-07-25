import React, { useState, useEffect } from 'react';
import { useApp } from '../AppProvider';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export const ConnectionStatusBar = () => {
  const { connectionStatus, syncStatus, user, logout } = useApp();
  const [showDetails, setShowDetails] = useState(false);

  const getStatusInfo = () => {
    if (!connectionStatus.isAuthenticated) {
      return {
        icon: <CloudOff className="w-4 h-4" />,
        text: 'Guest Mode',
        subtext: 'Data saved locally',
        color: 'text-gray-600 bg-gray-100',
        details: 'You\'re using the app without an account. Your data is saved locally and won\'t sync across devices.'
      };
    }

    if (!connectionStatus.isOnline) {
      return {
        icon: <WifiOff className="w-4 h-4" />,
        text: 'Offline',
        subtext: 'Changes will sync when connected',
        color: 'text-yellow-700 bg-yellow-100',
        details: 'You\'re offline but can continue using the app. All changes will be saved locally and synced when you reconnect.'
      };
    }

    if (syncStatus === 'syncing') {
      return {
        icon: <RefreshCw className="w-4 h-4 animate-spin" />,
        text: 'Syncing',
        subtext: 'Uploading changes...',
        color: 'text-blue-700 bg-blue-100',
        details: 'Currently syncing your latest changes to the server.'
      };
    }

    if (syncStatus === 'error') {
      return {
        icon: <AlertCircle className="w-4 h-4" />,
        text: 'Sync Error',
        subtext: 'Tap to retry',
        color: 'text-red-700 bg-red-100',
        details: 'There was an error syncing your data. Your changes are saved locally. Tap to retry syncing.'
      };
    }

    if (connectionStatus.hasPendingSync) {
      return {
        icon: <Cloud className="w-4 h-4" />,
        text: 'Pending Sync',
        subtext: 'Changes waiting to upload',
        color: 'text-orange-700 bg-orange-100',
        details: 'Some changes are waiting to be synced to the server.'
      };
    }

    return {
      icon: <CheckCircle className="w-4 h-4" />,
      text: 'Synced',
      subtext: `Logged in as ${user?.username || 'User'}`,
      color: 'text-green-700 bg-green-100',
      details: 'All your data is synced and up to date across all devices.'
    };
  };

  const statusInfo = getStatusInfo();

  const handleStatusClick = () => {
    if (syncStatus === 'error') {
      // Trigger retry sync
      window.dispatchEvent(new CustomEvent('retrySync'));
    } else {
      setShowDetails(!showDetails);
    }
  };

  return (
    <div className="relative">
      <div 
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${statusInfo.color} hover:opacity-80`}
        onClick={handleStatusClick}
      >
        {statusInfo.icon}
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-medium truncate">{statusInfo.text}</span>
          <span className="text-xs opacity-75 truncate">{statusInfo.subtext}</span>
        </div>
      </div>

      {showDetails && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
          <p className="text-sm text-gray-700 mb-3">{statusInfo.details}</p>
          
          {connectionStatus.isAuthenticated && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Status:</span>
                <span className={connectionStatus.isOnline ? 'text-green-600' : 'text-red-600'}>
                  {connectionStatus.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Account:</span>
                <span className="text-gray-700">{user?.username}</span>
              </div>
              
              {connectionStatus.hasPendingSync && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Pending:</span>
                  <span className="text-orange-600">Yes</span>
                </div>
              )}
              
              <div className="pt-2 border-t border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    logout();
                    setShowDetails(false);
                  }}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-2 pt-2 border-t border-gray-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(false);
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};