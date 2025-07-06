import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {useApp} from './AppProvider';

export const DemoNotice = () => {
  const { user } = useApp();
  const [showDemo, setShowDemo] = useState(true);

  // Auto-hide after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDemo(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!showDemo) return null;

  return (
    <div className="fixed bottom-4 right-4 z-30">
      <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 max-w-sm shadow-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">Demo Mode</p>
            <p className="text-xs text-yellow-700 mt-1">
              This is a preview with simulated backend. {user ? 'Authentication works' : 'Try signing in'} but data won't persist.
            </p>
          </div>
          <button
            onClick={() => setShowDemo(false)}
            className="text-yellow-600 hover:text-yellow-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
export default DemoNotice;