import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for managing filter state and operations
 * @param {Object} initialFilters - Initial filter values
 * @param {Function} onFiltersChange - Callback when filters change
 * @returns {Object} Filter state and operations
 */
export const useFilters = (initialFilters = {}, onFiltersChange) => {
  const [filters, setFilters] = useState(initialFilters);

  // Update a specific filter
  const updateFilter = useCallback((filterKey, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [filterKey]: value };
      if (onFiltersChange) {
        onFiltersChange(newFilters);
      }
      return newFilters;
    });
  }, [onFiltersChange]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    const clearedFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {});
    setFilters(clearedFilters);
    if (onFiltersChange) {
      onFiltersChange(clearedFilters);
    }
  }, [filters, onFiltersChange]);

  // Clear specific filter
  const clearFilter = useCallback((filterKey) => {
    setFilters(prev => {
      const newFilters = { ...prev, [filterKey]: [] };
      if (onFiltersChange) {
        onFiltersChange(newFilters);
      }
      return newFilters;
    });
  }, [onFiltersChange]);

  // Set multiple filters at once
  const setMultipleFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  }, [onFiltersChange]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(filter => 
      Array.isArray(filter) ? filter.length > 0 : filter
    );
  }, [filters]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).reduce((count, filter) => {
      if (Array.isArray(filter)) {
        return count + filter.length;
      }
      return filter ? count + 1 : count;
    }, 0);
  }, [filters]);

  // Convert filters to URL search params
  const toURLSearchParams = useCallback((customMapping = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      const paramKey = customMapping[key] || key;
      
      if (Array.isArray(value) && value.length > 0) {
        value.forEach(v => params.append(paramKey, v));
      } else if (value && !Array.isArray(value)) {
        params.set(paramKey, value);
      }
    });
    
    return params;
  }, [filters]);

  // Convert filters to API query object
  const toAPIQuery = useCallback((customMapping = {}) => {
    const query = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      const queryKey = customMapping[key] || key;
      
      if (Array.isArray(value) && value.length > 0) {
        query[queryKey] = value;
      } else if (value && !Array.isArray(value)) {
        query[queryKey] = value;
      }
    });
    
    return query;
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearAllFilters,
    clearFilter,
    setMultipleFilters,
    hasActiveFilters,
    activeFilterCount,
    toURLSearchParams,
    toAPIQuery
  };
};

/**
 * Hook for managing filter persistence (localStorage)
 * @param {string} storageKey - Key for localStorage
 * @param {Object} defaultFilters - Default filter values
 * @returns {Object} Filter state with persistence
 */
export const usePersistedFilters = (storageKey, defaultFilters = {}) => {
  // Load initial filters from localStorage
  const getInitialFilters = () => {
    if (typeof window === 'undefined') return defaultFilters;
    
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? { ...defaultFilters, ...JSON.parse(stored) } : defaultFilters;
    } catch (error) {
      console.warn('Failed to load filters from localStorage:', error);
      return defaultFilters;
    }
  };

  const [filters, setFilters] = useState(getInitialFilters);

  // Save filters to localStorage
  const saveFilters = useCallback((newFilters) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(newFilters));
    } catch (error) {
      console.warn('Failed to save filters to localStorage:', error);
    }
  }, [storageKey]);

  // Update filter with persistence
  const updateFilter = useCallback((filterKey, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [filterKey]: value };
      saveFilters(newFilters);
      return newFilters;
    });
  }, [saveFilters]);

  // Clear all filters with persistence
  const clearAllFilters = useCallback(() => {
    const clearedFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {});
    setFilters(clearedFilters);
    saveFilters(clearedFilters);
  }, [filters, saveFilters]);

  // Set multiple filters with persistence
  const setMultipleFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    saveFilters(newFilters);
  }, [saveFilters]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(filter => 
      Array.isArray(filter) ? filter.length > 0 : filter
    );
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearAllFilters,
    setMultipleFilters,
    hasActiveFilters,
    saveFilters
  };
};
