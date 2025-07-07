import { Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {useApp} from '../AppProvider';

export const SectionEditModal = ({ isOpen, onClose, section, onSave, onDelete }) => {
  const { colors, isMobile, categories, goals } = useApp();
  const [sectionData, setSectionData] = useState({
    name: '',
    layoutMode: 'list',
    columnCount: 1,
    rules: [],
    showBackground: true
  });

  useEffect(() => {
    if (section) {
      setSectionData({
        name: section.name,
        layoutMode: section.layoutMode || 'list',
        columnCount: section.columnCount || 1,
        rules: section.rules || [],
        showBackground: section.showBackground !== undefined ? section.showBackground : true
      });
    } else {
      setSectionData({
        name: '',
        layoutMode: 'list',
        columnCount: 1,
        rules: [],
        showBackground: true
      });
    }
  }, [section, isOpen]);

  const addRule = (type) => {
    const newRule = { id: Date.now(), type, value: '' };
    setSectionData(prev => ({
      ...prev,
      rules: [...prev.rules, newRule]
    }));
  };

  const updateRule = (ruleId, value) => {
    setSectionData(prev => ({
      ...prev,
      rules: prev.rules.map(rule => 
        rule.id === ruleId ? { ...rule, value } : rule
      )
    }));
  };

  const removeRule = (ruleId) => {
    setSectionData(prev => ({
      ...prev,
      rules: prev.rules.filter(rule => rule.id !== ruleId)
    }));
  };

  const handleSave = () => {
    if (sectionData.name.trim()) {
      onSave(sectionData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className={`bg-white rounded-xl shadow-2xl w-full max-h-[95vh] overflow-y-auto ${isMobile ? 'max-w-sm' : 'max-w-lg'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            {section ? 'Edit Section' : 'Create Section'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Section Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section Name</label>
            <input
              type="text"
              value={sectionData.name}
              onChange={(e) => setSectionData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Enter section name..."
              autoFocus
            />
          </div>

          {/* Layout Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Layout Mode</label>
            <div className="flex gap-1">
              {['list', 'compact', 'minimal'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setSectionData(prev => ({ ...prev, layoutMode: mode }))}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    sectionData.layoutMode === mode
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Column Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Columns</label>
            <div className="flex gap-1">
              {[1, 2, 3].map(count => (
                <button
                  key={count}
                  onClick={() => setSectionData(prev => ({ ...prev, columnCount: count }))}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    sectionData.columnCount === count
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {count} Col
                </button>
              ))}
            </div>
          </div>

          {/* Background Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section Background</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSectionData(prev => ({ ...prev, showBackground: true }))}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  sectionData.showBackground
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                With Background
              </button>
              <button
                onClick={() => setSectionData(prev => ({ ...prev, showBackground: false }))}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  !sectionData.showBackground
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                No Background
              </button>
            </div>
          </div>

          {/* Rules */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Auto-Assignment Rules</label>
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => addRule('category')}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  + Category
                </button>
                <button
                  onClick={() => addRule('goal')}
                  className="px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
                >
                  + Goal
                </button>
                <button
                  onClick={() => addRule('name')}
                  className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                >
                  + Name Contains
                </button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {sectionData.rules.map(rule => (
                <div key={rule.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span className="text-xs font-medium text-gray-600 min-w-0 flex-shrink-0">
                    {rule.type === 'category' ? 'Category:' : 
                     rule.type === 'goal' ? 'Goal:' : 
                     'Name contains:'}
                  </span>
                  {rule.type === 'category' ? (
                    <select
                      value={rule.value}
                      onChange={(e) => updateRule(rule.id, e.target.value)}
                      className="flex-1 p-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select category...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  ) : rule.type === 'goal' ? (
                    <select
                      value={rule.value}
                      onChange={(e) => updateRule(rule.id, e.target.value)}
                      className="flex-1 p-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select goal...</option>
                      {(goals || []).map(goal => (
                        <option key={goal.id} value={goal.id}>
                          🎯 {goal.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={rule.value}
                      onChange={(e) => updateRule(rule.id, e.target.value)}
                      className="flex-1 p-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Text to match..."
                    />
                  )}
                  <button
                    onClick={() => removeRule(rule.id)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Remove rule"
                  >
                    <X size={12} className="text-red-500" />
                  </button>
                </div>
              ))}
              {sectionData.rules.length === 0 && (
                <div className="text-center py-3">
                  <p className="text-xs text-gray-500 mb-2">
                    No auto-assignment rules defined.
                  </p>
                  <p className="text-xs text-gray-400">
                    Tasks will be assigned to this section manually or through drag & drop.
                  </p>
                </div>
              )}
            </div>
            
            {/* Rules explanation */}
            {sectionData.rules.length > 0 && (
              <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs text-blue-700">
                  <strong>Auto-assignment:</strong> Tasks matching any of these rules will be automatically placed in this section when created or edited.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 p-4 border-t bg-gray-50 rounded-b-xl">
          {section && section.id !== 'default' && (
            <button
              onClick={() => onDelete(section.id)}
              className="px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors text-sm"
            >
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!sectionData.name.trim()}
            className="flex-1 py-2 px-3 rounded-lg font-medium transition-colors text-sm"
            style={{
              backgroundColor: sectionData.name.trim() ? colors.primary : '#d1d5db',
              color: sectionData.name.trim() ? 'white' : '#6b7280',
              cursor: sectionData.name.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            <Save size={16} className="inline mr-1" />
            {section ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectionEditModal;