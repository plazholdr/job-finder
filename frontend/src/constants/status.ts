// Pure mappings only — keep in sync with backend constants

export const STATUS = {
  PENDING: 0,
  ACCEPTED: 1,
  REJECTED: 2,
} as const;

export const LABELS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
} as const;

export const ENTITY = {
  OFFER: 'offer',
  VERIFICATION: 'verification',
  APPROVAL: 'approval',
} as const;
