import { BarChart3 } from 'lucide-react';
import { useApp } from '../AppProvider';
import { useTaskScheduling } from '../../hooks/useTaskScheduling';
import { useTaskProgress } from '../../hooks/useTaskProgress';
import { dateUtils } from '../../utils/index';
import { DAY_ABBREVIATIONS } from '../../constants';

export const CalendarGrid = ({ 
  setCurrentDate,
  setViewMode,
  handleViewWeeklySummary,
  setHoveredDate
}) => {
  const { currentDate, colors } = useApp();
  const { getTasksWithDataForDate } = useTaskScheduling();
  const { getDayProgress } = useTaskProgress();

  return (
    <div className="bg-white rounded-lg shadow-lg border">
      <div className="grid grid-cols-8 border-b">
        <div className="p-3 text-center font-medium text-gray-700 text-sm border-r">
          <div className="flex items-center justify-center">
            <BarChart3 size={14} className="text-gray-500" />
          </div>
        </div>
        {DAY_ABBREVIATIONS.map(day => (
          <div key={day} className="p-3 text-center font-medium text-gray-700 text-sm border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>
      
      <div 
        className="grid grid-cols-8"
        onMouseLeave={() => setHoveredDate(null)}
      >
        {(() => {
          const calendarDays = dateUtils.getCalendarDays(currentDate);
          const weeks = [];
          for (let i = 0; i < calendarDays.length; i += 7) {
            weeks.push(calendarDays.slice(i, i + 7));
          }
          
          return weeks.map((week, weekIndex) => [
            // Weekly progress indicator
            <div 
              key={`week-${weekIndex}`}
              className="h-20 p-2 border-r border-b bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100"
              onClick={() => handleViewWeeklySummary(week[0])}
              onMouseEnter={() => setHoveredDate(null)}
              title="View weekly summary"
            >
              <BarChart3 size={12} className="text-gray-500 mb-1" />
              <div className="text-xs font-medium text-gray-600">
                {(() => {
                  const weekProgress = week.reduce((sum, date) => sum + getDayProgress(date), 0) / 7;
                  return Math.round(weekProgress) + '%';
                })()}
              </div>
            </div>,
            ...week.map((date, dayIndex) => {
              const dayTasks = getTasksWithDataForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const dayProgress = getDayProgress(date);
              
              return (
                <div 
                  key={`${weekIndex}-${dayIndex}`}
                  onClick={() => {
                    setCurrentDate(date);
                    setViewMode('day');
                  }}
                  onMouseEnter={() => setHoveredDate(date)}
                  onMouseLeave={() => setHoveredDate(null)}
                  className={`h-20 p-2 border-r border-b cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden ${
                    !isCurrentMonth ? 'bg-gray-100 text-gray-400' : 
                    isToday ? 'bg-blue-50 border-blue-200' : 'bg-white'
                  } ${dayIndex === 6 ? 'border-r-0' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-medium ${
                      !isCurrentMonth ? 'text-gray-400' : 
                      isToday ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      {date.getDate()}
                    </span>
                    {isToday && (
                      <span className="text-xs bg-blue-600 text-white px-1 rounded">Today</span>
                    )}
                  </div>
                  
                  {dayTasks.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex flex-wrap gap-1 mb-1">
                        {dayTasks.slice(0, 4).map(task => (
                          <div 
                            key={task.id}
                            className="w-2 h-2 rounded-sm"
                            style={{ backgroundColor: task.color || colors.accent }}
                          ></div>
                        ))}
                        {dayTasks.length > 4 && (
                          <div className="text-xs text-gray-500">+{dayTasks.length - 4}</div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className={`${!isCurrentMonth ? 'text-gray-400' : 'text-gray-600'}`}>
                          {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
                        </span>
                        <span className={`font-medium ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}`}>
                          {dayProgress}%
                        </span>
                      </div>
                      
                      {dayProgress > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="h-1 rounded-full transition-all"
                            style={{
                              width: `${dayProgress}%`,
                              backgroundColor: colors.accent
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ]).flat();
        })()}
      </div>
    </div>
  );
};

export default CalendarGrid;