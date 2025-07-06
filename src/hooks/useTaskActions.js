// src/hooks/useTaskActions.js

import {useApp} from '../components/AppProvider';
import { dateUtils } from '../utils/index';

export const useTaskActions = () => {
  const { tasks, setTasks, currentDate } = useApp();

  const toggleTimer = (taskId) => {
    const dateString = dateUtils.getDateString(currentDate);
    
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const dateProgress = task.dailyProgress[dateString] || { timeSpent: 0, isRunning: false, startTime: null };
        const newDailyProgress = { ...task.dailyProgress };
        
        if (dateProgress.isRunning) {
          const elapsed = Math.floor((Date.now() - dateProgress.startTime) / 1000);
          newDailyProgress[dateString] = {
            timeSpent: dateProgress.timeSpent + elapsed,
            isRunning: false,
            startTime: null
          };
        } else {
          newDailyProgress[dateString] = {
            ...dateProgress,
            isRunning: true,
            startTime: Date.now()
          };
        }
        
        return { ...task, dailyProgress: newDailyProgress };
      }
      return task;
    }));
  };

  const resetTimer = (taskId) => {
    const dateString = dateUtils.getDateString(currentDate);
    
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newDailyProgress = { ...task.dailyProgress };
        newDailyProgress[dateString] = {
          timeSpent: 0,
          isRunning: false,
          startTime: null,
          currentCount: 0
        };
        
        return { ...task, dailyProgress: newDailyProgress };
      }
      return task;
    }));
  };

  const incrementCount = (taskId) => {
    const dateString = dateUtils.getDateString(currentDate);
    
    setTasks(tasks.map(task => {
      if (task.id === taskId && task.taskType === 'count') {
        const dateProgress = task.dailyProgress[dateString] || { currentCount: 0 };
        const newDailyProgress = { ...task.dailyProgress };
        newDailyProgress[dateString] = {
          ...dateProgress,
          currentCount: (dateProgress.currentCount || 0) + 1
        };
        
        return { ...task, dailyProgress: newDailyProgress };
      }
      return task;
    }));
  };

  const decrementCount = (taskId) => {
    const dateString = dateUtils.getDateString(currentDate);
    
    setTasks(tasks.map(task => {
      if (task.id === taskId && task.taskType === 'count') {
        const dateProgress = task.dailyProgress[dateString] || { currentCount: 0 };
        const newDailyProgress = { ...task.dailyProgress };
        newDailyProgress[dateString] = {
          ...dateProgress,
          currentCount: Math.max(0, (dateProgress.currentCount || 0) - 1)
        };
        
        return { ...task, dailyProgress: newDailyProgress };
      }
      return task;
    }));
  };

  const toggleCheckbox = (taskId) => {
    const dateString = dateUtils.getDateString(currentDate);
    
    setTasks(tasks.map(task => {
      if (task.id === taskId && task.taskType === 'count' && task.targetCount === 1) {
        const dateProgress = task.dailyProgress[dateString] || { currentCount: 0 };
        const newDailyProgress = { ...task.dailyProgress };
        newDailyProgress[dateString] = {
          ...dateProgress,
          currentCount: dateProgress.currentCount === 1 ? 0 : 1
        };
        
        return { ...task, dailyProgress: newDailyProgress };
      }
      return task;
    }));
  };

  const skipTaskForDay = (taskId) => {
    const dateString = dateUtils.getDateString(currentDate);
    
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const excludedDates = task.excludedDates || [];
        
        if (!excludedDates.includes(dateString)) {
          return { ...task, excludedDates: [...excludedDates, dateString] };
        }
      }
      return task;
    }));
  };

  const addOneOffTask = (taskId) => {
    const dateString = dateUtils.getDateString(currentDate);
    
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const oneOffDates = task.oneOffDates || [];
        
        if (!oneOffDates.includes(dateString)) {
          return { ...task, oneOffDates: [...oneOffDates, dateString] };
        }
      }
      return task;
    }));
  };

  const addSingletonTask = (taskId) => {
    const dateString = dateUtils.getDateString(currentDate);
    
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const oneOffDates = task.oneOffDates || [];
        
        if (!oneOffDates.includes(dateString)) {
          return { ...task, oneOffDates: [...oneOffDates, dateString] };
        }
      }
      return task;
    }));
  };

  const deleteTask = (taskId) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = dateUtils.getDateString(yesterday);
    
    setTasks(tasks => tasks.map(task => 
      task.id === taskId 
        ? { ...task, endDate: yesterdayString }
        : task
    ));
  };

  return {
    toggleTimer,
    resetTimer,
    incrementCount,
    decrementCount,
    toggleCheckbox,
    skipTaskForDay,
    addOneOffTask,
    addSingletonTask,
    deleteTask
  };
};