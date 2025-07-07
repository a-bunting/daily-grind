import React, { useState, useEffect } from 'react';
import { X, Target, Plus, Minus, TrendingUp  } from 'lucide-react';
import { useApp } from '../AppProvider';
import { dateUtils } from '../../utils/index';

export const InputProgressModal = ({ isOpen, onClose, task, date, onSave }) => {
  const { colors, isMobile, goals, getGoalDisplayProgress  } = useApp();
  
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  // Get the linked goal for display
  const linkedGoal = goals.find(goal => goal.id === task?.goalId);
  
  // Get current progress for this date
  const dateString = date ? dateUtils.getDateString(date) : '';
  const currentProgress = task?.dailyProgress?.[dateString];
  const existingValue = currentProgress?.inputValue || 0;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && task) {
      setInputValue(existingValue.toString());
      setError('');
    }
  }, [isOpen, task, existingValue]);

  const validateInput = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return 'Please enter a valid number';
    }
    if (numValue < 0) {
      return 'Value cannot be negative';
    }
    return '';
  };

  const handleSave = () => {
    const validationError = validateInput(inputValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    const numValue = parseFloat(inputValue);
    onSave(task.id, dateString, numValue);
    onClose();
  };

  const handleQuickAdd = (amount) => {
    const currentVal = parseFloat(inputValue) || 0;
    const newVal = Math.max(0, currentVal + amount);
    setInputValue(newVal.toString());
    setError('');
  };

  const handleInputChange = (value) => {
    setInputValue(value);
    if (error) {
      setError('');
    }
  };

const getGoalTypeIcon = (goalType) => {
  return goalType === 'personalBest' ? Target : TrendingUp;
};

const getGoalTypeLabel = (goalType) => {
  return goalType === 'personalBest' ? 'Personal Best' : 'Cumulative';
};

const getGoalTypeColor = (goalType) => {
  return goalType === 'personalBest' 
    ? 'bg-orange-50 border-orange-200 text-orange-800' 
    : 'bg-blue-50 border-blue-200 text-blue-800';
};

const getGoalImpactPreview = (goalType, currentValue, linkedGoal) => {
  if (!currentValue || !linkedGoal) return null;
  
  const newValue = parseFloat(currentValue);
  if (isNaN(newValue) || newValue <= 0) return null;

  if (goalType === 'personalBest') {
    const currentBest = linkedGoal.personalBestProgress || 0;
    if (newValue > currentBest) {
      return {
        type: 'improvement',
        message: `🎉 New personal best! (Previous: ${currentBest} ${linkedGoal.unit})`
      };
    } else {
      return {
        type: 'maintenance', 
        message: `Current best: ${currentBest} ${linkedGoal.unit}`
      };
    }
  } else {
    const newTotal = (linkedGoal.currentProgress || 0) + newValue;
    return {
      type: 'progress',
      message: `Total will be: ${newTotal} ${linkedGoal.unit}`
    };
  }
};

  if (!isOpen || !task) return null;
  const goalImpact = linkedGoal ? getGoalImpactPreview(linkedGoal.goalType, inputValue, linkedGoal) : null;
  const GoalTypeIcon = linkedGoal ? getGoalTypeIcon(linkedGoal.goalType) : Target;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className={`bg-white rounded-xl shadow-2xl w-full max-h-[95vh] overflow-y-auto ${
        isMobile ? 'max-w-sm' : 'max-w-md'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Log Progress
            </h3>
            <p className="text-sm text-gray-600">
              {task.name} • {dateUtils.formatDisplayDate(date)}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Goal Link Display */}
          {linkedGoal && (
            <div className={`border rounded-lg p-3 ${getGoalTypeColor(linkedGoal.goalType)}`}>
                <div className="flex items-center gap-2 mb-2">
                <GoalTypeIcon size={16} />
                <span className="font-medium">Contributing to: {linkedGoal.name}</span>
                <span className="text-xs px-2 py-0.5 bg-white bg-opacity-50 rounded-full">
                    {getGoalTypeLabel(linkedGoal.goalType)}
                </span>
                </div>
                
                <div className="text-sm mb-2">
                {linkedGoal.goalType === 'personalBest' ? (
                    <div>
                    <div>Best so far: {linkedGoal.personalBestProgress || 0} {linkedGoal.unit}</div>
                    <div>Target: {linkedGoal.targetValue} {linkedGoal.unit}</div>
                    {linkedGoal.currentProgress > 0 && (
                        <div className="text-xs opacity-75 mt-1">
                        Total training: {linkedGoal.currentProgress} {linkedGoal.unit}
                        </div>
                    )}
                    </div>
                ) : (
                    <div>
                    <div>Current: {linkedGoal.currentProgress || 0} {linkedGoal.unit}</div>
                    <div>Target: {linkedGoal.targetValue} {linkedGoal.unit}</div>
                    {linkedGoal.personalBestProgress > 0 && (
                        <div className="text-xs opacity-75 mt-1">
                        Best session: {linkedGoal.personalBestProgress} {linkedGoal.unit}
                        </div>
                    )}
                    </div>
                )}
                </div>

                <div className="text-xs opacity-75">
                {linkedGoal.goalType === 'personalBest' 
                    ? 'This goal tracks your best single performance'
                    : 'This goal tracks your total progress over time'
                }
                </div>
            </div>
            )}

        {/* ADD this new goal impact preview section: */}
        {goalImpact && (
        <div className={`p-3 rounded-lg border ${
            goalImpact.type === 'improvement' 
            ? 'bg-green-50 border-green-200 text-green-800'
            : goalImpact.type === 'progress'
            ? 'bg-blue-50 border-blue-200 text-blue-800'  
            : 'bg-gray-50 border-gray-200 text-gray-800'
        }`}>
            <div className="text-sm font-medium">
            {goalImpact.message}
            </div>
        </div>
        )}

          {/* Input Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How much did you accomplish today?
            </label>
            
            {/* Input with Unit */}
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className={`w-full p-3 border rounded-lg text-lg font-medium focus:ring-2 focus:ring-opacity-50 focus:outline-none ${
                    error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  style={{ 
                    focusRingColor: error ? undefined : colors.primary + '50'
                  }}
                  placeholder="0"
                  autoFocus
                />
                {task.unit && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    {task.unit}
                  </span>
                )}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
          </div>

          {/* Quick Add Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick adjustments:
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleQuickAdd(-1)}
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Minus size={14} />
                -1
              </button>
              <button
                onClick={() => handleQuickAdd(-0.5)}
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Minus size={14} />
                -0.5
              </button>
              <button
                onClick={() => handleQuickAdd(0.5)}
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus size={14} />
                +0.5
              </button>
              <button
                onClick={() => handleQuickAdd(1)}
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus size={14} />
                +1
              </button>
            </div>
          </div>

          {/* Current Value Display */}
          {existingValue > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-sm text-gray-600">
                Previous value for today: <span className="font-medium text-gray-800">{existingValue}{task.unit ? ` ${task.unit}` : ''}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex gap-2 p-4 border-t bg-gray-50 rounded-b-xl">
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
            Save Progress
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputProgressModal;