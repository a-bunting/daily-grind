// src/utils/apiService.js - Updated for Client ID system
const API_BASE_URL = 'https://dailygrind.sweeto.co.uk/api'; // Change this to your API URL

class ApiService {
  constructor() {
    this.token = localStorage.getItem('auth_token');
    this.isOnline = navigator.onLine;
    this.syncQueue = JSON.parse(localStorage.getItem('sync_queue') || '[]');
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
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

  // Helper method to make authenticated requests
  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(url);
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // Token expired or invalid
      this.logout();
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Queue offline actions with clientId support
  queueAction(action, entityType, entityClientId, data) {
    if (!this.isOnline && this.token) {
      const queueItem = {
        id: Date.now().toString(),
        action,
        entityType,
        entityClientId,
        data,
        timestamp: Date.now()
      };
      
      this.syncQueue.push(queueItem);
      localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
      return true;
    }
    return false;
  }

  // Process sync queue when back online
  async processSyncQueue() {
    if (!this.isOnline || !this.token || this.syncQueue.length === 0) {
      return;
    }

    const queue = [...this.syncQueue];
    this.syncQueue = [];
    localStorage.removeItem('sync_queue');

    for (const item of queue) {
      try {
        await this.processQueueItem(item);
      } catch (error) {
        console.error('Failed to sync item:', item, error);
        // Re-queue failed items
        this.syncQueue.push(item);
      }
    }

    if (this.syncQueue.length > 0) {
      localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    }
  }

  async processQueueItem(item) {
    const { action, entityType, entityClientId, data } = item;
    
    switch (entityType) {
      case 'task':
        if (action === 'create') {
          await this.createTask(data);
        } else if (action === 'update') {
          await this.updateTask(entityClientId, data);
        } else if (action === 'delete') {
          await this.deleteTask(entityClientId);
        }
        break;
      case 'progress':
        if (action === 'update') {
          await this.updateProgress(data);
        } else if (action === 'delete') {
          await this.deleteProgress(data);
        }
        break;
      case 'category':
        if (action === 'create') {
          await this.createCategory(data);
        } else if (action === 'update') {
          await this.updateCategory(entityClientId, data);
        } else if (action === 'delete') {
          await this.deleteCategory(entityClientId);
        }
        break;
      case 'section':
        if (action === 'create') {
          await this.createSection(data);
        } else if (action === 'update') {
          await this.updateSection(entityClientId, data);
        } else if (action === 'delete') {
          await this.deleteSection(entityClientId);
        }
        break;
      case 'goal':
        if (action === 'create') {
          await this.createGoal(data);
        } else if (action === 'update') {
          await this.updateGoal(entityClientId, data);
        } else if (action === 'delete') {
          await this.deleteGoal(entityClientId);
        }
        break;
      default: break;
    }
  }

  // Authentication methods
  async login(username, password) {
    try {
      const response = await this.makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      this.token = response.token;
      localStorage.setItem('auth_token', this.token);
      
      return {
        success: true,
        user: response.user,
        token: response.token
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async register(username, email, password) {
    try {
      const response = await this.makeRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
      });

      this.token = response.token;
      localStorage.setItem('auth_token', this.token);

      return {
        success: true,
        user: response.user,
        token: response.token
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async verifyToken() {
    if (!this.token) return { valid: false };

    try {
      const response = await this.makeRequest('/auth/verify', {
        method: 'POST'
      });
      return response;
    } catch (error) {
      return { valid: false };
    }
  }

  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('sync_queue');
    this.syncQueue = [];
  }

  // Task methods - Updated to use clientId
  async getTasks() {
    if (!this.isOnline && this.queueAction('get', 'task', null, {})) {
      throw new Error('Offline - tasks will sync when reconnected');
    }

    return this.makeRequest('/tasks');
  }

  async createTask(taskData) {
    // Ensure task has clientId
    if (!taskData.clientId) {
      taskData.clientId = this.generateClientId();
    }

    if (!this.isOnline && this.queueAction('create', 'task', taskData.clientId, taskData)) {
      throw new Error('Offline - task will sync when reconnected');
    }

    return this.makeRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  }

  async updateTask(taskClientId, updates) {
    if (!this.isOnline && this.queueAction('update', 'task', taskClientId, updates)) {
      throw new Error('Offline - changes will sync when reconnected');
    }

    return this.makeRequest(`/tasks/${taskClientId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteTask(taskClientId) {
    if (!this.isOnline && this.queueAction('delete', 'task', taskClientId, {})) {
      throw new Error('Offline - deletion will sync when reconnected');
    }

    return this.makeRequest(`/tasks/${taskClientId}`, {
      method: 'DELETE'
    });
  }

  // Progress methods - Updated to use taskClientId
  async updateProgress(progressData) {
    // Ensure progress has clientId and uses taskClientId
    if (!progressData.clientId) {
      progressData.clientId = this.generateClientId();
    }

    if (!this.isOnline && this.queueAction('update', 'progress', null, progressData)) {
      throw new Error('Offline - progress will sync when reconnected');
    }

    return this.makeRequest('/progress', {
      method: 'POST',
      body: JSON.stringify(progressData)
    });
  }

  async deleteProgress(progressData) {
    if (!this.isOnline && this.queueAction('delete', 'progress', null, progressData)) {
      throw new Error('Offline - deletion will sync when reconnected');
    }

    return this.makeRequest('/progress', {
      method: 'DELETE',
      body: JSON.stringify(progressData)
    });
  }

  // Category methods - Updated to use clientId
  async getCategories() {
    return this.makeRequest('/categories');
  }

  async createCategory(categoryData) {
    if (!categoryData.clientId) {
      categoryData.clientId = this.generateClientId();
    }

    if (!this.isOnline && this.queueAction('create', 'category', categoryData.clientId, categoryData)) {
      throw new Error('Offline - category will sync when reconnected');
    }

    return this.makeRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  }

  async updateCategory(categoryClientId, updates) {
    if (!this.isOnline && this.queueAction('update', 'category', categoryClientId, updates)) {
      throw new Error('Offline - changes will sync when reconnected');
    }

    return this.makeRequest(`/categories/${categoryClientId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteCategory(categoryClientId) {
    if (!this.isOnline && this.queueAction('delete', 'category', categoryClientId, {})) {
      throw new Error('Offline - deletion will sync when reconnected');
    }

    return this.makeRequest(`/categories/${categoryClientId}`, {
      method: 'DELETE'
    });
  }

  // Section methods - Updated to use clientId
  async getSections() {
    return this.makeRequest('/sections');
  }

  async createSection(sectionData) {
    if (!sectionData.clientId) {
      sectionData.clientId = this.generateClientId();
    }

    if (!this.isOnline && this.queueAction('create', 'section', sectionData.clientId, sectionData)) {
      throw new Error('Offline - section will sync when reconnected');
    }

    return this.makeRequest('/sections', {
      method: 'POST',
      body: JSON.stringify(sectionData)
    });
  }

  async updateSection(sectionClientId, updates) {
    if (!this.isOnline && this.queueAction('update', 'section', sectionClientId, updates)) {
      throw new Error('Offline - changes will sync when reconnected');
    }

    return this.makeRequest(`/sections/${sectionClientId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteSection(sectionClientId) {
    if (!this.isOnline && this.queueAction('delete', 'section', sectionClientId, {})) {
      throw new Error('Offline - deletion will sync when reconnected');
    }

    return this.makeRequest(`/sections/${sectionClientId}`, {
      method: 'DELETE'
    });
  }

  // Goal methods - Updated to use clientId
  async getGoals() {
    return this.makeRequest('/goals');
  }

  async createGoal(goalData) {
    if (!goalData.clientId) {
      goalData.clientId = this.generateClientId();
    }

    if (!this.isOnline && this.queueAction('create', 'goal', goalData.clientId, goalData)) {
      throw new Error('Offline - goal will sync when reconnected');
    }

    return this.makeRequest('/goals', {
      method: 'POST',
      body: JSON.stringify(goalData)
    });
  }

  async updateGoal(goalClientId, updates) {
    if (!this.isOnline && this.queueAction('update', 'goal', goalClientId, updates)) {
      throw new Error('Offline - changes will sync when reconnected');
    }

    return this.makeRequest(`/goals/${goalClientId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteGoal(goalClientId) {
    if (!this.isOnline && this.queueAction('delete', 'goal', goalClientId, {})) {
      throw new Error('Offline - deletion will sync when reconnected');
    }

    return this.makeRequest(`/goals/${goalClientId}`, {
      method: 'DELETE'
    });
  }

  // User preferences sync
  async syncUserPreferences(preferences) {
    if (!this.isAuthenticated()) return false;
    
    try {
      await this.makeRequest('/preferences', {
        method: 'POST',
        body: JSON.stringify(preferences)
      });
      return true;
    } catch (error) {
      console.warn('Failed to sync preferences:', error);
      return false;
    }
  }

  async loadUserPreferences() {
    if (!this.isAuthenticated()) return {};
    
    try {
      return await this.makeRequest('/preferences');
    } catch (error) {
      console.warn('Failed to load preferences:', error);
      return {};
    }
  }

  // Enhanced sync management
  async getSyncStatus() {
    if (!this.isAuthenticated()) return { pending_items: 0, has_pending: false };
    
    try {
      return await this.makeRequest('/sync/status', { method: 'POST' });
    } catch (error) {
      console.warn('Failed to get sync status:', error);
      return { pending_items: 0, has_pending: false };
    }
  }

  async forceSyncAll() {
    if (!this.isAuthenticated()) return false;
    
    try {
      const result = await this.makeRequest('/sync/process', { method: 'POST' });
      return result.success;
    } catch (error) {
      console.error('Force sync failed:', error);
      return false;
    }
  }

  // Batch operations for better performance
  async batchUpdateProgress(progressUpdates) {
    if (!this.isAuthenticated()) return false;
    
    try {
      // Process in batches of 10
      const batchSize = 10;
      for (let i = 0; i < progressUpdates.length; i += batchSize) {
        const batch = progressUpdates.slice(i, i + batchSize);
        await Promise.all(batch.map(update => this.updateProgress(update)));
      }
      return true;
    } catch (error) {
      console.error('Batch progress update failed:', error);
      return false;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Utility methods
  isAuthenticated() {
    return !!this.token;
  }

  isOffline() {
    return !this.isOnline;
  }

  hasPendingSync() {
    return this.syncQueue.length > 0;
  }
}

// Create singleton instance
const apiService = new ApiService();

// Export both class and instance
export { ApiService, apiService };
export default apiService;