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

// Admin Job status codes 0..3
export const JOB_STATUS = {
  DRAFT: 0,
  PENDING: 1,
  ACTIVE: 2,
  REJECTED: 3,
} as const;

export const JOB_STATUS_LABEL: Record<number, 'Draft' | 'Pending' | 'Active' | 'Rejected'> = {
  [JOB_STATUS.DRAFT]: 'Draft',
  [JOB_STATUS.PENDING]: 'Pending',
  [JOB_STATUS.ACTIVE]: 'Active',
  [JOB_STATUS.REJECTED]: 'Rejected',
};

export function normalizeJobStatus(input: number | string | undefined | null): { code: number; name: 'Draft' | 'Pending' | 'Active' | 'Rejected' } {
  if (typeof input === 'number') {
    const code = [0,1,2,3].includes(input) ? input : 0;
    return { code, name: JOB_STATUS_LABEL[code] };
  }
  if (typeof input === 'string') {
    const s = input.trim().toLowerCase();
    const name = s === 'draft' ? 'Draft'
      : s === 'pending' || s === 'pending approval' ? 'Pending'
      : s === 'active' || s === 'approved' ? 'Active'
      : 'Rejected';
    const code = name === 'Draft' ? JOB_STATUS.DRAFT
      : name === 'Pending' ? JOB_STATUS.PENDING
      : name === 'Active' ? JOB_STATUS.ACTIVE
      : JOB_STATUS.REJECTED;
    return { code, name };
  }
  return { code: JOB_STATUS.DRAFT, name: 'Draft' };
}


// Application status codes (0..4) numeric-only for manage-application buckets
export const APPLICATION_STATUS = {
  PENDING: 0,
  SHORTLISTED: 1,
  PENDING_ACCEPTANCE: 2,
  ACCEPTED: 3,
  HIRED: 4,
  REJECTED: 5,
  DECLINED: 6,
  WITHDRAWN: 7
} as const;

export const APPLICATION_STATUS_LABEL: Record<number, string> = {
  [APPLICATION_STATUS.NEW]: 'New application',
  [APPLICATION_STATUS.SHORTLISTED]: 'Short listed',
  [APPLICATION_STATUS.PENDING_ACCEPTANCE]: 'Pending acceptance',
  [APPLICATION_STATUS.ACCEPTED]: 'Accepted',
  [APPLICATION_STATUS.REJECTED]: 'Rejected',
};

export function normalizeApplicationStatus(input: number | string | undefined | null): { code: number; name: string } {
  if (typeof input === 'number') {
    const code = [0,1,2,3,4].includes(input) ? input : 0;
    return { code, name: APPLICATION_STATUS_LABEL[code] };
  }
  const s = (input || '').toString().trim().toLowerCase();
  const name = s === 'shortlisted' || s === 'short listed' ? 'Short listed'
    : (s === 'pending_acceptance' || s === 'pending-acceptance' || s === 'offered' || s === 'offer_sent') ? 'Pending acceptance'
    : (s === 'accepted' || s === 'offer_accepted') ? 'Accepted'
    : (s === 'rejected' || s === 'declined' || s === 'withdrawn' || s === 'expired') ? 'Rejected'
    : 'New application';
  const code = name === 'Short listed' ? APPLICATION_STATUS.SHORTLISTED
    : name === 'Pending acceptance' ? APPLICATION_STATUS.PENDING_ACCEPTANCE
    : name === 'Accepted' ? APPLICATION_STATUS.ACCEPTED
    : name === 'Rejected' ? APPLICATION_STATUS.REJECTED
    : APPLICATION_STATUS.NEW;
  return { code, name };
}
