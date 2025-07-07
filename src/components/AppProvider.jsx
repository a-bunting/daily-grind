import React, { createContext, useContext, useEffect, useState } from 'react';
import { COLOR_SCHEMES, DEFAULT_CATEGORIES, DEFAULT_SECTIONS } from '../constants';
import { storageUtils } from '../utils';

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [goals, setGoals] = useState([]); // New goals state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day');
  const [editMode, setEditMode] = useState(false);
  const [currentColorScheme, setCurrentColorScheme] = useState('indigo');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [layoutMode, setLayoutMode] = useState('list');
  const [columnCount, setColumnCount] = useState(1);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsTask, setAnalyticsTask] = useState(null);
  const [weekSummaryDate, setWeekSummaryDate] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  
  // Drag and drop states
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverSection, setDragOverSection] = useState(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTasks = storageUtils.loadFromStorage('dailyGrind_tasks', []);
    const savedCategories = storageUtils.loadFromStorage('dailyGrind_categories', DEFAULT_CATEGORIES);
    const savedSections = storageUtils.loadFromStorage('dailyGrind_sections', DEFAULT_SECTIONS);
    const savedGoals = storageUtils.loadFromStorage('dailyGrind_goals', []);
    const savedColorScheme = storageUtils.loadFromStorage('dailyGrind_colorScheme', 'indigo');
    const savedLayoutMode = storageUtils.loadFromStorage('dailyGrind_layoutMode', 'list');
    const savedColumnCount = storageUtils.loadFromStorage('dailyGrind_columnCount', 1);
    const savedUser = storageUtils.loadFromStorage('dailyGrind_user', null);

    if (savedTasks.length > 0) setTasks(savedTasks);
    if (savedCategories.length > 0) setCategories(savedCategories);
    if (savedSections.length > 0) setSections(savedSections);
    if (savedGoals.length > 0) setGoals(savedGoals);
    setCurrentColorScheme(savedColorScheme);
    setLayoutMode(savedLayoutMode);
    // Ensure columnCount is within valid range (1-3)
    setColumnCount(savedColumnCount > 3 ? 3 : savedColumnCount);
    if (savedUser) setUser(savedUser);
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    storageUtils.saveToStorage('dailyGrind_tasks', tasks);
  }, [tasks]);

  useEffect(() => {
    storageUtils.saveToStorage('dailyGrind_categories', categories);
  }, [categories]);

  useEffect(() => {
    storageUtils.saveToStorage('dailyGrind_goals', goals);
  }, [goals]);

  useEffect(() => {
    storageUtils.saveToStorage('dailyGrind_sections', sections);
  }, [sections]);

  useEffect(() => {
    storageUtils.saveToStorage('dailyGrind_goals', goals); // Save goals
  }, [goals]);

  useEffect(() => {
    storageUtils.saveToStorage('dailyGrind_colorScheme', currentColorScheme);
  }, [currentColorScheme]);

  useEffect(() => {
    storageUtils.saveToStorage('dailyGrind_layoutMode', layoutMode);
  }, [layoutMode]);

  useEffect(() => {
    storageUtils.saveToStorage('dailyGrind_user', user);
  }, [user]);

  useEffect(() => {
    storageUtils.saveToStorage('dailyGrind_columnCount', columnCount);
  }, [columnCount]);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const newIsMobile = width < 750; // Changed from 550 to 750
      const newIsTablet = width >= 750 && width < 1024;
      setIsMobile(newIsMobile);
      setIsTablet(newIsTablet);
      setWindowWidth(width);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      if (layoutMode !== 'compact') {
        setLayoutMode('compact');
      }
      if (columnCount !== 1) {
        setColumnCount(1);
      }
    }
  }, [isMobile, layoutMode, columnCount]);

  const colors = COLOR_SCHEMES[currentColorScheme];

  // Goal management functions
const addGoal = (goal) => {
  const newGoal = {
    ...goal,
    id: Date.now().toString(),
    currentProgress: 0,
    personalBestProgress: 0, // ADD THIS LINE
    createdDate: new Date().toISOString().split('T')[0],
    goalType: goal.goalType || 'cumulative' // ADD THIS LINE
  };
  setGoals(prev => [...prev, newGoal]);
  return newGoal;
};

  const updateGoal = (goalId, updates) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, ...updates } : goal
    ));
  };

  const deleteGoal = (goalId) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
    // Also remove goal links from tasks
    setTasks(prev => prev.map(task => ({
      ...task,
      goalId: task.goalId === goalId ? null : task.goalId
    })));
  };

  const calculateGoalProgress = (goalId) => {
    // This will be implemented when we add task contributions
    // For now, return the stored currentProgress
    const goal = goals.find(g => g.id === goalId);
    return goal ? goal.currentProgress : 0;
  };

  // ADD THIS ONE ENHANCED VERSION
useEffect(() => {
  // Enhanced goal progress calculation for both cumulative and personal best
  setGoals(prevGoals => 
    prevGoals.map(goal => {
      const contributingTasks = tasks.filter(task => 
        task.goalId === goal.id && task.taskType === 'input'
      );
      
      let cumulativeProgress = 0;
      let personalBestProgress = 0;
      
      // Calculate both cumulative and personal best from all task inputs
      contributingTasks.forEach(task => {
        Object.values(task.dailyProgress || {}).forEach(dayProgress => {
          if (dayProgress.inputValue && dayProgress.inputValue > 0) {
            // Cumulative: sum all inputs
            cumulativeProgress += dayProgress.inputValue;
            
            // Personal Best: track highest single input
            if (dayProgress.inputValue > personalBestProgress) {
              personalBestProgress = dayProgress.inputValue;
            }
          }
        });
      });
      
      return { 
        ...goal, 
        currentProgress: cumulativeProgress,
        personalBestProgress: personalBestProgress
      };
    })
  );
}, [tasks, setGoals]);

const getGoalDisplayProgress = (goal) => {
    if (!goal) return { current: 0, percentage: 0, label: '' };
    
    const targetValue = goal.targetValue || 1;
    
    if (goal.goalType === 'personalBest') {
        const current = goal.personalBestProgress || 0;
        const percentage = Math.min((current / targetValue) * 100, 100);
        return {
            current,
            percentage,
            label: `Best: ${current}${goal.unit ? ` ${goal.unit}` : ''} / ${targetValue}${goal.unit ? ` ${goal.unit}` : ''}`,
            secondary: goal.currentProgress > 0 ? `Total: ${goal.currentProgress}${goal.unit ? ` ${goal.unit}` : ''}` : null
        };
    } else {
        const current = goal.currentProgress || 0;
        const percentage = Math.min((current / targetValue) * 100, 100);
        return {
            current,
            percentage, 
            label: `${current}${goal.unit ? ` ${goal.unit}` : ''} / ${targetValue}${goal.unit ? ` ${goal.unit}` : ''}`,
            secondary: goal.personalBestProgress > 0 ? `Best session: ${goal.personalBestProgress}${goal.unit ? ` ${goal.unit}` : ''}` : null
        };
    }
};

  const value = {
    tasks, setTasks,
    categories, setCategories,
    sections, setSections,
    goals, setGoals, // Add goals to context
    currentDate, setCurrentDate,
    viewMode, setViewMode,
    editMode, setEditMode,
    currentColorScheme, setCurrentColorScheme,
    isMobile, setIsMobile,
    isTablet, setIsTablet,
    layoutMode, setLayoutMode,
    columnCount, setColumnCount,
    colors,
    user, setUser,
    isLoading, setIsLoading,
    analyticsTask, setAnalyticsTask,
    weekSummaryDate, setWeekSummaryDate,
    showSettings, setShowSettings,
    windowWidth,
    draggedTask, setDraggedTask,
    dragOverSection, setDragOverSection,
    getGoalDisplayProgress,
    addGoal,
    updateGoal,
    deleteGoal,
    calculateGoalProgress
  };

  return React.createElement(AppContext.Provider, { value }, children);
};

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export { AppContext, AppProvider, useApp };