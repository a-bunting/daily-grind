// Updated AppProvider integration
// Add this to your existing AppProvider.jsx:

// Add these imports at the top
// 

// Add these state variables


// Add this useEffect
/*

*/

// Replace localStorage loading with hybrid loading in loadAllSettings:
/*

*/

// Add authentication methods to context value:
/*
const value = {
  // ... existing values
  

};
*/


import React, { createContext, useContext, useEffect, useState } from 'react';
import { COLOR_SCHEMES, DEFAULT_CATEGORIES, DEFAULT_SECTIONS } from '../constants';
import { storageUtils } from '../utils';
import { AppLoadingScreen } from './AppLoadingScreen'; // Add this import
import hybridStorage from '../utils/hybridStorage';

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [goals, setGoals] = useState([]);
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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState(hybridStorage.getConnectionStatus());
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'error'

  // Drag and drop states
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverSection, setDragOverSection] = useState(null);

  // NEW: UI State that should persist across page reloads
  const [selectedGoalFilter, setSelectedGoalFilter] = useState(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(null);
  const [showCompletedTasks, setShowCompletedTasks] = useState(true);
  const [taskSortOrder, setTaskSortOrder] = useState('manual'); // 'manual', 'priority', 'progress', 'alphabetical'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAllTasks, setShowAllTasks] = useState(false); // Show all tasks vs just scheduled
  const [lastViewedDate, setLastViewedDate] = useState(null);
  const [selectedTaskFilter, setSelectedTaskFilter] = useState('all'); // 'all', 'active', 'completed'
  const [sectionExpandedState, setSectionExpandedState] = useState({}); // Track which sections are expanded/collapsed
  const [sidebarCompactMode, setSidebarCompactMode] = useState(false);
  const [sidebarActiveTab, setSidebarActiveTab] = useState('tasks');

  // Load data from localStorage on mount
  useEffect(() => {
    // const loadAllSettings = async () => {
    //   const startTime = Date.now();
      
    //   try {
    //     const savedTasks = storageUtils.loadFromStorage('dailyGrind_tasks', []);
    //     const savedCategories = storageUtils.loadFromStorage('dailyGrind_categories', DEFAULT_CATEGORIES);
    //     const savedSections = storageUtils.loadFromStorage('dailyGrind_sections', DEFAULT_SECTIONS);
    //     const savedGoals = storageUtils.loadFromStorage('dailyGrind_goals', []);
    //     const savedColorScheme = storageUtils.loadFromStorage('dailyGrind_colorScheme', 'indigo');
    //     const savedLayoutMode = storageUtils.loadFromStorage('dailyGrind_layoutMode', 'list');
    //     const savedColumnCount = storageUtils.loadFromStorage('dailyGrind_columnCount', 1);
    //     const savedUser = storageUtils.loadFromStorage('dailyGrind_user', null);

    //     // NEW: Load UI state
    //     const savedViewMode = storageUtils.loadFromStorage('dailyGrind_viewMode', 'day');
    //     const savedEditMode = storageUtils.loadFromStorage('dailyGrind_editMode', false);
    //     const savedCurrentDate = storageUtils.loadFromStorage('dailyGrind_currentDate', null);
    //     const savedSelectedGoalFilter = storageUtils.loadFromStorage('dailyGrind_selectedGoalFilter', null);
    //     const savedSelectedCategoryFilter = storageUtils.loadFromStorage('dailyGrind_selectedCategoryFilter', null);
    //     const savedShowCompletedTasks = storageUtils.loadFromStorage('dailyGrind_showCompletedTasks', true);
    //     const savedTaskSortOrder = storageUtils.loadFromStorage('dailyGrind_taskSortOrder', 'manual');
    //     const savedSidebarCollapsed = storageUtils.loadFromStorage('dailyGrind_sidebarCollapsed', false);
    //     const savedShowAllTasks = storageUtils.loadFromStorage('dailyGrind_showAllTasks', false);
    //     const savedLastViewedDate = storageUtils.loadFromStorage('dailyGrind_lastViewedDate', null);
    //     const savedSelectedTaskFilter = storageUtils.loadFromStorage('dailyGrind_selectedTaskFilter', 'all');
    //     const savedSectionExpandedState = storageUtils.loadFromStorage('dailyGrind_sectionExpandedState', {});
    //     const savedSidebarCompactMode = storageUtils.loadFromStorage('dailyGrind_sidebarCompactMode', false);
    //     const savedSidebarActiveTab = storageUtils.loadFromStorage('dailyGrind_sidebarActiveTab', 'tasks');

    //     // Apply saved data
    //     if (savedTasks.length > 0) setTasks(savedTasks);
    //     if (savedCategories.length > 0) setCategories(savedCategories);
    //     if (savedGoals.length > 0) setGoals(savedGoals);
    //     setSidebarCompactMode(savedSidebarCompactMode);
    //     setSidebarActiveTab(savedSidebarActiveTab);
    //     setCurrentColorScheme(savedColorScheme);
    //     setLayoutMode(savedLayoutMode);
    //     setColumnCount(savedColumnCount > 3 ? 3 : savedColumnCount);
    //     if (savedUser) setUser(savedUser);

    //     if (savedSections && savedSections.length > 0) {
    //       const migratedSections = migrateSectionsWithLayoutProps(savedSections);
    //       setSections(migratedSections);
    //     } else {
    //       const migratedDefaults = migrateSectionsWithLayoutProps(DEFAULT_SECTIONS);
    //       setSections(migratedDefaults);
    //     }

    //     // NEW: Apply saved UI state
    //     setViewMode(savedViewMode);
    //     setEditMode(savedEditMode);
    //     setSelectedGoalFilter(savedSelectedGoalFilter);
    //     setSelectedCategoryFilter(savedSelectedCategoryFilter);
    //     setShowCompletedTasks(savedShowCompletedTasks);
    //     setTaskSortOrder(savedTaskSortOrder);
    //     setSidebarCollapsed(savedSidebarCollapsed);
    //     setShowAllTasks(savedShowAllTasks);
    //     setLastViewedDate(savedLastViewedDate);
    //     setSelectedTaskFilter(savedSelectedTaskFilter);
    //     setSectionExpandedState(savedSectionExpandedState);
        
    //     // Restore current date if saved (useful for returning to same day)
    //     if (savedCurrentDate) {
    //       setCurrentDate(new Date(savedCurrentDate));
    //     }

    //     // Ensure minimum 1 second loading time
    //     const elapsedTime = Date.now() - startTime;
    //     const minimumLoadTime = 1200; // 1 second
    //     const remainingTime = Math.max(0, minimumLoadTime - elapsedTime);
        
    //     await new Promise(resolve => setTimeout(resolve, remainingTime));

    //   } catch (error) {
    //     console.error('Error loading settings:', error);
    //     // Still wait minimum time even on error
    //     const elapsedTime = Date.now() - startTime;
    //     const remainingTime = Math.max(0, 1200 - elapsedTime);
    //     await new Promise(resolve => setTimeout(resolve, remainingTime));
    //   } finally {
    //     setIsInitialLoading(false);
    //   }
    // };

    const loadAllSettings = async () => {
        const startTime = Date.now();
        
        try {
            // Load data using hybrid storage
            const [savedTasks, savedCategories, savedSections, savedGoals] = await Promise.all([
            hybridStorage.loadTasks(),
            hybridStorage.loadCategories(),
            hybridStorage.loadSections(),
            hybridStorage.loadGoals()
            ]);

            // Load UI preferences from localStorage (these stay local)
            const savedColorScheme = storageUtils.loadFromStorage('dailyGrind_colorScheme', 'indigo');
            const savedLayoutMode = storageUtils.loadFromStorage('dailyGrind_layoutMode', 'list');
            // ... other UI preferences

            // Apply loaded data
            if (savedTasks.length > 0) setTasks(savedTasks);
            if (savedCategories.length > 0) setCategories(savedCategories);
            if (savedSections.length > 0) setSections(savedSections);
            if (savedGoals.length > 0) setGoals(savedGoals);
            
            // Apply UI settings
            setCurrentColorScheme(savedColorScheme);
            setLayoutMode(savedLayoutMode);
            // ... other UI settings

            // ... rest of loading logic
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setIsInitialLoading(false);
        }
    };

    loadAllSettings();
  }, []);

  // Helper function to migrate sections (moved before it's used)
  const migrateSectionsWithLayoutProps = (sections) => {
    return sections.map(section => ({
      ...section,
      // Add default layout properties if they don't exist
      layoutMode: section.layoutMode || 'list',
      columnCount: section.columnCount || 1,
      showBackground: section.showBackground !== undefined ? section.showBackground : true
    }));
  };

  // Save data to localStorage when it changes
  useEffect(() => {
    if (!isInitialLoading) {
        storageUtils.saveToStorage('dailyGrind_sidebarCompactMode', sidebarCompactMode);
    }
  }, [sidebarCompactMode, isInitialLoading]);

  useEffect(() => {
    if (!isInitialLoading) {
        storageUtils.saveToStorage('dailyGrind_sidebarActiveTab', sidebarActiveTab);
    }
}, [sidebarActiveTab, isInitialLoading]);

useEffect(() => {
    const updateConnectionStatus = () => {
        setConnectionStatus(hybridStorage.getConnectionStatus());
    };

    window.addEventListener('authChanged', updateConnectionStatus);
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);

    return () => {
        window.removeEventListener('authChanged', updateConnectionStatus);
        window.removeEventListener('online', updateConnectionStatus);
        window.removeEventListener('offline', updateConnectionStatus);
    };
}, []);

  useEffect(() => {
    if (!isInitialLoading) {
      storageUtils.saveToStorage('dailyGrind_tasks', tasks);
    }
  }, [tasks, isInitialLoading]);

  useEffect(() => {
    storageUtils.saveToStorage('dailyGrind_categories', categories);
  }, [categories]);

  useEffect(() => {
    if (!isInitialLoading) {
      storageUtils.saveToStorage('dailyGrind_goals', goals);
    }
  }, [goals, isInitialLoading]);

  useEffect(() => {
    if (!isInitialLoading) {
      storageUtils.saveToStorage('dailyGrind_sections', sections);
    }
  }, [sections, isInitialLoading]);

  useEffect(() => {
    if (!isInitialLoading) {
        storageUtils.saveToStorage('dailyGrind_colorScheme', currentColorScheme);
    }
    }, [currentColorScheme, isInitialLoading]);

  useEffect(() => {
    storageUtils.saveToStorage('dailyGrind_layoutMode', layoutMode);
  }, [layoutMode]);

  useEffect(() => {
    storageUtils.saveToStorage('dailyGrind_user', user);
  }, [user]);

  useEffect(() => {
    storageUtils.saveToStorage('dailyGrind_columnCount', columnCount);
  }, [columnCount]);

  // NEW: Save UI state when it changes
  useEffect(() => {
    storageUtils.saveToStorage('dailyGrind_viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    storageUtils.saveToStorage('dailyGrind_editMode', editMode);
  }, [editMode]);

  useEffect(() => {
    storageUtils.saveToStorage('dailyGrind_currentDate', currentDate.toISOString());
  }, [currentDate]);

  useEffect(() => {
    storageUtils.saveToStorage('dailyGrind_selectedGoalFilter', selectedGoalFilter);
  }, [selectedGoalFilter]);

  useEffect(() => {
    storageUtils.saveToStorage('dailyGrind_selectedCategoryFilter', selectedCategoryFilter);
  }, [selectedCategoryFilter]);

  useEffect(() => {
    storageUtils.saveToStorage('dailyGrind_showCompletedTasks', showCompletedTasks);
  }, [showCompletedTasks]);

  useEffect(() => {
    storageUtils.saveToStorage('dailyGrind_taskSortOrder', taskSortOrder);
  }, [taskSortOrder]);

  useEffect(() => {
    storageUtils.saveToStorage('dailyGrind_sidebarCollapsed', sidebarCollapsed);
  }, [sidebarCollapsed]);

  useEffect(() => {
    storageUtils.saveToStorage('dailyGrind_showAllTasks', showAllTasks);
  }, [showAllTasks]);

  useEffect(() => {
    storageUtils.saveToStorage('dailyGrind_lastViewedDate', lastViewedDate);
  }, [lastViewedDate]);

  useEffect(() => {
    storageUtils.saveToStorage('dailyGrind_selectedTaskFilter', selectedTaskFilter);
  }, [selectedTaskFilter]);

  useEffect(() => {
    storageUtils.saveToStorage('dailyGrind_sectionExpandedState', sectionExpandedState);
  }, [sectionExpandedState]);

  // Screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const newIsMobile = width < 750;
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
      personalBestProgress: 0,
      createdDate: new Date().toISOString().split('T')[0],
      goalType: goal.goalType || 'cumulative'
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
    const goal = goals.find(g => g.id === goalId);
    return goal ? goal.currentProgress : 0;
  };

  // Enhanced goal progress calculation
  useEffect(() => {
    setGoals(prevGoals => 
      prevGoals.map(goal => {
        const contributingTasks = tasks.filter(task => 
          task.goalId === goal.id && task.taskType === 'input'
        );
        
        let cumulativeProgress = 0;
        let personalBestProgress = 0;
        
        contributingTasks.forEach(task => {
          Object.values(task.dailyProgress || {}).forEach(dayProgress => {
            if (dayProgress.inputValue && dayProgress.inputValue > 0) {
              cumulativeProgress += dayProgress.inputValue;
              
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

  // NEW: Helper functions for UI state management
  const toggleSectionExpanded = (sectionId) => {
    setSectionExpandedState(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const isSectionExpanded = (sectionId) => {
    return sectionExpandedState[sectionId] !== false; // Default to expanded
  };

  const clearAllFilters = () => {
    setSelectedGoalFilter(null);
    setSelectedCategoryFilter(null);
    setSelectedTaskFilter('all');
  };

  const updateSectionLayout = (sectionId, layoutUpdates) => {
    setSections(prev => prev.map(section => 
        section.id === sectionId 
        ? { ...section, ...layoutUpdates }
        : section
    ));
    };

    const updateSectionLayoutMode = (sectionId, layoutMode) => {
    updateSectionLayout(sectionId, { layoutMode });
    };

    const updateSectionColumnCount = (sectionId, columnCount) => {
    updateSectionLayout(sectionId, { columnCount: Math.min(Math.max(columnCount, 1), 3) });
    };

    const updateSectionShowBackground = (sectionId, showBackground) => {
    updateSectionLayout(sectionId, { showBackground });
    };

    const resetSectionLayout = (sectionId) => {
        updateSectionLayout(sectionId, {
            layoutMode: 'list',
            columnCount: 1,
            showBackground: true
        });
    };

    const updateAllSectionsLayout = (layoutUpdates) => {
    setSections(prev => prev.map(section => ({ ...section, ...layoutUpdates })));
    };

  const value = {
    tasks, setTasks,
    categories, setCategories,
    sections, setSections,
    goals, setGoals,
    updateSectionLayout,
    updateSectionLayoutMode,
    updateSectionColumnCount,
    updateSectionShowBackground,
    resetSectionLayout,
    updateAllSectionsLayout,
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
    isInitialLoading, // Added to context
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
    calculateGoalProgress,
    sidebarCompactMode, setSidebarCompactMode,
    sidebarActiveTab, setSidebarActiveTab,
    
    // NEW: UI state and functions
    selectedGoalFilter, setSelectedGoalFilter,
    selectedCategoryFilter, setSelectedCategoryFilter,
    showCompletedTasks, setShowCompletedTasks,
    taskSortOrder, setTaskSortOrder,
    sidebarCollapsed, setSidebarCollapsed,
    showAllTasks, setShowAllTasks,
    lastViewedDate, setLastViewedDate,
    selectedTaskFilter, setSelectedTaskFilter,
    sectionExpandedState, setSectionExpandedState,
    toggleSectionExpanded,
    isSectionExpanded,
    clearAllFilters,
    
      // Authentication
    login: hybridStorage.login.bind(hybridStorage),
    register: hybridStorage.register.bind(hybridStorage),
    logout: hybridStorage.logout.bind(hybridStorage),
    
    // Connection status
    connectionStatus,
    syncStatus,
    setSyncStatus,
    
    // Storage methods
    saveTask: hybridStorage.saveTask.bind(hybridStorage),
    updateProgress: hybridStorage.updateProgress.bind(hybridStorage),

  };

  return React.createElement(AppContext.Provider, { value }, [
    React.createElement(AppLoadingScreen, { 
      key: 'loading',
      isLoading: isInitialLoading 
    }),
    React.createElement('div', { 
      key: 'app',
      style: { opacity: isInitialLoading ? 0 : 1, transition: 'opacity 300ms' }
    }, children)
  ]);
};

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export { AppContext, AppProvider, useApp };