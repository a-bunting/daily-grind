import { DEFAULT_SECTIONS } from '../constants';
import {useApp} from '../components/AppProvider';

export const useSectionLogic = () => {
  const { tasks, sections, categories, goals } = useApp();
  
  const getTaskSection = (task) => {  
    // First check if task is manually assigned to a section
    for (const section of sections) {
      if (section.taskOrder && section.taskOrder.includes(task.id)) {
        return section;
      }
    }
   
    // Check section rules for auto-assignment
    for (const section of sections) {
      if (section.rules && section.rules.length > 0) {       
        for (const rule of section.rules) {
          let matches = false;
         
          if (rule.type === 'category' && rule.value === task.categoryId) {
            matches = true;
          } else if (rule.type === 'goal' && rule.value === task.goalId) {
            matches = true;
          } else if (rule.type === 'name' && task.name.toLowerCase().includes(rule.value.toLowerCase())) {
            matches = true;
          }
         
          if (matches) {
            return section;
          }
        }
      }
    }
   
    // FIXED: Default to specific section by ID, not array position
    const defaultSection = sections.find(s => s.id === 'default') || 
                           sections.find(s => s.name === 'My Tasks') ||
                           sections[0] || 
                           DEFAULT_SECTIONS[0];
    return defaultSection;
  };

  const getTasksForSection = (section, scheduledTasks) => {
    const sectionTasks = scheduledTasks.filter(task => {
      const taskSection = getTaskSection(task);
      const belongs = taskSection.id === section.id;      
      return belongs;
    });
   
    // Sort by section order if defined, otherwise maintain original order
    if (section.taskOrder && section.taskOrder.length > 0) {
      sectionTasks.sort((a, b) => {
        const aIndex = section.taskOrder.indexOf(a.id);
        const bIndex = section.taskOrder.indexOf(b.id);
       
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
       
        return aIndex - bIndex;
      });
    }
    
    return sectionTasks;
  };

  return {
    getTaskSection,
    getTasksForSection
  };
};