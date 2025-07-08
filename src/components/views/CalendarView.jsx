import { Calendar } from 'lucide-react';
import { useApp } from '../AppProvider';
import { CalendarGrid } from './CalendarGrid';
import { MobileCalendar } from './MobileCalendar';
import { MONTHS } from '../../constants';

export const CalendarView = ({ 
  setCurrentDate,
  setViewMode,
  handleViewWeeklySummary,
  setHoveredDate
}) => {
  const { currentDate, isMobile } = useApp();

  return (
    <div className={isMobile ? '' : 'max-w-7xl'}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Calendar size={20} />
        {isMobile 
          ? `${MONTHS[currentDate.getMonth()].substring(0, 3)} ${currentDate.getFullYear()}`
          : `Calendar View - ${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
        }
      </h3>
      
      {isMobile ? (
        <MobileCalendar 
          setCurrentDate={setCurrentDate}
          setViewMode={setViewMode}
          handleViewWeeklySummary={handleViewWeeklySummary}
        />
      ) : (
        <CalendarGrid 
          setCurrentDate={setCurrentDate}
          setViewMode={setViewMode}
          handleViewWeeklySummary={handleViewWeeklySummary}
          setHoveredDate={setHoveredDate}
        />
      )}
    </div>
  );
};

export default CalendarView;