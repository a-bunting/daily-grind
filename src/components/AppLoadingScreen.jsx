import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

export const AppLoadingScreen = ({ colorScheme = 'indigo', isLoading = true }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);

  const colors = {
    indigo: { primary: '#6366f1', gradient: 'from-indigo-500 to-purple-600' },
    emerald: { primary: '#10b981', gradient: 'from-emerald-500 to-teal-600' },
    orange: { primary: '#f97316', gradient: 'from-orange-500 to-red-600' }
  };

  const currentColors = colors[colorScheme] || colors.indigo;

  // Handle fade out when loading completes
  useEffect(() => {
    if (!isLoading) {
      setOpacity(0);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 bg-gradient-to-br ${currentColors.gradient} flex items-center justify-center z-50 transition-opacity duration-300`}
      style={{ opacity }}
    >
      <div className="text-center text-white">
        {/* Simple Logo */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <Calendar size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">The Daily Grind</h1>
        </div>

        {/* Simple Spinner */}
        <div className="w-8 h-8 mx-auto border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default AppLoadingScreen;