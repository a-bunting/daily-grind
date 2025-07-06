import { Plus, Settings, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { DEFAULT_CATEGORIES } from '../constants';
import {useApp} from './AppProvider';

export const SettingsModal = ({ isOpen, onClose }) => {
  const { colors, categories, setCategories, isMobile } = useApp();
  const [activeSettingsTab, setActiveSettingsTab] = useState('categories');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(colors.taskColors[0]);
  const [newCategoryIcon, setNewCategoryIcon] = useState('📝');

  const addCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        id: Date.now().toString(),
        name: newCategoryName.trim(),
        color: newCategoryColor,
        icon: newCategoryIcon
      };
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
      setNewCategoryColor(colors.taskColors[0]);
      setNewCategoryIcon('📝');
    }
  };

  const deleteCategory = (categoryId) => {
    setCategories(categories.filter(cat => cat.id !== categoryId));
  };

  const canDeleteCategory = (categoryId) => {
    return !DEFAULT_CATEGORIES.some(cat => cat.id === categoryId);
  };

  const settingsMenu = [
    { id: 'categories', name: 'Categories', icon: '📂' },
    // Add more settings sections here in the future
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className={`bg-white rounded-xl shadow-2xl w-full max-h-[95vh] overflow-hidden ${isMobile ? 'max-w-sm' : 'max-w-4xl'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Settings size={20} />
            Settings
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className={`flex ${isMobile ? 'flex-col' : 'h-96'}`}>
          {/* Settings Menu - Left Side */}
          <div className={`${isMobile ? 'border-b' : 'border-r'} bg-gray-50 ${isMobile ? 'p-2' : 'w-48 p-4'}`}>
            <div className="space-y-1">
              {settingsMenu.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSettingsTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSettingsTab === item.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Settings Content - Right Side */}
          <div className="flex-1 p-4 overflow-y-auto">
            {activeSettingsTab === 'categories' && (
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-4">Manage Categories</h4>
                
                {/* Add New Category */}
                <div className="space-y-3 mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Category name..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="📝"
                      value={newCategoryIcon}
                      onChange={(e) => setNewCategoryIcon(e.target.value)}
                      className="w-12 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-center"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex gap-1 flex-wrap flex-1">
                      {colors.taskColors.map(color => (
                        <button
                          key={color}
                          onClick={() => setNewCategoryColor(color)}
                          className={`w-6 h-6 rounded border-2 transition-all ${
                            newCategoryColor === color ? 'border-gray-400 scale-110' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <button
                      onClick={addCategory}
                      disabled={!newCategoryName.trim()}
                      className="px-3 py-2 rounded-lg font-medium transition-colors text-sm flex items-center gap-1"
                      style={{
                        backgroundColor: newCategoryName.trim() ? colors.primary : '#d1d5db',
                        color: newCategoryName.trim() ? 'white' : '#6b7280',
                        cursor: newCategoryName.trim() ? 'pointer' : 'not-allowed'
                      }}
                    >
                      <Plus size={14} />
                      Add
                    </button>
                  </div>
                </div>

                {/* Existing Categories */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {categories.map(category => (
                    <div key={category.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-lg">{category.icon}</span>
                        <span className="text-sm font-medium text-gray-800">{category.name}</span>
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: category.color }}
                        />
                      </div>
                      
                      {canDeleteCategory(category.id) && (
                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Delete category"
                        >
                          <Trash2 size={12} className="text-red-500" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;