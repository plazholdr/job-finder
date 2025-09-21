// Centralized integer-based enums for statuses (CommonJS for Phase A)
// Follows the frozen-enum + bi-directional label map approach

const CompanyVerificationStatus = Object.freeze({
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2
});

const CompanyVerificationStatusLabel = Object.freeze({
  [CompanyVerificationStatus.PENDING]: 'pending',
  [CompanyVerificationStatus.APPROVED]: 'approved',
  [CompanyVerificationStatus.REJECTED]: 'rejected'
});

const InviteStatus = Object.freeze({
  PENDING: 0,
  ACCEPTED: 1,
  DECLINED: 2,
  EXPIRED: 3
});

const InviteStatusLabel = Object.freeze({
  [InviteStatus.PENDING]: 'pending',
  [InviteStatus.ACCEPTED]: 'accepted',
  [InviteStatus.DECLINED]: 'declined',
  [InviteStatus.EXPIRED]: 'expired'
});

// Backwards-compat exports to avoid touching all imports now
const VERIFICATION_STATUS = CompanyVerificationStatus;
const VERIFICATION_STATUS_LABELS = CompanyVerificationStatusLabel;
const INVITE_STATUS = InviteStatus;
const INVITE_STATUS_LABELS = InviteStatusLabel;

export {
  // Preferred names
  CompanyVerificationStatus,
  CompanyVerificationStatusLabel,
  InviteStatus,
  InviteStatusLabel,
  // Back-compat names (used in current code)
  VERIFICATION_STATUS,
  VERIFICATION_STATUS_LABELS,
  INVITE_STATUS,
  INVITE_STATUS_LABELS
};

