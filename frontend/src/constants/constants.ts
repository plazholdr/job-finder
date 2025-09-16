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


// Application pipeline codes (0..3) used for company manage-application buckets
export const APPLICATION_PIPELINE = {
  NEW: 0,
  SHORTLISTED: 1,
  PENDING_ACCEPTANCE: 2,
  ACCEPTED: 3,
} as const;

export const APPLICATION_PIPELINE_LABEL: Record<number, string> = {
  [APPLICATION_PIPELINE.NEW]: 'New application',
  [APPLICATION_PIPELINE.SHORTLISTED]: 'Short listed',
  [APPLICATION_PIPELINE.PENDING_ACCEPTANCE]: 'Pending acceptance',
  [APPLICATION_PIPELINE.ACCEPTED]: 'Accepted',
};

export function statusToPipelineCode(status: string | number | undefined | null): number {
  if (typeof status === 'number') return [0,1,2,3].includes(status) ? status : 0;
  const s = (status || '').toString().trim().toLowerCase();
  if (s === 'shortlisted') return APPLICATION_PIPELINE.SHORTLISTED;
  if (s === 'pending_acceptance' || s === 'offered') return APPLICATION_PIPELINE.PENDING_ACCEPTANCE;
  if (s === 'accepted' || s === 'offer_accepted') return APPLICATION_PIPELINE.ACCEPTED;
  return APPLICATION_PIPELINE.NEW;
}
