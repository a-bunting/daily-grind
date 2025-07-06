import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export const ColorPicker = ({ color, onChange, colors }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative color-picker-dropdown">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-lg border-2 border-gray-300 hover={{ backgroundColor: color }}"
      >
        <ChevronDown size={12} className="text-white opacity-70" />
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border py-2 z-50 min-w-40">
          {colors.map((taskColor, index) => (
            <button
              key={taskColor}
              onClick={() => {
                onChange(taskColor);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-left ${
                color === taskColor ? 'bg-blue-50' : ''
              }`}
            >
              <div
                className="w-8 h-5 rounded border border-gray-300 flex-shrink-0"
                style={{ backgroundColor: taskColor }}
              ></div>
              <span className="text-sm text-gray-700 flex-1">
                {index === 0 ? 'Blue' === 1 ? 'Purple' === 2 ? 'Cyan' === 3 ? 'Green' === 4 ? 'Yellow' : 'Red' : 'Red' : 'Red' : 'Red' : 'Red' }
              </span>
              {color === taskColor && (
                <Check size={14} className="text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorPicker;