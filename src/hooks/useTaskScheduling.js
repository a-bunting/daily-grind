// src/hooks/useTaskScheduling.js

import {useApp} from '../components/AppProvider';
import { dateUtils } from '../utils/index';

export const useTaskScheduling = () => {
  const { tasks } = useApp();

  const isTaskScheduledForDate = (task, date) => {
    const dateString = dateUtils.getDateString(date);
    
    if (task.oneOffDates && task.oneOffDates.includes(dateString)) {
      return true;
    }
    
    if (task.excludedDates && task.excludedDates.includes(dateString)) {
      return false;
    }
    
    if (!isTaskActive(task, date)) {
      return false;
    }
    
    return isTaskScheduledForDateByRules(task, date);
  };

  const isTaskActive = (task, date) => {
    const checkDate = dateUtils.getDateString(date);
    if (task.startDate && checkDate < task.startDate) return false;
    if (task.endDate && checkDate > task.endDate) return false;
    return true;
  };

  const isTaskScheduledForDateByRules = (task, date) => {
    const dayOfWeek = date.getDay();
    const selectedDays = task.selectedDays || [];
    
    switch (task.scheduleType || 'weekly') {
      case 'weekly':
        return selectedDays.includes(dayOfWeek);
        
      case 'monthly':
        const monthlyDays = task.monthlyDays || [];
        if (!monthlyDays.includes(dayOfWeek)) return false;
        
        const year = date.getFullYear();
        const month = date.getMonth();
        const dayOfMonth = date.getDate();
        
        const firstDayOfMonth = new Date(year, month, 1);
        const firstDayWeekday = firstDayOfMonth.getDay();
        const weekNumber = Math.ceil((dayOfMonth + firstDayWeekday) / 7);
        
        const monthlyTypes = task.monthlyTypes || [task.monthlyType || 'first'];
        let targetWeekNumbers = [];
        
        monthlyTypes.forEach(type => {
          switch (type) {
            case 'first': targetWeekNumbers.push(1); break;
            case 'second': targetWeekNumbers.push(2); break;
            case 'third': targetWeekNumbers.push(3); break;
            case 'fourth': targetWeekNumbers.push(4); break;
            case 'last':
              const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
              const lastWeekNumber = Math.ceil((lastDayOfMonth + firstDayWeekday) / 7);
              targetWeekNumbers.push(lastWeekNumber);
              break;
          }
        });
        
        return targetWeekNumbers.includes(weekNumber);
        
      case 'interval':
        if (!selectedDays.includes(dayOfWeek)) return false;
        
        const startDate = new Date(task.startDate);
        const daysDiff = Math.floor((date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        const weeksDiff = Math.floor(daysDiff / 7);
        
        return weeksDiff % (task.intervalWeeks || 1) === 0;
        
      default:
        return selectedDays.includes(dayOfWeek);
    }
  };

  const hasTaskDataForDate = (task, date) => {
    const dateString = dateUtils.getDateString(date);
    
    if (task.dailyProgress && task.dailyProgress[dateString]) {
      const progress = task.dailyProgress[dateString];
      if (task.taskType === 'time') {
        if (progress.timeSpent > 0) return true;
      } else {
        if (progress.currentCount > 0) return true;
      }
    }
    
    return isTaskScheduledForDate(task, date);
  };

  const getTasksWithDataForDate = (date) => {
    return tasks.filter(task => hasTaskDataForDate(task, date));
  };

  return {
    isTaskScheduledForDate,
    hasTaskDataForDate,
    getTasksWithDataForDate
  };
};