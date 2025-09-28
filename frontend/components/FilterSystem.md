# Reusable Filter System

A comprehensive, reusable filter system for React applications with Ant Design components.

## Components

### 1. FilterBar Component (`FilterBar.js`)
The main reusable filter component that renders filter buttons and dropdowns.

### 2. Filter Configurations (`filterConfigs.js`)
Predefined filter configurations for different use cases.

### 3. useFilters Hook (`hooks/useFilters.js`)
Custom React hook for managing filter state and operations.

## Quick Start

### Basic Usage

```javascript
import React from 'react';
import FilterBar from './FilterBar';
import { getFilterConfig } from './filterConfigs';
import { useFilters } from '../hooks/useFilters';

const MyPage = () => {
  // Get predefined filter configuration
  const filterConfig = getFilterConfig('job-search');
  
  // Initialize filter state
  const {
    filters: selectedFilters,
    updateFilter: handleFilterChange,
    clearAllFilters: handleClearAllFilters,
    hasActiveFilters,
    toAPIQuery
  } = useFilters({
    industry: [],
    jobType: [],
    location: []
  });

  return (
    <FilterBar
      filterConfig={filterConfig}
      selectedFilters={selectedFilters}
      onFilterChange={handleFilterChange}
      onClearAll={handleClearAllFilters}
      showSaveProfile={false}
      showClearAll={true}
    />
  );
};
```

## Predefined Filter Configurations

### Available Configurations

1. **`intern-search`** - For intern/student search
2. **`job-search`** - For job listings
3. **`company-search`** - For company directory
4. **`university-search`** - For university/education filters

### Usage

```javascript
import { getFilterConfig } from './filterConfigs';

// Get predefined config
const filterConfig = getFilterConfig('job-search');

// Or create custom config
const customConfig = [
  {
    key: 'category',
    label: 'Category',
    title: 'Product Category',
    type: 'checkbox',
    width: '120px',
    options: ['Electronics', 'Clothing', 'Books']
  }
];
```

## Filter Types

### Checkbox Filter
```javascript
{
  key: 'industry',
  label: 'Industry',
  title: 'Select Industries',
  type: 'checkbox',
  width: '120px',
  options: ['Tech', 'Finance', 'Healthcare']
}
```

### Date Range Filter
```javascript
{
  key: 'dateRange',
  label: 'Date Range',
  title: 'Select Date Range',
  type: 'dateRange',
  width: '150px'
}
```

### Number Range Filter
```javascript
{
  key: 'salary',
  label: 'Salary',
  title: 'Salary Range',
  type: 'numberRange',
  width: '130px'
}
```

## useFilters Hook

### Basic Usage

```javascript
const {
  filters,                    // Current filter values
  updateFilter,              // Update single filter
  clearAllFilters,           // Clear all filters
  clearFilter,               // Clear specific filter
  setMultipleFilters,        // Set multiple filters at once
  hasActiveFilters,          // Boolean - any filters active?
  activeFilterCount,         // Number of active filters
  toURLSearchParams,         // Convert to URLSearchParams
  toAPIQuery                 // Convert to API query object
} = useFilters(initialFilters, onFiltersChange);
```

### Advanced Usage with Persistence

```javascript
import { usePersistedFilters } from '../hooks/useFilters';

const {
  filters,
  updateFilter,
  clearAllFilters,
  hasActiveFilters
} = usePersistedFilters('my-page-filters', {
  category: [],
  price: []
});
```

## API Integration

### Convert Filters to API Query

```javascript
// Basic conversion
const apiQuery = toAPIQuery();
// Result: { industry: ['tech', 'finance'], location: ['remote'] }

// Custom field mapping
const apiQuery = toAPIQuery({
  industry: 'companyIndustry',
  location: 'workLocation'
});
// Result: { companyIndustry: ['tech'], workLocation: ['remote'] }

// Use with fetch
const url = `${API_BASE_URL}/jobs?${toURLSearchParams()}`;
```

## Customization

### Custom Theme

```javascript
<FilterBar
  theme={{
    activeColor: '#1890ff',      // Active button color
    inactiveColor: '#f5f5f5',    // Inactive button color
    textColor: '#666',           // Inactive text color
    activeTextColor: '#fff'      // Active text color
  }}
/>
```

### Custom Filter Configuration

```javascript
import { createCustomFilterConfig } from './filterConfigs';

const customFilters = createCustomFilterConfig([
  {
    key: 'status',
    label: 'Status',
    options: ['Active', 'Inactive', 'Pending']
  },
  {
    key: 'priority',
    label: 'Priority',
    type: 'checkbox',
    width: '100px',
    options: ['High', 'Medium', 'Low']
  }
]);
```

## Examples

### Job Search Page
```javascript
const JobSearchPage = () => {
  const filterConfig = getFilterConfig('job-search');
  const { filters, updateFilter, clearAllFilters } = useFilters({
    industry: [],
    jobType: [],
    location: []
  });

  return (
    <FilterBar
      filterConfig={filterConfig}
      selectedFilters={filters}
      onFilterChange={updateFilter}
      onClearAll={clearAllFilters}
    />
  );
};
```

### Company Directory
```javascript
const CompanyDirectory = () => {
  const filterConfig = getFilterConfig('company-search');
  const { filters, updateFilter, clearAllFilters } = usePersistedFilters(
    'company-filters',
    { industry: [], size: [], location: [] }
  );

  return (
    <FilterBar
      filterConfig={filterConfig}
      selectedFilters={filters}
      onFilterChange={updateFilter}
      onClearAll={clearAllFilters}
      theme={{ activeColor: '#52c41a' }}
    />
  );
};
```

## Benefits

✅ **Reusable** - Use across multiple pages with different configurations
✅ **Consistent UI** - Uniform look and behavior
✅ **Type Safe** - TypeScript support (if using TypeScript)
✅ **Flexible** - Support for different filter types
✅ **Persistent** - Optional localStorage persistence
✅ **API Ready** - Easy conversion to API queries
✅ **Customizable** - Themes and custom configurations
✅ **Mobile Friendly** - Responsive design
✅ **Accessible** - Proper ARIA labels and keyboard navigation

## Migration from Old Filter System

1. Replace individual filter state variables with `useFilters` hook
2. Replace custom filter UI with `FilterBar` component
3. Update API query building to use `toAPIQuery()` or `toURLSearchParams()`
4. Configure filter options in `filterConfigs.js`

This system makes it easy to add consistent, powerful filtering to any page in your application!
