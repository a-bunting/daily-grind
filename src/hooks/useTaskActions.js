// src/hooks/useTaskActions.js - Updated with Input Task Support
import { useApp } from '../components/AppProvider';
import { dateUtils } from '../utils/index';

export const useTaskActions = () => {
  const { tasks, setTasks, goals, setGoals } = useApp();

  // Helper function to calculate goal progress from tasks
  const calculateGoalProgress = (goalId, updatedTasks = tasks) => {
    const contributingTasks = updatedTasks.filter(task => 
      task.goalId === goalId && task.taskType === 'input'
    );
    
    let totalProgress = 0;
    contributingTasks.forEach(task => {
      Object.values(task.dailyProgress || {}).forEach(dayProgress => {
        if (dayProgress.inputValue) {
          totalProgress += dayProgress.inputValue;
        }
      });
    });
    
    return totalProgress;
  };

  // Helper function to update linked goal progress
  const updateLinkedGoalProgress = (taskId, updatedTasks = tasks) => {
    const task = updatedTasks.find(t => t.id === taskId);
    if (task && task.goalId) {
      const newProgress = calculateGoalProgress(task.goalId, updatedTasks);
      setGoals(prevGoals => 
        prevGoals.map(goal => 
          goal.id === task.goalId 
            ? { ...goal, currentProgress: newProgress }
            : goal
        )
      );
    }
  };

  // NEW: Add or update input progress for input tasks
  const addInputProgress = (taskId, dateString, inputValue) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const updatedTask = {
          ...task,
          dailyProgress: {
            ...task.dailyProgress,
            [dateString]: {
              ...task.dailyProgress?.[dateString],
              inputValue: inputValue,
              isRunning: false,
              startTime: null
            }
          }
        };
        return updatedTask;
      }
      return task;
    });
    
    setTasks(updatedTasks);
    
    // Update linked goal progress
    setTimeout(() => updateLinkedGoalProgress(taskId, updatedTasks), 0);
  };

  // NEW: Remove input progress for a specific date
  const removeInputProgress = (taskId, dateString) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId && task.dailyProgress?.[dateString]) {
        const newDailyProgress = { ...task.dailyProgress };
        delete newDailyProgress[dateString];
        
        return {
          ...task,
          dailyProgress: newDailyProgress
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    
    // Update linked goal progress
    setTimeout(() => updateLinkedGoalProgress(taskId, updatedTasks), 0);
  };

  // EXISTING: Toggle timer for time tasks
  const toggleTimer = (taskId) => {
    const today = dateUtils.getDateString(new Date());
    
    setTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id === taskId) {
          const currentProgress = task.dailyProgress?.[today] || {
            timeSpent: 0,
            isRunning: false,
            startTime: null
          };
          
          if (currentProgress.isRunning) {
            // Stop timer
            const timeSpent = currentProgress.timeSpent + (Date.now() - currentProgress.startTime);
            return {
              ...task,
              dailyProgress: {
                ...task.dailyProgress,
                [today]: {
                  timeSpent: Math.round(timeSpent / 1000) * 1000,
                  isRunning: false,
                  startTime: null
                }
              }
            };
          } else {
            // Start timer
            return {
              ...task,
              dailyProgress: {
                ...task.dailyProgress,
                [today]: {
                  ...currentProgress,
                  isRunning: true,
                  startTime: Date.now()
                }
              }
            };
          }
        }
        return task;
      });
    });
  };

  // EXISTING: Reset timer for time tasks
  const resetTimer = (taskId) => {
    const today = dateUtils.getDateString(new Date());
    
    setTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id === taskId) {
          const newDailyProgress = { ...task.dailyProgress };
          delete newDailyProgress[today];
          
          return {
            ...task,
            dailyProgress: newDailyProgress
          };
        }
        return task;
      });
    });
  };

  // EXISTING: Increment count for count tasks
  const incrementCount = (taskId) => {
    const today = dateUtils.getDateString(new Date());
    
    setTasks(prevTasks => {
        return prevTasks.map(task => {
            if (task.id === taskId) {
                const currentProgress = task.dailyProgress?.[today] || {
                    currentCount: 0,
                    isRunning: false,
                    startTime: null
                };          
          return {
            ...task,
            dailyProgress: {
              ...task.dailyProgress,
              [today]: {
                ...currentProgress,
                currentCount: currentProgress.currentCount + 1
              }
            }
          };
        }
        return task;
      });
    });
  };

  // EXISTING: Decrement count for count tasks
  const decrementCount = (taskId) => {
    const today = dateUtils.getDateString(new Date());
    
    setTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id === taskId) {
          const currentProgress = task.dailyProgress?.[today] || {
            currentCount: 0,
            isRunning: false,
            startTime: null
          };
          
          return {
            ...task,
            dailyProgress: {
              ...task.dailyProgress,
              [today]: {
                ...currentProgress,
                currentCount: Math.max(0, currentProgress.currentCount - 1)
              }
            }
          };
        }
        return task;
      });
    });
  };

  // EXISTING: Toggle checkbox for count tasks with target 1
  const toggleCheckbox = (taskId) => {
    const today = dateUtils.getDateString(new Date());
    
    setTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id === taskId) {
          const currentProgress = task.dailyProgress?.[today] || {
            currentCount: 0,
            isRunning: false,
            startTime: null
          };
          
          return {
            ...task,
            dailyProgress: {
              ...task.dailyProgress,
              [today]: {
                ...currentProgress,
                currentCount: currentProgress.currentCount === 1 ? 0 : 1
              }
            }
          };
        }
        return task;
      });
    });
  };

  // EXISTING: Skip task for today
  const skipTaskForDay = (taskId) => {
    const today = dateUtils.getDateString(new Date());
    
    setTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            excludedDates: [...(task.excludedDates || []), today]
          };
        }
        return task;
      });
    });
  };

  // EXISTING: Add one-off task for today
  const addOneOffTask = (taskId) => {
    const today = dateUtils.getDateString(new Date());
    
    setTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            oneOffDates: [...(task.oneOffDates || []), today]
          };
        }
        return task;
      });
    });
  };

  // EXISTING: Add singleton task for today
  const addSingletonTask = (taskId) => {
    return addOneOffTask(taskId);
  };

  // EXISTING: Delete task (mark as ended)
  const deleteTask = (taskId) => {
    const yesterday = dateUtils.getDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));
    
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            endDate: yesterday
          };
        }
        return task;
      });
      
      // Update any linked goal progress
      const deletedTask = prevTasks.find(t => t.id === taskId);
      if (deletedTask && deletedTask.goalId) {
        setTimeout(() => updateLinkedGoalProgress(taskId, updatedTasks), 0);
      }
      
      return updatedTasks;
    });
  };

  return {
    // NEW input task functions
    addInputProgress,
    removeInputProgress,
    
    // EXISTING functions
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

export default useTaskActions;