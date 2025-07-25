import apiService from './apiService';
import { storageUtils } from '../utils/index';

class HybridStorage {
  constructor() {
    this.isOnline = navigator.onLine;
    this.isAuthenticated = apiService.isAuthenticated();
    
    // Listen for auth changes
    window.addEventListener('authChanged', (event) => {
      this.isAuthenticated = event.detail.isAuthenticated;
    });
    
    // Listen for online/offline changes
    window.addEventListener('online', () => {
      this.isOnline = true;
      if (this.isAuthenticated) {
        this.syncFromLocalStorage();
      }
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Generate unique 10-character client ID
  generateClientId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Ensure all objects have clientIds
  ensureClientId(obj) {
    if (!obj.clientId) {
      obj.clientId = this.generateClientId();
    }
    return obj;
  }

  // Migrate old localStorage data to use clientIds
  migrateLocalStorageToClientIds() {
    const dataTypes = ['tasks', 'categories', 'sections', 'goals'];
    
    dataTypes.forEach(type => {
      const data = storageUtils.loadFromStorage(`dailyGrind_${type}`, []);
      let needsUpdate = false;
      
      const updatedData = data.map(item => {
        if (!item.clientId) {
          item.clientId = this.generateClientId();
          needsUpdate = true;
        }
        return item;
      });
      
      // Update foreign key references in tasks
      if (type === 'tasks') {
        const categories = storageUtils.loadFromStorage('dailyGrind_categories', []);
        const sections = storageUtils.loadFromStorage('dailyGrind_sections', []);
        const goals = storageUtils.loadFromStorage('dailyGrind_goals', []);
        
        updatedData.forEach(task => {
          // Update category reference
          if (task.categoryId && !task.categoryClientId) {
            const category = categories.find(c => c.id === task.categoryId);
            if (category) {
              task.categoryClientId = category.clientId;
              needsUpdate = true;
            }
          }
          
          // Update section reference
          if (task.sectionId && !task.sectionClientId) {
            const section = sections.find(s => s.id === task.sectionId);
            if (section) {
              task.sectionClientId = section.clientId;
              needsUpdate = true;
            }
          }
          
          // Update goal reference
          if (task.goalId && !task.goalClientId) {
            const goal = goals.find(g => g.id === task.goalId);
            if (goal) {
              task.goalClientId = goal.clientId;
              needsUpdate = true;
            }
          }
        });
      }
      
      if (needsUpdate) {
        storageUtils.saveToStorage(`dailyGrind_${type}`, updatedData);
      }
    });
  }

  // Determine storage method
  shouldUseAPI() {
    return this.isOnline && this.isAuthenticated;
  }

  // Auth methods
  async login(username, password) {
    const result = await apiService.login(username, password);
    if (result.success) {
      this.isAuthenticated = true;
      this.dispatchAuthChange(true);
      this.migrateLocalStorageToClientIds();
      await this.migrateLocalStorageToAPI();
    }
    return result;
  }

  async register(username, email, password) {
    const result = await apiService.register(username, email, password);
    if (result.success) {
      this.isAuthenticated = true;
      this.dispatchAuthChange(true);
      this.migrateLocalStorageToClientIds();
      await this.migrateLocalStorageToAPI();
    }
    return result;
  }

  async logout() {
    apiService.logout();
    this.isAuthenticated = false;
    this.dispatchAuthChange(false);
    
    // Clear all app data from localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('dailyGrind_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  dispatchAuthChange(isAuthenticated) {
    window.dispatchEvent(new CustomEvent('authChanged', {
      detail: { isAuthenticated }
    }));
  }

  // Migrate localStorage data to API on first login
  async migrateLocalStorageToAPI() {
    try {
      console.log('Migrating localStorage data to API...');
      
      // Get local data
      const localTasks = storageUtils.loadFromStorage('dailyGrind_tasks', []);
      const localCategories = storageUtils.loadFromStorage('dailyGrind_categories', []);
      const localSections = storageUtils.loadFromStorage('dailyGrind_sections', []);
      const localGoals = storageUtils.loadFromStorage('dailyGrind_goals', []);
      
      // Get API data to check if already migrated
      const [apiTasks, apiCategories, apiSections, apiGoals] = await Promise.all([
        apiService.getTasks().catch(() => []),
        apiService.getCategories().catch(() => []),
        apiService.getSections().catch(() => []),
        apiService.getGoals().catch(() => [])
      ]);
      
      // Only migrate if API has no data (first login)
      if (apiTasks.length === 0 && localTasks.length > 0) {
        console.log('Migrating tasks, categories, sections, and goals...');
        
        // Migrate categories (skip defaults, only custom ones)
        for (const category of localCategories.filter(c => !c.isDefault)) {
          try {
            const categoryData = {
              clientId: category.clientId,
              name: category.name,
              color: category.color,
              icon: category.icon
            };
            await apiService.createCategory(categoryData);
          } catch (error) {
            console.warn('Failed to migrate category:', category.name, error);
          }
        }
        
        // Migrate sections (skip defaults, only custom ones)
        for (const section of localSections.filter(s => !s.isDefault)) {
          try {
            const sectionData = {
              clientId: section.clientId,
              name: section.name,
              layoutMode: section.layoutMode || 'list',
              columnCount: section.columnCount || 1,
              rules: section.rules || [],
              taskOrder: section.taskOrder || [],
              showBackground: section.showBackground !== false
            };
            await apiService.createSection(sectionData);
          } catch (error) {
            console.warn('Failed to migrate section:', section.name, error);
          }
        }
        
        // Migrate goals
        for (const goal of localGoals) {
          try {
            const goalData = {
              clientId: goal.clientId,
              name: goal.name,
              description: goal.description,
              targetValue: goal.targetValue,
              unit: goal.unit,
              goalType: goal.goalType || 'cumulative',
              currentProgress: goal.currentProgress || 0,
              personalBestProgress: goal.personalBestProgress || 0,
              createdDate: goal.createdDate
            };
            await apiService.createGoal(goalData);
          } catch (error) {
            console.warn('Failed to migrate goal:', goal.name, error);
          }
        }
        
        // Migrate tasks with clientId references
        for (const task of localTasks) {
          try {
            const migratedTask = {
              clientId: task.clientId,
              name: task.name,
              taskType: task.taskType,
              plannedMinutes: task.plannedMinutes,
              targetCount: task.targetCount,
              selectedDays: task.selectedDays,
              scheduleType: task.scheduleType,
              monthlyTypes: task.monthlyTypes || [],
              monthlyDays: task.monthlyDays || [],
              intervalWeeks: task.intervalWeeks || 1,
              startDate: task.startDate,
              endDate: task.endDate,
              excludedDates: task.excludedDates || [],
              oneOffDates: task.oneOffDates || [],
              color: task.color,
              categoryClientId: task.categoryClientId || null,
              sectionClientId: task.sectionClientId || apiSections[0]?.clientId,
              goalClientId: task.goalClientId || null
            };
            
            await apiService.createTask(migratedTask);
            
            // Migrate progress data
            if (task.dailyProgress) {
              for (const [date, progress] of Object.entries(task.dailyProgress)) {
                if (progress.timeSpent > 0 || progress.currentCount > 0 || progress.inputValue > 0) {
                  try {
                    const progressData = {
                      clientId: this.generateClientId(),
                      taskClientId: task.clientId,
                      date: date,
                      timeSpent: progress.timeSpent || 0,
                      currentCount: progress.currentCount || 0,
                      inputValue: progress.inputValue || 0,
                      isRunning: false,
                      startTime: null
                    };
                    await apiService.updateProgress(progressData);
                  } catch (error) {
                    console.warn('Failed to migrate progress for task:', task.name, date, error);
                  }
                }
              }
            }
          } catch (error) {
            console.warn('Failed to migrate task:', task.name, error);
          }
        }
        
        console.log('Migration completed successfully');
      }
    } catch (error) {
      console.error('Migration failed:', error);
    }
  }

  // Sync any pending localStorage changes to API
  async syncFromLocalStorage() {
    if (!this.shouldUseAPI()) return;
    
    try {
      await apiService.processSyncQueue();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  // Generic data loading
  async loadData(key, apiMethod, defaultValue = []) {
    if (this.shouldUseAPI()) {
      try {
        return await apiMethod();
      } catch (error) {
        console.warn(`Failed to load ${key} from API, falling back to localStorage:`, error);
        const localData = storageUtils.loadFromStorage(`dailyGrind_${key}`, defaultValue);
        return localData.map(item => this.ensureClientId(item));
      }
    } else {
      const localData = storageUtils.loadFromStorage(`dailyGrind_${key}`, defaultValue);
      return localData.map(item => this.ensureClientId(item));
    }
  }

  // Generic data saving
  async saveData(key, data, apiMethod = null) {
    // Ensure all items have client_ids
    const dataWithClientIds = Array.isArray(data) 
      ? data.map(item => this.ensureClientId(item))
      : this.ensureClientId(data);

    if (this.shouldUseAPI() && apiMethod) {
      try {
        await apiMethod(dataWithClientIds);
      } catch (error) {
        console.warn(`Failed to save ${key} to API, saving to localStorage:`, error);
        storageUtils.saveToStorage(`dailyGrind_${key}`, dataWithClientIds);
      }
    } else {
      storageUtils.saveToStorage(`dailyGrind_${key}`, dataWithClientIds);
    }
  }

  // Specific data methods
  async loadTasks() {
    return this.loadData('tasks', () => apiService.getTasks(), []);
  }

  async loadCategories() {
    console.log(`loading categories`);
    return this.loadData('categories', () => apiService.getCategories(), []);
  }

  async loadSections() {
    console.log(`loading sections`);
    return this.loadData('sections', () => apiService.getSections(), []);
  }

  async loadGoals() {
    return this.loadData('goals', () => apiService.getGoals(), []);
  }

  async saveTask(task, isNew = false) {
    console.log(task);
    
    // Ensure task has clientId
    const taskWithClientId = this.ensureClientId({ ...task });
    
    if (this.shouldUseAPI()) {
      try {
        if (isNew) {
          return await apiService.createTask(taskWithClientId);
        } else {
          return await apiService.updateTask(taskWithClientId.clientId, taskWithClientId);
        }
      } catch (error) {
        console.warn('Failed to save task to API:', error);
        throw error;
      }
    }
    
    // Save to localStorage when offline or not authenticated
    const tasks = storageUtils.loadFromStorage('dailyGrind_tasks', []);
    if (isNew) {
      // For new tasks, also set the old id format for compatibility
      taskWithClientId.id = Date.now();
      tasks.push(taskWithClientId);
    } else {
      const index = tasks.findIndex(t => t.clientId === taskWithClientId.clientId);
      if (index !== -1) {
        tasks[index] = taskWithClientId;
      }
    }
    storageUtils.saveToStorage('dailyGrind_tasks', tasks);
    return taskWithClientId;
  }

  async saveCategory(category, isNew = false) {
    const categoryWithClientId = this.ensureClientId({ ...category });
    
    if (this.shouldUseAPI()) {
      try {
        if (isNew) {
          return await apiService.createCategory(categoryWithClientId);
        } else {
          return await apiService.updateCategory(categoryWithClientId.clientId, categoryWithClientId);
        }
      } catch (error) {
        console.warn('Failed to save category to API:', error);
        throw error;
      }
    }
    
    const categories = storageUtils.loadFromStorage('dailyGrind_categories', []);
    if (isNew) {
      categoryWithClientId.id = Date.now();
      categories.push(categoryWithClientId);
    } else {
      const index = categories.findIndex(c => c.clientId === categoryWithClientId.clientId);
      if (index !== -1) {
        categories[index] = categoryWithClientId;
      }
    }
    storageUtils.saveToStorage('dailyGrind_categories', categories);
    return categoryWithClientId;
  }

  async saveSection(section, isNew = false) {
    const sectionWithClientId = this.ensureClientId({ ...section });
    
    if (this.shouldUseAPI()) {
      try {
        if (isNew) {
          return await apiService.createSection(sectionWithClientId);
        } else {
          return await apiService.updateSection(sectionWithClientId.clientId, sectionWithClientId);
        }
      } catch (error) {
        console.warn('Failed to save section to API:', error);
        throw error;
      }
    }
    
    const sections = storageUtils.loadFromStorage('dailyGrind_sections', []);
    if (isNew) {
      sectionWithClientId.id = Date.now();
      sections.push(sectionWithClientId);
    } else {
      const index = sections.findIndex(s => s.clientId === sectionWithClientId.clientId);
      if (index !== -1) {
        sections[index] = sectionWithClientId;
      }
    }
    storageUtils.saveToStorage('dailyGrind_sections', sections);
    return sectionWithClientId;
  }

  async saveGoal(goal, isNew = false) {
    const goalWithClientId = this.ensureClientId({ ...goal });
    
    if (this.shouldUseAPI()) {
      try {
        if (isNew) {
          return await apiService.createGoal(goalWithClientId);
        } else {
          return await apiService.updateGoal(goalWithClientId.clientId, goalWithClientId);
        }
      } catch (error) {
        console.warn('Failed to save goal to API:', error);
        throw error;
      }
    }
    
    const goals = storageUtils.loadFromStorage('dailyGrind_goals', []);
    if (isNew) {
      goalWithClientId.id = Date.now();
      goals.push(goalWithClientId);
    } else {
      const index = goals.findIndex(g => g.clientId === goalWithClientId.clientId);
      if (index !== -1) {
        goals[index] = goalWithClientId;
      }
    }
    storageUtils.saveToStorage('dailyGrind_goals', goals);
    return goalWithClientId;
  }

  async updateProgress(taskClientId, date, progressData) {
    const data = {
      clientId: this.generateClientId(),
      taskClientId: taskClientId,
      date: date,
      ...progressData
    };

    if (this.shouldUseAPI()) {
      try {
        return await apiService.updateProgress(data);
      } catch (error) {
        console.warn('Failed to update progress via API:', error);
        // Fall back to localStorage
        this.updateProgressLocally(taskClientId, date, progressData);
        throw error;
      }
    } else {
      this.updateProgressLocally(taskClientId, date, progressData);
    }
  }

  updateProgressLocally(taskClientId, date, progressData) {
    const tasks = storageUtils.loadFromStorage('dailyGrind_tasks', []);
    const task = tasks.find(t => t.clientId === taskClientId);
    if (task) {
      if (!task.dailyProgress) task.dailyProgress = {};
      task.dailyProgress[date] = { ...task.dailyProgress[date], ...progressData };
      storageUtils.saveToStorage('dailyGrind_tasks', tasks);
    }
  }

  // Delete methods
  async deleteTask(taskClientId) {
    if (this.shouldUseAPI()) {
      try {
        await apiService.deleteTask(taskClientId);
      } catch (error) {
        console.warn('Failed to delete task via API:', error);
        throw error;
      }
    }
    
    const tasks = storageUtils.loadFromStorage('dailyGrind_tasks', []);
    const filteredTasks = tasks.filter(t => t.clientId !== taskClientId);
    storageUtils.saveToStorage('dailyGrind_tasks', filteredTasks);
  }

  async deleteCategory(categoryClientId) {
    if (this.shouldUseAPI()) {
      try {
        await apiService.deleteCategory(categoryClientId);
      } catch (error) {
        console.warn('Failed to delete category via API:', error);
        throw error;
      }
    }
    
    const categories = storageUtils.loadFromStorage('dailyGrind_categories', []);
    const filteredCategories = categories.filter(c => c.clientId !== categoryClientId);
    storageUtils.saveToStorage('dailyGrind_categories', filteredCategories);
  }

  async deleteSection(sectionClientId) {
    if (this.shouldUseAPI()) {
      try {
        await apiService.deleteSection(sectionClientId);
      } catch (error) {
        console.warn('Failed to delete section via API:', error);
        throw error;
      }
    }
    
    const sections = storageUtils.loadFromStorage('dailyGrind_sections', []);
    const filteredSections = sections.filter(s => s.clientId !== sectionClientId);
    storageUtils.saveToStorage('dailyGrind_sections', filteredSections);
  }

  async deleteGoal(goalClientId) {
    if (this.shouldUseAPI()) {
      try {
        await apiService.deleteGoal(goalClientId);
      } catch (error) {
        console.warn('Failed to delete goal via API:', error);
        throw error;
      }
    }
    
    const goals = storageUtils.loadFromStorage('dailyGrind_goals', []);
    const filteredGoals = goals.filter(g => g.clientId !== goalClientId);
    storageUtils.saveToStorage('dailyGrind_goals', filteredGoals);
    
    // Also remove goal links from tasks
    const tasks = storageUtils.loadFromStorage('dailyGrind_tasks', []);
    const updatedTasks = tasks.map(task => ({
      ...task,
      goalClientId: task.goalClientId === goalClientId ? null : task.goalClientId
    }));
    storageUtils.saveToStorage('dailyGrind_tasks', updatedTasks);
  }

  // Check connection status
  getConnectionStatus() {
    return {
      isOnline: this.isOnline,
      isAuthenticated: this.isAuthenticated,
      shouldUseAPI: this.shouldUseAPI(),
      hasPendingSync: apiService.hasPendingSync()
    };
  }

  // Initialize - migrate existing data to client_ids if needed
  async initialize() {
    this.migrateLocalStorageToClientIds();
  }
}

// Create singleton instance
const hybridStorage = new HybridStorage();

// Initialize on creation
hybridStorage.initialize();

export default hybridStorage;