// Generated constants

export const COLOR_SCHEMES = {
  indigo: {
    name: 'Default',
    primary: '#4f46e5',
    primaryHover: '#4338ca',
    primaryLight: '#e0e7ff',
    primaryDark: '#3730a3',
    accent: '#6366f1',
    gradient: 'from-indigo-50 via-white to-purple-50',
    background: 'linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 50%, #e9d5ff 100%)',
    taskColors: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
  },
  emerald: {
    name: 'Forest',
    primary: '#059669',
    primaryHover: '#047857',
    primaryLight: '#d1fae5',
    primaryDark: '#065f46',
    accent: '#10b981',
    gradient: 'from-emerald-50 via-white to-teal-50',
    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    taskColors: ['#10b981', '#059669', '#0d9488', '#84cc16', '#eab308', '#06b6d4']
  },
  orange: {
    name: 'Sunset',
    primary: '#ea580c',
    primaryHover: '#c2410c',
    primaryLight: '#fed7aa',
    primaryDark: '#9a3412',
    accent: '#f97316',
    gradient: 'from-orange-50 via-white to-red-50',
    background: 'linear-gradient(135deg, #fed7aa 0%, #f3f4f6 50%, #fecaca 100%)',
    taskColors: ['#f97316', '#ea580c', '#ef4444', '#f59e0b', '#ec4899', '#8b5cf6']
  }
};

export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const DAY_ABBREVIATIONS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const DEFAULT_CATEGORIES = [
  { id: 'work', name: 'Work', color: '#3b82f6', icon: '💼' },
  { id: 'health', name: 'Health', color: '#10b981', icon: '🏥' },
  { id: 'fitness', name: 'Fitness', color: '#f59e0b', icon: '💪' },
  { id: 'learning', name: 'Learning', color: '#8b5cf6', icon: '📚' },
  { id: 'personal', name: 'Personal', color: '#06b6d4', icon: '👤' },
  { id: 'fun', name: 'Fun', color: '#ec4899', icon: '🎉' },
  { id: 'chores', name: 'Chores', color: '#6b7280', icon: '🧹' },
  { id: 'finance', name: 'Finance', color: '#059669', icon: '💰' }
];

export const DEFAULT_SECTIONS = [
  {
    id: 'default',
    name: 'All Tasks',
    layoutMode: 'list',
    columnCount: 1,
    rules: [],
    taskOrder: [],
    showBackground: true
  }
];

export const API_BASE_URL = 'https://your-api-domain.com/daily_grind';

