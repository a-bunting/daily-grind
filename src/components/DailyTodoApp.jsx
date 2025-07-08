import { useEffect, useState } from 'react';
import { useApp } from './AppProvider';
import { useTaskActions } from '../hooks/useTaskActions';
import { useTaskScheduling } from '../hooks/useTaskScheduling';
import { dateUtils } from '../utils/index';
import { generateTestData } from '../data/TestData';

// Layout Components
import { MainLayout } from './layout/MainLayout';
import { Sidebar } from './layout/Sidebar';
import { MainHeader } from './layout/MainHeader';

// View Components
import { DayView } from './views/DayView';
import { CalendarView } from './views/CalendarView';
import { TaskAnalyticsView } from './views/TaskAnalyticsView';
import { WeeklySummaryView } from './views/WeeklySummaryView';
import { AdvancedStatistics } from './views/AdvancedStatistics';
import { GoalsDashboard } from './views/GoalsDashboard';

// UI Components
import { CalendarTooltip } from './ui/CalendarTooltip';

// Modal Components
import { AuthModal } from './modals/AuthModal';
import { TaskModal } from './modals/TaskModal';
import { SectionEditModal } from './modals/SectionEditModal';
import { SettingsModal } from './modals/SettingsModal';
import InputProgressModal from './modals/InputProgressModal';
import GoalModal from './modals/GoalModal';

export const DailyTodoApp = () => {
  const {
    tasks, setTasks,
    sections, setSections,
    currentDate, setCurrentDate,
    viewMode, setViewMode,
    editMode, setEditMode,
    isMobile, isTablet,
    colors, user, setUser, isLoading, setIsLoading,
    analyticsTask, setAnalyticsTask,
    weekSummaryDate, setWeekSummaryDate,
    showSettings, setShowSettings,
    setDraggedTask,
    setDragOverSection,
    selectedGoalFilter, 
    selectedCategoryFilter, 
    selectedTaskFilter,
    updateGoal, 
    deleteGoal, addGoal
  } = useApp();

  // UI State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputModalTask, setInputModalTask] = useState(null);
  const [inputModalDate, setInputModalDate] = useState(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  // Hooks
  const { isTaskScheduledForDate } = useTaskScheduling();
  const { addInputProgress, skipTaskForDay, addSingletonTask, deleteTask } = useTaskActions();

  // Navigation Functions
  const getTodaysTasks = () => {
    const scheduledTasks = tasks.filter(task => isTaskScheduledForDate(task, currentDate));
    
    // Apply filters
    let filtered = scheduledTasks;
    
    if (selectedGoalFilter) {
      filtered = filtered.filter(task => task.goalId === selectedGoalFilter);
    }
    
    if (selectedCategoryFilter) {
      filtered = filtered.filter(task => task.categoryId === selectedCategoryFilter);
    }
    
    if (selectedTaskFilter === 'active') {
      filtered = filtered.filter(task => !task.endDate || task.endDate >= dateUtils.getDateString(new Date()));
    } else if (selectedTaskFilter === 'completed') {
      filtered = filtered.filter(task => task.endDate && task.endDate < dateUtils.getDateString(new Date()));
    }
    
    return filtered;
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

  // Event Handlers
  const handleLogin = (userData) => {
    setUser(userData);
    console.log('User logged in:', userData);
  };

  const handleLogout = () => {
    setUser(null);
    console.log('User logged out');
  };

  const handleInputTaskClick = (task, date) => {
    setInputModalTask(task);
    setInputModalDate(date);
    setShowInputModal(true);
  };

  const handleSaveInputProgress = (taskId, dateString, inputValue) => {
    addInputProgress(taskId, dateString, inputValue);
    setShowInputModal(false);
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
              sectionId: taskData.sectionId,
              goalId: taskData.goalId,
              unit: taskData.unit,
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
        sectionId: taskData.sectionId,
        goalId: taskData.goalId,
        unit: taskData.unit,
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
    if (sectionId === 'default') return;
    
    setTasks(tasks.map(task => 
      task.sectionId === sectionId
        ? { ...task, sectionId: 'default' }
        : task
    ));
    
    setSections(sections.filter(section => section.id !== sectionId));
  };

  const generateFakeData = () => {
    const fakeTasks = generateTestData(colors, dateUtils);
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

  // Effects
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

  useEffect(() => {
    setDraggedTask(null);
    setDragOverSection(null);
  }, [viewMode, currentDate, editMode]);

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

  useEffect(() => {
    setHoveredDate(null);
  }, [viewMode, currentDate]);

  const todaysTasks = getTodaysTasks();

  return (
    <MainLayout>
      {/* Mobile overlay */}
      {showMobileMenu && (isMobile || isTablet) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowMobileMenu(false)}
        ></div>
      )}

      {/* Sidebar */}
      <Sidebar 
        showMobileMenu={showMobileMenu}
        setShowGoalModal={setShowGoalModal}
        setEditingGoal={setEditingGoal}
        setShowMobileMenu={setShowMobileMenu}
        setShowTaskModal={setShowTaskModal}
        setEditingTask={setEditingTask}
        setShowAuthModal={setShowAuthModal}
        setShowSettings={setShowSettings}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        handleSync={handleSync}
        handleReload={handleReload}
        generateFakeData={generateFakeData}
        handleViewAnalytics={handleViewAnalytics}
        addSingletonTask={addSingletonTask}
        deleteTask={deleteTask}
        isLoading={isLoading}
      />

    {showGoalModal && (
    <GoalModal 
        isOpen={showGoalModal}
        onClose={() => {
        setShowGoalModal(false);
        setEditingGoal(null);
        }}
        editingGoal={editingGoal}
        onSave={(goalIdOrData, updates) => {
        if (editingGoal) {
            // Editing existing goal
            updateGoal(goalIdOrData, updates);
        } else {
            // Creating new goal
            addGoal(goalIdOrData);
        }
        }}
    />
    )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col relative z-10 ${!isMobile && !isTablet ? 'ml-80' : ''}`}>
        {/* Header */}
        <MainHeader 
          showMobileMenu={showMobileMenu}
          setShowMobileMenu={setShowMobileMenu}
          viewMode={viewMode}
          setViewMode={setViewMode}
          currentDate={currentDate}
          navigateDay={navigateDay}
          navigateMonth={navigateMonth}
          navigateWeek={navigateWeek}
          weekSummaryDate={weekSummaryDate}
          goToToday={goToToday}
          setAnalyticsTask={setAnalyticsTask}
          setWeekSummaryDate={setWeekSummaryDate}
          handleViewWeeklySummary={handleViewWeeklySummary}
        />

        {/* Content Area - Centered */}
        <div className={`flex-1 flex justify-center overflow-y-auto ${isMobile || isTablet ? 'mt-16' : ''}`}>
          <div className={`w-full max-w-7xl p-4 ${isMobile || isTablet ? '' : 'px-8'}`}>
            {viewMode === 'task-analytics' && analyticsTask ? (
              <TaskAnalyticsView task={analyticsTask} onBack={handleBackToCalendar} />
            ) : viewMode === 'weekly-summary' && weekSummaryDate ? (
              <WeeklySummaryView weekDate={weekSummaryDate} onBack={handleBackToCalendar} />
            ) : viewMode === 'advanced-statistics' ? (
              <AdvancedStatistics />
            ) : viewMode === 'goals' ? (
              <GoalsDashboard onBack={() => setViewMode('day')} />
            ) : viewMode === 'day' ? (
              <DayView 
                todaysTasks={todaysTasks}
                editMode={editMode}
                setEditMode={setEditMode}
                handleInputTaskClick={handleInputTaskClick}
                setEditingTask={setEditingTask}
                setShowTaskModal={setShowTaskModal}
                deleteTask={deleteTask}
                skipTaskForDay={skipTaskForDay}
                handleTaskMove={handleTaskMove}
                handleSectionMove={handleSectionMove}
                handleSectionDelete={handleSectionDelete}
                setEditingSection={setEditingSection}
                setShowSectionModal={setShowSectionModal}
              />
            ) : (
              <CalendarView 
                setCurrentDate={setCurrentDate}
                setViewMode={setViewMode}
                handleViewWeeklySummary={handleViewWeeklySummary}
                setHoveredDate={setHoveredDate}
              />
            )}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <CalendarTooltip 
        hoveredDate={hoveredDate}
        tooltipPosition={tooltipPosition}
      />

      {/* Modals */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleLogin}
      />

      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        editingTask={editingTask}
        onSave={handleTaskSave}
      />

      <InputProgressModal
        isOpen={showInputModal}
        onClose={() => setShowInputModal(false)}
        task={inputModalTask}
        date={inputModalDate}
        onSave={handleSaveInputProgress}
      />

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
    </MainLayout>
  );
};

export default DailyTodoApp;