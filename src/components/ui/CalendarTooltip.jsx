import { useApp } from '../AppProvider';
import { useTaskScheduling } from '../../hooks/useTaskScheduling';
import { useTaskProgress } from '../../hooks/useTaskProgress';
import { dateUtils, timeUtils } from '../../utils/index';

export const CalendarTooltip = ({ hoveredDate, tooltipPosition }) => {
  const { categories, colors, isMobile } = useApp();
  const { getTasksWithDataForDate } = useTaskScheduling();
  const { getDayProgress, getDateProgress, getProgress } = useTaskProgress();

  if (!hoveredDate || isMobile) return null;

  const dayTasks = getTasksWithDataForDate(hoveredDate);
  const dayProgress = getDayProgress(hoveredDate);

  return (
    <div
      className="fixed z-50 bg-gray-900 text-white text-sm rounded-lg p-3 pointer-events-none shadow-lg max-w-xs"
      style={{
        left: tooltipPosition.x > window.innerWidth - 250 ? `${tooltipPosition.x - 250}px` : `${tooltipPosition.x + 10}px`,
        top: `${tooltipPosition.y}px`
      }}
    >
      <div className="font-semibold mb-2">{dateUtils.formatTooltipDate(hoveredDate)}</div>
      {dayTasks.length === 0 ? (
        <div className="text-gray-300">No tasks</div>
      ) : (
        <div className="space-y-1">
          {dayTasks.slice(0, 3).map(task => {
            const dateProgress = getDateProgress(task, hoveredDate);
            const progress = getProgress(task, hoveredDate);
            const category = categories.find(cat => cat.id === task.categoryId);
            
            return (
              <div key={task.id} className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: task.color || colors.accent }}
                ></div>
                <span className="text-xs">
                  {category && `${category.icon} `}
                  {task.name}: {task.taskType === 'time' 
                    ? `${timeUtils.formatTime(dateProgress.timeSpent || 0)} / ${timeUtils.formatPlannedTime(task.plannedMinutes)} (${Math.round(progress)}%)`
                    : `${dateProgress.currentCount || 0} / ${task.targetCount} (${Math.round(progress)}%)`
                  }
                </span>
              </div>
            );
          })}
          {dayTasks.length > 3 && (
            <div className="text-xs text-gray-300">+{dayTasks.length - 3} more tasks</div>
          )}
          <div className="border-t border-gray-700 pt-1 mt-2">
            <div className="text-xs font-medium">Overall Progress: {dayProgress}%</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarTooltip;