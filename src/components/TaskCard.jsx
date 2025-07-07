import { Check, EyeOff, GripVertical, Minus, Pause, Play, Plus, RotateCcw, Target, TrendingUp } from 'lucide-react';
import {useApp} from './AppProvider';
import { useTaskActions } from '../hooks/useTaskActions';
import { useTaskProgress } from '../hooks/useTaskProgress';
import { timeUtils } from '../utils/index';

export const TaskCard = ({ task, onEdit, onDelete, onSkip, onInputClick, section, isDragging, onDragStart, onDragEnd, editMode }) => {
  const { colors, isMobile, categories, goals, currentDate, setDraggedTask } = useApp();
  const { getDateProgress, getProgress } = useTaskProgress();
  const { toggleTimer, resetTimer, incrementCount, decrementCount, toggleCheckbox } = useTaskActions();

  const dateProgress = getDateProgress(task, currentDate);
  const progress = getProgress(task, currentDate);
  const category = categories.find(cat => cat.id === task.categoryId);

  // Check if this is a single-count task (checkbox behavior)
  const isSingleCount = task.taskType === 'count' && task.targetCount === 1;

  // Add input task support
  const isInputTask = task.taskType === 'input';
  const linkedGoal = goals?.find(g => g.id === task.goalId);
  const inputProgress = isInputTask ? dateProgress.inputValue : null;

  // Use layout settings from section, but force mobile to minimal/1col
  const layoutMode = isMobile ? 'minimal' : (section?.layoutMode || 'list');
  const columnCount = isMobile ? 1 : (section?.columnCount || 1);
  const useGridLayout = columnCount > 1;

  const handleDragStart = (e) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id.toString());
    onDragStart?.(task);
  };

  const handleDragEnd = (e) => {
    setDraggedTask(null);
    onDragEnd?.();
  };

  if (layoutMode === 'minimal') {
    if (useGridLayout && columnCount === 3) {
      // For minimal mode with 3 columns - span two rows
      return (
        <div 
          className={`bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow flex flex-col ${
            editMode ? 'cursor-move' : ''
          } ${isDragging ? 'opacity-50' : ''}`}
          draggable={editMode}
          onDragStart={editMode ? handleDragStart : undefined}
          onDragEnd={editMode ? handleDragEnd : undefined}
        >
          <div className="flex items-center gap-2 mb-2">
            {editMode && <GripVertical size={12} className="text-gray-400 flex-shrink-0" />}
            <div 
              className="w-2 h-2 rounded-full flex-shrink-0" 
              style={{ backgroundColor: task.color || colors.accent }}
            />
            <span className="text-sm font-medium text-gray-800 truncate">{task.name}</span>
            {category && (
              <span className="text-xs">{category.icon}</span>
            )}
          </div>
          
          <div className="text-xs text-gray-600 mb-2">
            {task.taskType === 'time' ? 'Time' : 
             task.taskType === 'count' ? 'Count' : 
             'Goal Progress'} • {Math.round(progress)}%
          </div>
          
          <div className="flex flex-wrap gap-1 mt-auto">
            {isInputTask ? (
              <button
                onClick={() => onInputClick(task, currentDate)}
                className="p-1 bg-blue-500 text-white rounded text-xs"
                title="Log progress"
              >
                <TrendingUp size={10} />
              </button>
            ) : task.taskType === 'time' ? (
              <>
                <button
                  onClick={() => toggleTimer(task.id)}
                  className={`p-1 rounded ${
                    dateProgress.isRunning ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                  }`}
                >
                  {dateProgress.isRunning ? <Pause size={10} /> : <Play size={10} />}
                </button>
                <button
                  onClick={() => resetTimer(task.id)}
                  className="p-1 bg-gray-500 text-white rounded"
                >
                  <RotateCcw size={10} />
                </button>
              </>
            ) : isSingleCount ? (
              <button
                onClick={() => toggleCheckbox(task.id)}
                className={`p-1 rounded ${
                  dateProgress.currentCount === 1 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                <Check size={10} />
              </button>
            ) : (
              <>
                <button
                  onClick={() => decrementCount(task.id)}
                  disabled={(dateProgress.currentCount || 0) <= 0}
                  className={`p-1 rounded ${
                    (dateProgress.currentCount || 0) <= 0 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-red-500 text-white'
                  }`}
                >
                  <Minus size={10} />
                </button>
                <button
                  onClick={() => incrementCount(task.id)}
                  className="p-1 bg-green-500 text-white rounded"
                >
                  <Plus size={10} />
                </button>
              </>
            )}
            <button
              onClick={() => onSkip(task.id)}
              className="p-1 bg-orange-500 text-white rounded"
              title="Skip today"
            >
              <EyeOff size={10} />
            </button>
          </div>
        </div>
      );
    }
    
    // Regular minimal layout (single column or 2 columns)
    return (
      <div 
        className={`flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow ${
          editMode ? 'cursor-move' : ''
        } ${isDragging ? 'opacity-50' : ''}`}
        draggable={editMode}
        onDragStart={editMode ? handleDragStart : undefined}
        onDragEnd={editMode ? handleDragEnd : undefined}
      >
        {editMode && <GripVertical size={12} className="text-gray-400 flex-shrink-0" />}
        <div 
          className="w-2 h-2 rounded-full flex-shrink-0" 
          style={{ backgroundColor: task.color || colors.accent }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-800 truncate">{task.name}</span>
              {category && (
                <span className="text-xs">{category.icon}</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span>{Math.round(progress)}%</span>
              {isInputTask ? (
                <button
                  onClick={() => onInputClick(task, currentDate)}
                  className="p-1 bg-blue-500 text-white rounded"
                  title="Log progress"
                >
                  <TrendingUp size={10} />
                </button>
              ) : task.taskType === 'time' ? (
                <>
                  <button
                    onClick={() => toggleTimer(task.id)}
                    className={`p-1 rounded ${
                      dateProgress.isRunning ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                    }`}
                  >
                    {dateProgress.isRunning ? <Pause size={10} /> : <Play size={10} />}
                  </button>
                  <button
                    onClick={() => resetTimer(task.id)}
                    className="p-1 bg-gray-500 text-white rounded"
                  >
                    <RotateCcw size={10} />
                  </button>
                </>
              ) : isSingleCount ? (
                <button
                  onClick={() => toggleCheckbox(task.id)}
                  className={`p-1 rounded ${
                    dateProgress.currentCount === 1 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  <Check size={10} />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => decrementCount(task.id)}
                    disabled={(dateProgress.currentCount || 0) <= 0}
                    className={`p-1 rounded ${
                      (dateProgress.currentCount || 0) <= 0 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    <Minus size={10} />
                  </button>
                  <button
                    onClick={() => incrementCount(task.id)}
                    className="p-1 bg-green-500 text-white rounded"
                  >
                    <Plus size={10} />
                  </button>
                </>
              )}
              <button
                onClick={() => onSkip(task.id)}
                className="p-1 bg-orange-500 text-white rounded"
                title="Skip today"
              >
                <EyeOff size={10} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (useGridLayout) {
    return (
      <div 
        className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow h-full flex flex-col ${
          editMode ? 'cursor-move' : ''
        } ${isDragging ? 'opacity-50' : ''}`}
        draggable={editMode}
        onDragStart={editMode ? handleDragStart : undefined}
        onDragEnd={editMode ? handleDragEnd : undefined}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {editMode && <GripVertical size={14} className="text-gray-400 flex-shrink-0" />}
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: task.color || colors.accent }}
            />
            <h4 className="text-sm font-medium text-gray-800 truncate">{task.name}</h4>
          </div>
          <div className="flex items-center gap-1">
            {category && (
              <span className="text-xs">{category.icon}</span>
            )}
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              {task.taskType === 'time' ? 'Time' : 
               task.taskType === 'count' ? 'Count' : 
               'Goal Progress'}
            </span>
          </div>
        </div>
        
        <div className="mb-3 flex-1">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: task.color || colors.accent
              }}
            />
          </div>
        </div>
        
        <div className="text-xs text-gray-600 mb-3">
          {isInputTask ? (
            <span>
              {inputProgress || 0} {task.unit}
              {linkedGoal && ` → ${linkedGoal.name}`}
            </span>
          ) : task.taskType === 'time' ? (
            <span>{timeUtils.formatTime(dateProgress.timeSpent || 0)} / {timeUtils.formatPlannedTime(task.plannedMinutes)}</span>
          ) : (
            <span>{dateProgress.currentCount || 0} / {task.targetCount}</span>
          )}
        </div>
        
        <div className="flex justify-start gap-1 flex-wrap">
          {isInputTask ? (
            <button
              onClick={() => onInputClick(task, currentDate)}
              className="p-1.5 bg-blue-500 text-white rounded text-xs"
              title="Log progress"
            >
              <TrendingUp size={12} />
            </button>
          ) : task.taskType === 'time' ? (
            <>
              <button
                onClick={() => toggleTimer(task.id)}
                className={`p-1.5 rounded text-white text-xs ${
                  dateProgress.isRunning ? 'bg-red-500' : 'bg-green-500'
                }`}
              >
                {dateProgress.isRunning ? <Pause size={12} /> : <Play size={12} />}
              </button>
              <button
                onClick={() => resetTimer(task.id)}
                className="p-1.5 bg-gray-500 text-white rounded text-xs"
              >
                <RotateCcw size={12} />
              </button>
            </>
          ) : isSingleCount ? (
            <button
              onClick={() => toggleCheckbox(task.id)}
              className={`p-1.5 rounded text-xs ${
                dateProgress.currentCount === 1 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}
            >
              <Check size={12} />
            </button>
          ) : (
            <>
              <button
                onClick={() => decrementCount(task.id)}
                disabled={(dateProgress.currentCount || 0) <= 0}
                className={`p-1.5 rounded text-xs ${
                  (dateProgress.currentCount || 0) <= 0 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-red-500 text-white'
                }`}
              >
                <Minus size={12} />
              </button>
              <button
                onClick={() => incrementCount(task.id)}
                className="p-1.5 bg-green-500 text-white rounded text-xs"
              >
                <Plus size={12} />
              </button>
            </>
          )}
          <button
            onClick={() => onSkip(task.id)}
            className="p-1.5 bg-orange-500 text-white rounded text-xs"
            title="Skip today"
          >
            <EyeOff size={12} />
          </button>
        </div>
      </div>
    );
  }

  if (layoutMode === 'compact') {
    return (
      <div
        className={`bg-gray-50 rounded-lg border-l-4 p-3 ${
          editMode ? 'cursor-move' : ''
        } ${isDragging ? 'opacity-50' : ''}`}
        style={{ borderLeftColor: task.color || colors.accent }}
        draggable={editMode}
        onDragStart={editMode ? handleDragStart : undefined}
        onDragEnd={editMode ? handleDragEnd : undefined}
      >
        <div className="flex items-center gap-3">
          {editMode && <GripVertical size={14} className="text-gray-400 flex-shrink-0" />}
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0" 
            style={{ backgroundColor: task.color || colors.accent }}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium text-gray-800 truncate">{task.name}</h4>
              {category && (
                <span className="text-xs">{category.icon}</span>
              )}
              <span className="text-xs bg-gray-200 px-2 py-1 rounded flex-shrink-0">
                {task.taskType === 'time' ? 'Time' : 
                 task.taskType === 'count' ? 'Count' : 
                 'Goal Progress'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
              {isInputTask ? (
                <span>
                  {inputProgress || 0} {task.unit}
                  {linkedGoal && ` → ${linkedGoal.name}`}
                </span>
              ) : task.taskType === 'time' ? (
                <span>{timeUtils.formatTime(dateProgress.timeSpent || 0)} / {timeUtils.formatPlannedTime(task.plannedMinutes)}</span>
              ) : (
                <span>{dateProgress.currentCount || 0} / {task.targetCount}</span>
              )}
              <span>•</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: task.color || colors.accent
                }}
              ></div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            {isInputTask ? (
              <button
                onClick={() => onInputClick(task, currentDate)}
                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                title="Log progress"
              >
                <TrendingUp size={12} />
              </button>
            ) : task.taskType === 'time' ? (
              <>
                <button
                  onClick={() => toggleTimer(task.id)}
                  className={`p-2 rounded transition-colors ${
                    dateProgress.isRunning
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {dateProgress.isRunning ? <Pause size={12} /> : <Play size={12} />}
                </button>
                <button
                  onClick={() => resetTimer(task.id)}
                  className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  <RotateCcw size={12} />
                </button>
              </>
            ) : isSingleCount ? (
              <button
                onClick={() => toggleCheckbox(task.id)}
                className={`p-2 rounded transition-colors ${
                  dateProgress.currentCount === 1
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                }`}
              >
                <Check size={12} />
              </button>
            ) : (
              <>
                <button
                  onClick={() => decrementCount(task.id)}
                  disabled={(dateProgress.currentCount || 0) <= 0}
                  className={`p-2 rounded transition-colors ${
                    (dateProgress.currentCount || 0) <= 0 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  <Minus size={12} />
                </button>
                <button
                  onClick={() => incrementCount(task.id)}
                  className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  <Plus size={12} />
                </button>
                <button
                  onClick={() => resetTimer(task.id)}
                  className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  <RotateCcw size={12} />
                </button>
              </>
            )}
            <button
              onClick={() => onSkip(task.id)}
              className="p-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
              title="Skip today"
            >
              <EyeOff size={12} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border-l-4 border rounded-xl p-4 bg-gray-50 ${
        editMode ? 'cursor-move' : ''
      } ${isDragging ? 'opacity-50' : ''}`}
      style={{ borderLeftColor: task.color || colors.accent }}
      draggable={editMode}
      onDragStart={editMode ? handleDragStart : undefined}
      onDragEnd={editMode ? handleDragEnd : undefined}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {editMode && <GripVertical size={16} className="text-gray-400 flex-shrink-0" />}
          <h4 className="text-lg font-medium text-gray-800">{task.name}</h4>
          {category && (
            <span className="text-lg" title={category.name}>{category.icon}</span>
          )}
          <span className="text-xs bg-gray-200 px-2 py-1 rounded flex-shrink-0">
            {task.taskType === 'time' ? 'Time' : 
             task.taskType === 'count' ? 'Count' : 
             'Goal Progress'}
          </span>
        </div>
        <div className="text-sm font-medium text-gray-600">
          {Math.round(progress)}%
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: task.color || colors.accent
            }}
          ></div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        {isInputTask ? (
          <>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-gray-600">Goal: </span>
                <span className="font-medium">{linkedGoal?.name || 'No goal linked'}</span>
              </div>
              <div>
                <span className="text-gray-600">Progress: </span>
                <span className="font-medium text-green-600">
                  {inputProgress || 0} {task.unit}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => onInputClick(task, currentDate)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <TrendingUp size={16} />
                {inputProgress ? 'Update Progress' : 'Log Progress'}
              </button>
              <button
                onClick={() => onSkip(task.id)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium bg-orange-600 text-white hover:bg-orange-700"
                title="Skip today"
              >
                <EyeOff size={16} />
                Skip
              </button>
            </div>
          </>
        ) : task.taskType === 'time' ? (
          <>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-gray-600">Planned: </span>
                <span className="font-medium">{timeUtils.formatPlannedTime(task.plannedMinutes)}</span>
              </div>
              <div>
                <span className="text-gray-600">Spent: </span>
                <span className="font-medium text-green-600">
                  {timeUtils.formatTime(dateProgress.timeSpent || 0)}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => toggleTimer(task.id)}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  dateProgress.isRunning
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {dateProgress.isRunning ? <Pause size={16} /> : <Play size={16} />}
                {dateProgress.isRunning ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={() => resetTimer(task.id)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium bg-gray-600 text-white hover:bg-gray-700"
                title="Reset"
              >
                <RotateCcw size={16} />
                Reset
              </button>
              <button
                onClick={() => onSkip(task.id)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium bg-orange-600 text-white hover:bg-orange-700"
                title="Skip today"
              >
                <EyeOff size={16} />
                Skip
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-gray-600">Target: </span>
                <span className="font-medium">{task.targetCount}</span>
              </div>
              <div>
                <span className="text-gray-600">Current: </span>
                <span className="font-medium text-green-600">
                  {dateProgress.currentCount || 0}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              {isSingleCount ? (
                <button
                  onClick={() => toggleCheckbox(task.id)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    dateProgress.currentCount === 1
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  <Check size={16} />
                  {dateProgress.currentCount === 1 ? 'Done' : 'Mark Done'}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => decrementCount(task.id)}
                    disabled={(dateProgress.currentCount || 0) <= 0}
                    className={`flex items-center justify-center w-10 h-10 rounded-lg font-medium transition-colors ${
                      (dateProgress.currentCount || 0) <= 0 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    <Minus size={16} />
                  </button>
                  <button
                    onClick={() => incrementCount(task.id)}
                    className="flex items-center justify-center w-10 h-10 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </>
              )}
              <button
                onClick={() => resetTimer(task.id)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium bg-gray-600 text-white hover:bg-gray-700"
                title="Reset"
              >
                <RotateCcw size={16} />
                Reset
              </button>
              <button
                onClick={() => onSkip(task.id)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium bg-orange-600 text-white hover:bg-orange-700"
                title="Skip today"
              >
                <EyeOff size={16} />
                Skip
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskCard;