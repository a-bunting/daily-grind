import { AlertTriangle, BarChart3, Calendar, ChevronDown, ChevronLeft, ChevronRight, Clock, Download, Edit2, Eye, LogIn, LogOut, Menu, Palette, Plus, Settings, Upload, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { COLOR_SCHEMES, DAYS, DAY_ABBREVIATIONS, MONTHS } from '../constants';
import {useApp} from './AppProvider';
import { useSectionLogic } from '../hooks/useSectionLogic';
import { useTaskActions } from '../hooks/useTaskActions';
import { useTaskProgress } from '../hooks/useTaskProgress';
import { useTaskScheduling } from '../hooks/useTaskScheduling';
import { dateUtils, timeUtils } from '../utils/index';
import {AuthModal} from './AuthModal';
import {DemoNotice} from './DemoNotice';
import {SectionEditModal} from './SectionEditModal';
import {SettingsModal} from './SettingsModal';
import {TaskAnalyticsView} from './TaskAnalyticsView';
import {TaskModal} from './TaskModal';
import {TaskSection} from './TaskSection';
import {WeeklySummaryView} from './WeeklySummaryView';
import { AdvancedStatistics } from './AdvancedStatistics';

export const DailyTodoApp = () => {
  const {
    tasks, setTasks,
    categories, 
    sections, setSections,
    currentDate, setCurrentDate,
    viewMode, setViewMode,
    editMode, setEditMode,
    currentColorScheme, setCurrentColorScheme,
    isMobile, isTablet, 
    colors, user, setUser, isLoading, setIsLoading,
    analyticsTask, setAnalyticsTask,
    weekSummaryDate, setWeekSummaryDate,
    showSettings, setShowSettings,
    setDraggedTask,
    setDragOverSection
  } = useApp();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);

  const { isTaskScheduledForDate, getTasksWithDataForDate } = useTaskScheduling();
  const { getDayProgress, getDateProgress, getProgress } = useTaskProgress();
  const { skipTaskForDay, addSingletonTask, deleteTask } = useTaskActions();
  const { getTasksForSection } = useSectionLogic();

  const getTodaysTasks = () => {
    return tasks.filter(task => isTaskScheduledForDate(task, currentDate));
  };

  const navigateWeek = (direction) => {
    const currentWeek = weekSummaryDate || currentDate;
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction * 7));
    setWeekSummaryDate(newWeek);
  };

  const navigateDay = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setViewMode('day');
  };

  const handleLogin = (userData) => {
    setUser(userData);
    console.log('User logged in:', userData);
  };

  const handleLogout = () => {
    setUser(null);
    console.log('User logged out');
  };

  const handleSync = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Data synced to cloud');
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReload = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Data reloaded from cloud');
    } catch (error) {
      console.error('Reload failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskSave = (taskData, editingTask) => {
    if (editingTask) {
      setTasks(tasks.map(task => 
        task.id === editingTask.id 
          ? {
              ...task,
              name: taskData.name.trim(),
              taskType: taskData.taskType,
              plannedMinutes: taskData.taskType === 'time' ? parseFloat(taskData.plannedMinutes) : null,
              targetCount: taskData.taskType === 'count' ? parseInt(taskData.targetCount) : null,
              selectedDays: taskData.selectedDays,
              startDate: taskData.startDate,
              endDate: taskData.endDate || null,
              color: taskData.color,
              categoryId: taskData.categoryId,
              scheduleType: taskData.scheduleType,
              monthlyTypes: taskData.monthlyTypes,
              monthlyDays: taskData.monthlyDays,
              intervalWeeks: taskData.intervalWeeks,
              sectionId: taskData.sectionId
            }
          : task
      ));
    } else {
      const task = {
        id: Date.now(),
        name: taskData.name.trim(),
        taskType: taskData.taskType,
        plannedMinutes: taskData.taskType === 'time' ? parseFloat(taskData.plannedMinutes) : null,
        targetCount: taskData.taskType === 'count' ? parseInt(taskData.targetCount) : null,
        selectedDays: taskData.selectedDays,
        dailyProgress: {},
        excludedDates: [],
        oneOffDates: [],
        startDate: taskData.startDate,
        endDate: taskData.endDate || null,
        color: taskData.color,
        categoryId: taskData.categoryId,
        scheduleType: taskData.scheduleType,
        monthlyTypes: taskData.monthlyTypes,
        monthlyDays: taskData.monthlyDays,
        intervalWeeks: taskData.intervalWeeks,
        sectionId: taskData.sectionId
      };
      setTasks([...tasks, task]);
    }
    setEditingTask(null);
  };

  const handleSectionSave = (sectionData) => {
    if (editingSection) {
      setSections(sections.map(section =>
        section.id === editingSection.id
          ? { ...section, ...sectionData }
          : section
      ));
    } else {
      const newSection = {
        id: Date.now().toString(),
        taskOrder: [],
        showBackground: true,
        ...sectionData
      };
      setSections([...sections, newSection]);
    }
    setEditingSection(null);
  };

  const handleTaskMove = (taskId, targetSectionId) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, sectionId: targetSectionId }
        : task
    ));

    // Update section task orders
    setSections(sections.map(section => {
      if (section.id === targetSectionId) {
        const taskOrder = section.taskOrder || [];
        if (!taskOrder.includes(taskId)) {
          return {
            ...section,
            taskOrder: [...taskOrder, taskId]
          };
        }
      } else {
        // Remove from other sections
        return {
          ...section,
          taskOrder: (section.taskOrder || []).filter(id => id !== taskId)
        };
      }
      return section;
    }));
  };

  const handleSectionMove = (sectionId, direction) => {
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    if (currentIndex === -1) return;
    
    let newIndex;
    if (direction === 'up') {
      newIndex = Math.max(0, currentIndex - 1);
    } else if (direction === 'down') {
      newIndex = Math.min(sections.length - 1, currentIndex + 1);
    } else {
      return;
    }
    
    if (newIndex !== currentIndex) {
      const newSections = [...sections];
      const sectionToMove = newSections.splice(currentIndex, 1)[0];
      newSections.splice(newIndex, 0, sectionToMove);
      setSections(newSections);
    }
  };

  const handleSectionDelete = (sectionId) => {
    // Don't allow deleting the default section
    if (sectionId === 'default') return;
    
    // Move all tasks from deleted section to default section
    setTasks(tasks.map(task => 
      task.sectionId === sectionId
        ? { ...task, sectionId: 'default' }
        : task
    ));
    
    setSections(sections.filter(section => section.id !== sectionId));
  };

  const generateFakeData = () => {
    const fakeColors = colors.taskColors;
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const fakeTasks = [
      {
        id: Date.now() + 1,
        name: "Morning Exercise",
        taskType: "time",
        plannedMinutes: 30,
        targetCount: null,
        selectedDays: [1, 2, 3, 4, 5],
        dailyProgress: {},
        excludedDates: [],
        oneOffDates: [],
        startDate: dateUtils.getDateString(oneWeekAgo),
        endDate: null,
        color: fakeColors[0],
        categoryId: 'fitness',
        scheduleType: 'weekly',
        monthlyTypes: ['first'],
        monthlyDays: [],
        intervalWeeks: 2,
        sectionId: 'default'
      },
      {
        id: Date.now() + 2,
        name: "Read Pages",
        taskType: "count",
        plannedMinutes: null,
        targetCount: 10,
        selectedDays: [0, 1, 2, 3, 4, 5, 6],
        dailyProgress: {},
        excludedDates: [],
        oneOffDates: [],
        startDate: dateUtils.getDateString(oneWeekAgo),
        endDate: null,
        color: fakeColors[1],
        categoryId: 'learning',
        scheduleType: 'weekly',
        monthlyTypes: ['first'],
        monthlyDays: [],
        intervalWeeks: 2,
        sectionId: 'default'
      },
      {
        id: Date.now() + 3,
        name: "Meditation",
        taskType: "time",
        plannedMinutes: 15,
        targetCount: null,
        selectedDays: [0, 6],
        dailyProgress: {},
        excludedDates: [],
        oneOffDates: [],
        startDate: dateUtils.getDateString(oneWeekAgo),
        endDate: null,
        color: fakeColors[2],
        categoryId: 'health',
        scheduleType: 'weekly',
        monthlyTypes: ['first'],
        monthlyDays: [],
        intervalWeeks: 2,
        sectionId: 'default'
      },
      {
        id: Date.now() + 4,
        name: "Take Vitamins",
        taskType: "count",
        plannedMinutes: null,
        targetCount: 1,
        selectedDays: [0, 1, 2, 3, 4, 5, 6],
        dailyProgress: {},
        excludedDates: [],
        oneOffDates: [],
        startDate: dateUtils.getDateString(oneWeekAgo),
        endDate: null,
        color: fakeColors[3],
        categoryId: 'health',
        scheduleType: 'weekly',
        monthlyTypes: ['first'],
        monthlyDays: [],
        intervalWeeks: 2,
        sectionId: 'default'
      }
    ];

    // Add some fake progress data
    fakeTasks.forEach(task => {
      for (let i = 0; i < 7; i++) {
        const date = new Date(oneWeekAgo.getTime() + i * 24 * 60 * 60 * 1000);
        const dateString = dateUtils.getDateString(date);
        
        if (task.taskType === 'time') {
          const completionRate = 0.5 + Math.random() * 0.7;
          const timeSpent = Math.floor(task.plannedMinutes * 60 * completionRate);
          task.dailyProgress[dateString] = {
            timeSpent: timeSpent,
            isRunning: false,
            startTime: null
          };
        } else {
          const completionRate = 0.6 + Math.random() * 0.5;
          const count = Math.floor(task.targetCount * completionRate);
          task.dailyProgress[dateString] = {
            currentCount: count,
            isRunning: false,
            startTime: null
          };
        }
      }
    });

    setTasks(fakeTasks);
  };

  const handleViewAnalytics = (task) => {
    setAnalyticsTask(task);
    setViewMode('task-analytics');
    if (isMobile || isTablet) setShowMobileMenu(false);
  };

  const handleViewWeeklySummary = (date) => {
    setWeekSummaryDate(date);
    setViewMode('weekly-summary');
    if (isMobile || isTablet) setShowMobileMenu(false);
  };

  const handleBackToCalendar = () => {
    setViewMode('calendar');
    setAnalyticsTask(null);
    setWeekSummaryDate(null);
  };

//   const handleBackToDay = () => {
//     setViewMode('day');
//     setAnalyticsTask(null);
//     setWeekSummaryDate(null);
//   };

  // Update running timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      const dateString = dateUtils.getDateString(currentDate);
      setTasks(tasks => tasks.map(task => {
        const dateProgress = task.dailyProgress && task.dailyProgress[dateString];
        if (dateProgress && dateProgress.isRunning && dateProgress.startTime) {
          const elapsed = Math.floor((Date.now() - dateProgress.startTime) / 1000);
          const newDailyProgress = { ...task.dailyProgress };
          newDailyProgress[dateString] = {
            timeSpent: dateProgress.timeSpent + elapsed,
            isRunning: true,
            startTime: Date.now()
          };
          return { ...task, dailyProgress: newDailyProgress };
        }
        return task;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentDate]);

  // Handle mouse movement for tooltips
  useEffect(() => {
    const handleGlobalMouseMove = (event) => {
      if (hoveredDate && !isMobile) {
        setTooltipPosition({
          x: event.clientX,
          y: event.clientY - 20
        });
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [hoveredDate, isMobile]);

  // Clear drag states when view changes or edit mode changes
  useEffect(() => {
    setDraggedTask(null);
    setDragOverSection(null);
  }, [viewMode, currentDate, editMode]);

  // Add global drag event listeners to handle drag end
  useEffect(() => {
    const handleGlobalDragEnd = () => {
      setDraggedTask(null);
      setDragOverSection(null);
    };

    document.addEventListener('dragend', handleGlobalDragEnd);
    return () => {
      document.removeEventListener('dragend', handleGlobalDragEnd);
    };
  }, [setDraggedTask, setDragOverSection]);

  // Clear tooltip when view changes
  useEffect(() => {
    setHoveredDate(null);
  }, [viewMode, currentDate]);

  const todaysTasks = getTodaysTasks();

  return (
    <div 
      className="min-h-screen flex relative"
      style={{ background: colors.background }}
    >
      {/* Trendy overlay pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.2) 0%, transparent 50%)`
        }}
      ></div>

      {/* Mobile & Tablet overlay */}
      {showMobileMenu && (isMobile || isTablet) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowMobileMenu(false)}
        ></div>
      )}

      {/* Left Sidebar - Fixed */}
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

        {/* Add New Task Button */}
        <div className="border-b p-4">
          <button 
            onClick={() => {
              setEditingTask(null);
              setShowTaskModal(true);
              if (isMobile || isTablet) setShowMobileMenu(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors text-sm"
            style={{ backgroundColor: colors.primary, color: 'white' }}
          >
            <Plus size={16} />
            Add New Task
          </button>
        </div>

        {/* All Tasks */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">All Tasks</h3>
          </div>
          <div className="px-4 pb-4 space-y-2">
            {tasks.filter(task => !task.endDate || task.endDate >= dateUtils.getDateString(new Date())).map(task => {
              const category = categories.find(cat => cat.id === task.categoryId);
              return (
                <div key={task.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: task.color || colors.taskColors[0] }}
                      ></div>
                      <h4 className="text-xs font-medium">{task.name}</h4>
                      {category && (
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
                      <button
                        onClick={() => handleViewAnalytics(task)}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="View analytics"
                      >
                        <BarChart3 size={10} />
                      </button>
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
                </div>
              );
            })}
            {tasks.filter(task => !task.endDate || task.endDate >= dateUtils.getDateString(new Date())).length === 0 && (
              <p className="text-xs text-gray-500 text-center py-4">No active tasks</p>
            )}
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

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleLogin}
      />

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        editingTask={editingTask}
        onSave={handleTaskSave}
      />

      {/* Section Edit Modal */}
      <SectionEditModal
        isOpen={showSectionModal}
        onClose={() => {
          setShowSectionModal(false);
          setEditingSection(null);
        }}
        section={editingSection}
        onSave={handleSectionSave}
        onDelete={(sectionId) => {
          handleSectionDelete(sectionId);
          setShowSectionModal(false);
          setEditingSection(null);
        }}
      />

      {/* Tooltip for calendar hover */}
      {hoveredDate && !isMobile && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-sm rounded-lg p-3 pointer-events-none shadow-lg max-w-xs"
          style={{
            left: tooltipPosition.x > window.innerWidth - 250 ? `${tooltipPosition.x - 250}px` : `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y}px`
          }}
        >
          <div className="font-semibold mb-2">{dateUtils.formatTooltipDate(hoveredDate)}</div>
          {(() => {
            const dayTasks = getTasksWithDataForDate(hoveredDate);
            const dayProgress = getDayProgress(hoveredDate);
            
            if (dayTasks.length === 0) {
              return <div className="text-gray-300">No tasks</div>;
            }

            return (
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map(task => {
                  const dateProgress = getDateProgress(task, hoveredDate);
                  const progress = getProgress(task, hoveredDate);
                  const category = categories.find(cat => cat.id === task.categoryId);
                  
                  return (
                    <div key={task.id} className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: task.color || colors.accent }}
                      ></div>
                      <span className="text-xs">
                        {category && `${category.icon} `}
                        {task.name}: {task.taskType === 'time' 
                          ? `${timeUtils.formatTime(dateProgress.timeSpent || 0)} / ${timeUtils.formatPlannedTime(task.plannedMinutes)} (${Math.round(progress)}%)`
                          : `${dateProgress.currentCount || 0} / ${task.targetCount} (${Math.round(progress)}%)`
                        }
                      </span>
                    </div>
                  );
                })}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-gray-300">+{dayTasks.length - 3} more tasks</div>
                )}
                <div className="border-t border-gray-700 pt-1 mt-2">
                  <div className="text-xs font-medium">Overall Progress: {dayProgress}%</div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col relative z-10 ${!isMobile && !isTablet ? 'ml-80' : ''}`}>
        {/* Header */}
        <div className={`${isMobile || isTablet ? 'fixed top-0 left-0 right-0 z-40' : 'relative'} bg-white/90 backdrop-blur-sm border-b px-4 py-3 ${isMobile || isTablet ? 'h-16' : 'h-16'} flex items-center justify-between overflow-hidden`}>
          <div 
            className="absolute -right-8 -top-4 w-32 h-32 rounded-full opacity-20"
            style={{
              background: `radial-gradient(circle, ${colors.primary} 0%, ${colors.accent} 70%, transparent 100%)`
            }}
          ></div>

          {/* Mobile & Tablet menu button */}
          {(isMobile || isTablet) && (
            <button
              onClick={() => setShowMobileMenu(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative z-10 mobile-menu-btn"
            >
              <Menu size={20} />
            </button>
          )}

          {!isMobile && !isTablet && <div className="flex-1"></div>}

          <div className="flex items-center gap-2 relative z-10">
            {/* Navigation controls */}
            {viewMode === 'day' && (
              <div className={`flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm border border-gray-200 h-8 ${isMobile ? 'min-w-32' : 'min-w-48'}`}>
                <button
                  onClick={() => navigateDay(-1)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <div className="text-center flex-1">
                  <h2 className="text-xs font-medium text-gray-800 truncate">
                    {isMobile 
                      ? `${DAY_ABBREVIATIONS[currentDate.getDay()]}, ${currentDate.getDate()}`
                      : `${DAYS[currentDate.getDay()]}, ${MONTHS[currentDate.getMonth()]} ${currentDate.getDate()}`
                    }
                  </h2>
                </div>
                <button
                  onClick={() => navigateDay(1)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}

            {viewMode === 'calendar' && (
              <div className={`flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm border border-gray-200 h-8 ${isMobile ? 'min-w-32' : 'min-w-48'}`}>
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <div className="text-center flex-1">
                  <h2 className="text-xs font-medium text-gray-800 truncate">
                    {isMobile 
                      ? `${MONTHS[currentDate.getMonth()].substring(0, 3)} ${currentDate.getFullYear()}`
                      : `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                    }
                  </h2>
                </div>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}

            {viewMode === 'weekly-summary' && weekSummaryDate && (
              <div className={`flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm border border-gray-200 h-8 ${isMobile ? 'min-w-32' : 'min-w-48'}`}>
                <button
                  onClick={() => navigateWeek(-1)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <div className="text-center flex-1">
                  <h2 className="text-xs font-medium text-gray-800 truncate">
                    {(() => {
                      const weekStart = dateUtils.getWeekStart(weekSummaryDate);
                      const weekEnd = dateUtils.getWeekEnd(weekSummaryDate);
                      if (isMobile) {
                        return `${MONTHS[weekStart.getMonth()].substring(0, 3)} ${weekStart.getDate()} - ${weekEnd.getDate()}`;
                      } else {
                        return `${MONTHS[weekStart.getMonth()]} ${weekStart.getDate()} - ${MONTHS[weekEnd.getMonth()]} ${weekEnd.getDate()}`;
                      }
                    })()}
                  </h2>
                </div>
                <button
                  onClick={() => navigateWeek(1)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}

        {/* View Mode Buttons */}
        <div className="flex gap-2">
            
        {/* Existing buttons... */}
        <button
            onClick={() => setViewMode('advanced-statistics')}
            className={`p-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm ${
            viewMode === 'advanced-statistics'
                ? 'text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/30'
            }`}
            style={viewMode === 'advanced-statistics' ? { backgroundColor: colors.primary } : {}}
        >
            <BarChart3 size={16} />
            {!isMobile && 'Statistics'}
        </button>
        </div>

            <button
              onClick={() => {
                if (viewMode === 'task-analytics' || viewMode === 'weekly-summary') {
                  setViewMode('calendar');
                  setAnalyticsTask(null);
                  setWeekSummaryDate(null);
                } else if (viewMode === 'calendar') {
                  setViewMode('day');
                } else {
                  setViewMode('calendar');
                }
              }}
              className={`px-2 py-1 rounded-lg shadow-sm hover:shadow-md border border-gray-200 h-8 flex items-center justify-center transition-all ${
                viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white'
              }`}
              title={viewMode === 'calendar' ? 'Back to Day View' : 'Calendar View'}
            >
              <Calendar size={14} />
            </button>

            <button
              onClick={() => handleViewWeeklySummary(new Date())}
              className={`px-2 py-1 rounded-lg shadow-sm hover:shadow-md border border-gray-200 h-8 flex items-center justify-center transition-all ${
                viewMode === 'weekly-summary' ? 'text-white' : 'bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white'
              }`}
              style={{ 
                backgroundColor: viewMode === 'weekly-summary' ? colors.accent : undefined
              }}
              title="This Week's Summary"
            >
              <BarChart3 size={14} />
            </button>

            <button
              onClick={goToToday}
              className={`px-2 py-1 rounded-lg shadow-sm hover:shadow-md border border-gray-200 h-8 flex items-center justify-center transition-all ${
                viewMode === 'day' ? 'text-white' : 'bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white'
              }`}
              style={{ 
                backgroundColor: viewMode === 'day' ? colors.primary : undefined
              }}
            >
              <Clock size={14} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className={`flex-1 p-4 overflow-y-auto ${isMobile || isTablet ? 'mt-16' : ''}`}>
          {viewMode === 'task-analytics' && analyticsTask ? (
            <TaskAnalyticsView task={analyticsTask} onBack={handleBackToCalendar} />
          ) : viewMode === 'weekly-summary' && weekSummaryDate ? (
            <WeeklySummaryView weekDate={weekSummaryDate} onBack={handleBackToCalendar} />
          ) : viewMode === 'advanced-statistics' ? (
            <AdvancedStatistics />
          ) : (
            <div className={isMobile ? '' : 'max-w-7xl'}>
              {viewMode === 'day' ? (
                <>
                  <div className={`${isMobile ? 'flex-col' : 'flex-row'} flex items-start justify-between mb-4 gap-2`}>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Calendar size={20} />
                        {isMobile 
                          ? `${DAY_ABBREVIATIONS[currentDate.getDay()]} - ${todaysTasks.length} tasks` 
                          : `Tasks for ${dateUtils.formatDisplayDate(currentDate)} - ${todaysTasks.length} tasks`
                        }
                        {editMode && (
                          <span className="text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded">
                            Edit Mode
                          </span>
                        )}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Section Management Controls - Desktop Only */}
                      {!isMobile && editMode && (
                        <button
                          onClick={() => {
                            setEditingSection(null);
                            setShowSectionModal(true);
                          }}
                          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                          title="Add Section"
                        >
                          <Plus size={16} />
                          <span className="text-sm">Add Section</span>
                        </button>
                      )}

                      {/* Edit Mode Toggle */}
                      <button
                        onClick={() => setEditMode(!editMode)}
                        className={`p-2 rounded-lg transition-colors ${
                          editMode 
                            ? 'bg-orange-600 text-white hover:bg-orange-700' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        title={editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
                      >
                        {editMode ? <Eye size={16} /> : <Edit2 size={16} />}
                      </button>
                    </div>

                    {/* Mobile Section Management */}
                    {isMobile && editMode && (
                      <button
                        onClick={() => {
                          setEditingSection(null);
                          setShowSectionModal(true);
                        }}
                        className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <Plus size={14} />
                        Add Section
                      </button>
                    )}
                  </div>
                  
                  {todaysTasks.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Clock size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No tasks scheduled for {dateUtils.formatDisplayDate(currentDate)}</p>
                      <p className="text-sm mt-2">Create a new task to get started!</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {sections.map((section, index) => {
                        const sectionTasks = getTasksForSection(section, todaysTasks);
                        
                        // Skip empty sections unless in edit mode
                        if (sectionTasks.length === 0 && !editMode) {
                          return null;
                        }
                        
                        return (
                          <TaskSection
                            key={section.id}
                            section={section}
                            tasks={sectionTasks}
                            sectionIndex={index}
                            totalSections={sections.length}
                            onTaskEdit={(task) => {
                              setEditingTask(task);
                              setShowTaskModal(true);
                            }}
                            onTaskDelete={deleteTask}
                            onTaskSkip={skipTaskForDay}
                            onTaskMove={handleTaskMove}
                            onSectionMove={handleSectionMove}
                            onSectionDelete={handleSectionDelete}
                            editMode={editMode}
                            onSectionEdit={(section) => {
                              setEditingSection(section);
                              setShowSectionModal(true);
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                // Calendar View
                <>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Calendar size={20} />
                    {isMobile 
                      ? `${MONTHS[currentDate.getMonth()].substring(0, 3)} ${currentDate.getFullYear()}`
                      : `Calendar View - ${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                    }
                  </h3>
                  
                  {/* Mobile Calendar: List View */}
                  {isMobile ? (
                    <div className="space-y-3">
                      {(() => {
                        const calendarDays = dateUtils.getCalendarDays(currentDate);
                        const currentMonthDays = calendarDays.filter(day => day.getMonth() === currentDate.getMonth());
                        const weeks = [];
                        
                        // Group days into weeks for mobile
                        for (let i = 0; i < currentMonthDays.length; i += 7) {
                          const week = currentMonthDays.slice(i, i + 7);
                          if (week.length > 0) {
                            weeks.push(week);
                          }
                        }
                        
                        return weeks.map((week, weekIndex) => {
                          const weekStart = dateUtils.getWeekStart(week[0]);
                          const weekEnd = dateUtils.getWeekEnd(week[0]);
                          const weekProgress = week.reduce((sum, date) => sum + getDayProgress(date), 0) / week.length;
                          
                          return (
                            <div key={weekIndex}>
                              {/* Week Header */}
                              <div 
                                className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2 cursor-pointer hover:bg-blue-100 transition-colors"
                                onClick={() => handleViewWeeklySummary(week[0])}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-blue-800">
                                    Week {dateUtils.getWeekNumber(week[0])} - {MONTHS[weekStart.getMonth()]} {weekStart.getDate()} to {weekEnd.getDate()}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-blue-700">{Math.round(weekProgress)}%</span>
                                    <BarChart3 size={16} className="text-blue-600" />
                                  </div>
                                </div>
                              </div>
                              
                              {/* Week Days */}
                              <div className="space-y-2">
                                {week.map((date) => {
                                  const dayTasks = getTasksWithDataForDate(date);
                                  const isToday = date.toDateString() === new Date().toDateString();
                                  const dayProgress = getDayProgress(date);
                                  
                                  return (
                                    <div 
                                      key={dateUtils.getDateString(date)}
                                      onClick={() => {
                                        setCurrentDate(date);
                                        setViewMode('day');
                                      }}
                                      className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                                        isToday ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <span className={`text-sm font-medium ${
                                            isToday ? 'text-blue-600' : 'text-gray-700'
                                          }`}>
                                            {DAYS[date.getDay()]}, {MONTHS[date.getMonth()]} {date.getDate()}
                                          </span>
                                          {isToday && (
                                            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Today</span>
                                          )}
                                        </div>
                                        {dayTasks.length > 0 && (
                                          <span className="text-xs text-gray-600">
                                            {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''} • {dayProgress}%
                                          </span>
                                        )}
                                      </div>
                                      
                                      {dayTasks.length > 0 && (
                                        <div className="space-y-2">
                                          <div className="flex flex-wrap gap-1">
                                            {dayTasks.slice(0, 3).map(task => {
                                              const category = categories.find(cat => cat.id === task.categoryId);
                                              return (
                                                <div 
                                                  key={task.id}
                                                  className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs"
                                                >
                                                  <div 
                                                    className="w-2 h-2 rounded-full" 
                                                    style={{ backgroundColor: task.color || colors.accent }}
                                                  ></div>
                                                  {category && <span>{category.icon}</span>}
                                                  <span className="text-gray-700">{task.name}</span>
                                                </div>
                                              );
                                            })}
                                            {dayTasks.length > 3 && (
                                              <div className="px-2 py-1 bg-gray-200 rounded text-xs text-gray-600">
                                                +{dayTasks.length - 3} more
                                              </div>
                                            )}
                                          </div>
                                          
                                          {dayProgress > 0 && (
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                              <div
                                                className="h-2 rounded-full transition-all"
                                                style={{
                                                  width: `${dayProgress}%`,
                                                  backgroundColor: colors.accent
                                                }}
                                              ></div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      
                                      {dayTasks.length === 0 && (
                                        <div className="text-xs text-gray-400">No tasks</div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  ) : (
                    // Desktop Calendar: Grid View
                    <div className="bg-white rounded-lg shadow-lg border">
                      <div className="grid grid-cols-8 border-b">
                        <div className="p-3 text-center font-medium text-gray-700 text-sm border-r">
                          <div className="flex items-center justify-center">
                            <BarChart3 size={14} className="text-gray-500" />
                          </div>
                        </div>
                        {DAY_ABBREVIATIONS.map(day => (
                          <div key={day} className="p-3 text-center font-medium text-gray-700 text-sm border-r last:border-r-0">
                            {day}
                          </div>
                        ))}
                      </div>
                      
                      <div 
                        className="grid grid-cols-8"
                        onMouseLeave={() => setHoveredDate(null)}
                      >
                        {(() => {
                          const calendarDays = dateUtils.getCalendarDays(currentDate);
                          const weeks = [];
                          for (let i = 0; i < calendarDays.length; i += 7) {
                            weeks.push(calendarDays.slice(i, i + 7));
                          }
                          
                          return weeks.map((week, weekIndex) => [
                            // Weekly progress indicator
                            <div 
                              key={`week-${weekIndex}`}
                              className="h-20 p-2 border-r border-b bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100"
                              onClick={() => handleViewWeeklySummary(week[0])}
                              onMouseEnter={() => setHoveredDate(null)}
                              title="View weekly summary"
                            >
                              <BarChart3 size={12} className="text-gray-500 mb-1" />
                              <div className="text-xs font-medium text-gray-600">
                                {(() => {
                                  const weekProgress = week.reduce((sum, date) => sum + getDayProgress(date), 0) / 7;
                                  return Math.round(weekProgress) + '%';
                                })()}
                              </div>
                            </div>,
                            ...week.map((date, dayIndex) => {
                              const dayTasks = getTasksWithDataForDate(date);
                              const isToday = date.toDateString() === new Date().toDateString();
                              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                              const dayProgress = getDayProgress(date);
                              
                              return (
                                <div 
                                  key={`${weekIndex}-${dayIndex}`}
                                  onClick={() => {
                                    setCurrentDate(date);
                                    setViewMode('day');
                                  }}
                                  onMouseEnter={() => setHoveredDate(date)}
                                  onMouseLeave={() => setHoveredDate(null)}
                                  className={`h-20 p-2 border-r border-b cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden ${
                                    !isCurrentMonth ? 'bg-gray-100 text-gray-400' : 
                                    isToday ? 'bg-blue-50 border-blue-200' : 'bg-white'
                                  } ${dayIndex === 6 ? 'border-r-0' : ''}`}
                                >
                                  <div className="flex justify-between items-start mb-1">
                                    <span className={`text-sm font-medium ${
                                      !isCurrentMonth ? 'text-gray-400' : 
                                      isToday ? 'text-blue-600' : 'text-gray-700'
                                    }`}>
                                      {date.getDate()}
                                    </span>
                                    {isToday && (
                                      <span className="text-xs bg-blue-600 text-white px-1 rounded">Today</span>
                                    )}
                                  </div>
                                  
                                  {dayTasks.length > 0 && (
                                    <div className="space-y-1">
                                      <div className="flex flex-wrap gap-1 mb-1">
                                        {dayTasks.slice(0, 4).map(task => (
                                          <div 
                                            key={task.id}
                                            className="w-2 h-2 rounded-sm"
                                            style={{ backgroundColor: task.color || colors.accent }}
                                          ></div>
                                        ))}
                                        {dayTasks.length > 4 && (
                                          <div className="text-xs text-gray-500">+{dayTasks.length - 4}</div>
                                        )}
                                      </div>
                                      
                                      <div className="flex items-center justify-between text-xs">
                                        <span className={`${!isCurrentMonth ? 'text-gray-400' : 'text-gray-600'}`}>
                                          {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
                                        </span>
                                        <span className={`font-medium ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}`}>
                                          {dayProgress}%
                                        </span>
                                      </div>
                                      
                                      {dayProgress > 0 && (
                                        <div className="w-full bg-gray-200 rounded-full h-1">
                                          <div
                                            className="h-1 rounded-full transition-all"
                                            style={{
                                              width: `${dayProgress}%`,
                                              backgroundColor: colors.accent
                                            }}
                                          ></div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          ]).flat();
                        })()}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Demo Notice */}
      <DemoNotice />
    </div>
  );
};

export default DailyTodoApp;