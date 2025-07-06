// src/hooks/useTaskProgress.js

import {useApp} from '../components/AppProvider';
import { useTaskScheduling } from './useTaskScheduling';
import { dateUtils } from '../utils/index';

export const useTaskProgress = () => {
  const { tasks } = useApp();
  const { getTasksWithDataForDate } = useTaskScheduling();

  const getDateProgress = (task, date) => {
    const dateString = dateUtils.getDateString(date);
    if (!task.dailyProgress || !task.dailyProgress[dateString]) {
      if (task.taskType === 'count') {
        return { currentCount: 0, isRunning: false, startTime: null };
      } else {
        return { timeSpent: 0, isRunning: false, startTime: null };
      }
    }
    return task.dailyProgress[dateString];
  };

  const getProgress = (task, date) => {
    const dateProgress = getDateProgress(task, date);
    if (task.taskType === 'count') {
      return Math.min(((dateProgress.currentCount || 0) / task.targetCount) * 100, 100);
    } else {
      const plannedMinutes = parseFloat(task.plannedMinutes) || 0;
      if (plannedMinutes === 0) return 0;
      const plannedSeconds = plannedMinutes * 60;
      return Math.min((dateProgress.timeSpent / plannedSeconds) * 100, 100);
    }
  };

  const getDayProgress = (date) => {
    const dayTasks = getTasksWithDataForDate(date);
    if (dayTasks.length === 0) return 0;
    
    let totalProgress = 0;
    dayTasks.forEach(task => {
      const progress = getProgress(task, date);
      totalProgress += progress;
    });
    
    return Math.round(totalProgress / dayTasks.length);
  };

  return {
    getDateProgress,
    getProgress,
    getDayProgress
  };
};