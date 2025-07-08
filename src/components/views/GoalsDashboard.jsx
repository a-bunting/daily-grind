// GoalsDashboard.jsx - Redesigned with Sidebar and Timeline
import React, { useState } from 'react';
import { ArrowLeft, Target, Plus, Edit3, Trash2, Calendar, TrendingUp, Award, BarChart3, Activity, Clock } from 'lucide-react';
import { useApp } from '../AppProvider';
import { dateUtils } from '../../utils/index';
import GoalModal from '../modals/GoalModal';

export const GoalsDashboard = ({ onBack }) => {
  const { 
    goals, 
    tasks,
    addGoal, 
    updateGoal, 
    deleteGoal,
    getGoalDisplayProgress,
    colors, 
    isMobile 
  } = useApp();

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(goals.length > 0 ? goals[0] : null);

  // Separate active and completed goals
  const activeGoals = goals.filter(goal => {
    const display = getGoalDisplayProgress(goal);
    return display.percentage < 100;
  });

  const completedGoals = goals.filter(goal => {
    const display = getGoalDisplayProgress(goal);
    return display.percentage >= 100;
  });

  const handleCreateGoal = () => {
    setEditingGoal(null);
    setShowGoalModal(true);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setShowGoalModal(true);
  };

  const handleDeleteGoal = (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal? This will also remove it from any linked tasks.')) {
      deleteGoal(goalId);
      if (selectedGoal?.id === goalId) {
        setSelectedGoal(activeGoals.length > 0 ? activeGoals[0] : null);
      }
    }
  };

  const handleGoalSelect = (goal) => {
    setSelectedGoal(goal);
  };

  const getGoalTypeIcon = (goalType) => {
    return goalType === 'personalBest' ? Target : TrendingUp;
  };

  const getGoalTypeLabel = (goalType) => {
    return goalType === 'personalBest' ? 'Personal Best' : 'Cumulative';
  };

  // Get progress data for timeline
  const getGoalProgressTimeline = (goal) => {
    const contributingTasks = tasks.filter(task => 
      task.goalId === goal.id && task.taskType === 'input'
    );

    const timeline = [];
    const dailyTotals = {};

    contributingTasks.forEach(task => {
      Object.entries(task.dailyProgress || {}).forEach(([date, progress]) => {
        if (progress.inputValue && progress.inputValue > 0) {
          if (!dailyTotals[date]) {
            dailyTotals[date] = { date, value: 0, tasks: [] };
          }
          dailyTotals[date].value += progress.inputValue;
          dailyTotals[date].tasks.push({
            name: task.name,
            value: progress.inputValue
          });
        }
      });
    });

    // Convert to sorted timeline
    return Object.values(dailyTotals)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((entry, index, arr) => {
        // Calculate running totals for cumulative goals
        const runningTotal = goal.goalType === 'cumulative' 
          ? arr.slice(0, index + 1).reduce((sum, e) => sum + e.value, 0)
          : entry.value;
        
        const personalBest = goal.goalType === 'personalBest'
          ? Math.max(...arr.slice(0, index + 1).map(e => e.value))
          : 0;

        return {
          ...entry,
          runningTotal,
          personalBest,
          percentage: goal.goalType === 'personalBest' 
            ? (personalBest / goal.targetValue) * 100
            : (runningTotal / goal.targetValue) * 100
        };
      });
  };

  const getGoalStats = (goal) => {
    const timeline = getGoalProgressTimeline(goal);
    const display = getGoalDisplayProgress(goal);
    
    return {
      totalSessions: timeline.length,
      averageSession: timeline.length > 0 ? (goal.currentProgress / timeline.length).toFixed(1) : 0,
      bestSession: goal.personalBestProgress || 0,
      streak: calculateStreak(timeline),
      daysRemaining: goal.targetDate ? Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24)) : null,
      projectedCompletion: calculateProjectedCompletion(goal, timeline)
    };
  };

  const calculateStreak = (timeline) => {
    if (timeline.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // Count backwards from today
    while (streak < timeline.length) {
      const dateString = dateUtils.getDateString(currentDate);
      const hasProgress = timeline.some(entry => entry.date === dateString);
      
      if (hasProgress) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateProjectedCompletion = (goal, timeline) => {
    if (timeline.length < 2 || !goal.targetDate) return null;
    
    const recentEntries = timeline.slice(-7); // Last 7 entries
    const avgProgress = recentEntries.reduce((sum, entry) => sum + entry.value, 0) / recentEntries.length;
    
    const remaining = goal.targetValue - (goal.goalType === 'personalBest' ? goal.personalBestProgress : goal.currentProgress);
    const daysNeeded = Math.ceil(remaining / avgProgress);
    
    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + daysNeeded);
    
    return projectedDate;
  };

  if (isMobile) {
    // Mobile: Show either goals list or detail view
    return (
      <div className="max-w-full min-h-screen">
        {selectedGoal ? (
          <GoalDetailView 
            goal={selectedGoal} 
            onBack={() => setSelectedGoal(null)}
            onEdit={handleEditGoal}
            onDelete={handleDeleteGoal}
            getGoalDisplayProgress={getGoalDisplayProgress}
            getGoalProgressTimeline={getGoalProgressTimeline}
            getGoalStats={getGoalStats}
            getGoalTypeIcon={getGoalTypeIcon}
            getGoalTypeLabel={getGoalTypeLabel}
            colors={colors}
            isMobile={true}
          />
        ) : (
          <GoalsListView 
            activeGoals={activeGoals}
            completedGoals={completedGoals}
            onGoalSelect={handleGoalSelect}
            onCreateGoal={handleCreateGoal}
            onEditGoal={handleEditGoal}
            onDeleteGoal={handleDeleteGoal}
            onBack={onBack}
            getGoalDisplayProgress={getGoalDisplayProgress}
            getGoalTypeIcon={getGoalTypeIcon}
            getGoalTypeLabel={getGoalTypeLabel}
            colors={colors}
            isMobile={true}
          />
        )}
        
        {/* Goal Modal */}
        {showGoalModal && (
          <GoalModal
            isOpen={showGoalModal}
            onClose={() => setShowGoalModal(false)}
            editingGoal={editingGoal}
            onSave={editingGoal ? updateGoal : addGoal}
          />
        )}
      </div>
    );
  }

  // Desktop: Split view
  return (
    <div className="max-w-full h-screen flex">
      {/* Left Sidebar - Goals List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <button 
              onClick={onBack} 
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Target size={20} />
              Goals
            </h3>
          </div>
          <button
            onClick={handleCreateGoal}
            className="px-3 py-2 rounded-lg font-medium text-white transition-colors text-sm whitespace-nowrap"
            style={{ backgroundColor: colors.primary }}
          >
            Add Goal
          </button>
        </div>

        {/* Goals List */}
        <div className="flex-1 overflow-y-auto">
          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-3">ACTIVE GOALS</h4>
              <div className="space-y-2">
                {activeGoals.map(goal => (
                  <GoalCard 
                    key={goal.id}
                    goal={goal}
                    isSelected={selectedGoal?.id === goal.id}
                    onSelect={() => handleGoalSelect(goal)}
                    onEdit={() => handleEditGoal(goal)}
                    onDelete={() => handleDeleteGoal(goal.id)}
                    getGoalDisplayProgress={getGoalDisplayProgress}
                    getGoalTypeIcon={getGoalTypeIcon}
                    getGoalTypeLabel={getGoalTypeLabel}
                    colors={colors}
                    size="normal"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div className="p-4 border-t">
              <h4 className="text-sm font-medium text-gray-500 mb-3">COMPLETED GOALS</h4>
              <div className="space-y-1">
                {completedGoals.map(goal => (
                  <GoalCard 
                    key={goal.id}
                    goal={goal}
                    isSelected={selectedGoal?.id === goal.id}
                    onSelect={() => handleGoalSelect(goal)}
                    onEdit={() => handleEditGoal(goal)}
                    onDelete={() => handleDeleteGoal(goal.id)}
                    getGoalDisplayProgress={getGoalDisplayProgress}
                    getGoalTypeIcon={getGoalTypeIcon}
                    getGoalTypeLabel={getGoalTypeLabel}
                    colors={colors}
                    size="compact"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {activeGoals.length === 0 && completedGoals.length === 0 && (
            <div className="p-4 text-center">
              <Target size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500 mb-3">No goals yet</p>
              <button
                onClick={handleCreateGoal}
                className="text-sm px-3 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: colors.primary }}
              >
                Create First Goal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Content - Goal Details */}
      <div className="flex-1 bg-gray-50 overflow-hidden">
        {selectedGoal ? (
          <GoalDetailView 
            goal={selectedGoal} 
            onEdit={handleEditGoal}
            onDelete={handleDeleteGoal}
            getGoalDisplayProgress={getGoalDisplayProgress}
            getGoalProgressTimeline={getGoalProgressTimeline}
            getGoalStats={getGoalStats}
            getGoalTypeIcon={getGoalTypeIcon}
            getGoalTypeLabel={getGoalTypeLabel}
            colors={colors}
            isMobile={false}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
              <h4 className="text-lg font-medium text-gray-500 mb-2">Select a goal</h4>
              <p className="text-gray-400">Choose a goal from the sidebar to view detailed progress</p>
            </div>
          </div>
        )}
      </div>

      {/* Goal Modal */}
      {showGoalModal && (
        <GoalModal
          isOpen={showGoalModal}
          onClose={() => setShowGoalModal(false)}
          editingGoal={editingGoal}
          onSave={editingGoal ? updateGoal : addGoal}
        />
      )}
    </div>
  );
};

// Goal Card Component
const GoalCard = ({ goal, isSelected, onSelect, onEdit, onDelete, getGoalDisplayProgress, getGoalTypeIcon, getGoalTypeLabel, colors, size = 'normal' }) => {
  const display = getGoalDisplayProgress(goal);
  const GoalTypeIcon = getGoalTypeIcon(goal.goalType);
  const isCompleted = display.percentage >= 100;
  
  if (size === 'compact') {
    return (
      <button
        onClick={onSelect}
        className={`w-full text-left p-2 rounded-lg transition-all ${
          isSelected 
            ? 'border border-opacity-50 ring-2 ring-opacity-20' 
            : 'hover:bg-gray-50'
        }`}
        style={isSelected ? { 
          backgroundColor: colors.primaryLight, 
          borderColor: colors.primary,
          '--tw-ring-color': colors.primary 
        } : {}}
      >
        <div className="flex items-center gap-2">
          <Award size={14} className="text-green-600" />
          <span className="text-sm font-medium text-gray-700 flex-1 truncate">{goal.name}</span>
          <span className="text-xs text-gray-500">{display.percentage.toFixed(0)}%</span>
        </div>
      </button>
    );
  }

  return (
    <div className={`border rounded-lg p-3 transition-all cursor-pointer ${
      isSelected 
        ? 'border-opacity-50 ring-2 ring-opacity-20' 
        : 'border-gray-200 bg-white hover:border-gray-300'
    }`}
    style={isSelected ? { 
      backgroundColor: colors.primaryLight, 
      borderColor: colors.primary,
      '--tw-ring-color': colors.primary 
    } : {}}>
      <button onClick={onSelect} className="w-full text-left">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <GoalTypeIcon size={14} style={{ color: colors.primary }} />
              <h4 className="font-medium text-gray-800 text-sm">{goal.name}</h4>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full text-gray-600"
                  style={{ backgroundColor: colors.primaryLight }}>
              {getGoalTypeLabel(goal.goalType)}
            </span>
          </div>
          <div className="flex gap-1 ml-2">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(goal); }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <Edit3 size={12} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(goal.id); }}
              className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{display.percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min(display.percentage, 100)}%`,
                backgroundColor: isCompleted ? '#10B981' : (goal.color || colors.primary)
              }}
            />
          </div>
        </div>

        <div className="text-xs text-gray-600">
          {display.label}
        </div>
      </button>
    </div>
  );
};

// Goal Detail View Component  
const GoalDetailView = ({ goal, onBack, onEdit, onDelete, getGoalDisplayProgress, getGoalProgressTimeline, getGoalStats, getGoalTypeIcon, getGoalTypeLabel, colors, isMobile }) => {
  const display = getGoalDisplayProgress(goal);
  const timeline = getGoalProgressTimeline(goal);
  const stats = getGoalStats(goal);
  const GoalTypeIcon = getGoalTypeIcon(goal.goalType);
  const isCompleted = display.percentage >= 100;

  return (
    <div className={`h-full overflow-y-auto  ${isMobile ? '-m-4' : ''}`}>
      {/* Header */}
      <div className={`bg-white border-b border-gray-200 ${isMobile ? 'p-2 pb-2' : 'p-4 pb-4'}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-3 mb-2">
              {isMobile && onBack && (
                <button 
                  onClick={onBack} 
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              <GoalTypeIcon size={20} style={{ color: colors.primary }} />
              <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-800`}>{goal.name}</h1>
              <span className={`px-2 py-1 text-xs rounded-full font-medium`}
                    style={{ 
                      backgroundColor: colors.primaryLight,
                      color: colors.primaryDark
                    }}>
                {getGoalTypeLabel(goal.goalType)}
              </span>
              {isCompleted && (
                <span className="px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-700">
                  <Award size={12} className="inline mr-1" />
                  Completed
                </span>
              )}
            </div>
            
            {goal.description && (
              <p className="text-gray-600 mb-3 text-sm">{goal.description}</p>
            )}

            {/* Progress Overview */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {goal.goalType === 'personalBest' ? 'Personal Best Progress' : 'Total Progress'}
                </span>
                <span className="text-sm font-bold text-gray-800">
                  {display.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(display.percentage, 100)}%`,
                    backgroundColor: isCompleted ? '#10B981' : (goal.color || colors.primary)
                  }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>{display.label}</span>
                {display.secondary && <span>{display.secondary}</span>}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => onEdit(goal)}
              className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              style={{ backgroundColor: colors.primaryLight, color: colors.primaryDark }}
            >
              <Edit3 size={14} />
              Edit
            </button>
            <button
              onClick={() => onDelete(goal.id)}
              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={isMobile ? 'px-2 py-2' : 'p-3'}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Activity size={14} style={{ color: colors.primary }} />
              <span className="text-xs font-medium text-gray-700">Sessions</span>
            </div>
            <span className="text-xl font-bold text-gray-800">{stats.totalSessions}</span>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={14} className="text-green-600" />
              <span className="text-xs font-medium text-gray-700">Average</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-gray-800">{stats.averageSession}</span>
              <span className="text-xs text-gray-500">{goal.unit}</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Target size={14} style={{ color: colors.accent }} />
              <span className="text-xs font-medium text-gray-700">Best</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-gray-800">{stats.bestSession}</span>
              <span className="text-xs text-gray-500">{goal.unit}</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} className="text-purple-600" />
              <span className="text-xs font-medium text-gray-700">Streak</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-gray-800">{stats.streak}</span>
              <span className="text-xs text-gray-500">days</span>
            </div>
          </div>
        </div>

        {/* Contributing Tasks */}
        <div className={`bg-white rounded-lg border border-gray-200 ${isMobile ? 'p-2' : 'p-4'} mb-3`}>
          <h3 className="text-base font-semibold text-gray-800 mb-3">Contributing Tasks</h3>
          <ContributingTasksList goal={goal} />
        </div>

        {/* Progress Chart */}
        <div className={`bg-white rounded-lg border border-gray-200 ${isMobile ? 'p-2' : 'p-4'} mb-3`}>
          <h3 className="text-base font-semibold text-gray-800 mb-3">Progress Chart</h3>
          <ProgressChart goal={goal} timeline={timeline} colors={colors} />
        </div>

        {/* Timeline */}
        <div className={`bg-white rounded-lg border border-gray-200 ${isMobile ? 'p-2' : 'p-4'}`}>
          <h3 className="text-base font-semibold text-gray-800 mb-3">Progress Timeline</h3>
          
          {timeline.length === 0 ? (
            <div className="text-center py-6">
              <Calendar size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">No progress logged yet</p>
              <p className="text-sm text-gray-400">Start logging progress to see your timeline</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {timeline.slice().reverse().map((entry, index) => (
                <div key={entry.date} className={`flex items-center gap-3 ${isMobile ? 'p-2' : 'p-2'} bg-gray-50 rounded-lg`}>
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                         style={{ backgroundColor: colors.primaryLight }}>
                      <span className="text-xs font-bold" style={{ color: colors.primaryDark }}>
                        {entry.value}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-800 text-sm truncate">
                        {dateUtils.formatDisplayDate(new Date(entry.date))}
                      </span>
                      <span className="text-sm font-medium text-gray-600 ml-2">
                        {entry.value} {goal.unit}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {goal.goalType === 'personalBest' ? (
                        `Personal best: ${entry.personalBest} ${goal.unit} (${entry.percentage.toFixed(1)}%)`
                      ) : (
                        `Total: ${entry.runningTotal} ${goal.unit} (${entry.percentage.toFixed(1)}%)`
                      )}
                    </div>
                    
                    {entry.tasks.length > 1 && (
                      <div className="text-xs text-gray-400 mt-1 truncate">
                        From {entry.tasks.length} tasks: {entry.tasks.map(t => `${t.name} (${t.value})`).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Mobile Goals List View
const GoalsListView = ({ activeGoals, completedGoals, onGoalSelect, onCreateGoal, onEditGoal, onDeleteGoal, onBack, isMobile, getGoalDisplayProgress, getGoalTypeIcon, getGoalTypeLabel, colors }) => {
  return (
    <div className="max-w-full">
      {/* Header */}
      <div className={`flex items-center justify-between mb-3 bg-white p-2 border-b border-gray-200 ${isMobile ? '-m-4' : ''}`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Target size={24} />
            Goals
          </h3>
        </div>
        <button
          onClick={onCreateGoal}
          className="px-4 py-2 rounded-lg font-medium text-white transition-colors whitespace-nowrap"
          style={{ backgroundColor: colors.primary }}
        >
          Add Goal
        </button>
      </div>

      {/* Goals Lists */}
      <div className="px-2">
        {activeGoals.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-500 mb-2">ACTIVE GOALS</h4>
            <div className="space-y-2">
              {activeGoals.map(goal => (
                <GoalCard 
                  key={goal.id}
                  goal={goal}
                  onSelect={() => onGoalSelect(goal)}
                  onEdit={() => onEditGoal(goal)}
                  onDelete={() => onDeleteGoal(goal.id)}
                  getGoalDisplayProgress={getGoalDisplayProgress}
                  getGoalTypeIcon={getGoalTypeIcon}
                  getGoalTypeLabel={getGoalTypeLabel}
                  colors={colors}
                  size="normal"
                />
              ))}
            </div>
          </div>
        )}

        {completedGoals.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">COMPLETED GOALS</h4>
            <div className="space-y-2">
              {completedGoals.map(goal => (
                <GoalCard 
                  key={goal.id}
                  goal={goal}
                  onSelect={() => onGoalSelect(goal)}
                  onEdit={() => onEditGoal(goal)}
                  onDelete={() => onDeleteGoal(goal.id)}
                  getGoalDisplayProgress={getGoalDisplayProgress}
                  getGoalTypeIcon={getGoalTypeIcon}
                  getGoalTypeLabel={getGoalTypeLabel}
                  colors={colors}
                  size="compact"
                />
              ))}
            </div>
          </div>
        )}

        {activeGoals.length === 0 && completedGoals.length === 0 && (
          <div className="text-center py-8">
            <Target size={48} className="mx-auto text-gray-300 mb-4" />
            <h4 className="text-lg font-medium text-gray-500 mb-2">No goals yet</h4>
            <p className="text-gray-400 mb-4">Create your first goal to start tracking progress</p>
            <button
              onClick={onCreateGoal}
              className="px-6 py-3 rounded-lg font-medium text-white transition-colors"
              style={{ backgroundColor: colors.primary }}
            >
              Create Your First Goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Contributing Tasks List Component
const ContributingTasksList = ({ goal }) => {
  const { tasks, isMobile } = useApp();
  
  const contributingTasks = tasks.filter(task => 
    task.goalId === goal.id && task.taskType === 'input'
  );

  if (contributingTasks.length === 0) {
    return (
      <div className="text-center py-4">
        <Target size={24} className="mx-auto text-gray-300 mb-2" />
        <p className="text-gray-500 text-sm">No tasks linked to this goal yet</p>
        <p className="text-gray-400 text-xs">Create input tasks and link them to this goal to track progress</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {contributingTasks.map(task => {
        // Calculate total contribution from this task
        const totalContribution = Object.values(task.dailyProgress || {})
          .reduce((sum, progress) => sum + (progress.inputValue || 0), 0);
        
        // Find best single session from this task
        const bestSession = Math.max(
          ...Object.values(task.dailyProgress || {}).map(p => p.inputValue || 0),
          0
        );

        // Count sessions
        const sessions = Object.values(task.dailyProgress || {})
          .filter(p => p.inputValue && p.inputValue > 0).length;

        return (
          <div key={task.id} className={`flex items-center justify-between ${isMobile ? 'p-2' : 'p-3'} bg-gray-50 rounded-lg`}>
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: task.color }}
              />
              <div>
                <h4 className="font-medium text-gray-800">{task.name}</h4>
                <p className="text-xs text-gray-500">{sessions} sessions logged</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-800">
                {totalContribution} {task.unit}
              </div>
              <div className="text-xs text-gray-500">
                Best: {bestSession} {task.unit}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Progress Chart Component
const ProgressChart = ({ goal, timeline, colors }) => {
  const [containerWidth, setContainerWidth] = React.useState(400);
  const containerRef = React.useRef(null);
  const { isMobile } = useApp();
  
  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  if (timeline.length === 0) {
    return (
      <div className={`text-center ${isMobile ? 'py-4' : 'py-6'}`}>
        <BarChart3 size={32} className="mx-auto text-gray-300 mb-2" />
        <p className="text-gray-500">No data to chart yet</p>
        <p className="text-sm text-gray-400">Start logging progress to see your chart</p>
      </div>
    );
  }

  const chartHeight = isMobile ? 160 : 200;
  const padding = 40;
  const innerWidth = containerWidth - padding * 2;
  const innerHeight = chartHeight - padding * 2;

  // Prepare data points
  const dataPoints = timeline.map((entry, index) => ({
    x: (index / (timeline.length - 1 || 1)) * innerWidth + padding,
    y: chartHeight - padding - ((goal.goalType === 'personalBest' ? entry.personalBest : entry.runningTotal) / goal.targetValue) * innerHeight,
    value: goal.goalType === 'personalBest' ? entry.personalBest : entry.runningTotal,
    date: entry.date,
    percentage: entry.percentage
  }));

  // Create path for line chart
  const pathData = dataPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  // Target line
  const targetY = chartHeight - padding;

  return (
    <div ref={containerRef} className="w-full">
      <svg width={containerWidth} height={chartHeight} className="w-full">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(percent => {
          const y = chartHeight - padding - (percent * innerHeight);
          return (
            <g key={percent}>
              <line
                x1={padding}
                y1={y}
                x2={containerWidth - padding}
                y2={y}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
              <text
                x={padding - 10}
                y={y + 4}
                fontSize="10"
                fill="#6b7280"
                textAnchor="end"
              >
                {Math.round(percent * goal.targetValue)}
              </text>
            </g>
          );
        })}

        {/* Target line */}
        <line
          x1={padding}
          y1={targetY}
          x2={containerWidth - padding}
          y2={targetY}
          stroke="#ef4444"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
        <text
          x={containerWidth - padding + 5}
          y={targetY + 4}
          fontSize="10"
          fill="#ef4444"
          fontWeight="bold"
        >
          Target: {goal.targetValue}
        </text>

        {/* Progress area */}
        {dataPoints.length > 0 && (
          <path
            d={`${pathData} L ${dataPoints[dataPoints.length - 1].x} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`}
            fill={goal.color || colors.primary}
            fillOpacity="0.1"
          />
        )}

        {/* Progress line */}
        {dataPoints.length > 1 && (
          <path
            d={pathData}
            fill="none"
            stroke={goal.color || colors.primary}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points */}
        {dataPoints.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={goal.color || colors.primary}
            stroke="white"
            strokeWidth="2"
          >
            <title>
              {dateUtils.formatDisplayDate(new Date(point.date))}: {point.value} {goal.unit} ({point.percentage.toFixed(1)}%)
            </title>
          </circle>
        ))}

        {/* Y-axis label */}
        <text
          x="20"
          y="20"
          fontSize="12"
          fill="#6b7280"
          fontWeight="bold"
        >
          {goal.unit}
        </text>

        {/* Chart title */}
        <text
          x={containerWidth / 2}
          y="20"
          fontSize="14"
          fill="#374151"
          fontWeight="bold"
          textAnchor="middle"
        >
          {goal.goalType === 'personalBest' ? 'Personal Best Progress' : 'Cumulative Progress'}
        </text>
      </svg>
    </div>
  );
};

export default GoalsDashboard;