import React, { createContext, useContext, useEffect, useState } from 'react';
import { COLOR_SCHEMES, DEFAULT_CATEGORIES, DEFAULT_SECTIONS } from '../constants';
import { storageUtils } from '../utils';

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
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
    const savedColorScheme = storageUtils.loadFromStorage('dailyGrind_colorScheme', 'indigo');
    const savedLayoutMode = storageUtils.loadFromStorage('dailyGrind_layoutMode', 'list');
    const savedColumnCount = storageUtils.loadFromStorage('dailyGrind_columnCount', 1);
    const savedUser = storageUtils.loadFromStorage('dailyGrind_user', null);

    if (savedTasks.length > 0) setTasks(savedTasks);
    if (savedCategories.length > 0) setCategories(savedCategories);
    if (savedSections.length > 0) setSections(savedSections);
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
    storageUtils.saveToStorage('dailyGrind_sections', sections);
  }, [sections]);

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

  const value = {
    tasks, setTasks,
    categories, setCategories,
    sections, setSections,
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
    dragOverSection, setDragOverSection
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