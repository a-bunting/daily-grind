import { Calendar, Clock, Edit2, Eye, Plus } from 'lucide-react';
import { useApp } from '../AppProvider';
import { useSectionLogic } from '../../hooks/useSectionLogic';
import { dateUtils } from '../../utils/index';
import { TaskSection } from '../TaskSection';
import { DAY_ABBREVIATIONS } from '../../constants';
import { SectionSaveDebugger } from '../SectionSaveDebugger';
import GoalFilterDebugger from '../GoalFilterDebugger';


export const DayView = ({ 
  todaysTasks, 
  editMode, 
  setEditMode,
  handleInputTaskClick,
  setEditingTask,
  setShowTaskModal,
  deleteTask,
  skipTaskForDay,
  handleTaskMove,
  handleSectionMove,
  handleSectionDelete,
  setEditingSection,
  setShowSectionModal
}) => {
  const { 
    sections, 
    currentDate, 
    isMobile, 
    colors 
  } = useApp();
  
  const { getTasksForSection } = useSectionLogic();

  return (
    <div className={isMobile ? '' : 'max-w-7xl'}>
        {/* <GoalFilterDebugger todaysTasks={todaysTasks} /> */}
      <div className={`${isMobile ? 'flex-col' : 'flex-row'} flex items-start justify-between mb-4 gap-2`}>
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Calendar size={20} />
            {isMobile 
              ? `${DAY_ABBREVIATIONS[currentDate.getDay()]} - ${todaysTasks.length} tasks` 
              : `Tasks for ${dateUtils.formatDisplayDate(currentDate)} - ${todaysTasks.length} tasks`
            }
            {editMode && (
              <span className="text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded">
                Edit Mode
              </span>
            )}
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Section Management Controls - Desktop Only */}
          {!isMobile && editMode && (
            <button
              onClick={() => {
                setEditingSection(null);
                setShowSectionModal(true);
              }}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
              title="Add Section"
            >
              <Plus size={16} />
              <span className="text-sm">Add Section</span>
            </button>
          )}

          {/* Edit Mode Toggle */}
          <button
            onClick={() => setEditMode(!editMode)}
            className={`p-2 rounded-lg transition-colors ${
              editMode 
                ? 'bg-orange-600 text-white hover:bg-orange-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title={editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
          >
            {editMode ? <Eye size={16} /> : <Edit2 size={16} />}
          </button>
        </div>

        {/* Mobile Section Management */}
        {isMobile && editMode && (
          <button
            onClick={() => {
              setEditingSection(null);
              setShowSectionModal(true);
            }}
            className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-1"
          >
            <Plus size={14} />
            Add Section
          </button>
        )}
      </div>
      
      {todaysTasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Clock size={48} className="mx-auto mb-4 opacity-50" />
          <p>No tasks scheduled for {dateUtils.formatDisplayDate(currentDate)}</p>
          <p className="text-sm mt-2">Create a new task to get started!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((section, index) => {
            const sectionTasks = getTasksForSection(section, todaysTasks);
            
            // Skip empty sections unless in edit mode
            if (sectionTasks.length === 0 && !editMode) {
              return null;
            }
            
            return (
              <TaskSection
                key={section.id}
                section={section}
                tasks={sectionTasks}
                sectionIndex={index}
                totalSections={sections.length}
                onInputClick={handleInputTaskClick}
                onTaskEdit={(task) => {
                  setEditingTask(task);
                  setShowTaskModal(true);
                }}
                onTaskDelete={deleteTask}
                onTaskSkip={skipTaskForDay}
                onTaskMove={handleTaskMove}
                onSectionMove={handleSectionMove}
                onSectionDelete={handleSectionDelete}
                editMode={editMode}
                onSectionEdit={(section) => {
                  setEditingSection(section);
                  setShowSectionModal(true);
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DayView;