import React, { useMemo, useState } from 'react';
import {useApp} from './AppProvider';
import { useTaskProgress } from '../hooks/useTaskProgress';
import { useTaskScheduling } from '../hooks/useTaskScheduling';
import { dateUtils } from '../utils/index';
import { ArrowLeft, TrendingUp, Clock, Target, BarChart3, PieChart, Trophy, Zap, Activity } from 'lucide-react';

export const AdvancedStatistics = () => {
  const { 
    tasks, 
    categories, 
    sections, 
    currentDate, 
    setViewMode, 
    colors, 
    isMobile, 
    isTablet 
  } = useApp();
  
  const { getProgress, getDayProgress, getDateProgress } = useTaskProgress();
  const { isTaskScheduledForDate, getTasksWithDataForDate } = useTaskScheduling();
  
  const [timeRange, setTimeRange] = useState('30'); // 7, 30, 90, 365 days
  const [selectedTab, setSelectedTab] = useState('overview'); // overview, trends, categories, performance

  // Calculate date range based on selection
  const dateRange = useMemo(() => {
    const endDate = new Date(currentDate);
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - parseInt(timeRange));
    
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
    let streakDays = 0;
    let currentStreak = 0;
    
    // Check for current streak (consecutive days with >50% completion)
    const today = new Date();
    let checkDate = new Date(today);
    let streakActive = true;
    
    while (streakActive && streakDays < 365) {
      const dayProgress = getDayProgress(checkDate);
      if (dayProgress >= 50) {
        if (dateUtils.getDateString(checkDate) === dateUtils.getDateString(today)) {
          currentStreak++;
        }
        streakDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        streakActive = false;
      }
    }

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
      totalTimeSpent: Math.round(totalTimeSpent / 3600 * 10) / 10, // Hours
      totalTimeTargeted: Math.round(totalTimeTargeted / 3600 * 10) / 10, // Hours
      timeEfficiency: totalTimeTargeted > 0 ? (totalTimeSpent / totalTimeTargeted * 100) : 0,
      currentStreak: currentStreak,
      averageDaily: totalTasks > 0 ? (completedTasks / dateRange.length) : 0
    };
  }, [dateRange, tasks, getProgress, getDayProgress, getTasksWithDataForDate, isTaskScheduledForDate, getDateProgress]);

  // Daily Progress Trend Data
  const trendData = useMemo(() => {
    return dateRange.map(date => {
      const dayProgress = getDayProgress(date);
      const tasksForDate = getTasksWithDataForDate(date);
      const completedCount = tasksForDate.filter(task => getProgress(task, date) >= 100).length;
      
      return {
        date: `${date.getMonth() + 1}/${date.getDate()}`, // MM/DD format
        fullDate: dateUtils.formatDisplayDate(date),
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
    
    // Add uncategorized
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
  }, [dateRange, categories, tasks, getProgress, getDateProgress, getTasksWithDataForDate, isTaskScheduledForDate]);

  // Top Performing Tasks
  const topTasks = useMemo(() => {
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

    return Object.values(taskStats)
      .filter(task => task.total > 0)
      .map(task => ({
        ...task,
        completion: task.total > 0 ? Math.round(task.completed / task.total * 100) : 0,
        avgProgress: task.total > 0 ? Math.round(task.avgProgress / task.total) : 0,
        timeSpent: Math.round(task.timeSpent * 10) / 10
      }))
      .sort((a, b) => b.completion - a.completion)
      .slice(0, 10);
  }, [dateRange, tasks, getProgress, getDateProgress, isTaskScheduledForDate]);

  // Custom Chart Components
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
    const strokeDasharray = circumference;
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
            strokeDasharray={strokeDasharray}
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

  const SimpleBarChart = ({ data, dataKey, color = colors.primary, height = 200 }) => {
    const maxValue = Math.max(...data.map(d => d[dataKey]));
    
    return (
      <div className="flex items-end gap-1 h-40 p-3 bg-gray-50 rounded-md">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div 
              className="w-full bg-gradient-to-t rounded-t-sm transition-all duration-500 ease-out min-h-1"
              style={{ 
                height: `${(item[dataKey] / maxValue) * 100}%`,
                backgroundImage: `linear-gradient(to top, ${color}, ${color}90)`
              }}
            />
            <span className="text-xs text-gray-600 text-center leading-tight">
              {item.date || `${index + 1}`}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const TrendLineChart = ({ data, dataKey, color = colors.primary }) => {
    const maxValue = Math.max(...data.map(d => d[dataKey]));
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (item[dataKey] / maxValue) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="h-28 relative bg-gray-50 rounded-md p-2">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
              <stop offset="100%" stopColor={color} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <polyline
            points={`0,100 ${points} 100,100`}
            fill="url(#areaGradient)"
            stroke="none"
          />
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, children }) => (
    <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md" style={{ backgroundColor: `${color}20` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 text-xs">{title}</h4>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xl font-bold text-gray-900">{value}</p>
        {children}
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setSelectedTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
        selectedTab === id
          ? 'text-white shadow-lg'
          : 'text-gray-600 hover:text-gray-800 hover:bg-white/30'
      }`}
      style={selectedTab === id ? { backgroundColor: colors.primary } : {}}
    >
      <Icon size={16} />
      {!isMobile && label}
    </button>
  );

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

      {/* Recent Trend Chart */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <TrendingUp size={16} />
          Daily Progress Trend ({parseInt(timeRange)} days)
        </h4>
        <TrendLineChart data={trendData.slice(-14)} dataKey="progress" color={colors.primary} />
        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
          <div className="bg-gray-50 rounded-md p-2">
            <div className="text-lg font-bold text-gray-800">{Math.round(trendData.slice(-7).reduce((acc, d) => acc + d.progress, 0) / 7)}%</div>
            <div className="text-xs text-gray-600">7-day avg</div>
          </div>
          <div className="bg-gray-50 rounded-md p-2">
            <div className="text-lg font-bold text-gray-800">{trendData.slice(-1)[0]?.progress || 0}%</div>
            <div className="text-xs text-gray-600">Today</div>
          </div>
          <div className="bg-gray-50 rounded-md p-2">
            <div className="text-lg font-bold text-gray-800">{Math.max(...trendData.map(d => d.progress))}%</div>
            <div className="text-xs text-gray-600">Best day</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrendsTab = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-3">Daily Progress Trend</h4>
        <SimpleBarChart data={trendData.slice(-21)} dataKey="progress" color={colors.primary} />
      </div>

      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-3">Task Completion Count</h4>
        <SimpleBarChart data={trendData.slice(-21)} dataKey="completed" color={colors.accent} />
      </div>

      {/* Trend Summary */}
      <div className="grid gap-3 md:grid-cols-3">
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm text-center">
          <Activity size={20} className="mx-auto mb-2" style={{ color: colors.primary }} />
          <div className="text-lg font-bold text-gray-800">
            {Math.round(trendData.slice(-7).reduce((acc, d) => acc + d.progress, 0) / 7)}%
          </div>
          <div className="text-xs text-gray-600">Weekly Average</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm text-center">
          <TrendingUp size={20} className="mx-auto mb-2" style={{ color: colors.accent }} />
          <div className="text-lg font-bold text-gray-800">
            {trendData.slice(-7).filter(d => d.progress > trendData.slice(-14, -7).reduce((acc, d) => acc + d.progress, 0) / 7).length}
          </div>
          <div className="text-xs text-gray-600">Days Above Average</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm text-center">
          <Trophy size={20} className="mx-auto mb-2" style={{ color: '#F59E0B' }} />
          <div className="text-lg font-bold text-gray-800">
            {Math.max(...trendData.map(d => d.progress))}%
          </div>
          <div className="text-xs text-gray-600">Best Performance</div>
        </div>
      </div>
    </div>
  );

  const renderCategoriesTab = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-3">Category Performance</h4>
        <div className="space-y-3">
          {categoryData.map((category, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-20 text-xs font-medium text-gray-700 truncate">
                {category.name}
              </div>
              <div className="flex-1">
                <ProgressBar value={category.completion} color={category.color} height="h-3" />
              </div>
              <div className="w-10 text-xs font-bold text-gray-800 text-right">
                {category.completion}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-gray-800">Category Breakdown</h4>
        {categoryData.map((category, index) => (
          <div key={index} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="font-medium text-gray-800 text-sm">{category.name}</span>
              </div>
              <CircularProgress value={category.completion} size={40} color={category.color} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
              <div>
                <span className="font-medium">Completed:</span> {category.completed}/{category.total}
              </div>
              {category.timeSpent > 0 && (
                <div>
                  <span className="font-medium">Time:</span> {category.timeSpent}h
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Trophy size={16} />
          Top Performing Tasks
        </h4>
        <div className="space-y-2">
          {topTasks.map((task, index) => (
            <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs"
                   style={{ backgroundColor: colors.primary, color: 'white' }}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800 truncate text-sm">{task.name}</div>
                <div className="text-xs text-gray-600">
                  {task.completed}/{task.total} completed
                  {task.timeSpent > 0 && ` • ${task.timeSpent}h`}
                </div>
                <div className="mt-1">
                  <ProgressBar value={task.completion} color={task.color} height="h-1.5" />
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm" style={{ color: colors.primary }}>
                  {task.completion}%
                </div>
                <div className="text-xs text-gray-600">
                  Avg: {task.avgProgress}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl">
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
      <div className={`flex items-center justify-between mb-4 ${isMobile ? 'flex-col gap-3' : ''}`}>
        {/* Time Range Selector */}
        <div className="flex gap-1">
          {[
            { value: '7', label: '7D' },
            { value: '30', label: '30D' },
            { value: '90', label: '90D' },
            { value: '365', label: '1Y' }
          ].map(range => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-3 py-1 rounded-md font-medium transition-colors text-sm ${
                timeRange === range.value
                  ? 'text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/30'
              }`}
              style={timeRange === range.value ? { backgroundColor: colors.primary } : {}}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1">
          <TabButton id="overview" label="Overview" icon={BarChart3} />
          <TabButton id="trends" label="Trends" icon={TrendingUp} />
          <TabButton id="categories" label="Categories" icon={PieChart} />
          <TabButton id="performance" label="Performance" icon={Trophy} />
        </div>
      </div>

      {/* Content */}
      {selectedTab === 'overview' && renderOverviewTab()}
      {selectedTab === 'trends' && renderTrendsTab()}
      {selectedTab === 'categories' && renderCategoriesTab()}
      {selectedTab === 'performance' && renderPerformanceTab()}
    </div>
  );
};

export default AdvancedStatistics;