const STATUS = {
  PENDING: 0,
  ACCEPTED: 1,
  REJECTED: 2,
};

const STATUS_TEST = {
  PENDING: 0,
  ACCEPTED: 1,
  REJECTED: 2,
};

const LABELS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};

const ENTITY = {
  OFFER: {
    STRINGS: {
      PENDING: 'pending',
      ACCEPTED: 'accepted',
      REJECTED: 'rejected',
      WITHDRAWN: 'withdrawn',
      EXPIRED: 'expired',
      NEGOTIATING: 'negotiating',
    },
  },
  VERIFICATION: {
    STRINGS: {
      PENDING: 'pending',
      VERIFIED: 'verified',
      REJECTED: 'rejected',
    },
  },
  APPROVAL: {
    STRINGS: {
      PENDING: 'pending',
      APPROVED: 'approved',
      REJECTED: 'rejected',
    },
  },
};

// Job status codes and labels (0..4)
const JOB_STATUS = {
  DRAFT: 0,
  PENDING: 1,
  ACTIVE: 2,
  REJECTED: 3,
  CLOSED: 4,
};

const JOB_STATUS_LABEL = {
  [JOB_STATUS.DRAFT]: 'Draft',
  [JOB_STATUS.PENDING]: 'Pending',
  [JOB_STATUS.ACTIVE]: 'Active',
  [JOB_STATUS.REJECTED]: 'Rejected',
  [JOB_STATUS.CLOSED]: 'Closed',
};

// Normalize input (number or string) to { code, name }
function normalizeJobStatus(input) {
  if (typeof input === 'number') {
    const code = [0,1,2,3,4].includes(input) ? input : 0;
    return { code, name: JOB_STATUS_LABEL[code] };
  }
  if (typeof input === 'string') {
    const s = input.trim().toLowerCase();
    const name = s === 'draft' ? 'Draft'
      : s === 'pending' || s === 'pending approval' ? 'Pending'
      : s === 'active' || s === 'approved' ? 'Active'
      : s === 'rejected' ? 'Rejected'
      : s === 'closed' || s === 'close' ? 'Closed'
      : 'Draft';
    const code = name === 'Draft' ? JOB_STATUS.DRAFT
      : name === 'Pending' ? JOB_STATUS.PENDING
      : name === 'Active' ? JOB_STATUS.ACTIVE
      : name === 'Rejected' ? JOB_STATUS.REJECTED
      : JOB_STATUS.CLOSED;
    return { code, name };
  }
  return { code: JOB_STATUS.DRAFT, name: 'Draft' };
}

// Application pipeline codes (0..3)
const APPLICATION_PIPELINE = {
  NEW: 0,
  SHORTLISTED: 1,
  PENDING_ACCEPTANCE: 2,
  ACCEPTED: 3,
};

const APPLICATION_PIPELINE_LABEL = {
  [APPLICATION_PIPELINE.NEW]: 'New application',
  [APPLICATION_PIPELINE.SHORTLISTED]: 'Short listed',
  [APPLICATION_PIPELINE.PENDING_ACCEPTANCE]: 'Pending acceptance',
  [APPLICATION_PIPELINE.ACCEPTED]: 'Accepted',
};

// Helper: map detailed backend status strings to pipeline code
function statusToPipelineCode(status) {
  const s = (status || '').toString().trim().toLowerCase();
  if (s === 'shortlisted') return APPLICATION_PIPELINE.SHORTLISTED;
  if (s === 'pending_acceptance' || s === 'offered') return APPLICATION_PIPELINE.PENDING_ACCEPTANCE;
  if (s === 'accepted' || s === 'offer_accepted') return APPLICATION_PIPELINE.ACCEPTED;
  return APPLICATION_PIPELINE.NEW; // submitted/under_review/etc → New application
}


module.exports = {
  STATUS,
  LABELS,
  ENTITY,
  JOB_STATUS,
  JOB_STATUS_LABEL,
  normalizeJobStatus,
  APPLICATION_PIPELINE,
  APPLICATION_PIPELINE_LABEL,
  statusToPipelineCode,
};
