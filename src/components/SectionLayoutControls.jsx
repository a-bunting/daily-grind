import React from 'react';
import { Grid, List, Minimize2, Square, Eye, EyeOff } from 'lucide-react';
import { useApp } from './AppProvider';

export const SectionLayoutControls = ({ section, onChange }) => {
  const { isMobile } = useApp();

  const layoutModes = [
    { value: 'list', label: 'List', icon: List },
    { value: 'compact', label: 'Compact', icon: Minimize2 },
    { value: 'minimal', label: 'Minimal', icon: Square }
  ];

  const columnOptions = [
    { value: 1, label: '1 Column' },
    { value: 2, label: '2 Columns' },
    { value: 3, label: '3 Columns' }
  ];

  return (
    <div className="space-y-4">
      {/* Layout Mode */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Layout Mode
        </label>
        <div className="grid grid-cols-3 gap-2">
          {layoutModes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ layoutMode: value })}
              className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                (section.layoutMode || 'list') === value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon size={16} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Column Count - Hide on mobile */}
      {!isMobile && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Column Count
          </label>
          <div className="grid grid-cols-3 gap-2">
            {columnOptions.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ columnCount: value })}
                className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                  (section.columnCount || 1) === value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: value }, (_, i) => (
                    <div key={i} className="w-2 h-3 bg-current rounded-sm" />
                  ))}
                </div>
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Background Toggle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Background
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange({ showBackground: true })}
            className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
              section.showBackground !== false
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Eye size={16} />
            <span className="text-sm font-medium">Show</span>
          </button>
          <button
            type="button"
            onClick={() => onChange({ showBackground: false })}
            className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
              section.showBackground === false
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <EyeOff size={16} />
            <span className="text-sm font-medium">Hide</span>
          </button>
        </div>
      </div>

      {/* Current Settings Display */}
      <div className="pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p><strong>Current Settings:</strong></p>
          <p>Mode: {section.layoutMode || 'list'}</p>
          <p>Columns: {section.columnCount || 1}</p>
          <p>Background: {section.showBackground !== false ? 'visible' : 'hidden'}</p>
        </div>
      </div>
    </div>
  );
};

export default SectionLayoutControls;