import React, { useState } from 'react';
import { X, TrendingUp, Target } from 'lucide-react';
import { useApp } from '../AppProvider';

export const GoalModal = ({ isOpen, onClose, editingGoal, onSave }) => {
  const { colors, isMobile, categories } = useApp();
  
  const [formData, setFormData] = useState({
    name: editingGoal?.name || '',
    description: editingGoal?.description || '',
    goalType: editingGoal?.goalType || 'cumulative',
    targetValue: editingGoal?.targetValue || '',
    unit: editingGoal?.unit || '',
    targetDate: editingGoal?.targetDate || '',
    color: editingGoal?.color || colors.primary,
    categoryId: editingGoal?.categoryId || ''
  });

  const [errors, setErrors] = useState({});

  const goalTypes = [
    {
      value: 'cumulative',
      label: 'Cumulative',
      icon: TrendingUp,
      description: 'Sum all sessions',
      example: 'Run 500 miles total'
    },
    {
      value: 'personalBest', 
      label: 'Personal Best',
      icon: Target,
      description: 'Track best session',
      example: 'Run 26 miles once'
    }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Goal name is required';
    }
    
    if (!formData.targetValue || formData.targetValue <= 0) {
      newErrors.targetValue = 'Target value must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const goalData = {
      ...formData,
      targetValue: parseFloat(formData.targetValue),
      currentProgress: editingGoal?.currentProgress || 0,
      personalBestProgress: editingGoal?.personalBestProgress || 0
    };

    if (editingGoal) {
      onSave(editingGoal.id, goalData);
    } else {
      onSave(goalData);
    }
    
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Reset form when modal opens/closes or editingGoal changes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: editingGoal?.name || '',
        description: editingGoal?.description || '',
        goalType: editingGoal?.goalType || 'cumulative',
        targetValue: editingGoal?.targetValue || '',
        unit: editingGoal?.unit || '',
        targetDate: editingGoal?.targetDate || '',
        color: editingGoal?.color || colors.primary,
        categoryId: editingGoal?.categoryId || ''
      });
      setErrors({});
    }
  }, [isOpen, editingGoal, colors.primary]);

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
      <div className={`bg-white rounded-xl shadow-2xl w-full max-h-[95vh] overflow-y-auto ${
        isMobile ? 'max-w-sm' : 'max-w-md'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="text-base font-semibold text-gray-800">
            {editingGoal ? 'Edit Goal' : 'Create Goal'}
          </h3>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-3 space-y-3">
          {/* Goal Name and Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Goal Name *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`flex-1 px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none ${
                  errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
                style={{ 
                  focusRingColor: errors.name ? undefined : colors.primary + '50'
                }}
                placeholder="e.g., Run a Marathon"
              />
              <input
                type="color"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="w-10 h-8 border border-gray-300 rounded cursor-pointer flex-shrink-0"
                title="Goal color"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Goal Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Goal Type *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {goalTypes.map(type => {
                const Icon = type.icon;
                const isSelected = formData.goalType === type.value;
                
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleInputChange('goalType', type.value)}
                    className={`p-2 border rounded-lg text-left transition-all text-sm ${
                      isSelected
                        ? 'ring-2 ring-opacity-20'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                    style={isSelected ? { 
                      backgroundColor: colors.primaryLight,
                      borderColor: colors.primary,
                      '--tw-ring-color': colors.primary 
                    } : {}}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon 
                        size={16} 
                        style={{ color: isSelected ? colors.primary : '#9CA3AF' }}
                      />
                      <div className={`font-medium ${isSelected ? '' : 'text-gray-700'}`}
                           style={{ color: isSelected ? colors.primaryDark : undefined }}>
                        {type.label}
                      </div>
                    </div>
                    <div className={`text-xs ${isSelected ? '' : 'text-gray-500'}`}
                         style={{ color: isSelected ? colors.primaryDark : undefined }}>
                      {type.description}
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Compact explanation */}
            <div className="mt-2 p-2 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600">
                <strong>{formData.goalType === 'cumulative' ? 'Cumulative:' : 'Personal Best:'}</strong> 
                {formData.goalType === 'cumulative' 
                  ? ' Adds up all your sessions (2+5+3 = 10 total)'
                  : ' Tracks your highest single session (best of 2, 5, 3 = 5)'
                }
              </div>
            </div>
          </div>

          {/* Target Value and Unit */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target *
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.targetValue}
                onChange={(e) => handleInputChange('targetValue', e.target.value)}
                className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none ${
                  errors.targetValue ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
                style={{ 
                  focusRingColor: errors.targetValue ? undefined : colors.primary + '50'
                }}
                placeholder="26"
              />
              {errors.targetValue && (
                <p className="text-xs text-red-600 mt-1">{errors.targetValue}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none"
                style={{ focusRingColor: colors.primary + '50' }}
                placeholder="miles"
              />
            </div>
          </div>

          {/* Target Date and Category */}
          <div className={categories.length > 0 ? "grid grid-cols-2 gap-2" : ""}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => handleInputChange('targetDate', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none"
                style={{ focusRingColor: colors.primary + '50' }}
              />
            </div>
            {categories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none"
                  style={{ focusRingColor: colors.primary + '50' }}
                >
                  <option value="">No category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none"
              style={{ focusRingColor: colors.primary + '50' }}
              rows={2}
              placeholder="Optional description"
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex gap-2 p-3 border-t bg-gray-50 rounded-b-xl">
          <button 
            onClick={onClose} 
            className="flex-1 py-2 px-3 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="flex-1 py-2 px-3 rounded-lg font-medium transition-colors text-sm text-white hover:opacity-90"
            style={{ backgroundColor: colors.primary }}
          >
            {editingGoal ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalModal;