import React, { useState } from 'react';
import { useApp } from '../AppProvider';
import { Database, ArrowRight, CheckCircle } from 'lucide-react';

export const DataMigrationModal = ({ isOpen, onClose, onComplete }) => {
  const [migrationStatus, setMigrationStatus] = useState('pending'); // 'pending', 'migrating', 'complete', 'error'
  const [migrationDetails, setMigrationDetails] = useState({
    tasks: 0,
    categories: 0,
    goals: 0,
    sections: 0
  });

  const startMigration = async () => {
    setMigrationStatus('migrating');
    
    try {
      // The migration happens automatically in hybridStorage.migrateLocalStorageToAPI()
      // This modal just provides user feedback
      
      setTimeout(() => {
        setMigrationStatus('complete');
        setTimeout(() => {
          onComplete();
        }, 2000);
      }, 3000);
      
    } catch (error) {
      setMigrationStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="text-center">
          <Database className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          
          {migrationStatus === 'pending' && (
            <>
              <h2 className="text-xl font-bold mb-2">Migrate Your Data</h2>
              <p className="text-gray-600 mb-4">
                We'll securely transfer your local data to your new account so you can access it from any device.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Local Storage</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span>Cloud Account</span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={startMigration}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Start Migration
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Skip
                </button>
              </div>
            </>
          )}
          
          {migrationStatus === 'migrating' && (
            <>
              <h2 className="text-xl font-bold mb-2">Migrating Data...</h2>
              <p className="text-gray-600 mb-4">
                Please wait while we transfer your data. This may take a few moments.
              </p>
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </>
          )}
          
          {migrationStatus === 'complete' && (
            <>
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Migration Complete!</h2>
              <p className="text-gray-600 mb-4">
                Your data has been successfully transferred to your account.
              </p>
            </>
          )}
          
          {migrationStatus === 'error' && (
            <>
              <h2 className="text-xl font-bold mb-2">Migration Failed</h2>
              <p className="text-gray-600 mb-4">
                There was an error transferring your data. Your local data is safe.
              </p>
              <button
                onClick={startMigration}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 mr-2"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};