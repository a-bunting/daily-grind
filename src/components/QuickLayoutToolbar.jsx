import React, { useState } from 'react';
import { Settings, Grid, List, Minimize2, Square, ChevronDown } from 'lucide-react';
import { useApp } from './AppProvider';

export const QuickLayoutToolbar = ({ section }) => {
  const { 
    updateSectionLayoutMode, 
    updateSectionColumnCount,
    isMobile,
    colors 
  } = useApp();
  
  const [isExpanded, setIsExpanded] = useState(false);

  const layoutModes = [
    { value: 'list', icon: List, tooltip: 'List View' },
    { value: 'compact', icon: Minimize2, tooltip: 'Compact View' },
    { value: 'minimal', icon: Square, tooltip: 'Minimal View' }
  ];

  const columnCounts = [1, 2, 3];

  if (isMobile) {
    return null; // Hide on mobile since layout is forced to minimal/1 column
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-1 hover:bg-gray-100 rounded transition-colors flex items-center gap-1"
        title="Layout options"
      >
        <Settings size={14} className="text-gray-600" />
        <ChevronDown 
          size={12} 
          className={`text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
        />
      </button>

      {isExpanded && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsExpanded(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-20 min-w-48">
            <div className="space-y-3">
              {/* Layout Mode */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Layout Mode
                </label>
                <div className="flex gap-1">
                  {layoutModes.map(({ value, icon: Icon, tooltip }) => (
                    <button
                      key={value}
                      onClick={() => {
                        updateSectionLayoutMode(section.id, value);
                        setIsExpanded(false);
                      }}
                      className={`p-2 rounded border transition-all ${
                        (section.layoutMode || 'list') === value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      title={tooltip}
                    >
                      <Icon size={12} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Column Count */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Columns
                </label>
                <div className="flex gap-1">
                  {columnCounts.map((count) => (
                    <button
                      key={count}
                      onClick={() => {
                        updateSectionColumnCount(section.id, count);
                        setIsExpanded(false);
                      }}
                      className={`px-2 py-1 rounded border text-xs transition-all ${
                        (section.columnCount || 1) === count
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QuickLayoutToolbar;