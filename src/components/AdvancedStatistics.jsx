import React, { useMemo, useState } from 'react';
import {useApp} from './AppProvider';
import { useTaskProgress } from '../hooks/useTaskProgress';
import { useTaskScheduling } from '../hooks/useTaskScheduling';
import { ArrowLeft, TrendingUp, Clock, Target, BarChart3, PieChart, Trophy, Zap, Activity } from 'lucide-react';
import { achievementDefinitions, calculateAchievementValue } from '../data/AchievementDefinitions';

export const AdvancedStatistics = () => {
  const { 
    tasks, 
    categories, 
    currentDate, 
    setViewMode, 
    colors, 
    isMobile,
    isTablet
  } = useApp();
  
  const { getProgress, getDayProgress, getDateProgress } = useTaskProgress();
  const { isTaskScheduledForDate, getTasksWithDataForDate } = useTaskScheduling();
  
  const [timeRange, setTimeRange] = useState(30); // Now using number instead of string
  const [selectedTab, setSelectedTab] = useState('overview');
  const [hoveredAchievement, setHoveredAchievement] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Calculate date range based on selection
  const dateRange = useMemo(() => {
    const endDate = new Date(currentDate);
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - timeRange);
    
    const dates = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, [currentDate, timeRange]);

  // Overview Statistics
  const overviewStats = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    let totalTimeSpent = 0;
    let totalTimeTargeted = 0;
    let currentStreak = 0;
    
    // Check for current streak (consecutive days with >50% completion)
    const today = new Date();
    let checkDate = new Date(today);
    let streakActive = true;
    let streakDays = 0;
    
    while (streakActive && streakDays < 365) {
      const dayProgress = getDayProgress(checkDate);
      if (dayProgress >= 50) {
        streakDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        streakActive = false;
      }
    }
    currentStreak = streakDays;

    dateRange.forEach(date => {
      const tasksForDate = getTasksWithDataForDate(date);
      const scheduledTasks = tasksForDate.filter(task => isTaskScheduledForDate(task, date));
      
      totalTasks += scheduledTasks.length;
      
      scheduledTasks.forEach(task => {
        const progress = getProgress(task, date);
        if (progress >= 100) completedTasks++;
        
        const dateProgress = getDateProgress(task, date);
        if (task.taskType === 'time') {
          totalTimeSpent += dateProgress.timeSpent || 0;
          totalTimeTargeted += (task.plannedMinutes || 0) * 60;
        }
      });
    });

    return {
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100) : 0,
      totalTimeSpent: Math.round(totalTimeSpent / 3600 * 10) / 10,
      totalTimeTargeted: Math.round(totalTimeTargeted / 3600 * 10) / 10,
      timeEfficiency: totalTimeTargeted > 0 ? (totalTimeSpent / totalTimeTargeted * 100) : 0,
      currentStreak: currentStreak,
      averageDaily: totalTasks > 0 ? (completedTasks / dateRange.length) : 0
    };
  }, [dateRange, getDayProgress, getTasksWithDataForDate, isTaskScheduledForDate, getProgress, getDateProgress]);

  // Daily Progress Trend Data
  const trendData = useMemo(() => {
    return dateRange.map(date => {
      const dayProgress = getDayProgress(date);
      const tasksForDate = getTasksWithDataForDate(date);
      const completedCount = tasksForDate.filter(task => getProgress(task, date) >= 100).length;
      
      return {
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        progress: Math.round(dayProgress),
        completed: completedCount,
        total: tasksForDate.filter(task => isTaskScheduledForDate(task, date)).length
      };
    });
  }, [dateRange, getDayProgress, getTasksWithDataForDate, getProgress, isTaskScheduledForDate]);

  // Category Performance Data
  const categoryData = useMemo(() => {
    const categoryStats = {};
    
    categories.forEach(category => {
      categoryStats[category.id] = {
        name: category.name,
        color: category.color,
        total: 0,
        completed: 0,
        timeSpent: 0
      };
    });
    
    categoryStats['uncategorized'] = {
      name: 'Uncategorized',
      color: '#6B7280',
      total: 0,
      completed: 0,
      timeSpent: 0
    };

    dateRange.forEach(date => {
      const tasksForDate = getTasksWithDataForDate(date);
      
      tasksForDate.forEach(task => {
        if (isTaskScheduledForDate(task, date)) {
          const categoryId = task.categoryId || 'uncategorized';
          const progress = getProgress(task, date);
          const dateProgress = getDateProgress(task, date);
          
          if (categoryStats[categoryId]) {
            categoryStats[categoryId].total++;
            if (progress >= 100) categoryStats[categoryId].completed++;
            if (task.taskType === 'time') {
              categoryStats[categoryId].timeSpent += (dateProgress.timeSpent || 0) / 3600;
            }
          }
        }
      });
    });

    return Object.values(categoryStats)
      .filter(cat => cat.total > 0)
      .map(cat => ({
        ...cat,
        completion: cat.total > 0 ? Math.round(cat.completed / cat.total * 100) : 0,
        timeSpent: Math.round(cat.timeSpent * 10) / 10
      }));
  }, [dateRange, categories, getProgress, getDateProgress, getTasksWithDataForDate, isTaskScheduledForDate]);

  // Top and Bottom Performing Tasks
  const performanceTasks = useMemo(() => {
    const taskStats = {};
    
    tasks.forEach(task => {
      taskStats[task.id] = {
        name: task.name,
        color: task.color,
        total: 0,
        completed: 0,
        timeSpent: 0,
        avgProgress: 0
      };
    });

    dateRange.forEach(date => {
      tasks.forEach(task => {
        if (isTaskScheduledForDate(task, date)) {
          const progress = getProgress(task, date);
          const dateProgress = getDateProgress(task, date);
          
          taskStats[task.id].total++;
          if (progress >= 100) taskStats[task.id].completed++;
          taskStats[task.id].avgProgress += progress;
          if (task.taskType === 'time') {
            taskStats[task.id].timeSpent += (dateProgress.timeSpent || 0) / 3600;
          }
        }
      });
    });

    const processedTasks = Object.values(taskStats)
      .filter(task => task.total > 0)
      .map(task => ({
        ...task,
        completion: task.total > 0 ? Math.round(task.completed / task.total * 100) : 0,
        avgProgress: task.total > 0 ? Math.round(task.avgProgress / task.total) : 0,
        timeSpent: Math.round(task.timeSpent * 10) / 10
      }))
      .sort((a, b) => b.completion - a.completion);

    return {
      top: processedTasks.slice(0, 5),
      bottom: processedTasks.slice(-5).reverse()
    };
  }, [dateRange, tasks, getProgress, getDateProgress, isTaskScheduledForDate]);

  // All-time data for achievements
  const allTimeData = useMemo(() => {
    const endDate = new Date(currentDate);
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - 365);
    
    const dates = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    const allTimeTrend = dates.map(date => {
      const dayProgress = getDayProgress(date);
      return {
        progress: Math.round(dayProgress)
      };
    });

    let totalTimeSpent = 0;
    dates.forEach(date => {
      const tasksForDate = getTasksWithDataForDate(date);
      tasksForDate.forEach(task => {
        const dateProgress = getDateProgress(task, date);
        if (task.taskType === 'time') {
          totalTimeSpent += dateProgress.timeSpent || 0;
        }
      });
    });

    return {
      trendData: allTimeTrend,
      totalTimeSpent: Math.round(totalTimeSpent / 3600 * 10) / 10,
      perfectDays: allTimeTrend.filter(d => d.progress === 100).length
    };
  }, [currentDate, getDayProgress, getTasksWithDataForDate, getDateProgress]);

  // Achievement definitions
  // (Now imported from achievementsData.js)

  // Achievements System
  const achievementProgress = useMemo(() => {
    const progressData = achievementDefinitions.map(definition => {
      const currentValue = calculateAchievementValue(
        definition.id, 
        allTimeData, 
        overviewStats, 
        categoryData, 
        tasks, 
        dateRange, 
        getProgress, 
        getDateProgress
      );

      let achievedLevel = 0;
      let nextLevel = null;
      
      for (const level of definition.levels) {
        if (currentValue >= level.target) {
          achievedLevel = level.level;
        } else {
          nextLevel = level;
          break;
        }
      }

      return {
        ...definition,
        currentValue,
        achievedLevel,
        nextLevel: nextLevel || definition.levels[definition.levels.length - 1],
        maxLevel: definition.levels.length,
        isMaxed: achievedLevel === definition.levels.length
      };
    });

    const achieved = progressData.filter(a => a.achievedLevel > 0);
    
    // Calculate total points from achievements
    const totalPoints = achieved.reduce((sum, achievement) => {
      // Points per level: Level 1 = 10pts, Level 2 = 25pts, Level 3 = 50pts, Level 4 = 100pts, Level 5 = 200pts
      const pointsPerLevel = [0, 10, 25, 50, 100, 200];
      let achievementPoints = 0;
      for (let i = 1; i <= achievement.achievedLevel; i++) {
        achievementPoints += pointsPerLevel[i] || 0;
      }
      return sum + achievementPoints;
    }, 0);
    
    return { all: progressData, achieved, totalPoints };
  }, [allTimeData, overviewStats.currentStreak]);

  // Helper Components
  const ProgressBar = ({ value, color = colors.primary, height = 'h-2' }) => (
    <div className={`bg-gray-200 rounded-full ${height} overflow-hidden`}>
      <div 
        className={`${height} rounded-full transition-all duration-500 ease-out`}
        style={{ 
          width: `${Math.min(100, Math.max(0, value))}%`,
          backgroundColor: color 
        }}
      />
    </div>
  );

  const CircularProgress = ({ value, size = 80, strokeWidth = 8, color = colors.primary }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-800">{Math.round(value)}%</span>
        </div>
      </div>
    );
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, children }) => (
    <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md" style={{ backgroundColor: `${color}20` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 text-xs">{title}</h4>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-end justify-between mt-auto">
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <div className="flex-shrink-0">
          {children}
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setSelectedTab(id)}
      className={`flex items-center justify-center gap-2 rounded-lg font-medium transition-all ${
        isMobile 
          ? 'px-3 py-2 text-xs' 
          : 'px-4 py-2 text-sm'
      } ${
        selectedTab === id
          ? 'text-white shadow-lg'
          : 'text-gray-600 hover:text-gray-800 hover:bg-white/30'
      }`}
      style={selectedTab === id ? { backgroundColor: colors.primary } : {}}
    >
      <Icon size={isMobile ? 14 : 16} />
      {(!isMobile || selectedTab === id) && (
        <span className={isMobile ? 'text-xs' : 'text-sm'}>{label}</span>
      )}
    </button>
  );

  // Render Functions
  const renderOverviewTab = () => (
    <div className="space-y-4">
      {/* Key Stats Grid */}
      <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
        <StatCard
          icon={Target}
          title="Completion Rate"
          value={`${Math.round(overviewStats.completionRate)}%`}
          subtitle={`${overviewStats.completedTasks}/${overviewStats.totalTasks} tasks`}
          color={colors.primary}
        >
          <CircularProgress value={overviewStats.completionRate} size={50} color={colors.primary} />
        </StatCard>
        <StatCard
          icon={Zap}
          title="Current Streak"
          value={`${overviewStats.currentStreak} days`}
          subtitle="Consecutive days >50%"
          color={colors.accent}
        >
          <div className="text-2xl">🔥</div>
        </StatCard>
        <StatCard
          icon={Clock}
          title="Time Spent"
          value={`${overviewStats.totalTimeSpent}h`}
          subtitle={`${Math.round(overviewStats.timeEfficiency)}% efficiency`}
          color="#10B981"
        >
          <CircularProgress value={overviewStats.timeEfficiency} size={50} color="#10B981" />
        </StatCard>
        <StatCard
          icon={BarChart3}
          title="Daily Average"
          value={Math.round(overviewStats.averageDaily * 10) / 10}
          subtitle="Tasks completed/day"
          color="#F59E0B"
        >
          <div className="text-xl">📊</div>
        </StatCard>
      </div>

      {/* Performance Section */}
      <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200 shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Trophy size={16} />
          Task Performance
        </h4>
        <div className={`grid gap-3 md:gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {/* Top Performers */}
          <div>
            <h5 className={`font-medium text-green-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>🏆 Top Performers</h5>
            <div className="space-y-2">
              {performanceTasks.top.map((task, index) => (
                <div key={index} className={`flex items-center gap-2 p-2 bg-green-50 rounded-lg ${isMobile ? 'text-sm' : ''}`}>
                  <div className={`flex items-center justify-center rounded-full font-bold text-xs text-white ${
                    isMobile ? 'w-4 h-4' : 'w-5 h-5'
                  }`}
                       style={{ backgroundColor: '#10B981' }}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-gray-800 truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>{task.name}</div>
                    <div className="text-xs text-gray-600">{task.completed}/{task.total} tasks</div>
                  </div>
                  <div className={`font-bold text-green-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {task.completion}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Performers */}
          <div>
            <h5 className={`font-medium text-red-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>📈 Needs Attention</h5>
            <div className="space-y-2">
              {performanceTasks.bottom.map((task, index) => (
                <div key={index} className={`flex items-center gap-2 p-2 bg-red-50 rounded-lg ${isMobile ? 'text-sm' : ''}`}>
                  <div className={`flex items-center justify-center rounded-full font-bold text-xs text-white ${
                    isMobile ? 'w-4 h-4' : 'w-5 h-5'
                  }`}
                       style={{ backgroundColor: '#EF4444' }}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-gray-800 truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>{task.name}</div>
                    <div className="text-xs text-gray-600">{task.completed}/{task.total} tasks</div>
                  </div>
                  <div className={`font-bold text-red-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {task.completion}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trend Summary */}
      <div className="grid gap-3 md:grid-cols-3">
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm text-center">
          <Activity size={20} className="mx-auto mb-2" style={{ color: colors.primary }} />
          <div className="text-lg font-bold text-gray-800">
            {trendData.length > 0 ? Math.round(trendData.slice(-7).reduce((acc, d) => acc + d.progress, 0) / 7) : 0}%
          </div>
          <div className="text-xs text-gray-600">Weekly Average</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm text-center">
          <TrendingUp size={20} className="mx-auto mb-2" style={{ color: colors.accent }} />
          <div className="text-lg font-bold text-gray-800">
            {trendData.length > 0 ? trendData.slice(-7).filter(d => d.progress > 50).length : 0}
          </div>
          <div className="text-xs text-gray-600">Good Days (&gt;50%)</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm text-center">
          <Trophy size={20} className="mx-auto mb-2" style={{ color: '#F59E0B' }} />
          <div className="text-lg font-bold text-gray-800">
            {trendData.length > 0 ? Math.max(...trendData.map(d => d.progress)) : 0}%
          </div>
          <div className="text-xs text-gray-600">Best Performance</div>
        </div>
      </div>

      {/* Recent Achievements */}
      {achievementProgress.achieved.length > 0 && (
        <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200 shadow-sm">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Trophy size={16} />
            Recent Achievements
          </h4>
          <div className={`grid gap-2 ${
            isMobile 
              ? 'grid-cols-1' 
              : achievementProgress.achieved.length >= 6
                ? 'grid-cols-3 xl:grid-cols-4'
                : achievementProgress.achieved.length >= 4
                  ? 'grid-cols-2 xl:grid-cols-3'
                  : 'grid-cols-2'
          }`}>
            {achievementProgress.achieved.slice(0, 8).map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-2 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                <div className={isMobile ? 'text-lg' : 'text-xl'}>{achievement.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-gray-800 truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>{achievement.name}</div>
                  <div className="text-xs text-gray-600">Level {achievement.achievedLevel}</div>
                </div>
                <div className={isMobile ? 'text-sm' : 'text-lg'}>🏆</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderCategoriesTab = () => (
    <div className="space-y-4">
      {/* Category Summary Boxes - No White Background */}
      <div className="p-3 md:p-4">
        <h4 className="font-semibold text-gray-800 mb-3 md:mb-4 text-sm">Category Overview</h4>
        <div className={`grid gap-2 md:gap-3 ${
          isMobile 
            ? 'grid-cols-2' 
            : categoryData.length <= 3 
              ? 'grid-cols-3' 
              : categoryData.length <= 4 
                ? 'grid-cols-4' 
                : categoryData.length <= 6 
                  ? 'grid-cols-3 lg:grid-cols-6' 
                  : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
        }`}>
          {categoryData.map((category, index) => (
            <div key={index} className={`bg-gradient-to-br rounded-lg border-2 text-center relative overflow-hidden ${
              isMobile ? 'p-2' : 'p-3'
            }`}
                 style={{ 
                   borderColor: category.color,
                   background: `linear-gradient(135deg, ${category.color}15 0%, ${category.color}25 100%)`
                 }}>
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10"
                   style={{ 
                     backgroundImage: `radial-gradient(circle at 20% 50%, ${category.color} 2px, transparent 2px), radial-gradient(circle at 80% 50%, ${category.color} 1px, transparent 1px)`,
                     backgroundSize: '15px 15px'
                   }}></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div 
                  className={`rounded-full mx-auto mb-2 shadow-lg border-2 border-white ${
                    isMobile ? 'w-4 h-4' : 'w-6 h-6'
                  }`}
                  style={{ backgroundColor: category.color }}
                ></div>
                <div className={`font-bold text-gray-800 truncate mb-1 ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`} title={category.name}>
                  {isMobile ? category.name.slice(0, 8) + (category.name.length > 8 ? '...' : '') : category.name}
                </div>
                <div className={`font-black mb-1 ${
                  isMobile ? 'text-lg' : 'text-2xl'
                }`} style={{ color: category.color }}>
                  {category.completion}%
                </div>
                <div className={`text-gray-700 font-medium ${
                  isMobile ? 'text-xs' : 'text-xs'
                }`}>
                  <div>{category.completed}/{category.total}</div>
                  {category.timeSpent > 0 && !isMobile && (
                    <div className="text-xs text-gray-600">{category.timeSpent}h</div>
                  )}
                </div>
                
                {/* Mini progress bar */}
                <div className={`mt-2 bg-white/50 rounded-full overflow-hidden ${
                  isMobile ? 'h-1' : 'h-1.5'
                }`}>
                  <div 
                    className="h-full rounded-full transition-all duration-700"
                    style={{ 
                      width: `${category.completion}%`,
                      backgroundColor: category.color 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add empty state if no categories */}
          {categoryData.length === 0 && (
            <div className={`bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 text-center col-span-full ${
              isMobile ? 'p-3' : 'p-4'
            }`}>
              <div className="text-gray-400 text-2xl mb-2">📊</div>
              <div className="text-sm text-gray-500">No category data yet</div>
            </div>
          )}
        </div>
      </div>

      {/* Category Performance Overview - Closer spacing */}
      <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200 shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-3">Detailed Performance</h4>
        {categoryData.length > 0 ? (
          <div className="space-y-1">
            {categoryData.map((category, index) => (
              <div key={index} className={`flex items-center gap-2 md:gap-3 py-1 ${
                isMobile ? 'text-sm' : ''
              }`}>
                <div className={`font-medium text-gray-700 truncate flex items-center gap-2 ${
                  isMobile ? 'w-16' : 'w-20'
                }`}>
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="truncate text-xs md:text-sm">{category.name}</span>
                </div>
                <div className="flex-1">
                  <ProgressBar value={category.completion} color={category.color} height="h-3" />
                </div>
                <div className={`font-bold text-gray-800 text-right ${
                  isMobile ? 'w-8 text-xs' : 'w-12 text-sm'
                }`}>
                  {category.completion}%
                </div>
                <div className={`text-gray-600 text-right ${
                  isMobile ? 'w-12 text-xs' : 'w-16 text-xs'
                }`}>
                  {category.completed}/{category.total}
                  {category.timeSpent > 0 && !isMobile && (
                    <div>{category.timeSpent}h</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 bg-gray-50 rounded-md">
            <div className="text-center">
              <div className="text-gray-400 text-3xl mb-2">📊</div>
              <span className="text-gray-500">No categories with data yet</span>
              <p className="text-xs text-gray-400 mt-1">Complete categorized tasks to see performance</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAchievementsTab = () => (
    <div className="space-y-4 relative">
      {/* Improved Hover Tooltip */}
      {hoveredAchievement && (
        <div className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-80 pointer-events-none"
             style={{
               left: Math.min(mousePosition.x - 160, window.innerWidth - 320),
               top: Math.max(mousePosition.y - 300, 10),
               maxWidth: isMobile ? '280px' : '320px'
             }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="text-2xl">{hoveredAchievement.icon}</div>
            <div>
              <div className="font-semibold text-gray-800">{hoveredAchievement.name}</div>
              <div className="text-xs text-gray-600">{hoveredAchievement.category}</div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3">{hoveredAchievement.description}</p>
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700 mb-2">All Levels:</div>
            {hoveredAchievement.levels.map((level, index) => (
              <div key={level.level} className={`flex items-center gap-2 text-xs p-2 rounded ${
                hoveredAchievement.achievedLevel >= level.level 
                  ? 'bg-green-50 text-green-800' 
                  : hoveredAchievement.achievedLevel + 1 === level.level
                    ? 'bg-blue-50 text-blue-800'
                    : 'bg-gray-50 text-gray-600'
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  hoveredAchievement.achievedLevel >= level.level 
                    ? 'bg-green-500 text-white' 
                    : hoveredAchievement.achievedLevel + 1 === level.level
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                }`}>
                  {hoveredAchievement.achievedLevel >= level.level ? '✓' : level.level}
                </div>
                <span className="flex-1">{level.description}</span>
                {hoveredAchievement.achievedLevel >= level.level && (
                  <span className="text-green-600 font-medium">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achieved Achievements */}
      {achievementProgress.achieved.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Trophy size={16} />
            Achieved ({achievementProgress.achieved.length})
          </h4>
          <div className="grid gap-2 md:grid-cols-2">
            {achievementProgress.achieved.map((achievement) => (
              <div 
                key={achievement.id} 
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    setHoveredAchievement(achievement);
                  }
                }}
                onMouseMove={(e) => {
                  if (!isMobile) {
                    setMousePosition({ x: e.clientX, y: e.clientY });
                  }
                }}
                onMouseLeave={() => setHoveredAchievement(null)}
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{achievement.name}</div>
                  <div className="text-sm text-gray-600">Level {achievement.achievedLevel}/{achievement.maxLevel}</div>
                  <div className="text-xs text-yellow-600 font-medium">{achievement.category}</div>
                </div>
                <div className="text-2xl">🏆</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Towards All Achievements */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Target size={16} />
          Achievement Progress
        </h4>
        <div className="grid gap-3 md:grid-cols-2">
          {achievementProgress.all.map((achievement) => (
            <div 
              key={achievement.id} 
              className="p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              onMouseEnter={(e) => {
                if (!isMobile) {
                  setHoveredAchievement(achievement);
                }
              }}
              onMouseMove={(e) => {
                if (!isMobile) {
                  setMousePosition({ x: e.clientX, y: e.clientY });
                }
              }}
              onMouseLeave={() => setHoveredAchievement(null)}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`text-xl ${achievement.achievedLevel === 0 ? 'opacity-50' : ''}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-sm">{achievement.name}</div>
                  <div className="text-xs text-gray-600">{achievement.category}</div>
                </div>
                <div className="text-right">
                  {achievement.isMaxed ? (
                    <div className="text-yellow-600 font-bold text-sm">MAX</div>
                  ) : (
                    <div className="text-xs text-gray-600">
                      Level {achievement.achievedLevel}/{achievement.maxLevel}
                    </div>
                  )}
                </div>
              </div>
              
              {!achievement.isMaxed && (
                <div>
                  <div className="text-xs text-gray-600 mb-1">
                    Next: {achievement.nextLevel.description}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>{achievement.currentValue}/{achievement.nextLevel.target}</span>
                    <span>{Math.round((achievement.currentValue / achievement.nextLevel.target) * 100)}%</span>
                  </div>
                  <ProgressBar 
                    value={(achievement.currentValue / achievement.nextLevel.target) * 100} 
                    color={achievement.achievedLevel > 0 ? colors.primary : '#9CA3AF'} 
                    height="h-2" 
                  />
                </div>
              )}
              
              {achievement.isMaxed && (
                <div className="text-center py-2">
                  <div className="text-yellow-600 font-semibold text-sm">🌟 Maxed Out! 🌟</div>
                  <div className="text-xs text-gray-600">All levels completed</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* No Achievements Yet */}
      {achievementProgress.achieved.length === 0 && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm text-center">
          <div className="text-3xl mb-3">🎯</div>
          <h4 className="font-semibold text-gray-800 mb-2">Start Your Journey!</h4>
          <p className="text-gray-600 text-sm">Complete tasks consistently to unlock achievements and track your progress.</p>
        </div>
      )}

      {/* Achievement System Info */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h5 className="text-sm font-medium text-blue-800 mb-2">💡 How Achievements Work</h5>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Achievements have 5 levels each, getting progressively harder</p>
          <p>• Progress is tracked across all time, not just the selected time period</p>
          <p>• Unlock levels by reaching the target for each achievement type</p>
          <p>• Points earned: Level 1 = 10pts, Level 2 = 25pts, Level 3 = 50pts, Level 4 = 100pts, Level 5 = 200pts</p>
          <p>• {isMobile ? 'Tap' : 'Hover over'} achievements to see all level requirements</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button 
          onClick={() => setViewMode('day')} 
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 size={20} />
          Advanced Statistics
        </h3>
      </div>

      {/* Controls */}
      <div className={`flex items-center justify-between mb-4 ${isMobile ? 'flex-col gap-4' : ''}`}>
        {/* Time Range Selector - Only show for overview and categories tabs */}
        {(selectedTab === 'overview' || selectedTab === 'categories') && (
          <div className={`flex items-center gap-3 ${isMobile ? 'w-full justify-center' : ''}`}>
            <span className={`font-medium text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {isMobile ? 'Period:' : 'Time Period:'}
            </span>
            <div className="flex items-center gap-3">
              {/* Mobile Dropdown */}
              {isMobile ? (
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(parseInt(e.target.value))}
                  className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ focusRingColor: colors.primary }}
                >
                  <option value={30}>30 Days</option>
                  <option value={60}>60 Days</option>
                  <option value={90}>90 Days</option>
                  <option value={180}>6 Months</option>
                  <option value={365}>1 Year</option>
                </select>
              ) : (
                <>
                  {/* Preset buttons */}
                  <div className="flex gap-1">
                    {[30, 90, 180, 365].map(days => (
                      <button
                        key={days}
                        onClick={() => setTimeRange(days)}
                        className={`px-1.5 py-0.5 rounded-md font-medium transition-colors text-xs ${
                          timeRange === days
                            ? 'text-white'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        }`}
                        style={timeRange === days ? { backgroundColor: colors.primary } : {}}
                      >
                        {days}D
                      </button>
                    ))}
                  </div>
                  
                  {/* Slider */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">30</span>
                    <input
                      type="range"
                      min="30"
                      max="365"
                      value={timeRange}
                      onChange={(e) => setTimeRange(parseInt(e.target.value))}
                      className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      style={{
                        background: `linear-gradient(to right, ${colors.primary} 0%, ${colors.primary} ${((timeRange - 30) / (365 - 30)) * 100}%, #e5e7eb ${((timeRange - 30) / (365 - 30)) * 100}%, #e5e7eb 100%)`,
                        focusRingColor: colors.primary
                      }}
                    />
                    <span className="text-xs text-gray-500">365</span>
                    <span className="text-xs font-semibold text-gray-800 min-w-8">{timeRange}D</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Achievement Points - Only show for achievements tab */}
        {selectedTab === 'achievements' && (
          <div className={`flex items-center gap-3 ${isMobile ? 'w-full justify-center' : ''}`}>
            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg px-3 py-2">
              <Trophy size={16} className="text-yellow-600" />
              <span className="font-semibold text-gray-800">Total Points: {achievementProgress.totalPoints}</span>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className={`flex gap-1 ${isMobile ? 'w-full justify-center' : ''}`}>
          <TabButton id="overview" label="Overview" icon={BarChart3} />
          <TabButton id="categories" label="Categories" icon={PieChart} />
          <TabButton id="achievements" label="Achievements" icon={Trophy} />
        </div>
      </div>

      {/* Content */}
      {selectedTab === 'overview' && renderOverviewTab()}
      {selectedTab === 'categories' && renderCategoriesTab()}
      {selectedTab === 'achievements' && renderAchievementsTab()}
    </div>
  );
};

export default AdvancedStatistics;