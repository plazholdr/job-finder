const STATUS = {
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

module.exports = {
  STATUS,
  LABELS,
  ENTITY,
};
