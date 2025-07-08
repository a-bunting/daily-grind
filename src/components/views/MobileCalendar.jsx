import { BarChart3 } from 'lucide-react';
import { useApp } from '../AppProvider';
import { useTaskScheduling } from '../../hooks/useTaskScheduling';
import { useTaskProgress } from '../../hooks/useTaskProgress';
import { dateUtils } from '../../utils/index';
import { DAYS, MONTHS } from '../../constants';

export const MobileCalendar = ({ 
  setCurrentDate,
  setViewMode,
  handleViewWeeklySummary
}) => {
  const { currentDate, categories, colors } = useApp();
  const { getTasksWithDataForDate } = useTaskScheduling();
  const { getDayProgress } = useTaskProgress();

  const calendarDays = dateUtils.getCalendarDays(currentDate);
  const currentMonthDays = calendarDays.filter(day => day.getMonth() === currentDate.getMonth());
  const weeks = [];
  
  // Group days into weeks for mobile
  for (let i = 0; i < currentMonthDays.length; i += 7) {
    const week = currentMonthDays.slice(i, i + 7);
    if (week.length > 0) {
      weeks.push(week);
    }
  }

  return (
    <div className="space-y-3">
      {weeks.map((week, weekIndex) => {
        const weekStart = dateUtils.getWeekStart(week[0]);
        const weekEnd = dateUtils.getWeekEnd(week[0]);
        const weekProgress = week.reduce((sum, date) => sum + getDayProgress(date), 0) / week.length;
        
        return (
          <div key={weekIndex}>
            {/* Week Header */}
            <div 
              className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2 cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => handleViewWeeklySummary(week[0])}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">
                  Week {dateUtils.getWeekNumber(week[0])} - {MONTHS[weekStart.getMonth()]} {weekStart.getDate()} to {weekEnd.getDate()}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-700">{Math.round(weekProgress)}%</span>
                  <BarChart3 size={16} className="text-blue-600" />
                </div>
              </div>
            </div>
            
            {/* Week Days */}
            <div className="space-y-2">
              {week.map((date) => {
                const dayTasks = getTasksWithDataForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const dayProgress = getDayProgress(date);
                
                return (
                  <div 
                    key={dateUtils.getDateString(date)}
                    onClick={() => {
                      setCurrentDate(date);
                      setViewMode('day');
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                      isToday ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          isToday ? 'text-blue-600' : 'text-gray-700'
                        }`}>
                          {DAYS[date.getDay()]}, {MONTHS[date.getMonth()]} {date.getDate()}
                        </span>
                        {isToday && (
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Today</span>
                        )}
                      </div>
                      {dayTasks.length > 0 && (
                        <span className="text-xs text-gray-600">
                          {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''} • {dayProgress}%
                        </span>
                      )}
                    </div>
                    
                    {dayTasks.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {dayTasks.slice(0, 3).map(task => {
                            const category = categories.find(cat => cat.id === task.categoryId);
                            return (
                              <div 
                                key={task.id}
                                className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs"
                              >
                                <div 
                                  className="w-2 h-2 rounded-full" 
                                  style={{ backgroundColor: task.color || colors.accent }}
                                ></div>
                                {category && <span>{category.icon}</span>}
                                <span className="text-gray-700">{task.name}</span>
                              </div>
                            );
                          })}
                          {dayTasks.length > 3 && (
                            <div className="px-2 py-1 bg-gray-200 rounded text-xs text-gray-600">
                              +{dayTasks.length - 3} more
                            </div>
                          )}
                        </div>
                        
                        {dayProgress > 0 && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{
                                width: `${dayProgress}%`,
                                backgroundColor: colors.accent
                              }}
                            ></div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {dayTasks.length === 0 && (
                      <div className="text-xs text-gray-400">No tasks</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MobileCalendar;