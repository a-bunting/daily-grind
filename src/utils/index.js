// src/utils/index.js - Updated with correct imports and exports
import { DAY_ABBREVIATIONS, DAYS, MONTHS } from "../constants";

export const dateUtils = {
  getDateString: (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  formatDisplayDate: (date) => {
    const dayName = DAYS[date.getDay()];
    const month = MONTHS[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${dayName}, ${month} ${day}, ${year}`;
  },

  getCalendarDays: (currentDate) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  },

  formatTooltipDate: (date) => {
    const dayName = DAYS[date.getDay()];
    const month = MONTHS[date.getMonth()];
    const day = date.getDate();
    return `${dayName}, ${month.substring(0, 3)} ${day}`;
  },

  getWeekStart: (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  },

  getWeekEnd: (date) => {
    const weekStart = dateUtils.getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return weekEnd;
  },

  getWeekDays: (date) => {
    const weekStart = dateUtils.getWeekStart(date);
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  },

  getWeekNumber: (date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  }
};

export const timeUtils = {
  formatTime: (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  formatPlannedTime: (minutes) => {
    if (!minutes || minutes === 0) return '0m';
    
    const totalSeconds = Math.round(minutes * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      if (mins > 0 && secs > 0) return `${hours}h ${mins}m ${secs}s`;
      if (mins > 0) return `${hours}h ${mins}m`;
      if (secs > 0) return `${hours}h ${secs}s`;
      return `${hours}h`;
    } else if (mins > 0) {
      if (secs > 0) return `${mins}m ${secs}s`;
      return `${mins}m`;
    } else {
      return `${secs}s`;
    }
  }
};

export const storageUtils = {
  saveToStorage: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  loadFromStorage: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return defaultValue;
    }
  },

  removeFromStorage: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};

export const mockApiService = {
  async login(username, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'Login successful',
      token: 'demo-jwt-token-' + Date.now(),
      user: {
        id: 1,
        clientId: 'DemoUser01',
        username: username,
        email: username + '@example.com'
      }
    };
  },

  async register(username, email, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'User registered successfully',
      token: 'demo-jwt-token-' + Date.now(),
      user: {
        id: 1,
        clientId: 'DemoUser01',
        username: username,
        email: email
      }
    };
  }
};

export const getScheduleDescription = (task) => {
  if (!task.selectedDays && !task.monthlyDays) return 'No schedule selected';
  
  const selectedDays = task.selectedDays || [];
  const monthlyDays = task.monthlyDays || [];
  
  switch (task.scheduleType || 'weekly') {
    case 'weekly':
      if (selectedDays.length === 0) return 'No days selected';
      if (selectedDays.length === 7) return 'Every day';
      const dayNames = selectedDays.map(d => DAY_ABBREVIATIONS[d]).join(', ');
      return `Every ${dayNames}`;
      
    case 'monthly':
      if (monthlyDays.length === 0) return 'No days selected';
      const monthlyTypes = task.monthlyTypes || [task.monthlyType || 'first'];
      const monthlyDayNames = monthlyDays.map(d => DAY_ABBREVIATIONS[d]).join(', ');
      const typesText = monthlyTypes.map(type => 
        type === 'first' ? '1st' :
        type === 'second' ? '2nd' :
        type === 'third' ? '3rd' :
        type === 'fourth' ? '4th' :
        'last'
      ).join(' & ');
      return `Every ${typesText} ${monthlyDayNames} of the month`;
      
    case 'interval':
      if (selectedDays.length === 0) return 'No days selected';
      const intervalDayNames = selectedDays.map(d => DAY_ABBREVIATIONS[d]).join(', ');
      const weeks = task.intervalWeeks || 2;
      return `Every ${weeks} weeks on ${intervalDayNames}`;
      
    default:
      return 'No schedule selected';
  }
};

// Import and export API service and hybrid storage
export { default as apiService, ApiService } from './apiService';

// Create and export hybrid storage
class HybridStorage {
  constructor() {
    this.isOnline = navigator.onLine;
    this.isAuthenticated = false;
    
    // Check for existing auth token
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.isAuthenticated = true;
    }
    
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

  // Determine storage method
  shouldUseAPI() {
    return this.isOnline && this.isAuthenticated;
  }

  // Sync any pending localStorage changes to API
  async syncFromLocalStorage() {
    if (!this.shouldUseAPI()) return;
    
    try {
      // This would trigger API sync processes
      console.log('Syncing from localStorage to API...');
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  // Generic data loading
  async loadData(key, apiMethod, defaultValue = []) {
    if (this.shouldUseAPI()) {
      try {
        const { default: apiService } = await import('./apiService');
        return await apiMethod.call(apiService);
      } catch (error) {
        console.warn(`Failed to load ${key} from API, falling back to localStorage:`, error);
        const localData = storageUtils.loadFromStorage(`dailyGrind_${key}`, defaultValue);
        return Array.isArray(localData) ? localData.map(item => this.ensureClientId(item)) : this.ensureClientId(localData);
      }
    } else {
      const localData = storageUtils.loadFromStorage(`dailyGrind_${key}`, defaultValue);
      return Array.isArray(localData) ? localData.map(item => this.ensureClientId(item)) : this.ensureClientId(localData);
    }
  }

  // Specific data methods
  async loadTasks() {
    return this.loadData('tasks', async function() {
      const { default: apiService } = await import('./apiService');
      return apiService.getTasks();
    }, []);
  }

  async loadCategories() {
    return this.loadData('categories', async function() {
      const { default: apiService } = await import('./apiService');
      return apiService.getCategories();
    }, []);
  }

  async loadSections() {
    return this.loadData('sections', async function() {
      const { default: apiService } = await import('./apiService');
      return apiService.getSections();
    }, []);
  }

  async loadGoals() {
    return this.loadData('goals', async function() {
      const { default: apiService } = await import('./apiService');
      return apiService.getGoals();
    }, []);
  }
}

// Create and export singleton instance
export const hybridStorage = new HybridStorage();
