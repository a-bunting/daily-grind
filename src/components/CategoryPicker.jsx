import { useState } from 'react';

import { Check } from 'lucide-react';

export const CategoryPicker = ({ selectedCategory, onChange, categories }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCat = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className="relative category-picker-dropdown">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-lg hover={selectedCat?.name || 'No Category'}"
      >
        <span className="text-lg">{selectedCat?.icon || '📝'}</span>
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border py-2 z-50 max-h-48 overflow-y-auto min-w-48">
          <button
            onClick={() => {
              onChange(null);
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-left ${
              !selectedCategory ? 'bg-blue-50' : ''
            }`}
          >
            <span className="text-sm">📝</span>
            <span className="text-xs text-gray-700 flex-1">No Category</span>
            {!selectedCategory && (
              <Check size={12} className="text-blue-600" />
            )}
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                onChange(category.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-left ${
                selectedCategory === category.id ? 'bg-blue-50' : ''
              }`}
            >
              <span className="text-sm">{category.icon}</span>
              <span className="text-xs text-gray-700 flex-1">{category.name}</span>
              <div 
                className="w-2 h-2 rounded-full border border-gray-300"
                style={{ backgroundColor: category.color }}
              />
              {selectedCategory === category.id && (
                <Check size={12} className="text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPicker;