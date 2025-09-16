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

export const APPLICATION_STATUS = {
  PENDING: 0,
  SHORTLISTED: 1,
  PENDING_ACCEPTANCE: 2,
  ACCEPTED: 3,
  HIRED: 4,
  REJECTED: 5,
  DECLINED: 6,
  WITHDRAWN: 7
}
