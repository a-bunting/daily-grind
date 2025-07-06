import { ArrowLeft, BarChart3, Check, Target, TrendingUp, Zap } from 'lucide-react';
import { DAYS, DAY_ABBREVIATIONS, MONTHS } from '../constants';
import {useApp} from './AppProvider';
import { useTaskProgress } from '../hooks/useTaskProgress';
import { useTaskScheduling } from '../hooks/useTaskScheduling';
import { dateUtils } from '../utils/index';

export const WeeklySummaryView = ({ weekDate, onBack }) => {
  const { colors, isMobile, isTablet, categories, setCurrentDate, setViewMode } = useApp();
  const { getTasksWithDataForDate } = useTaskScheduling();
  const { getDayProgress } = useTaskProgress();

  if (!weekDate) return null;

  const handleDayClick = (date) => {
    setCurrentDate(date);
    setViewMode('day');
  };

  const getWeeklyStats = () => {
    const weekStart = dateUtils.getWeekStart(weekDate);
    const weekEnd = dateUtils.getWeekEnd(weekDate);
    const weekDays = dateUtils.getWeekDays(weekDate);
    const todayString = dateUtils.getDateString(new Date());
    
    const stats = {
      totalTasks: 0,
      completedTasks: 0,
      totalProgress: 0,
      activeDays: 0,
      dailyBreakdown: []
    };

    weekDays.forEach(date => {
      const dayTasks = getTasksWithDataForDate(date);
      const dayProgress = getDayProgress(date);
      const dateString = dateUtils.getDateString(date);
      const isToday = dateString === todayString;
      const completedTasks = dayTasks.filter(task => {
        const progress = task.taskType === 'time' 
          ? (task.dailyProgress[dateString]?.timeSpent || 0) / (task.plannedMinutes * 60) * 100
          : (task.dailyProgress[dateString]?.currentCount || 0) / task.targetCount * 100;
        return progress >= 100;
      }).length;

      stats.dailyBreakdown.push({
        date,
        dayName: DAYS[date.getDay()],
        dayShort: DAY_ABBREVIATIONS[date.getDay()],
        dayNum: date.getDate(),
        taskCount: dayTasks.length,
        progress: dayProgress,
        completedTasks,
        tasks: dayTasks,
        isToday
      });

      stats.totalTasks += dayTasks.length;
      stats.completedTasks += completedTasks;
      stats.totalProgress += dayProgress;
      // Only count as active if there are tasks AND progress > 0
      if (dayTasks.length > 0 && dayProgress > 0) stats.activeDays++;
    });

    const avgProgress = stats.activeDays > 0 ? Math.round(stats.totalProgress / stats.activeDays) : 0;
    const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

    return { ...stats, avgProgress, completionRate, weekStart, weekEnd };
  };

  const stats = getWeeklyStats();

  const renderStatsCards = () => {
    if (isMobile) {
      return (
        <div className="grid gap-3 mb-4 grid-cols-2">
          <div className="bg-white rounded-lg p-3 shadow border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Target size={14} style={{ color: colors.primary }} />
              <span className="text-xs font-medium text-gray-700">Total Tasks</span>
            </div>
            <div className="text-xl font-bold text-gray-800 mb-1">{stats.totalTasks}</div>
            <div className="text-xs text-gray-600">{stats.activeDays} active days</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 shadow border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Check size={14} className="text-green-600" />
              <span className="text-xs font-medium text-gray-700">Completed</span>
            </div>
            <div className="text-xl font-bold text-gray-800 mb-1">{stats.completedTasks}</div>
            <div className="text-xs text-gray-600">{stats.completionRate}% rate</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 shadow border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-purple-600" />
              <span className="text-xs font-medium text-gray-700">Avg Progress</span>
            </div>
            <div className="text-xl font-bold text-gray-800 mb-1">{stats.avgProgress}%</div>
            <div className="text-xs text-gray-600">per active day</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 shadow border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-orange-600" />
              <span className="text-xs font-medium text-gray-700">Active Days</span>
            </div>
            <div className="text-xl font-bold text-gray-800 mb-1">{stats.activeDays}</div>
            <div className="text-xs text-gray-600">out of 7 days</div>
          </div>
        </div>
      );
    }

    return (
      <div className="grid gap-4 mb-6 grid-cols-4">
        <div className="bg-white rounded-lg p-4 shadow border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primaryLight }}>
              <Target size={20} style={{ color: colors.primary }} />
            </div>
            <span className="text-xl font-bold text-gray-800">{stats.totalTasks}</span>
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">Total Tasks</h3>
          <p className="text-xs text-gray-600">{stats.activeDays} active days</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check size={20} className="text-green-600" />
            </div>
            <span className="text-xl font-bold text-gray-800">{stats.completedTasks}</span>
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">Completed</h3>
          <p className="text-xs text-gray-600">{stats.completionRate}% rate</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp size={20} className="text-purple-600" />
            </div>
            <span className="text-xl font-bold text-gray-800">{stats.avgProgress}%</span>
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">Avg Progress</h3>
          <p className="text-xs text-gray-600">Per active day</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Zap size={20} className="text-orange-600" />
            </div>
            <span className="text-xl font-bold text-gray-800">{stats.activeDays}</span>
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">Active Days</h3>
          <p className="text-xs text-gray-600">Out of 7</p>
        </div>
      </div>
    );
  };

  const renderDailyBreakdown = () => {
    if (isMobile) {
      // Mobile only: Mini layout with colored dots
      return (
        <div className="bg-white rounded-lg shadow border border-gray-100 p-3">
          <h4 className="font-semibold text-gray-800 mb-3 text-sm">Daily Progress</h4>
          <div className="grid gap-2">
            {stats.dailyBreakdown.map((day, index) => (
              <div 
                key={index} 
                onClick={() => handleDayClick(day.date)}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 transition-colors ${
                  day.isToday ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${
                  day.isToday ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {day.dayNum}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{day.dayShort}</span>
                      {day.tasks.length > 0 && (
                        <div className="flex items-center gap-1">
                          {day.tasks.slice(0, 4).map((task, taskIndex) => (
                            <div
                              key={taskIndex}
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: task.color || colors.accent }}
                              title={task.name}
                            ></div>
                          ))}
                          {day.tasks.length > 4 && (
                            <span className="text-xs text-gray-500">+{day.tasks.length - 4}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <span>{day.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div
                      className="h-1 rounded-full"
                      style={{
                        width: `${day.progress}%`,
                        backgroundColor: day.isToday ? '#3b82f6' : colors.accent
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Desktop & Tablet: List layout with task names and icons
    return (
      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
        <div className="p-3 border-b border-gray-100">
          <h4 className="font-semibold text-gray-800">Daily Breakdown</h4>
        </div>
        <div className="divide-y divide-gray-100">
          {stats.dailyBreakdown.map((day, index) => {
            const isBest = Math.max(...stats.dailyBreakdown.map(d => d.progress)) === day.progress && day.progress > 0;
            
            return (
              <div 
                key={index} 
                onClick={() => handleDayClick(day.date)}
                className={`flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                  day.isToday ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                  day.isToday ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {day.dayNum}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${day.isToday ? 'text-blue-800' : 'text-gray-800'}`}>
                        {day.dayShort}
                      </span>
                      {day.tasks.length > 0 && (
                        <div className="flex items-center gap-1">
                          {day.tasks.slice(0, 3).map((task, taskIndex) => {
                            const category = categories.find(cat => cat.id === task.categoryId);
                            return (
                              <div
                                key={taskIndex}
                                className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded text-xs"
                                title={task.name}
                              >
                                {category && <span className="text-xs">{category.icon}</span>}
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: task.color || colors.accent }}
                                ></div>
                                <span className="text-gray-700 max-w-16 truncate">{task.name}</span>
                              </div>
                            );
                          })}
                          {day.tasks.length > 3 && (
                            <span className="text-xs text-gray-500">+{day.tasks.length - 3}</span>
                          )}
                        </div>
                      )}
                      <span className="text-xs text-gray-600">
                        {day.taskCount} tasks • {day.completedTasks} done
                      </span>
                      {isBest && day.progress > 0 && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-1 rounded">Best</span>
                      )}
                    </div>
                    <span className={`text-sm font-bold ${day.isToday ? 'text-blue-700' : 'text-gray-800'}`}>
                      {day.progress}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(day.progress, 100)}%`,
                        backgroundColor: day.isToday ? '#3b82f6' : day.progress >= 80 ? '#10b981' : colors.accent
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 size={24} />
            Weekly Summary
            {!isMobile && (
              <span> - {MONTHS[stats.weekStart.getMonth()]} {stats.weekStart.getDate()} - {MONTHS[stats.weekEnd.getMonth()]} {stats.weekEnd.getDate()}</span>
            )}
          </h3>
          {isMobile && (
            <p className="text-sm text-gray-600 ml-8">
              {MONTHS[stats.weekStart.getMonth()]} {stats.weekStart.getDate()} - {MONTHS[stats.weekEnd.getMonth()]} {stats.weekEnd.getDate()}
            </p>
          )}
        </div>
      </div>

      {renderStatsCards()}
      {renderDailyBreakdown()}
    </div>
  );
};

export default WeeklySummaryView;