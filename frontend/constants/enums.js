// Job Listing Status
export const JobListingStatus = Object.freeze({
  DRAFT: 0,
  PENDING: 1,
  ACTIVE: 2,
  CLOSED: 3,
});

// Status display configuration
export const JobListingStatusConfig = Object.freeze({
  [JobListingStatus.DRAFT]: { label: 'Draft', color: 'default' },
  [JobListingStatus.PENDING]: { label: 'Pending', color: 'orange' },
  [JobListingStatus.ACTIVE]: { label: 'Active', color: 'green' },
  [JobListingStatus.CLOSED]: { label: 'Closed', color: 'red' },
});

// Status filter keys for UI
export const JobListingStatusFilters = Object.freeze({
  ALL: 'all',
  DRAFT: 'draft',
  PENDING: 'pending',
  ACTIVE: 'active',
  CLOSED: 'closed',
});

