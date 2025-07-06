import { Edit2, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DAY_ABBREVIATIONS } from '../constants';
import {useApp} from './AppProvider';
import { getScheduleDescription } from '../utils';
import { dateUtils } from '../utils/index';
import CategoryPicker from './CategoryPicker';
import ColorPicker from './ColorPicker';


export const TaskModal = ({ isOpen, onClose, editingTask, onSave }) => {
  const { colors, isMobile, categories, sections } = useApp();
  const [newTask, setNewTask] = useState({
    name: '',
    plannedMinutes: '',
    targetCount: '',
    taskType: 'time',
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
    } else {
      if (!newTask.targetCount || newTask.targetCount <= 0) errors.targetCount = 'Count must be greater than 0';
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
    const hasValidTarget = newTask.taskType === 'time' 
      ? (newTask.plannedMinutes && !isNaN(parseFloat(newTask.plannedMinutes)) && parseFloat(newTask.plannedMinutes) > 0)
      : (newTask.targetCount && newTask.targetCount > 0);
    
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
    if (validateNewTask()) {
      onSave(newTask, editingTask);
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

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`bg-white rounded-xl shadow-2xl w-full max-h-[95vh] overflow-y-auto ${isMobile ? 'max-w-sm' : 'max-w-lg'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-4 space-y-3">
          {/* Task Name with Color Picker and Category */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter task name..."
              value={newTask.name}
              onChange={(e) => setNewTask({...newTask, name: e.target.value})}
              className={`flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                taskErrors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              autoFocus
            />
            <CategoryPicker
              selectedCategory={newTask.categoryId}
              onChange={(categoryId) => setNewTask({...newTask, categoryId})}
              categories={categories}
            />
            <ColorPicker
              color={newTask.color}
              onChange={(color) => setNewTask({...newTask, color})}
              colors={colors.taskColors}
            />
          </div>
          {taskErrors.name && <p className="text-xs text-red-600">{taskErrors.name}</p>}

          {/* Section Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Section</label>
            <select
              value={newTask.sectionId}
              onChange={(e) => setNewTask({...newTask, sectionId: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {sections.map(section => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>

          {/* Task Type and Target */}
          <div className="flex gap-2">
            <div className="w-32">
              <div className="flex">
                <button
                  type="button"
                  onClick={() => setNewTask({...newTask, taskType: 'time'})}
                  className={`flex-1 px-2 py-3 rounded-l text-sm font-medium transition-colors ${
                    newTask.taskType === 'time' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Time
                </button>
                <button
                  type="button"
                  onClick={() => setNewTask({...newTask, taskType: 'count'})}
                  className={`flex-1 px-2 py-3 rounded-r text-sm font-medium transition-colors ${
                    newTask.taskType === 'count' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Count
                </button>
              </div>
            </div>
            
            <div className="flex-1">
              {newTask.taskType === 'time' ? (
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="Minutes"
                  value={newTask.plannedMinutes}
                  onChange={(e) => setNewTask({...newTask, plannedMinutes: e.target.value})}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                    taskErrors.plannedMinutes ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
              ) : (
                <input
                  type="number"
                  min="1"
                  placeholder="Target count"
                  value={newTask.targetCount}
                  onChange={(e) => setNewTask({...newTask, targetCount: e.target.value})}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                    taskErrors.targetCount ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
              )}
            </div>
          </div>
          {(taskErrors.plannedMinutes || taskErrors.targetCount) && (
            <p className="text-xs text-red-600">{taskErrors.plannedMinutes || taskErrors.targetCount}</p>
          )}

          {/* Start and End Date */}
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="date"
                value={newTask.startDate}
                onChange={(e) => setNewTask({...newTask, startDate: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                title="Start Date"
              />
            </div>
            <div className="flex-1">
              <input
                type="date"
                value={newTask.endDate}
                onChange={(e) => setNewTask({...newTask, endDate: e.target.value})}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                  taskErrors.endDate ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="End date (optional)"
                title="End Date (Optional)"
              />
            </div>
          </div>
          {taskErrors.endDate && <p className="text-xs text-red-600">{taskErrors.endDate}</p>}

          {/* Schedule Type */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Schedule Type</label>
            <div className="flex gap-1 mb-2">
              <button
                type="button"
                onClick={() => setNewTask({...newTask, scheduleType: 'weekly'})}
                className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
                  newTask.scheduleType === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setNewTask({...newTask, scheduleType: 'monthly'})}
                className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
                  newTask.scheduleType === 'monthly' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setNewTask({...newTask, scheduleType: 'interval'})}
                className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
                  newTask.scheduleType === 'interval' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Every N Weeks
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
                      className="p-2 rounded text-xs font-medium transition-colors text-center"
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
                  <label className="text-xs text-gray-600 block mb-1">Week of Month (can select multiple)</label>
                  <div className="flex gap-1 flex-wrap">
                    {['first', 'second', 'third', 'fourth', 'last'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleMonthlyType(type)}
                        className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
                          newTask.monthlyTypes.includes(type) ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
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
                        className="p-2 rounded text-xs font-medium transition-colors text-center"
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
                  <span className="text-sm text-gray-600">Every</span>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={newTask.intervalWeeks}
                    onChange={(e) => setNewTask({...newTask, intervalWeeks: parseInt(e.target.value) || 1})}
                    className="w-16 p-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <span className="text-sm text-gray-600">weeks on:</span>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DAY_ABBREVIATIONS.map((day, index) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(index)}
                      className="p-2 rounded text-xs font-medium transition-colors text-center"
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
        
        <div className="flex gap-2 p-4 border-t bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-3 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isFormValid()}
            className="flex-1 py-3 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-1 text-sm"
            style={{
              backgroundColor: isFormValid() ? colors.primary : '#d1d5db',
              color: isFormValid() ? 'white' : '#6b7280',
              cursor: isFormValid() ? 'pointer' : 'not-allowed'
            }}
          >
            {editingTask ? <Edit2 size={16} /> : <Plus size={16} />}
            {editingTask ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;