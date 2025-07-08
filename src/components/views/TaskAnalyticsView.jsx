import { ArrowLeft, BarChart3, Calendar, Check, Target, TrendingUp, Zap } from 'lucide-react';
import { DAYS, MONTHS } from '../../constants';
import {useApp} from '../AppProvider';
import { useTaskProgress } from '../../hooks/useTaskProgress';
import { useTaskScheduling } from '../../hooks/useTaskScheduling';
import { dateUtils, timeUtils } from '../../utils/index';
import {YearHeatmap} from '../YearHeatmap';

export const TaskAnalyticsView = ({ task, onBack }) => {
  const { colors, isMobile, isTablet, tasks, categories, setCurrentDate, setViewMode } = useApp();
  const { getDateProgress, getProgress } = useTaskProgress();
  const { isTaskScheduledForDate, getTasksWithDataForDate } = useTaskScheduling();

  if (!task) return null;

  const handleDayClick = (dateString) => {
    const clickedDate = new Date(dateString);
    setCurrentDate(clickedDate);
    setViewMode('day');
  };

  // Calculate analytics data
  const getTaskAnalytics = () => {
    const today = new Date();
    const todayString = dateUtils.getDateString(today);
    const eightDaysAgo = new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000);
    const analytics = {
      activeDays: 0,
      completedDays: 0,
      totalProgress: 0,
      totalCount: 0,
      currentStreak: 0,
      bestStreak: 0,
      dailyData: []
    };

    let streak = 0;
    let maxStreak = 0;

    // Analyze last 8 days
    for (let i = 7; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateString = dateUtils.getDateString(date);
      const progress = getProgress(task, date);
      const dateProgress = getDateProgress(task, date);
      const isScheduled = isTaskScheduledForDate(task, date);
      const isToday = dateString === todayString;
      const dayTasks = getTasksWithDataForDate(date);
      
      const dayData = {
        date: dateString,
        displayDate: `${MONTHS[date.getMonth()].substring(0, 3)} ${date.getDate()}`,
        fullDate: `${date.getDate()}`,
        dayName: DAYS[date.getDay()].substring(0, 3),
        progress: Math.round(progress),
        isCompleted: progress >= 100,
        value: task.taskType === 'time' ? dateProgress.timeSpent : dateProgress.currentCount,
        isBest: false,
        isScheduled,
        isToday,
        dayTasks: dayTasks.slice(0, 4) // Show up to 4 tasks for the day
      };

      analytics.dailyData.push(dayData);
      
      if (task.dailyProgress && task.dailyProgress[dateString]) {
        analytics.activeDays++;
        analytics.totalProgress += progress;
        
        if (task.taskType === 'count') {
          analytics.totalCount += dateProgress.currentCount || 0;
        } else {
          analytics.totalCount += Math.floor(dateProgress.timeSpent / 60) || 0;
        }
        
        if (progress >= 100) {
          analytics.completedDays++;
          streak++;
          maxStreak = Math.max(maxStreak, streak);
        } else {
          if (i === 0) analytics.currentStreak = 0; // Today is not completed
          streak = 0;
        }
      } else {
        streak = 0;
      }
    }

    // Set current streak (count from today backwards)
    let currentStreakCount = 0;
    for (let i = 0; i < analytics.dailyData.length; i++) {
      const dayData = analytics.dailyData[analytics.dailyData.length - 1 - i];
      if (dayData.isCompleted) {
        currentStreakCount++;
      } else {
        break;
      }
    }
    analytics.currentStreak = currentStreakCount;
    analytics.bestStreak = maxStreak;

    // Find best day
    let bestProgress = 0;
    let bestDayIndex = -1;
    analytics.dailyData.forEach((day, index) => {
      if (day.progress > bestProgress) {
        bestProgress = day.progress;
        bestDayIndex = index;
      }
    });
    if (bestDayIndex >= 0) {
      analytics.dailyData[bestDayIndex].isBest = true;
    }

    return analytics;
  };

  const analytics = getTaskAnalytics();
  const avgProgress = analytics.activeDays > 0 ? Math.round(analytics.totalProgress / analytics.activeDays) : 0;
  const completionRate = analytics.activeDays > 0 ? Math.round((analytics.completedDays / analytics.activeDays) * 100) : 0;
  const avgCount = analytics.activeDays > 0 ? Math.round(analytics.totalCount / analytics.activeDays) : 0;

  return (
    <div className="max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 size={24} />
          Analytics: {task.name}
        </h3>
      </div>

      {/* Stats Cards - 1 row, 4 columns on desktop; 4 rows, 1 column on mobile */}
      <div className={`grid gap-4 mb-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-4'}`}>
        <div className="rounded-lg p-4" style={{ 
          backgroundColor: colors.primary,
          color: 'white'
        }}>
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-white" />
            <span className="text-sm font-medium text-white">Average Progress</span>
          </div>
          <div className="text-2xl font-bold text-white">{avgProgress}%</div>
          <div className="text-xs text-white opacity-80">{analytics.activeDays} active days</div>
        </div>

        <div className="rounded-lg p-4" style={{ 
          backgroundColor: '#10b981',
          color: 'white'
        }}>
          <div className="flex items-center gap-2 mb-2">
            <Check size={16} className="text-white" />
            <span className="text-sm font-medium text-white">Completion Rate</span>
          </div>
          <div className="text-2xl font-bold text-white">{completionRate}%</div>
          <div className="text-xs text-white opacity-80">{analytics.completedDays} of {analytics.activeDays} days</div>
        </div>

        <div className="rounded-lg p-4" style={{ 
          backgroundColor: '#f59e0b',
          color: 'white'
        }}>
          <div className="flex items-center gap-2 mb-2">
            <Zap size={16} className="text-white" />
            <span className="text-sm font-medium text-white">Current Streak</span>
          </div>
          <div className="text-2xl font-bold text-white">{analytics.currentStreak}</div>
          <div className="text-xs text-white opacity-80">Best: {analytics.bestStreak} days</div>
        </div>

        <div className="rounded-lg p-4" style={{ 
          backgroundColor: '#8b5cf6',
          color: 'white'
        }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-white" />
            <span className="text-sm font-medium text-white">
              {task.taskType === 'time' ? 'Total Time' : 'Total Count'}
            </span>
          </div>
          <div className="text-2xl font-bold text-white">{analytics.totalCount}</div>
          <div className="text-xs text-white opacity-80">
            Avg: {avgCount}{task.taskType === 'time' ? 'm' : ''}/day
          </div>
        </div>
      </div>

      {/* Year Heatmap - Desktop Only */}
      {!isMobile && !isTablet && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={18} />
            Year Activity Heatmap
          </h4>
          <div className="flex items-center justify-center">
            <YearHeatmap 
              task={task} 
              colors={colors}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Daily Progress */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Daily Progress</h4>
        <div className="text-sm text-gray-600 mb-4">
          Last 8 days • {analytics.activeDays} active days
          {analytics.dailyData.find(d => d.isBest) && (
            <span className="ml-4 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
              Best: {analytics.dailyData.find(d => d.isBest)?.progress}% on {analytics.dailyData.find(d => d.isBest)?.displayDate}
            </span>
          )}
        </div>
        
        <div className="bg-white rounded-lg border divide-y divide-gray-100">
          {analytics.dailyData.map((day, index) => (
            <div 
              key={index} 
              onClick={() => handleDayClick(day.date)}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                day.isToday ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="w-16 text-center flex-shrink-0">
                <div className={`text-sm font-medium ${day.isToday ? 'text-blue-700' : 'text-gray-800'}`}>
                  {day.displayDate}
                </div>
                <div className={`text-xs ${day.isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                  {day.dayName}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {task.taskType === 'time' 
                        ? `${timeUtils.formatTime(day.value || 0)} / ${timeUtils.formatPlannedTime(task.plannedMinutes)}`
                        : `${day.value || 0} / ${task.targetCount}`
                      }
                    </span>
                    {day.dayTasks.length > 0 && (
                      <div className="flex items-center gap-1">
                        {isMobile ? (
                          // Mobile only: Just colored dots like calendar
                          <>
                            {day.dayTasks.slice(0, 6).map((dayTask, taskIndex) => (
                              <div
                                key={taskIndex}
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: dayTask.color || colors.accent }}
                                title={dayTask.name}
                              ></div>
                            ))}
                            {day.dayTasks.length > 6 && (
                              <span className="text-xs text-gray-500">+{day.dayTasks.length - 6}</span>
                            )}
                          </>
                        ) : (
                          // Desktop & Tablet: Full task cards with icons
                          <>
                            {day.dayTasks.map((dayTask, taskIndex) => {
                              const category = categories.find(cat => cat.id === dayTask.categoryId);
                              return (
                                <div
                                  key={taskIndex}
                                  className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded text-xs"
                                  title={dayTask.name}
                                >
                                  {category && <span className="text-xs">{category.icon}</span>}
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: dayTask.color || colors.accent }}
                                  ></div>
                                  <span className="text-gray-700 max-w-16 truncate">{dayTask.name}</span>
                                </div>
                              );
                            })}
                            {day.dayTasks.length > 4 && (
                              <span className="text-xs text-gray-500">+{day.dayTasks.length - 4}</span>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {day.isBest && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-1 rounded">Best</span>
                    )}
                    <span className={`text-sm font-medium ${day.isToday ? 'text-blue-700' : 'text-gray-800'}`}>
                      {day.progress}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(day.progress, 100)}%`,
                      backgroundColor: day.isToday ? '#3b82f6' : day.progress >= 100 ? '#10b981' : day.progress >= 50 ? colors.primary : '#6b7280'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskAnalyticsView;