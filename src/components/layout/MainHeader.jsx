import { BarChart3, Calendar, ChevronLeft, ChevronRight, Clock, Menu, Target } from 'lucide-react';
import { DAYS, DAY_ABBREVIATIONS, MONTHS } from '../../constants/index';
import { useApp } from '../AppProvider';
import { dateUtils } from '../../utils/index';

export const MainHeader = ({ 
  showMobileMenu,
  setShowMobileMenu,
  viewMode,
  setViewMode,
  currentDate,
  navigateDay,
  navigateMonth,
  navigateWeek,
  weekSummaryDate,
  goToToday,
  setAnalyticsTask,
  setWeekSummaryDate,
  handleViewWeeklySummary
}) => {
  const { isMobile, isTablet, colors } = useApp();

  return (
    <div className={`${isMobile || isTablet ? 'fixed top-0 left-0 right-0 z-40' : 'relative'} bg-white/90 backdrop-blur-sm border-b px-4 py-3 ${isMobile || isTablet ? 'h-16' : 'h-16'} flex items-center justify-between overflow-hidden`}>
      <div 
        className="absolute -right-8 -top-4 w-32 h-32 rounded-full opacity-20"
        style={{
          background: `radial-gradient(circle, ${colors.primary} 0%, ${colors.accent} 70%, transparent 100%)`
        }}
      ></div>

      {/* Mobile & Tablet menu button */}
      {(isMobile || isTablet) && (
        <button
          onClick={() => setShowMobileMenu(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative z-10 mobile-menu-btn"
        >
          <Menu size={20} />
        </button>
      )}

      {!isMobile && !isTablet && <div className="flex-1"></div>}

      <div className="flex items-center gap-2 relative z-10">
        {/* Navigation controls */}
        {viewMode === 'day' && (
          <div className={`flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm border border-gray-200 h-8 ${isMobile ? 'min-w-32' : 'min-w-48'}`}>
            <button
              onClick={() => navigateDay(-1)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <div className="text-center flex-1">
              <h2 className="text-xs font-medium text-gray-800 truncate">
                {isMobile 
                  ? `${DAY_ABBREVIATIONS[currentDate.getDay()]}, ${currentDate.getDate()}`
                  : `${DAYS[currentDate.getDay()]}, ${MONTHS[currentDate.getMonth()]} ${currentDate.getDate()}`
                }
              </h2>
            </div>
            <button
              onClick={() => navigateDay(1)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {viewMode === 'calendar' && (
          <div className={`flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm border border-gray-200 h-8 ${isMobile ? 'min-w-32' : 'min-w-48'}`}>
            <button
              onClick={() => navigateMonth(-1)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <div className="text-center flex-1">
              <h2 className="text-xs font-medium text-gray-800 truncate">
                {isMobile 
                  ? `${MONTHS[currentDate.getMonth()].substring(0, 3)} ${currentDate.getFullYear()}`
                  : `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                }
              </h2>
            </div>
            <button
              onClick={() => navigateMonth(1)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {viewMode === 'weekly-summary' && weekSummaryDate && (
          <div className={`flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm border border-gray-200 h-8 ${isMobile ? 'min-w-32' : 'min-w-48'}`}>
            <button
              onClick={() => navigateWeek(-1)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <div className="text-center flex-1">
              <h2 className="text-xs font-medium text-gray-800 truncate">
                {(() => {
                  const weekStart = dateUtils.getWeekStart(weekSummaryDate);
                  const weekEnd = dateUtils.getWeekEnd(weekSummaryDate);
                  if (isMobile) {
                    return `${MONTHS[weekStart.getMonth()].substring(0, 3)} ${weekStart.getDate()} - ${weekEnd.getDate()}`;
                  } else {
                    return `${MONTHS[weekStart.getMonth()]} ${weekStart.getDate()} - ${MONTHS[weekEnd.getMonth()]} ${weekEnd.getDate()}`;
                  }
                })()}
              </h2>
            </div>
            <button
              onClick={() => navigateWeek(1)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* View Mode Buttons - All with consistent styling */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('goals')}
            className={`px-2 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md border border-gray-200 h-8 flex items-center justify-center ${
              viewMode === 'goals'
                ? 'text-white'
                : 'bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white'
            }`}
            style={{
              backgroundColor: viewMode === 'goals' ? colors.primary : undefined
            }}
          >
            <Target size={14} className={!isMobile && !isTablet ? "mr-1" : ""} />
            {!isMobile && !isTablet && 'Goals'}
          </button>

          <button
            onClick={() => setViewMode('advanced-statistics')}
            className={`px-2 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md border border-gray-200 h-8 flex items-center justify-center ${
              viewMode === 'advanced-statistics'
                ? 'text-white'
                : 'bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white'
            }`}
            style={{
              backgroundColor: viewMode === 'advanced-statistics' ? colors.primary : undefined
            }}
          >
            <BarChart3 size={14} className={!isMobile && !isTablet ? "mr-1" : ""} />
            {!isMobile && !isTablet && 'Statistics'}
          </button>

          <button
            onClick={() => {
              if (viewMode === 'task-analytics' || viewMode === 'weekly-summary') {
                setViewMode('calendar');
                setAnalyticsTask(null);
                setWeekSummaryDate(null);
              } else if (viewMode === 'calendar') {
                setViewMode('day');
              } else {
                setViewMode('calendar');
              }
            }}
            className={`px-2 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md border border-gray-200 h-8 flex items-center justify-center ${
              viewMode === 'calendar'
                ? 'text-white'
                : 'bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white'
            }`}
            style={{
              backgroundColor: viewMode === 'calendar' ? colors.primary : undefined
            }}
            title={viewMode === 'calendar' ? 'Back to Day View' : 'Calendar View'}
          >
            <Calendar size={14} className={!isMobile && !isTablet ? "mr-1" : ""} />
            {!isMobile && !isTablet && 'Calendar'}
          </button>

          {/* <button
            onClick={() => handleViewWeeklySummary(new Date())}
            className={`px-2 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md border border-gray-200 h-8 flex items-center justify-center ${
              viewMode === 'weekly-summary'
                ? 'text-white'
                : 'bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white'
            }`}
            style={{ 
              backgroundColor: viewMode === 'weekly-summary' ? colors.primary : undefined
            }}
            title="This Week's Summary"
          >
            <BarChart3 size={14} className={!isMobile && !isTablet ? "mr-1" : ""} />
            {!isMobile && !isTablet && 'Weekly'}
          </button> */}

          <button
            onClick={goToToday}
            className={`px-2 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md border border-gray-200 h-8 flex items-center justify-center ${
              viewMode === 'day'
                ? 'text-white'
                : 'bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white'
            }`}
            style={{ 
              backgroundColor: viewMode === 'day' ? colors.primary : undefined
            }}
          >
            <Clock size={14} className={!isMobile && !isTablet ? "mr-1" : ""} />
            {!isMobile && !isTablet && 'Today'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainHeader;