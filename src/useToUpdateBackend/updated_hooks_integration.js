// src/hooks/useTaskActions.js - Updated for backend integration
import { useApp } from '../components/AppProvider';
import hybridStorage from '../utils/hybridStorage';
import { dateUtils } from '../utils';

export const useTaskActions = () => {
  const { 
    tasks, 
    setTasks, 
    goals, 
    setGoals,
    connectionStatus,
    setSyncStatus
  } = useApp();

  // Helper to update task progress
  const updateTaskProgress = async (taskId, dateString, progressData) => {
    try {
      setSyncStatus('syncing');
      
      // Update API/localStorage
      await hybridStorage.updateProgress(taskId, dateString, progressData);
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === taskId) {
            const updatedTask = { ...task };
            if (!updatedTask.dailyProgress) updatedTask.dailyProgress = {};
            updatedTask.dailyProgress[dateString] = {
              ...updatedTask.dailyProgress[dateString],
              ...progressData
            };
            return updatedTask;
          }
          return task;
        })
      );
      
      setSyncStatus('idle');
    } catch (error) {
      console.error('Failed to update progress:', error);
      setSyncStatus('error');
      
      // Still update local state for offline functionality
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === taskId) {
            const updatedTask = { ...task };
            if (!updatedTask.dailyProgress) updatedTask.dailyProgress = {};
            updatedTask.dailyProgress[dateString] = {
              ...updatedTask.dailyProgress[dateString],
              ...progressData
            };
            return updatedTask;
          }
          return task;
        })
      );
    }
  };

  const addInputProgress = async (taskId, dateString, inputValue) => {
    await updateTaskProgress(taskId, dateString, {
      inputValue: parseFloat(inputValue) || 0,
      isRunning: false,
      startTime: null
    });
    
    // Update linked goal progress
    updateLinkedGoalProgress(taskId, inputValue);
  };

  const removeInputProgress = async (taskId, dateString) => {
    const task = tasks.find(t => t.id === taskId);
    const oldValue = task?.dailyProgress?.[dateString]?.inputValue || 0;
    
    try {
      setSyncStatus('syncing');
      
      if (connectionStatus.shouldUseAPI) {
        await hybridStorage.deleteProgress(taskId, dateString);
      }
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === taskId) {
            const updatedTask = { ...task };
            if (updatedTask.dailyProgress && updatedTask.dailyProgress[dateString]) {
              delete updatedTask.dailyProgress[dateString];
            }
            return updatedTask;
          }
          return task;
        })
      );
      
      // Update linked goal progress
      updateLinkedGoalProgress(taskId, -oldValue);
      setSyncStatus('idle');
    } catch (error) {
      console.error('Failed to remove progress:', error);
      setSyncStatus('error');
    }
  };

  const toggleTimer = async (taskId) => {
    const today = dateUtils.getDateString(new Date());
    const task = tasks.find(t => t.id === taskId);
    const currentProgress = task?.dailyProgress?.[today] || {};
    
    if (currentProgress.isRunning) {
      // Stop timer
      const timeSpent = (currentProgress.timeSpent || 0) + 
        Math.floor((Date.now() - (currentProgress.startTime || Date.now())) / 1000);
      
      await updateTaskProgress(taskId, today, {
        timeSpent,
        isRunning: false,
        startTime: null
      });
    } else {
      // Start timer
      await updateTaskProgress(taskId, today, {
        timeSpent: currentProgress.timeSpent || 0,
        isRunning: true,
        startTime: Date.now()
      });
    }
  };

  const resetTimer = async (taskId) => {
    const today = dateUtils.getDateString(new Date());
    await updateTaskProgress(taskId, today, {
      timeSpent: 0,
      isRunning: false,
      startTime: null
    });
  };

  const incrementCount = async (taskId) => {
    const today = dateUtils.getDateString(new Date());
    const task = tasks.find(t => t.id === taskId);
    const currentCount = task?.dailyProgress?.[today]?.currentCount || 0;
    
    await updateTaskProgress(taskId, today, {
      currentCount: currentCount + 1,
      isRunning: false,
      startTime: null
    });
  };

  const decrementCount = async (taskId) => {
    const today = dateUtils.getDateString(new Date());
    const task = tasks.find(t => t.id === taskId);
    const currentCount = Math.max(0, (task?.dailyProgress?.[today]?.currentCount || 0) - 1);
    
    await updateTaskProgress(taskId, today, {
      currentCount,
      isRunning: false,
      startTime: null
    });
  };

  const toggleCheckbox = async (taskId) => {
    const today = dateUtils.getDateString(new Date());
    const task = tasks.find(t => t.id === taskId);
    const currentCount = task?.dailyProgress?.[today]?.currentCount || 0;
    const newCount = currentCount > 0 ? 0 : 1;
    
    await updateTaskProgress(taskId, today, {
      currentCount: newCount,
      isRunning: false,
      startTime: null
    });
  };

  const skipTaskForDay = async (taskId) => {
    const today = dateUtils.getDateString(new Date());
    
    try {
      setSyncStatus('syncing');
      
      // Update task to add today to excluded dates
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const updatedTask = {
          ...task,
          excludedDates: [...(task.excludedDates || []), today]
        };
        
        if (connectionStatus.shouldUseAPI) {
          await hybridStorage.saveTask(updatedTask, false);
        }
        
        setTasks(prevTasks => 
          prevTasks.map(t => t.id === taskId ? updatedTask : t)
        );
      }
      
      setSyncStatus('idle');
    } catch (error) {
      console.error('Failed to skip task:', error);
      setSyncStatus('error');
    }
  };

  const addOneOffTask = async (taskId) => {
    const today = dateUtils.getDateString(new Date());
    
    try {
      setSyncStatus('syncing');
      
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const updatedTask = {
          ...task,
          oneOffDates: [...(task.oneOffDates || []), today]
        };
        
        if (connectionStatus.shouldUseAPI) {
          await hybridStorage.saveTask(updatedTask, false);
        }
        
        setTasks(prevTasks => 
          prevTasks.map(t => t.id === taskId ? updatedTask : t)
        );
      }
      
      setSyncStatus('idle');
    } catch (error) {
      console.error('Failed to add one-off task:', error);
      setSyncStatus('error');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      setSyncStatus('syncing');
      
      if (connectionStatus.shouldUseAPI) {
        await hybridStorage.deleteTask(taskId);
      }
      
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
      setSyncStatus('idle');
    } catch (error) {
      console.error('Failed to delete task:', error);
      setSyncStatus('error');
    }
  };

  const updateLinkedGoalProgress = (taskId, inputChange) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task?.goalId) return;
    
    setGoals(prevGoals => 
      prevGoals.map(goal => {
        if (goal.id === task.goalId) {
          const newProgress = Math.max(0, (goal.currentProgress || 0) + inputChange);
          const newPersonalBest = Math.max(goal.personalBestProgress || 0, inputChange);
          
          return {
            ...goal,
            currentProgress: newProgress,
            personalBestProgress: inputChange > (goal.personalBestProgress || 0) ? inputChange : goal.personalBestProgress
          };
        }
        return goal;
      })
    );
  };

  return {
    addInputProgress,
    removeInputProgress,
    toggleTimer,
    resetTimer,
    incrementCount,
    decrementCount,
    toggleCheckbox,
    skipTaskForDay,
    addOneOffTask,
    addSingletonTask: addOneOffTask, // Alias
    deleteTask
  };
};

// Integration Guide for your main App component:

/*
## Complete Integration Steps:

### 1. Update your utils/index.js:
```javascript
// Add these exports
export { default as hybridStorage } from './hybridStorage';
export { ApiService, apiService } from './apiService';
```

### 2. Update your AppProvider.jsx:
Add the imports and state as shown in the hybridStorage.js comments.

### 3. Create AuthModal component (new):
```javascript
// src/components/AuthModal.jsx
import React, { useState } from 'react';
import { useApp } from './AppProvider';

export const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useApp();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (isLogin) {
        result = await login(formData.username, formData.password);
      } else {
        result = await register(formData.username, formData.email, formData.password);
      }

      if (result.success) {
        onClose();
        setFormData({ username: '', email: '', password: '' });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {isLogin ? 'Login' : 'Register'}
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
        
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 hover:text-blue-700"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};
```

### 4. Add connection status indicator to your main app:
```javascript
// Add this component somewhere in your UI
const ConnectionStatus = () => {
  const { connectionStatus, syncStatus } = useApp();
  
  if (!connectionStatus.isAuthenticated) {
    return (
      <div className="flex items-center text-gray-600">
        <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
        Guest Mode (data saved locally)
      </div>
    );
  }
  
  if (!connectionStatus.isOnline) {
    return (
      <div className="flex items-center text-yellow-600">
        <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
        Offline (will sync when connected)
      </div>
    );
  }
  
  if (syncStatus === 'syncing') {
    return (
      <div className="flex items-center text-blue-600">
        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
        Syncing...
      </div>
    );
  }
  
  if (connectionStatus.hasPendingSync) {
    return (
      <div className="flex items-center text-orange-600">
        <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
        Pending sync
      </div>
    );
  }
  
  return (
    <div className="flex items-center text-green-600">
      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
      Synced
    </div>
  );
};
```

### 5. Update your backend URLs:
In `src/utils/apiService.js`, change the `API_BASE_URL` to your actual domain.

### 6. PHP File Structure:
Place the PHP files in this structure:
```
your-domain.com/
├── api/
│   ├── auth.php
│   ├── tasks.php
│   ├── progress.php
│   ├── categories.php
│   ├── sections.php
│   └── goals.php
├── config/
│   └── database.php
└── includes/
    ├── jwt.php
    ├── api_helpers.php
    └── default_data.php
```

### 7. Database Setup:
1. Run the SQL schema to create your database
2. Update database credentials in `config/database.php`
3. Update the JWT secret key in `includes/jwt.php`

### 8. Testing:
1. Test registration/login flows
2. Verify data migration from localStorage
3. Test offline functionality
4. Confirm sync when reconnected

The system now provides:
✅ JWT authentication
✅ Real-time API sync when online
✅ Offline localStorage fallback
✅ Data migration from localStorage to database
✅ Automatic sync when reconnected
✅ Hybrid storage that works seamlessly
*/