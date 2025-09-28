import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipientUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  recipientRole: { type: String, enum: ['student','company','admin'], required: true },
  type: { type: String, enum: [
    'invite_sent','invite_accepted','invite_declined',
    'kyc_submitted','kyc_approved','kyc_rejected','kyc_review_required',
    'email_verification','email_verified',
    'job_submitted','job_update','job_expiring','job_expired','job_renewal_requested','job_renewal_approved',
    // Applications lifecycle
    'application_created','application_shortlisted','interview_scheduled','interview_cancelled','interview_declined','interview_noshow',
    'offer_sent','offer_accepted','offer_declined','offer_expiring','offer_expired',
    'application_withdrawn','application_rejected','application_pdf_regenerated',
    // Employment lifecycle
    'employment_started','employment_moved_to_closure','employment_completed','employment_terminated',
    // Timesheets
    'timesheet_submitted','timesheet_approved','timesheet_rejected','timesheet_reminder',
    // Extension/Termination/Completion requests
    'extension_requested','extension_approved','extension_rejected',
    'termination_requested','termination_approved','termination_rejected',
    'resignation_requested','resignation_approved','resignation_rejected',
    'early_completion_requested','early_completion_approved','early_completion_rejected',
    // Reminders
    'closure_reminder',
    // Shares
    'share_opened',
    // Generic
    'onboarding_guide','message','system'
  ], required: true },
  title: String,
  body: String,
  data: { type: Object },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);

