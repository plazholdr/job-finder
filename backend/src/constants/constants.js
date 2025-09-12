// Central constants only — no logic functions here.
// Tri-state code mapping used across the app.
// 0=pending, 1=accepted/approved/verified, 2=rejected/declined

const STATUS = Object.freeze({
  PENDING: 0,
  ACCEPTED: 1,
  REJECTED: 2,
});

// Canonical string labels to use when also storing string alongside code
const LABELS = Object.freeze({
  PENDING: 'pending',
  ACCEPTED: 'accepted', // or 'approved'/'verified' depending on domain usage
  REJECTED: 'rejected', // or 'declined'
});

// Domain-specific status groups (string names expected by existing UI/routes)
const ENTITY = Object.freeze({
  OFFER: Object.freeze({
    // legacy string names still used by FE in some places
    STRINGS: Object.freeze({
      PENDING: 'pending',
      ACCEPTED: 'accepted',
      REJECTED: 'rejected',
      WITHDRAWN: 'withdrawn',
      EXPIRED: 'expired',
      NEGOTIATING: 'negotiating',
    }),
  }),
  VERIFICATION: Object.freeze({
    STRINGS: Object.freeze({
      PENDING: 'pending',
      VERIFIED: 'verified', // maps to code 1
      REJECTED: 'rejected', // maps to code 2
    }),
  }),
  APPROVAL: Object.freeze({
    STRINGS: Object.freeze({
      PENDING: 'pending',
      APPROVED: 'approved', // maps to code 1
      REJECTED: 'rejected', // maps to code 2
    }),
  }),
});

module.exports = {
  STATUS,
  LABELS,
  ENTITY,
};
