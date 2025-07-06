// Achievement definitions with levels
export const achievementDefinitions = [
    {
      id: 'time_collector',
      name: 'Time Collector',
      icon: '⏰',
      category: 'Time Management',
      description: 'Log hours of focused work',
      levels: [
        { level: 1, target: 1, description: 'Log 1 hour of work' },
        { level: 2, target: 10, description: 'Log 10 hours of work' },
        { level: 3, target: 50, description: 'Log 50 hours of work' },
        { level: 4, target: 200, description: 'Log 200 hours of work' },
        { level: 5, target: 1000, description: 'Log 1000 hours of work' }
      ]
    },
    {
      id: 'perfectionist',
      name: 'Perfectionist',
      icon: '💎',
      category: 'Completion',
      description: 'Achieve perfect completion days',
      levels: [
        { level: 1, target: 1, description: 'Achieve 1 perfect day' },
        { level: 2, target: 5, description: 'Achieve 5 perfect days' },
        { level: 3, target: 20, description: 'Achieve 20 perfect days' },
        { level: 4, target: 50, description: 'Achieve 50 perfect days' },
        { level: 5, target: 100, description: 'Achieve 100 perfect days' }
      ]
    },
    {
      id: 'streak_master',
      name: 'Streak Master',
      icon: '🔥',
      category: 'Consistency',
      description: 'Maintain daily completion streaks',
      levels: [
        { level: 1, target: 3, description: 'Maintain a 3-day streak' },
        { level: 2, target: 7, description: 'Maintain a 7-day streak' },
        { level: 3, target: 21, description: 'Maintain a 21-day streak' },
        { level: 4, target: 50, description: 'Maintain a 50-day streak' },
        { level: 5, target: 100, description: 'Maintain a 100-day streak' }
      ]
    },
    {
      id: 'task_master',
      name: 'Task Master',
      icon: '🎖️',
      category: 'Completion',
      description: 'Achieve high overall completion rates',
      levels: [
        { level: 1, target: 70, description: 'Achieve 70% overall completion' },
        { level: 2, target: 80, description: 'Achieve 80% overall completion' },
        { level: 3, target: 90, description: 'Achieve 90% overall completion' },
        { level: 4, target: 95, description: 'Achieve 95% overall completion' },
        { level: 5, target: 99, description: 'Achieve 99% overall completion' }
      ]
    },
    {
      id: 'category_champion',
      name: 'Category Champion',
      icon: '👑',
      category: 'Mastery',
      description: 'Perfect completion in categories',
      levels: [
        { level: 1, target: 1, description: 'Perfect completion in 1 category' },
        { level: 2, target: 2, description: 'Perfect completion in 2 categories' },
        { level: 3, target: 3, description: 'Perfect completion in 3 categories' },
        { level: 4, target: 5, description: 'Perfect completion in 5 categories' },
        { level: 5, target: 10, description: 'Perfect completion in 10 categories' }
      ]
    },
    {
      id: 'consistent_performer',
      name: 'Consistent Performer',
      icon: '📈',
      category: 'Consistency',
      description: 'Days with high completion rates',
      levels: [
        { level: 1, target: 5, description: '5 days with >80% completion' },
        { level: 2, target: 20, description: '20 days with >80% completion' },
        { level: 3, target: 50, description: '50 days with >80% completion' },
        { level: 4, target: 100, description: '100 days with >80% completion' },
        { level: 5, target: 365, description: '365 days with >80% completion' }
      ]
    },
    {
      id: 'early_bird',
      name: 'Early Bird',
      icon: '🌅',
      category: 'Time Management',
      description: 'Complete tasks in the morning',
      levels: [
        { level: 1, target: 5, description: 'Complete all tasks before 12 PM, 5 times' },
        { level: 2, target: 15, description: 'Complete all tasks before 12 PM, 15 times' },
        { level: 3, target: 30, description: 'Complete all tasks before 12 PM, 30 times' },
        { level: 4, target: 60, description: 'Complete all tasks before 12 PM, 60 times' },
        { level: 5, target: 100, description: 'Complete all tasks before 12 PM, 100 times' }
      ]
    },
    {
      id: 'night_owl',
      name: 'Night Owl',
      icon: '🦉',
      category: 'Time Management',
      description: 'Work late into the evening',
      levels: [
        { level: 1, target: 10, description: 'Log 10 hours after 8 PM' },
        { level: 2, target: 25, description: 'Log 25 hours after 8 PM' },
        { level: 3, target: 50, description: 'Log 50 hours after 8 PM' },
        { level: 4, target: 100, description: 'Log 100 hours after 8 PM' },
        { level: 5, target: 250, description: 'Log 250 hours after 8 PM' }
      ]
    },
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      icon: '⚡',
      category: 'Efficiency',
      description: 'Complete tasks faster than planned',
      levels: [
        { level: 1, target: 5, description: 'Complete 5 tasks under planned time' },
        { level: 2, target: 20, description: 'Complete 20 tasks under planned time' },
        { level: 3, target: 50, description: 'Complete 50 tasks under planned time' },
        { level: 4, target: 100, description: 'Complete 100 tasks under planned time' },
        { level: 5, target: 250, description: 'Complete 250 tasks under planned time' }
      ]
    },
    {
      id: 'multitasker',
      name: 'Multitasker',
      icon: '🎪',
      category: 'Variety',
      description: 'Work across multiple categories',
      levels: [
        { level: 1, target: 2, description: 'Complete 2+ categories in one day' },
        { level: 2, target: 3, description: 'Complete 3+ categories in one day' },
        { level: 3, target: 4, description: 'Complete 4+ categories in one day' },
        { level: 4, target: 5, description: 'Complete 5+ categories in one day' },
        { level: 5, target: 6, description: 'Complete 6+ categories in one day' }
      ]
    },
    {
      id: 'marathon_runner',
      name: 'Marathon Runner',
      icon: '🏃',
      category: 'Endurance',
      description: 'Log long continuous work sessions',
      levels: [
        { level: 1, target: 2, description: 'Log 2+ hours in one session' },
        { level: 2, target: 4, description: 'Log 4+ hours in one session' },
        { level: 3, target: 6, description: 'Log 6+ hours in one session' },
        { level: 4, target: 8, description: 'Log 8+ hours in one session' },
        { level: 5, target: 12, description: 'Log 12+ hours in one session' }
      ]
    },
    {
      id: 'weekend_warrior',
      name: 'Weekend Warrior',
      icon: '🛡️',
      category: 'Dedication',
      description: 'Stay productive on weekends',
      levels: [
        { level: 1, target: 5, description: 'Complete weekend tasks 5 times' },
        { level: 2, target: 15, description: 'Complete weekend tasks 15 times' },
        { level: 3, target: 30, description: 'Complete weekend tasks 30 times' },
        { level: 4, target: 50, description: 'Complete weekend tasks 50 times' },
        { level: 5, target: 100, description: 'Complete weekend tasks 100 times' }
      ]
    },
    {
      id: 'comeback_king',
      name: 'Comeback King',
      icon: '👑',
      category: 'Resilience',
      description: 'Bounce back after missed days',
      levels: [
        { level: 1, target: 3, description: 'Bounce back with >90% after missing a day, 3 times' },
        { level: 2, target: 10, description: 'Bounce back with >90% after missing a day, 10 times' },
        { level: 3, target: 20, description: 'Bounce back with >90% after missing a day, 20 times' },
        { level: 4, target: 35, description: 'Bounce back with >90% after missing a day, 35 times' },
        { level: 5, target: 50, description: 'Bounce back with >90% after missing a day, 50 times' }
      ]
    },
    {
      id: 'overachiever',
      name: 'Overachiever',
      icon: '🚀',
      category: 'Excellence',
      description: 'Exceed daily task targets',
      levels: [
        { level: 1, target: 5, description: 'Exceed planned tasks/time 5 days' },
        { level: 2, target: 15, description: 'Exceed planned tasks/time 15 days' },
        { level: 3, target: 30, description: 'Exceed planned tasks/time 30 days' },
        { level: 4, target: 60, description: 'Exceed planned tasks/time 60 days' },
        { level: 5, target: 100, description: 'Exceed planned tasks/time 100 days' }
      ]
    }
  ];
  
  // Helper function to calculate achievement progress
  export const calculateAchievementValue = (achievementId, allTimeData, overviewStats, categoryData, tasks, dateRange, getProgress, getDateProgress) => {
    switch (achievementId) {
      case 'time_collector':
        return allTimeData.totalTimeSpent;
      
      case 'perfectionist':
        return allTimeData.perfectDays;
      
      case 'streak_master':
        return overviewStats.currentStreak;
      
      case 'task_master':
        return Math.round(allTimeData.completionRate || 0);
      
      case 'category_champion':
        return categoryData.filter(cat => cat.completion === 100).length;
      
      case 'consistent_performer':
        return allTimeData.trendData.filter(d => d.progress >= 80).length;
      
      case 'early_bird':
        // This would need actual time tracking to implement properly
        return 0;
      
      case 'night_owl':
        // This would need actual time tracking to implement properly  
        return 0;
      
      case 'speed_demon':
        // Count tasks completed under planned time
        let speedCount = 0;
        dateRange.forEach(date => {
          tasks.forEach(task => {
            if (task.taskType === 'time' && task.plannedMinutes) {
              const progress = getDateProgress(task, date);
              const timeSpent = (progress.timeSpent || 0) / 60; // Convert to minutes
              if (timeSpent > 0 && timeSpent < task.plannedMinutes) {
                speedCount++;
              }
            }
          });
        });
        return speedCount;
      
      case 'multitasker':
        // Find max categories completed in one day
        let maxCategories = 0;
        dateRange.forEach(date => {
          const completedCategories = new Set();
          tasks.forEach(task => {
            const progress = getProgress(task, date);
            if (progress >= 100 && task.categoryId) {
              completedCategories.add(task.categoryId);
            }
          });
          maxCategories = Math.max(maxCategories, completedCategories.size);
        });
        return maxCategories;
      
      case 'marathon_runner':
        // This would need session tracking to implement properly
        return 0;
      
      case 'weekend_warrior':
        // Count weekend completions
        let weekendCount = 0;
        dateRange.forEach(date => {
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          if (isWeekend) {
            const dayProgress = allTimeData.trendData.find(d => d.date === `${date.getMonth() + 1}/${date.getDate()}`);
            if (dayProgress && dayProgress.progress >= 80) {
              weekendCount++;
            }
          }
        });
        return weekendCount;
      
      case 'comeback_king':
        // This would need more complex tracking to implement properly
        return 0;
      
      case 'overachiever':
        // Count days where user exceeded planned time/tasks
        let overachieveCount = 0;
        dateRange.forEach(date => {
          let dailyPlanned = 0;
          let dailyActual = 0;
          tasks.forEach(task => {
            if (task.taskType === 'time' && task.plannedMinutes) {
              const progress = getDateProgress(task, date);
              dailyPlanned += task.plannedMinutes;
              dailyActual += (progress.timeSpent || 0) / 60;
            }
          });
          if (dailyActual > dailyPlanned && dailyPlanned > 0) {
            overachieveCount++;
          }
        });
        return overachieveCount;
      
      default:
        return 0;
    }
  };