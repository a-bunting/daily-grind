// src/hooks/useSectionLogic.js

import { DEFAULT_SECTIONS } from '../constants';
import {useApp} from '../components/AppProvider';

export const useSectionLogic = () => {
  const { tasks, sections, categories } = useApp();

  const getTaskSection = (task) => {
    // Check if task is manually assigned to a section
    for (const section of sections) {
      if (section.taskOrder && section.taskOrder.includes(task.id)) {
        return section;
      }
    }

    // Check section rules
    for (const section of sections) {
      if (section.rules && section.rules.length > 0) {
        for (const rule of section.rules) {
          if (rule.type === 'category' && rule.value === task.categoryId) {
            return section;
          }
          if (rule.type === 'name' && task.name.toLowerCase().includes(rule.value.toLowerCase())) {
            return section;
          }
        }
      }
    }

    // Default to first section
    return sections[0] || DEFAULT_SECTIONS[0];
  };

  const getTasksForSection = (section, scheduledTasks) => {
    const sectionTasks = scheduledTasks.filter(task => {
      const taskSection = getTaskSection(task);
      return taskSection.id === section.id;
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