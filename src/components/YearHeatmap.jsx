import { useTaskProgress } from '../hooks/useTaskProgress';

export const YearHeatmap = ({ task, colors, className = "" }) => {
  const { getDateProgress, getProgress } = useTaskProgress();
  
  const getYearData = () => {
    const today = new Date();
    const yearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const days = [];
    
    for (let d = new Date(yearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const date = new Date(d);
      const progress = getProgress(task, date);
      days.push({
        date: new Date(date),
        progress: Math.round(progress),
        intensity: progress >= 100 ? 4 : progress >= 75 ? 3 : progress >= 50 ? 2 : progress >= 25 ? 1 : 0
      });
    }
    
    return days;
  };

  const yearData = getYearData();
  const weeks = [];
  
  // Group days into weeks
  let currentWeek = [];
  yearData.forEach((day, index) => {
    if (index === 0) {
      // Fill in empty days at the start of the first week
      const dayOfWeek = day.date.getDay();
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push(null);
      }
    }
    
    currentWeek.push(day);
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  
  // Add the last partial week if it exists
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  const getIntensityColor = (intensity) => {
    if (intensity === 0) return '#ebedf0';
    if (intensity === 1) return colors.primary + '40';
    if (intensity === 2) return colors.primary + '60';
    if (intensity === 3) return colors.primary + '80';
    if (intensity === 4) return colors.primary;
    return '#ebedf0';
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="grid grid-cols-53 gap-0.5" style={{ gridTemplateColumns: 'repeat(53, 1fr)' }}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-rows-7 gap-0.5">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="w-2 h-2 rounded-sm"
                    style={{
                      backgroundColor: day ? getIntensityColor(day.intensity) : 'transparent'
                    }}
                    title={day ? `${day.date.toLocaleDateString()}: ${day.progress}%` : ''}
                  />
                ))}
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-600">
            <span>Less</span>
            <div className="flex gap-0.5">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#ebedf0' }} />
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: colors.primary + '40' }} />
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: colors.primary + '60' }} />
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: colors.primary + '80' }} />
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: colors.primary }} />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearHeatmap;