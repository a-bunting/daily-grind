import { Plus, Settings, Trash2, X, AlertTriangle, Database } from 'lucide-react';
import { useState } from 'react';
import { DEFAULT_CATEGORIES } from '../../constants';
import { useApp } from '../AppProvider';

const COMMON_ICONS = [
  '📝', '💼', '🏃', '📚', '🎯', '💪', '🧘', '🍎', '💰', '🏠',
  '🚗', '🎨', '🎵', '📱', '💻', '🛒', '👥', '📧', '📅', '🌟',
  '⭐', '❤️', '🔥', '✨', '🎉', '🏆', '📊', '🔧', '🌱', '🎮'
];

export const SettingsModal = ({ isOpen, onClose }) => {
  const { 
    colors, 
    categories, 
    setCategories, 
    isMobile, 
    setTasks, 
    setGoals, 
    setSections 
  } = useApp();
  
  const [activeSettingsTab, setActiveSettingsTab] = useState('categories');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(colors.taskColors[0]);
  const [newCategoryIcon, setNewCategoryIcon] = useState('📝');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

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

  const handleDeleteAllData = () => {
    if (deleteConfirmationText === 'DELETE ALL DATA') {
      setTasks([]);
      setGoals([]);
      setCategories(DEFAULT_CATEGORIES);
      // Reset sections to default if you have that function
      // setSections(DEFAULT_SECTIONS);
      setShowDeleteConfirmation(false);
      setDeleteConfirmationText('');
      onClose();
    }
  };

  const settingsMenu = [
    { id: 'categories', name: 'Categories', icon: '📂' },
    { id: 'data', name: 'Data Management', icon: '🗃️' },
  ];

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2"
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-xl shadow-2xl w-full max-h-[95vh] overflow-hidden ${
        isMobile ? 'max-w-sm' : 'max-w-4xl'
      }`}>
        {/* Header */}
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
          <div className={`${isMobile ? 'border-b' : 'border-r'} bg-gray-50 ${
            isMobile ? 'p-2' : 'w-40 p-2'
          }`}>
            <div className="space-y-0.5">
              {settingsMenu.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSettingsTab(item.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-all ${
                    activeSettingsTab === item.id
                      ? 'ring-2 ring-opacity-20'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={activeSettingsTab === item.id ? {
                    backgroundColor: colors.primaryLight,
                    color: colors.primaryDark,
                    '--tw-ring-color': colors.primary
                  } : {}}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-xs font-medium">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Settings Content - Right Side */}
          <div className="flex-1 p-3 overflow-y-auto">
            {activeSettingsTab === 'categories' && (
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Manage Categories</h4>
                
                {/* Add New Category */}
                <div className="space-y-2 mb-3 p-2 border border-gray-200 rounded bg-gray-50">
                  <h5 className="text-xs font-medium text-gray-700">Add New Category</h5>
                  
                  {/* Name and Icon Row */}
                  <div className="flex gap-1 items-center">
                    <input
                      type="text"
                      placeholder="Category name..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-opacity-50 text-xs"
                      style={{ focusRingColor: colors.primary + '50' }}
                    />
                    
                    {/* Icon Picker */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowIconPicker(!showIconPicker)}
                        className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center text-sm hover:bg-gray-100 transition-colors"
                      >
                        {newCategoryIcon}
                      </button>
                      
                      {showIconPicker && (
                        <div className="absolute top-8 right-0 bg-white border border-gray-300 rounded shadow-lg p-1 z-10 w-48">
                          <div className="grid grid-cols-6 gap-0.5 max-h-24 overflow-y-auto">
                            {COMMON_ICONS.map(icon => (
                              <button
                                key={icon}
                                onClick={() => {
                                  setNewCategoryIcon(icon);
                                  setShowIconPicker(false);
                                }}
                                className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded transition-colors text-sm"
                              >
                                {icon}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Color Picker */}
                    <input
                      type="color"
                      value={newCategoryColor}
                      onChange={(e) => setNewCategoryColor(e.target.value)}
                      className="w-7 h-7 border border-gray-300 rounded cursor-pointer"
                      title="Category color"
                    />
                  </div>
                  
                  {/* Color Swatches */}
                  <div className="flex gap-0.5 flex-wrap">
                    {colors.taskColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewCategoryColor(color)}
                        className={`w-4 h-4 rounded border transition-all ${
                          newCategoryColor === color ? 'border-gray-500 scale-110' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  
                  {/* Add Button */}
                  <button
                    onClick={addCategory}
                    disabled={!newCategoryName.trim()}
                    className="w-full py-1.5 rounded font-medium transition-colors text-xs flex items-center justify-center gap-1"
                    style={{
                      backgroundColor: newCategoryName.trim() ? colors.primary : '#d1d5db',
                      color: newCategoryName.trim() ? 'white' : '#6b7280',
                      cursor: newCategoryName.trim() ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <Plus size={12} />
                    Add Category
                  </button>
                </div>

                {/* Existing Categories */}
                <div>
                  <h5 className="text-xs font-medium text-gray-700 mb-1">Existing Categories</h5>
                  <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto">
                    {categories.map(category => (
                      <div 
                        key={category.id} 
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors group"
                      >
                        <span className="text-xs">{category.icon}</span>
                        <span className="text-xs font-medium text-gray-800">{category.name}</span>
                        <div 
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: category.color }}
                        />
                        
                        {canDeleteCategory(category.id) && (
                          <button
                            onClick={() => deleteCategory(category.id)}
                            className="p-0.5 hover:bg-red-100 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete category"
                          >
                            <Trash2 size={8} className="text-red-500" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSettingsTab === 'data' && (
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Data Management</h4>
                
                <div className="space-y-2">
                  {/* Export/Import section could go here in the future */}
                  
                  {/* Delete All Data */}
                  <div className="p-3 border border-red-200 rounded bg-red-50">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h5 className="text-xs font-semibold text-red-800 mb-1">Danger Zone</h5>
                        <p className="text-xs text-red-700 mb-2">
                          This will permanently delete all your tasks, progress data, goals, and custom categories. 
                          This action cannot be undone.
                        </p>
                        
                        {!showDeleteConfirmation ? (
                          <button
                            onClick={() => setShowDeleteConfirmation(true)}
                            className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium flex items-center gap-1"
                          >
                            <Database size={12} />
                            Delete All Data
                          </button>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-red-800">
                              Type "DELETE ALL DATA" to confirm:
                            </p>
                            <input
                              type="text"
                              value={deleteConfirmationText}
                              onChange={(e) => setDeleteConfirmationText(e.target.value)}
                              placeholder="DELETE ALL DATA"
                              className="w-full px-2 py-1.5 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 text-xs"
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setShowDeleteConfirmation(false);
                                  setDeleteConfirmationText('');
                                }}
                                className="px-3 py-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-xs font-medium"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleDeleteAllData}
                                disabled={deleteConfirmationText !== 'DELETE ALL DATA'}
                                className="px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1"
                                style={{
                                  backgroundColor: deleteConfirmationText === 'DELETE ALL DATA' ? '#dc2626' : '#d1d5db',
                                  color: deleteConfirmationText === 'DELETE ALL DATA' ? 'white' : '#6b7280',
                                  cursor: deleteConfirmationText === 'DELETE ALL DATA' ? 'pointer' : 'not-allowed'
                                }}
                              >
                                <Trash2 size={12} />
                                Confirm Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
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