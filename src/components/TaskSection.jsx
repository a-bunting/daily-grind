import { ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react';
import {useApp} from './AppProvider';
import { useSectionLogic } from '../hooks/useSectionLogic';
import TaskCard from './TaskCard';

export const TaskSection = ({ section, tasks, onTaskEdit, onTaskDelete, onTaskSkip, onTaskMove, editMode, onSectionEdit, onSectionMove, onSectionDelete, sectionIndex, totalSections }) => {
  const { colors, isMobile, draggedTask, setDragOverSection, dragOverSection } = useApp();
  const { getTasksForSection } = useSectionLogic();

  const sectionTasks = getTasksForSection(section, tasks);
  const layoutMode = isMobile ? 'minimal' : (section.layoutMode || 'list');
  const columnCount = isMobile ? 1 : (section.columnCount || 1);

  // Task drag and drop handlers
  const handleTaskDragOver = (e) => {
    e.preventDefault();
    if (draggedTask && section.id !== dragOverSection) {
      setDragOverSection(section.id);
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleTaskDragLeave = (e) => {
    // Only clear drag over if we're leaving the section entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverSection(null);
    }
  };

  const handleTaskDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSection(null);
    
    if (!draggedTask) return;

    const taskId = parseInt(e.dataTransfer.getData('text/plain'));
    if (taskId && !isNaN(taskId) && onTaskMove) {
      onTaskMove(taskId, section.id);
    }
  };

  const isTaskDropTarget = draggedTask && dragOverSection === section.id;
  const isEmpty = sectionTasks.length === 0;

  const getGridClasses = () => {
    if (columnCount === 1) {
      return layoutMode === 'compact' || layoutMode === 'minimal' ? 'space-y-2' : 'space-y-3';
    } else if (columnCount === 2) {
      return 'grid grid-cols-2 gap-4';
    } else {
      return 'grid grid-cols-3 gap-4';
    }
  };

  const handleMoveUp = () => {
    if (sectionIndex > 0 && onSectionMove) {
      onSectionMove(section.id, 'up');
    }
  };

  const handleMoveDown = () => {
    if (sectionIndex < totalSections - 1 && onSectionMove) {
      onSectionMove(section.id, 'down');
    }
  };

  const handleDelete = () => {
    if (section.id !== 'default' && onSectionDelete) {
      if (window.confirm(`Are you sure you want to delete the "${section.name}" section? All tasks will be moved to the default section.`)) {
        onSectionDelete(section.id);
      }
    }
  };

  return (
    <div 
      className={`rounded-lg border-2 transition-all duration-200 ${
        isTaskDropTarget 
          ? 'border-blue-400 bg-blue-50' 
          : section.showBackground !== false 
          ? 'border-gray-200 bg-white'
          : 'border-transparent bg-transparent'
      }`}
      onDragOver={handleTaskDragOver}
      onDragLeave={handleTaskDragLeave}
      onDrop={handleTaskDrop}
    >
      <div className={`${editMode && isEmpty ? 'p-3' : 'p-4'} flex items-center justify-between ${
        section.showBackground !== false ? 'border-b border-gray-100' : ''
      } ${editMode && isEmpty ? 'mb-2' : 'mb-4'}`}>
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-800">{section.name}</h3>
          <span className="text-sm text-gray-500">
            {sectionTasks.length} {sectionTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>
        
        {editMode && (
          <div className="flex items-center gap-1">
            {/* Section reorder buttons */}
            <button
              onClick={handleMoveUp}
              disabled={sectionIndex === 0}
              className={`p-1 rounded transition-colors ${
                sectionIndex === 0 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Move section up"
            >
              <ChevronUp size={16} />
            </button>
            <button
              onClick={handleMoveDown}
              disabled={sectionIndex >= totalSections - 1}
              className={`p-1 rounded transition-colors ${
                sectionIndex >= totalSections - 1 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Move section down"
            >
              <ChevronDown size={16} />
            </button>
            
            {/* Section edit button */}
            <button
              onClick={() => onSectionEdit(section)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Edit section"
            >
              <Edit2 size={16} className="text-gray-600" />
            </button>
            
            {/* Section delete button - only for non-default sections */}
            {section.id !== 'default' && (
              <button
                onClick={handleDelete}
                className="p-1 hover:bg-red-100 rounded transition-colors"
                title="Delete section"
              >
                <Trash2 size={16} className="text-red-600" />
              </button>
            )}
          </div>
        )}
      </div>
      
      {!isEmpty && (
        <div className={editMode ? 'px-4 pb-3' : 'px-4 pb-4'}>
          <div className={getGridClasses()}>
            {sectionTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                section={section}
                isDragging={draggedTask?.id === task.id}
                onEdit={onTaskEdit}
                onDelete={onTaskDelete}
                onSkip={onTaskSkip}
                editMode={editMode}
                onDragStart={(task) => {
                  // TaskCard now handles setting draggedTask directly
                }}
                onDragEnd={() => {
                  // TaskCard now handles clearing draggedTask directly
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Empty section content - only show drop zone if dragging */}
      {isEmpty && (
        <div className={editMode ? 'px-4 pb-2' : 'px-4 pb-4'}>
          {isTaskDropTarget ? (
            <div className="text-center py-4 text-blue-600 font-medium">
              Drop task here to move to "{section.name}"
            </div>
          ) : (
            <div className="text-center py-2 text-gray-400">
              <div className="text-lg mb-1">📋</div>
              <p className="text-xs">No tasks in this section</p>
              {section.rules && section.rules.length > 0 && (
                <p className="text-xs mt-1">
                  Auto-assigned by rules: {section.rules.map(rule => 
                    rule.type === 'category' ? `${rule.value} category` : `"${rule.value}"`
                  ).join(', ')}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskSection;