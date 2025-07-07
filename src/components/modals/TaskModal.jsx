import { Edit2, Plus, X, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DAY_ABBREVIATIONS } from '../../constants/index';
import {useApp} from '../AppProvider';
import { getScheduleDescription } from '../../utils/index';
import { dateUtils } from '../../utils/index';

export const TaskModal = ({ isOpen, onClose, editingTask, onSave }) => {
  const { colors, isMobile, categories, sections, goals } = useApp();
  const [newTask, setNewTask] = useState({
    name: '',
    plannedMinutes: '',
    targetCount: '',
    taskType: 'time',
    goalId: '',
    unit: '',
    selectedDays: [],
    startDate: dateUtils.getDateString(new Date()),
    endDate: '',
    color: colors.taskColors[0],
    categoryId: null,
    scheduleType: 'weekly',
    monthlyTypes: ['first'],
    monthlyDays: [],
    intervalWeeks: 2,
    sectionId: sections[0]?.id || 'default'
  });
  const [taskErrors, setTaskErrors] = useState({});

  useEffect(() => {
    if (editingTask) {
      setNewTask({
        name: editingTask.name,
        plannedMinutes: editingTask.plannedMinutes || '',
        targetCount: editingTask.targetCount || '',
        taskType: editingTask.taskType,
        goalId: editingTask.goalId || '',
        unit: editingTask.unit || '',
        selectedDays: editingTask.selectedDays || [],
        startDate: editingTask.startDate,
        endDate: editingTask.endDate || '',
        color: editingTask.color,
        categoryId: editingTask.categoryId || null,
        scheduleType: editingTask.scheduleType || 'weekly',
        monthlyTypes: editingTask.monthlyTypes || [editingTask.monthlyType || 'first'],
        monthlyDays: editingTask.monthlyDays || [],
        intervalWeeks: editingTask.intervalWeeks || 2,
        sectionId: editingTask.sectionId || sections[0]?.id || 'default'
      });
    } else {
      setNewTask({
        name: '',
        plannedMinutes: '',
        targetCount: '',
        taskType: 'time',
        goalId: '',
        unit: '',
        selectedDays: [],
        startDate: dateUtils.getDateString(new Date()),
        endDate: '',
        color: colors.taskColors[0],
        categoryId: null,
        scheduleType: 'weekly',
        monthlyTypes: ['first'],
        monthlyDays: [],
        intervalWeeks: 2,
        sectionId: sections[0]?.id || 'default'
      });
    }
    setTaskErrors({});
  }, [editingTask, isOpen, colors.taskColors, sections]);

  const validateNewTask = () => {
    const errors = {};
    if (!newTask.name.trim()) errors.name = 'Task name is required';
    
    if (newTask.taskType === 'time') {
      const minutes = parseFloat(newTask.plannedMinutes);
      if (!newTask.plannedMinutes || isNaN(minutes) || minutes <= 0) errors.plannedMinutes = 'Time must be greater than 0';
    } else if (newTask.taskType === 'count') {
      if (!newTask.targetCount || newTask.targetCount <= 0) errors.targetCount = 'Count must be greater than 0';
    } else if (newTask.taskType === 'input') {
      if (!newTask.unit.trim()) errors.unit = 'Unit is required for input tasks';
    }
    
    if (newTask.scheduleType === 'weekly' || newTask.scheduleType === 'interval') {
      if (newTask.selectedDays.length === 0) errors.selectedDays = 'Select at least one day';
    } else if (newTask.scheduleType === 'monthly') {
      if (!newTask.monthlyDays || newTask.monthlyDays.length === 0) {
        errors.selectedDays = 'Select at least one day for monthly schedule';
      }
    }
    
    if (newTask.endDate && newTask.endDate < newTask.startDate) errors.endDate = 'End date cannot be before start date';
    
    setTaskErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isFormValid = () => {
    let hasValidTarget = true; // Input tasks don't need a target value
    
    if (newTask.taskType === 'time') {
      hasValidTarget = newTask.plannedMinutes && !isNaN(parseFloat(newTask.plannedMinutes)) && parseFloat(newTask.plannedMinutes) > 0;
    } else if (newTask.taskType === 'count') {
      hasValidTarget = newTask.targetCount && newTask.targetCount > 0;
    } else if (newTask.taskType === 'input') {
      hasValidTarget = newTask.unit.trim(); // Input tasks only need a unit
    }
    
    const hasValidSchedule = newTask.scheduleType === 'weekly' 
      ? newTask.selectedDays.length > 0
      : newTask.scheduleType === 'monthly' 
      ? (newTask.monthlyDays && newTask.monthlyDays.length > 0)
      : newTask.selectedDays.length > 0;
    
    return newTask.name.trim() && 
           hasValidTarget && 
           hasValidSchedule &&
           (!newTask.endDate || newTask.endDate >= newTask.startDate);
  };

  const handleSave = () => {
    console.log('TaskModal saving:', newTask);
    if (validateNewTask()) {
      const taskData = {
        ...newTask,
        plannedMinutes: newTask.taskType === 'time' ? parseFloat(newTask.plannedMinutes) : null,
        targetCount: newTask.taskType === 'count' ? parseInt(newTask.targetCount) : null,
        goalId: newTask.goalId || null,
        unit: (newTask.taskType === 'input' || newTask.goalId) ? newTask.unit : null,
      };
      
      onSave(taskData, editingTask);
      onClose();
    }
  };

  const toggleDay = (dayIndex) => {
    if (newTask.scheduleType === 'monthly') {
      const monthlyDays = newTask.monthlyDays || [];
      const newMonthlyDays = monthlyDays.includes(dayIndex)
        ? monthlyDays.filter(d => d !== dayIndex)
        : [...monthlyDays, dayIndex];
      setNewTask(prev => ({
        ...prev,
        monthlyDays: newMonthlyDays
      }));
    } else {
      setNewTask(prev => ({
        ...prev,
        selectedDays: prev.selectedDays.includes(dayIndex)
          ? prev.selectedDays.filter(d => d !== dayIndex)
          : [...prev.selectedDays, dayIndex]
      }));
    }
  };

  const toggleMonthlyType = (type) => {
    const monthlyTypes = newTask.monthlyTypes || [];
    const newMonthlyTypes = monthlyTypes.includes(type)
      ? monthlyTypes.filter(t => t !== type)
      : [...monthlyTypes, type];
    setNewTask(prev => ({
      ...prev,
      monthlyTypes: newMonthlyTypes
    }));
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const selectedGoal = goals.find(goal => goal.id === newTask.goalId);

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
            {editingTask ? 'Edit Task' : 'Create Task'}
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
          {/* Task Name and Color */}
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter task name..."
                value={newTask.name}
                onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                className={`flex-1 px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none ${
                  taskErrors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
                style={{ 
                  focusRingColor: taskErrors.name ? undefined : colors.primary + '50'
                }}
                autoFocus
              />
              <input
                type="color"
                value={newTask.color}
                onChange={(e) => setNewTask({...newTask, color: e.target.value})}
                className="w-10 h-8 border border-gray-300 rounded cursor-pointer flex-shrink-0"
                title="Task color"
              />
            </div>
            {taskErrors.name && <p className="text-xs text-red-600 mt-1">{taskErrors.name}</p>}
          </div>

          {/* Task Type */}
          <div>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => setNewTask({...newTask, taskType: 'time'})}
                className={`px-2 py-2 rounded-lg text-sm font-medium transition-all ${
                  newTask.taskType === 'time' 
                    ? 'ring-2 ring-opacity-20' 
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
                style={newTask.taskType === 'time' ? { 
                  backgroundColor: colors.primaryLight,
                  borderColor: colors.primary,
                  color: colors.primaryDark,
                  '--tw-ring-color': colors.primary 
                } : {}}
              >
                Time
              </button>
              <button
                type="button"
                onClick={() => setNewTask({...newTask, taskType: 'count'})}
                className={`px-2 py-2 rounded-lg text-sm font-medium transition-all ${
                  newTask.taskType === 'count' 
                    ? 'ring-2 ring-opacity-20' 
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
                style={newTask.taskType === 'count' ? { 
                  backgroundColor: colors.primaryLight,
                  borderColor: colors.primary,
                  color: colors.primaryDark,
                  '--tw-ring-color': colors.primary 
                } : {}}
              >
                Count
              </button>
              <button
                type="button"
                onClick={() => setNewTask({...newTask, taskType: 'input'})}
                className={`px-2 py-2 rounded-lg text-sm font-medium transition-all ${
                  newTask.taskType === 'input' 
                    ? 'ring-2 ring-opacity-20' 
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
                style={newTask.taskType === 'input' ? { 
                  backgroundColor: colors.primaryLight,
                  borderColor: colors.primary,
                  color: colors.primaryDark,
                  '--tw-ring-color': colors.primary 
                } : {}}
              >
                Input
              </button>
            </div>
          </div>

          {/* Target Value - only for time and count tasks */}
          {(newTask.taskType === 'time' || newTask.taskType === 'count') && (
            <div>
              {newTask.taskType === 'time' && (
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="Minutes"
                  value={newTask.plannedMinutes}
                  onChange={(e) => setNewTask({...newTask, plannedMinutes: e.target.value})}
                  className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none ${
                    taskErrors.plannedMinutes ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  style={{ 
                    focusRingColor: taskErrors.plannedMinutes ? undefined : colors.primary + '50'
                  }}
                />
              )}

              {newTask.taskType === 'count' && (
                <input
                  type="number"
                  min="1"
                  placeholder="Target count"
                  value={newTask.targetCount}
                  onChange={(e) => setNewTask({...newTask, targetCount: e.target.value})}
                  className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none ${
                    taskErrors.targetCount ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  style={{ 
                    focusRingColor: taskErrors.targetCount ? undefined : colors.primary + '50'
                  }}
                />
              )}

              {(taskErrors.plannedMinutes || taskErrors.targetCount) && (
                <p className="text-xs text-red-600 mt-1">
                  {taskErrors.plannedMinutes || taskErrors.targetCount}
                </p>
              )}
            </div>
          )}

          {/* Goal and Unit */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goal (Optional)
              </label>
              <select
                value={newTask.goalId}
                onChange={(e) => {
                  const goalId = e.target.value;
                  const goal = goals.find(g => g.id === goalId);
                  setNewTask({
                    ...newTask, 
                    goalId,
                    unit: goal ? goal.unit : newTask.unit
                  });
                }}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none"
                style={{ focusRingColor: colors.primary + '50' }}
              >
                <option value="">No goal</option>
                {goals.map(goal => (
                  <option key={goal.id} value={goal.id}>
                    {goal.name} ({goal.currentProgress}/{goal.targetValue} {goal.unit})
                  </option>
                ))}
              </select>
            </div>
            
            {(newTask.goalId || newTask.taskType === 'input') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <input
                  type="text"
                  placeholder="Unit"
                  value={newTask.unit}
                  onChange={(e) => setNewTask({...newTask, unit: e.target.value})}
                  disabled={!!newTask.goalId}
                  className={`w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none ${
                    newTask.goalId ? 'bg-gray-100 text-gray-500' : ''
                  } ${taskErrors.unit ? 'border-red-300' : ''}`}
                  style={{ focusRingColor: colors.primary + '50' }}
                />
                {taskErrors.unit && (
                  <p className="text-xs text-red-600 mt-1">{taskErrors.unit}</p>
                )}
              </div>
            )}
          </div>

          {/* Goal Preview */}
          {selectedGoal && (
            <div className="p-2 rounded-lg border border-gray-200" style={{ backgroundColor: colors.primaryLight }}>
              <div className="flex items-center justify-between" style={{ color: colors.primaryDark }}>
                <div className="flex items-center gap-2">
                  <Target size={14} />
                  <span className="font-medium text-sm">{selectedGoal.name}</span>
                </div>
                <span className="text-xs">
                  {selectedGoal.personalBestProgress}/{selectedGoal.targetValue} {selectedGoal.unit}
                </span>
              </div>
              {newTask.unit && selectedGoal.unit && newTask.unit !== selectedGoal.unit && (
                <div className="text-xs text-orange-600 mt-1">
                  ⚠️ Unit mismatch: Task uses "{newTask.unit}" but goal uses "{selectedGoal.unit}"
                </div>
              )}
            </div>
          )}

          {/* Section and Category */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <select
                value={newTask.sectionId}
                onChange={(e) => setNewTask({...newTask, sectionId: e.target.value})}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none"
                style={{ focusRingColor: colors.primary + '50' }}
              >
                {sections.map(section => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>
            {categories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newTask.categoryId || ''}
                  onChange={(e) => setNewTask({...newTask, categoryId: e.target.value || null})}
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

          {/* Start and End Date */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={newTask.startDate}
                onChange={(e) => setNewTask({...newTask, startDate: e.target.value})}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none"
                style={{ focusRingColor: colors.primary + '50' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={newTask.endDate}
                onChange={(e) => setNewTask({...newTask, endDate: e.target.value})}
                className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none ${
                  taskErrors.endDate ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
                style={{ 
                  focusRingColor: taskErrors.endDate ? undefined : colors.primary + '50'
                }}
              />
            </div>
          </div>
          {taskErrors.endDate && <p className="text-xs text-red-600">{taskErrors.endDate}</p>}

          {/* Schedule Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
            <div className="grid grid-cols-3 gap-1 mb-2">
              <button
                type="button"
                onClick={() => setNewTask({...newTask, scheduleType: 'weekly'})}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  newTask.scheduleType === 'weekly' 
                    ? 'ring-2 ring-opacity-20' 
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
                style={newTask.scheduleType === 'weekly' ? { 
                  backgroundColor: colors.primaryLight,
                  borderColor: colors.primary,
                  color: colors.primaryDark,
                  '--tw-ring-color': colors.primary 
                } : {}}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setNewTask({...newTask, scheduleType: 'monthly'})}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  newTask.scheduleType === 'monthly' 
                    ? 'ring-2 ring-opacity-20' 
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
                style={newTask.scheduleType === 'monthly' ? { 
                  backgroundColor: colors.primaryLight,
                  borderColor: colors.primary,
                  color: colors.primaryDark,
                  '--tw-ring-color': colors.primary 
                } : {}}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setNewTask({...newTask, scheduleType: 'interval'})}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  newTask.scheduleType === 'interval' 
                    ? 'ring-2 ring-opacity-20' 
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
                style={newTask.scheduleType === 'interval' ? { 
                  backgroundColor: colors.primaryLight,
                  borderColor: colors.primary,
                  color: colors.primaryDark,
                  '--tw-ring-color': colors.primary 
                } : {}}
              >
                Interval
              </button>
            </div>

            {/* Schedule Configuration */}
            {newTask.scheduleType === 'weekly' && (
              <div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DAY_ABBREVIATIONS.map((day, index) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(index)}
                      className="p-1.5 rounded text-xs font-medium transition-colors text-center"
                      style={{
                        backgroundColor: newTask.selectedDays.includes(index) ? colors.primary : '#f3f4f6',
                        color: newTask.selectedDays.includes(index) ? 'white' : '#374151'
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  {getScheduleDescription(newTask)}
                </div>
                {taskErrors.selectedDays && <p className="text-xs text-red-600 mt-1">{taskErrors.selectedDays}</p>}
              </div>
            )}

            {newTask.scheduleType === 'monthly' && (
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Week of Month</label>
                  <div className="grid grid-cols-5 gap-1">
                    {['first', 'second', 'third', 'fourth', 'last'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleMonthlyType(type)}
                        className="px-2 py-1.5 rounded text-xs font-medium transition-colors"
                        style={{
                          backgroundColor: newTask.monthlyTypes.includes(type) ? colors.primary : '#f3f4f6',
                          color: newTask.monthlyTypes.includes(type) ? 'white' : '#374151'
                        }}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Days of Week</label>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {DAY_ABBREVIATIONS.map((day, index) => (
                      <button
                        key={day}
                        onClick={() => toggleDay(index)}
                        className="p-1.5 rounded text-xs font-medium transition-colors text-center"
                        style={{
                          backgroundColor: (newTask.monthlyDays || []).includes(index) ? colors.primary : '#f3f4f6',
                          color: (newTask.monthlyDays || []).includes(index) ? 'white' : '#374151'
                        }}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    {getScheduleDescription(newTask)}
                  </div>
                  {taskErrors.selectedDays && <p className="text-xs text-red-600 mt-1">{taskErrors.selectedDays}</p>}
                </div>
              </div>
            )}

            {newTask.scheduleType === 'interval' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Every</span>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={newTask.intervalWeeks}
                    onChange={(e) => setNewTask({...newTask, intervalWeeks: parseInt(e.target.value) || 1})}
                    className="w-12 px-1 py-1 text-xs border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ focusRingColor: colors.primary + '50' }}
                  />
                  <span className="text-xs text-gray-600">weeks on:</span>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DAY_ABBREVIATIONS.map((day, index) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(index)}
                      className="p-1.5 rounded text-xs font-medium transition-colors text-center"
                      style={{
                        backgroundColor: newTask.selectedDays.includes(index) ? colors.primary : '#f3f4f6',
                        color: newTask.selectedDays.includes(index) ? 'white' : '#374151'
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  {getScheduleDescription(newTask)}
                </div>
                {taskErrors.selectedDays && <p className="text-xs text-red-600 mt-1">{taskErrors.selectedDays}</p>}
              </div>
            )}
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
            disabled={!isFormValid()}
            className="flex-1 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-1 text-sm text-white"
            style={{
              backgroundColor: isFormValid() ? colors.primary : '#d1d5db',
              opacity: isFormValid() ? 1 : 0.5,
              cursor: isFormValid() ? 'pointer' : 'not-allowed'
            }}
          >
            {editingTask ? <Edit2 size={14} /> : <Plus size={14} />}
            {editingTask ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;