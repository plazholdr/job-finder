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

// Application status codes (0..7) — numeric only
const APPLICATION_STATUS = {
  PENDING: 0,               // Application submitted / under review
  SHORTLISTED: 1,           // Short listed
  PENDING_ACCEPTANCE: 2,    // Offer sent, waiting for candidate
  ACCEPTED: 3,              // Candidate accepted offer
  HIRED: 4,                 // Candidate hired/onboarded
  REJECTED: 5,              // Rejected by company or auto-expired
  DECLINED: 6,              // Candidate declined offer
  WITHDRAWN: 7              // Withdrawn by candidate/company
};

const APPLICATION_STATUS_LABEL = {
  [APPLICATION_STATUS.PENDING]: 'Pending',
  [APPLICATION_STATUS.SHORTLISTED]: 'Short listed',
  [APPLICATION_STATUS.PENDING_ACCEPTANCE]: 'Pending acceptance',
  [APPLICATION_STATUS.ACCEPTED]: 'Accepted',
  [APPLICATION_STATUS.HIRED]: 'Hired',
  [APPLICATION_STATUS.REJECTED]: 'Rejected',
  [APPLICATION_STATUS.DECLINED]: 'Declined',
  [APPLICATION_STATUS.WITHDRAWN]: 'Withdrawn'
};

// Normalize various inputs to the numeric application status
function normalizeApplicationStatus(input) {
  if (typeof input === 'number') {
    const code = [0,1,2,3,4,5,6,7].includes(input) ? input : 0;
    return { code, name: APPLICATION_STATUS_LABEL[code] };
  }
  const s = (input || '').toString().trim().toLowerCase();
  const name = (s === 'pending' || s === 'new' || s === 'applied' || s === 'submitted') ? 'Pending'
    : (s === 'shortlisted' || s === 'short listed') ? 'Short listed'
    : (s === 'pending_acceptance' || s === 'pending-acceptance' || s === 'offered' || s === 'offer_sent') ? 'Pending acceptance'
    : (s === 'accepted' || s === 'offer_accepted') ? 'Accepted'
    : (s === 'hired' || s === 'onboarded') ? 'Hired'
    : (s === 'declined' || s === 'offer_declined') ? 'Declined'
    : (s === 'withdrawn' || s === 'withdraw') ? 'Withdrawn'
    : (s === 'rejected' || s === 'expired') ? 'Rejected'
    : 'Pending';
  const code = name === 'Pending' ? APPLICATION_STATUS.PENDING
    : name === 'Short listed' ? APPLICATION_STATUS.SHORTLISTED
    : name === 'Pending acceptance' ? APPLICATION_STATUS.PENDING_ACCEPTANCE
    : name === 'Accepted' ? APPLICATION_STATUS.ACCEPTED
    : name === 'Hired' ? APPLICATION_STATUS.HIRED
    : name === 'Declined' ? APPLICATION_STATUS.DECLINED
    : name === 'Withdrawn' ? APPLICATION_STATUS.WITHDRAWN
    : APPLICATION_STATUS.REJECTED; // default to Rejected for unknown strings
  return { code, name };
}

module.exports = {
  STATUS,
  LABELS,
  ENTITY,
  APPLICATION_STATUS,
  JOB_STATUS,
  JOB_STATUS_LABEL,
  normalizeJobStatus,
  APPLICATION_STATUS,
  APPLICATION_STATUS_LABEL,
  normalizeApplicationStatus,
};
