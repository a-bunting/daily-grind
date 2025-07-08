import { AlertTriangle, Calendar, ChevronDown, Download, Edit2, LogIn, LogOut, Palette, Plus, Settings, Upload, User, X, BarChart3, Target, TrendingUp, Minimize2, Maximize2 } from 'lucide-react';
import { useState } from 'react';
import { COLOR_SCHEMES, DAY_ABBREVIATIONS } from '../../constants';
import { useApp } from '../AppProvider';
import { dateUtils, timeUtils } from '../../utils/index';

export const Sidebar = ({ 
  showMobileMenu, 
  setShowMobileMenu, 
  setShowTaskModal, 
  setEditingTask, 
  setShowAuthModal, 
  setShowSettings,
  setShowGoalModal = null,
  setEditingGoal = null,
  handleLogin,
  handleLogout,
  handleSync,
  handleReload,
  generateFakeData,
  handleViewAnalytics,
  addSingletonTask,
  deleteTask,
  isLoading
}) => {
  const {
    tasks,
    categories,
    goals,
    currentDate,
    currentColorScheme,
    setCurrentColorScheme,
    isMobile,
    isTablet,
    colors,
    user,
    getGoalDisplayProgress,
    updateGoal,
    deleteGoal,
    // Add these to AppProvider if not already there:
    sidebarCompactMode,
    setSidebarCompactMode,
    sidebarActiveTab,
    setSidebarActiveTab
  } = useApp();

  const [showColorDropdown, setShowColorDropdown] = useState(false);
  
  // Fallback for active tab if not in AppProvider yet
  const [localActiveTab, setLocalActiveTab] = useState('tasks');
  const activeTab = sidebarActiveTab !== undefined ? sidebarActiveTab : localActiveTab;
  const setActiveTab = setSidebarActiveTab || setLocalActiveTab;
  
  // Fallback for compact mode if not in AppProvider yet
  const [localCompactMode, setLocalCompactMode] = useState(false);
  const compactMode = sidebarCompactMode !== undefined ? sidebarCompactMode : localCompactMode;
  const setCompactMode = setSidebarCompactMode || setLocalCompactMode;

  const renderTasksTab = () => (
    <div className="space-y-2">
      {tasks.filter(task => !task.endDate || task.endDate >= dateUtils.getDateString(new Date())).map(task => {
        const category = categories.find(cat => cat.id === task.categoryId);
        return (
          <div key={task.id} className={`border rounded-lg bg-gray-50 ${compactMode ? 'p-2' : 'p-3'}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: task.color || colors.taskColors[0] }}
                ></div>
                <h4 className="text-xs font-medium">{task.name}</h4>
                {category && !compactMode && (
                  <span className="text-xs" title={category.name}>{category.icon}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => addSingletonTask(task.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Add to today"
                >
                  <Plus size={10} />
                </button>
                {!compactMode && (
                  <button
                    onClick={() => handleViewAnalytics(task)}
                    className="p-1 hover:bg-gray-200 rounded"
                    title="View analytics"
                  >
                    <BarChart3 size={10} />
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingTask(task);
                    setShowTaskModal(true);
                    if (isMobile || isTablet) setShowMobileMenu(false);
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Edit task"
                >
                  <Edit2 size={10} />
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Stop task (preserves history)"
                >
                  <X size={10} />
                </button>
              </div>
            </div>
            
            {!compactMode && (
              <>
                <p className="text-xs text-gray-600 mb-2">
                  {task.taskType === 'time' 
                    ? `${timeUtils.formatPlannedTime(task.plannedMinutes || 0)}`
                    : `Target: ${task.targetCount || 0}`
                  }
                  {(() => {
                    switch (task.scheduleType || 'weekly') {
                      case 'monthly':
                        const monthlyDays = task.monthlyDays || [];
                        const dayNames = monthlyDays.map(d => DAY_ABBREVIATIONS[d]).join(', ');
                        const monthlyTypes = task.monthlyTypes || [task.monthlyType || 'first'];
                        return ` • ${monthlyTypes.join(' & ')} ${dayNames} monthly`;
                      case 'interval':
                        return ` • every ${task.intervalWeeks || 2} weeks on ${(task.selectedDays || []).map(d => DAY_ABBREVIATIONS[d]).join(', ')}`;
                      default:
                        return ` • weekly: ${(task.selectedDays || []).map(d => DAY_ABBREVIATIONS[d]).join(', ')}`;
                    }
                  })()}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Start: {task.startDate}</span>
                  {task.endDate && <span>End: {task.endDate}</span>}
                </div>
              </>
            )}
          </div>
        );
      })}
      {tasks.filter(task => !task.endDate || task.endDate >= dateUtils.getDateString(new Date())).length === 0 && (
        <p className="text-xs text-gray-500 text-center py-4">No active tasks</p>
      )}
    </div>
  );

  const renderGoalsTab = () => (
    <div className="space-y-2">
      {goals.map(goal => {
        const progressData = getGoalDisplayProgress(goal);
        const linkedTasks = tasks.filter(task => task.goalId === goal.id);
        
        return (
          <div key={goal.id} className={`border rounded-lg bg-gray-50 ${compactMode ? 'p-2' : 'p-3'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target size={12} className="text-blue-600" />
                <h4 className="text-xs font-medium">{goal.name}</h4>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (setEditingGoal && setShowGoalModal) {
                      setEditingGoal(goal);
                      setShowGoalModal(true);
                      if (isMobile || isTablet) setShowMobileMenu(false);
                    } else {
                      console.warn('Goal modal props not provided to Sidebar component');
                      alert('Goal editing not yet implemented. Please add setShowGoalModal and setEditingGoal props to Sidebar.');
                    }
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Edit goal"
                >
                  <Edit2 size={10} />
                </button>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Delete goal"
                >
                  <X size={10} />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className={compactMode ? 'mb-1' : 'mb-2'}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-600">{compactMode ? `${progressData.current}/${goal.targetValue}${goal.unit ? ` ${goal.unit}` : ''}` : progressData.label}</span>
                <span className="text-xs font-medium" style={{ color: colors.primary }}>
                  {progressData.percentage.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    backgroundColor: colors.primary,
                    width: `${Math.min(progressData.percentage, 100)}%`
                  }}
                ></div>
              </div>
              {progressData.secondary && !compactMode && (
                <p className="text-xs text-gray-500 mt-1">{progressData.secondary}</p>
              )}
            </div>

            {/* Goal details */}
            {!compactMode && (
              <div className="text-xs text-gray-600 space-y-1">
                <p>Type: {goal.goalType === 'personalBest' ? 'Personal Best' : 'Cumulative'}</p>
                {goal.targetDate && (
                  <p>Target Date: {goal.targetDate}</p>
                )}
                {linkedTasks.length > 0 && (
                  <div>
                    <p className="font-medium">Linked Tasks:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {linkedTasks.map(task => (
                        <span 
                          key={task.id} 
                          className="px-2 py-1 bg-gray-200 rounded text-xs"
                          title={task.name}
                        >
                          {task.name.length > 15 ? task.name.substring(0, 15) + '...' : task.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      {goals.length === 0 && (
        <p className="text-xs text-gray-500 text-center py-4">No goals created yet</p>
      )}
    </div>
  );

  return (
    <div className={`${
      isMobile || isTablet
        ? (showMobileMenu ? 'translate-x-0' : '-translate-x-full') + ' fixed'
        : 'fixed left-0 top-0 translate-x-0'
    } w-80 bg-white/90 backdrop-blur-sm shadow-lg flex flex-col z-50 transition-transform duration-300 ease-in-out h-screen mobile-sidebar`}>
      
      {/* Header */}
      <div className="p-4 h-16 flex items-center relative overflow-hidden">
        <div 
          className="absolute -left-8 -top-4 w-32 h-32 rounded-full opacity-15"
          style={{
            background: `radial-gradient(circle, ${colors.primary} 0%, ${colors.accent} 70%, transparent 100%)`
          }}
        ></div>
        
        <div className="flex items-center justify-between w-full relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div 
                className="w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center"
              >
                <Calendar size={20} style={{ color: colors.primary }} />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-gray-800 leading-tight">The Daily Grind</h1>
              <p className="text-xs text-gray-600">{dateUtils.formatDisplayDate(currentDate)}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings size={16} />
            </button>

            {/* Mobile & Tablet close button */}
            {(isMobile || isTablet) && (
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User Section */}
      <div className="border-b p-4">
        {user ? (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-800">{user.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Logout"
            >
              <LogOut size={14} className="text-gray-600" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Sign in to sync your data</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors text-sm bg-blue-600 text-white hover:bg-blue-700"
            >
              <LogIn size={16} />
              Sign In
            </button>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b px-4 py-2">
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'tasks'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 size={14} />
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'goals'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Target size={14} />
            Goals
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-800">
                {activeTab === 'tasks' ? 'All Tasks' : 'All Goals'}
              </h3>
              <button 
                onClick={() => {
                  if (activeTab === 'tasks') {
                    setEditingTask(null);
                    setShowTaskModal(true);
                  } else if (activeTab === 'goals') {
                    if (setEditingGoal && setShowGoalModal) {
                      setEditingGoal(null);
                      setShowGoalModal(true);
                    } else {
                      console.warn('Goal modal props not provided to Sidebar component');
                      alert('Goal creation not yet implemented. Please add setShowGoalModal and setEditingGoal props to Sidebar.');
                    }
                  }
                  if (isMobile || isTablet) setShowMobileMenu(false);
                }}
                className="flex items-center justify-center p-1 rounded-md transition-colors text-white hover:opacity-90"
                style={{ backgroundColor: colors.primary }}
                title={activeTab === 'tasks' ? 'Add New Task' : 'Add New Goal'}
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              onClick={() => setCompactMode(!compactMode)}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              title={compactMode ? 'Expand view' : 'Compact view'}
            >
              {compactMode ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </button>
          </div>
        </div>
        <div className="px-4 pb-4">
          {activeTab === 'tasks' ? renderTasksTab() : renderGoalsTab()}
        </div>
      </div>

      {/* Footer with controls */}
      <div className="border-t p-4 space-y-3">
        {user && (
          <div className="flex gap-2">
            <button
              onClick={handleSync}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
              title="Force sync to cloud"
            >
              <Upload size={14} />
              {isLoading ? 'Syncing...' : 'Sync'}
            </button>
            <button
              onClick={handleReload}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
              title="Reload from cloud"
            >
              <Download size={14} />
              {isLoading ? 'Loading...' : 'Reload'}
            </button>
          </div>
        )}
        
        <button
          onClick={generateFakeData}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
        >
          <AlertTriangle size={14} />
          Load Test Data
        </button>
        
        <div className="color-dropdown relative">
          <button
            onClick={() => setShowColorDropdown(!showColorDropdown)}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-sm"
          >
            <div className="flex items-center gap-2">
              <Palette size={14} className="text-gray-600" />
              <span className="text-gray-700">Theme: {colors.name}</span>
            </div>
            <ChevronDown 
              size={12} 
              className={`text-gray-600 transition-transform ${showColorDropdown ? 'rotate-180' : ''}`} 
            />
          </button>
          {showColorDropdown && (
            <div className="absolute bottom-full left-0 mb-1 bg-white rounded-lg shadow-lg border p-2 w-full" style={{ zIndex: 1000 }}>
              <h4 className="text-xs font-semibold mb-2 text-gray-700">Choose Theme</h4>
              {Object.entries(COLOR_SCHEMES).map(([key, scheme]) => (
                <div
                  key={key}
                  onClick={() => {
                    setCurrentColorScheme(key);
                    setShowColorDropdown(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded text-sm hover:bg-gray-100 cursor-pointer ${
                    currentColorScheme === key ? 'bg-blue-100' : ''
                  }`}
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: scheme.primary }}
                  ></div>
                  <span>{scheme.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;