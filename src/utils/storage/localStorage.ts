/**
 * Utility functions for localStorage operations
 */

const STORAGE_KEYS = {
  FORM_DATA: 'schoolforms-store',
  USER_PREFERENCES: 'schoolforms-preferences',
  FAMILY_DATA: 'schoolforms-family',
} as const;

export const storage = {
  /**
   * Store data in localStorage with error handling
   */
  set: <T>(key: string, value: T): boolean => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  },

  /**
   * Get data from localStorage with error handling
   */
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return defaultValue;
    }
  },

  /**
   * Remove data from localStorage
   */
  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
      return false;
    }
  },

  /**
   * Clear all storage
   */
  clear: (): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  },

  /**
   * Check if localStorage is available
   */
  isAvailable: (): boolean => {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Get storage usage information
   */
  getUsage: (): { used: number; total: number; available: number } => {
    let used = 0;
    const total = 5 * 1024 * 1024; // 5MB typical localStorage limit

    try {
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          used += localStorage[key].length + key.length;
        }
      }
    } catch (error) {
      console.error('Failed to calculate localStorage usage:', error);
    }

    return {
      used,
      total,
      available: total - used,
    };
  },
};

export const STORAGE_KEYS_EXPORT = STORAGE_KEYS;
