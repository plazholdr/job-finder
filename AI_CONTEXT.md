Project Context and Preferences (for new conversations)

Purpose
- This file summarizes important, previously shared project context so a new conversation can immediately understand key preferences and environment details.
- WARNING: This file contains sensitive information. Do not publish publicly. Prefer moving secrets to environment variables or a secrets manager.

Deployment Details
- Deployment server: 103.209.156.198 (SSH accessible)
- SSH key file: jobfinderopenssh.pem (used to access the server)
- Repo/branch for deployment: https://github.com/plazholdr/job-finder.git, branch: major-change-sebas

CI/CD Preferences
- Get basic functionality working first before implementing CI/CD pipelines
- Prefer CI/CD structured as separate jobs: lint, test, deploy, rollback (not a single job with many steps)
- Remove health checks if not necessary
- Prefer a single sequential workflow: linting → testing → deploy → rollback (rather than separate parallel workflows for staging/production)

Application Preferences
- Registration UX: multi-step forms starting with role selection (Find Jobs vs Hire Talent), not single-page forms
- Media handling: use object storage with the following credentials
  • Access Key: 5AJTYW0DKWU06H5Q7M4K
  • Secret Key: GNHkld/Iq3roFcRVXUyMJ2h7pGpMck9Inv5czf/N
- Backend module style: ES module syntax only (import/export) across the backend
- Status fields: represent as integer enums (0, 1, 2, 3) with mappings in a central constants.js
  • After such changes, run tests to ensure everything works
- Authentication: Feathers-native authentication only (no custom/Express routes)
  • If the 'local' strategy fails, switch to another Feathers-supported strategy while staying Feathers-native
  • Authentication endpoint must be /authentication (not /auth/login)
- API surface: FeathersJS-only API (no ExpressJS endpoints)

Database Configuration (Staging)
- MongoDB URI:
  mongodb+srv://saino365forweb_db_user:dgBXwQFyUwI6LBnI@cluster0.tffyagz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

Notes
- Keep this file private. If you need to commit it, consider encrypting or redacting the secret values and storing real secrets in environment variables (.env) or a secrets manager.
- Update this file if preferences or infrastructure change so future conversations stay aligned with the latest context.



Continuation (Admin Monitoring, Redis, Tests, Status Enums)

Key Decisions and Requirements
- Redis must be running in all environments (remove/avoid using REDIS_DISABLED=true)
  • Default config: redis://localhost:6379 from backend/config/default.json (override with REDIS_URI)
  • Rate limiting middleware relies on Redis; when Redis is not ready, middleware skips rate limiting
  • Refresh tokens are stored in Redis; logic now catches Redis errors but production should have Redis available
- All status fields persisted in Mongo must be integers; refer to backend/src/constants/enums.js
  • Job listings: 0=draft, 1=pending_approval, 2=active, 3=closed
  • Company verification (VERIFICATION_STATUS): integers (e.g., pending/approved/rejected)
- Feathers-native authentication only; /authentication endpoint; no Express custom routes

Recent Backend Changes (summary)
- Admin Monitoring Service
  • New endpoints: GET /admin/monitoring and GET /admin/monitoring/overview (admin-only)
  • /admin/monitoring?type=pending_jobs → lists pending job listings
  • /admin/monitoring?type=pending_companies → lists companies pending verification
  • Documented in backend/docs/API.md (openapi.yaml update pending)
- Job Listings Service
  • Enforced role-based visibility: students see ACTIVE only; companies see own listings; admins see all
  • Status transitions validated: draft → pending → active → closed; admin approve/reject; company close
  • Notifications emitted on key transitions, but see Notifications section below
- Redis Integration
  • backend/src/redis.js: connects using REDIS_URI or config redis; logs connection errors once; sets app.set('redis')
  • Rate limiter (backend/src/middleware/rate-limit.js) now skips when Redis not ready; no hard failure
  • Refresh token issuance and rotation catch Redis errors but expect Redis present in production
- Mongoose/Test Environment
  • backend/src/mongoose.js: in test, if MONGODB_URI is not set, connection is left to tests (MongoMemoryServer)
  • Prevents double-connect during Jest runs
- Authentication/Users
  • users.hooks.js: requireVerifiedCompany allows a company to access its own user record (fixes login flow for unverified companies)

Notifications
- The notifications schema currently enforces enum types: [invite_sent, invite_accepted, invite_declined, kyc_submitted, kyc_approved, kyc_rejected, message, system]
- Interim change: to avoid schema errors, non-existing types (company_submitted, company_approved, job_submitted, job_update, etc.) are sent as type="system" with descriptive titles/bodies
- Follow-up option: extend the notifications type enum to include the new granular types and update all emitters accordingly

Testing and Jest (ESM)
- Jest runs with Node flag --experimental-vm-modules to support ESM imports
- Test DB uses mongodb-memory-server (configured in backend/test/setup.js)
- Primary end-to-end test added: backend/test/services/job-listings.test.js covering
  • Bootstrap admin/company/student → create company → admin approves → company creates/submits listing → admin approves → student sees active listing
- Tip: run single test via: yarn test --runTestsByPath test/services/job-listings.test.js

Operational Notes
- Local Redis requirement: ensure a Redis server is running on 127.0.0.1:6379 or provide REDIS_URI. Docker Desktop must be running to use docker-compose defined at backend/docker-compose.yml.
- If Redis is down, app logs: ECONNREFUSED 127.0.0.1:6379, and rate-limiter is skipped. Refresh token storage attempts are wrapped in try/catch but production should not rely on this fallback.

Open Items / Next Steps
- OpenAPI (backend/openapi.yaml): add documentation for /admin/monitoring and /admin/monitoring/overview (docs/API.md already updated)
- Notifications: decide whether to expand enum to include company_* and job_* types, then update emitters and tests
- Scheduler: optional follow-up to auto-close job listings at expiresAt and send pre-expiry reminders
- CI: later integrate sequential jobs (lint → test → deploy → rollback) as per preferences



Continuation (Frontend, Routing, and Recent Fixes)

Overview
- Frontend uses Next.js 15 App Router with Ant Design. Yarn is the package manager of choice (avoid npm). Turbopack is enabled in dev/build.
- Backend is FeathersJS-only API (no Next.js API routes, no custom Express routes) and remains the single API surface under /authentication, etc.
- Object Storage is used for media; logos use NEXT_PUBLIC_STORAGE_URL.

Environment Variables (frontend)
- NEXT_PUBLIC_API_BASE_URL → e.g., http://localhost:3030 (see frontend/config/index.js)
- NEXT_PUBLIC_STORAGE_URL → object storage base URL for logos/assets

Yarn/Turbopack and lockfiles
- Prefer Yarn: ensure any package-lock.json files are removed (both at repo root and frontend/). Keep only yarn.lock.
- If Next.js warns about inferred workspace root due to multiple lockfiles, delete stray package-lock.json and restart dev.

Recent Frontend Features and Fixes
- Company page implemented with modular components (Ant Design):
  • components/CompanyHeader.js – logo, name, industry tags, website, description
  • components/CompanyContactInfo.js – reg no, business nature, email, phone, website, full address
  • components/CompanyInternshipsList.js – internship listings: title, posted date, duration, location, salary range
  • app/companies/[id]/page.js integrates these modules
- Job card navigation:
  • components/JobCard.js: whole card clickable with router.push(`/jobs/${job._id}`); Save/Like buttons stop propagation
- Job detail route fixes:
  • app/jobs/[id]/page.js: fetches data server-side and renders through a Client wrapper
  • components/JobDetailClient.js (client) renders the page UI
  • components/JobDetailActions.js (client) holds interactive Apply/Save/Like buttons
- Hydration mismatch fix:
  • components/Providers.js now initializes theme with a stable default ('light') and hydrates from localStorage on mount to avoid SSR/CSR mismatch

Next.js App Router patterns (Server vs Client)
- Dynamic params in server components (Next 15): await params before reading fields.
  Example: const { id } = await params; // in an async Server Component
- Never pass event handlers from a Server Component to a Client Component prop; instead, move interactive UI into a Client Component and compose it from the Server Component.
- Use fetch in Server Components with revalidate when appropriate (e.g., { next: { revalidate: 60 } }).

Routing and Ingress: Decision for Production
- Chosen approach: Use Nginx as the single public-facing reverse proxy. Reasons:
  • Central TLS termination, HTTP/2, compression, caching, and headers hardening
  • Simple path-based routing between Next.js frontend and Feathers API
  • Better control for static assets and large uploads
- Do NOT use Next.js API routes for backend endpoints. Keep FeathersJS as the only API and call it directly from the frontend (server/client) using NEXT_PUBLIC_API_BASE_URL.

Recommended Production Topology
- Nginx (443/80)
  • / → proxies to Next.js server (port 3000 or a process manager like PM2)
  • /_next/static and /_next/image → proxy to Next.js as usual (Nginx can cache static content)
  • /api/… and /authentication → proxy to FeathersJS backend (e.g., port 3030)
  • WebSockets: enable proxy_set_header Upgrade / Connection for Feathers real-time

Sample Nginx snippet (adjust hostnames/paths/SSL as needed)

server {
    listen 80;
    server_name example.com;

    # Frontend (Next.js)
    location /_next/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API (FeathersJS)
    location /api/ {
        proxy_pass http://127.0.0.1:3030/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /authentication {
        proxy_pass http://127.0.0.1:3030/authentication;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

Development vs Production
- Dev: run yarn dev for Next.js; Feathers on 3030; no Nginx needed locally.
- Prod: run Next.js with PM2 or systemd; run Feathers with PM2/systemd; front with Nginx.

Common Error Playbook
- Error: "Route used params.id — params should be awaited" → use const { id } = await params in server components.
- Error: "Event handlers cannot be passed to Client Component props" → move handlers into a dedicated Client Component (e.g., JobDetailActions) and compose it.
- Hydration error after navigation → avoid reading localStorage during initial render; hydrate state in useEffect (Providers.js already fixed).

Other Notes
- Ant Design is the standard UI library.
- date-fns installed for date formatting in company/internship lists.
- Keep styles in app/globals.css when possible, and prefer AntD tokens for color/spacing.

Open Follow-ups
- Confirm and set NEXT_PUBLIC_STORAGE_URL to display company logos from object storage.
- Confirm Nginx deployment details (domain, SSL certs) and provision PM2 scripts for Next.js and Feathers.
- Optionally add caching headers for static assets and images via Nginx.



Continuation (Authentication Flow, Password Reset, Company Registration)

Recent Authentication and Registration Features
- Complete password reset flow implemented:
  • POST /password-reset (request reset email with token)
  • PATCH /password-reset (reset password using token + email)
  • frontend/app/forgot-password/page.js - request reset form
  • frontend/app/reset-password/page.js - reset form with token validation and expiry countdown
  • Tokens expire in 30 minutes (configurable via PASSWORD_RESET_EXPIRES_MINUTES)
  • Email links use PUBLIC_WEB_URL environment variable for proper domain resolution

- Email verification system:
  • POST /email-verification (request verification email)
  • PATCH /email-verification (verify with token)
  • frontend/app/verify-email/page.js - handles verification and routes appropriately
  • Supports company registration flow with forCompany=1 parameter

- Separate company registration flow:
  • frontend/app/register-company/page.js - initial account creation (username/password/email)
  • frontend/app/company/setup/page.js - company information form with SSM Superform upload
  • Unique company registration number validation (backend enforces uniqueness with 409 conflict)
  • Integration with existing /companies and /company-verifications endpoints
  • Auto-approval workflow: company submits → admin approves via existing endpoints

Registration Flow Architecture
- Student registration: /register → multi-step wizard → email verification → dashboard
- Company registration: /register-company → account creation → email verification → /company/setup → approval workflow
- Shared authentication: login and password reset work for both user types
- Role-based routing: email verification redirects appropriately based on forCompany parameter

Backend Enhancements
- Password reset service (backend/src/services/password-reset/password-reset.service.js):
  • Crypto token generation with configurable expiry
  • Integration with existing mailer utility
  • Secure password update with token validation
- Company uniqueness validation (backend/src/services/companies/companies.hooks.js):
  • Pre-create hook checks registrationNumber uniqueness
  • Returns 409 conflict with company ID if duplicate found
- Email verification enhanced to support company flow routing

Frontend Architecture Decisions
- Separate registration routes for clarity (/register vs /register-company)
- Shared login page with link to company registration
- Consistent form patterns using Ant Design Form components
- Proper Suspense boundaries for useSearchParams compatibility in Next.js 15

Environment Configuration
- PUBLIC_WEB_URL: Required for email links to resolve to correct domain (not webmail sites)
- Example: PUBLIC_WEB_URL=https://your-domain.com or http://103.209.156.198

Postman Collection Updates
- Added password reset endpoints with proper request/response examples
- Added email verification endpoints for both request and verification
- Enhanced company endpoints with phone field and additional CRUD operations
- Collection-level authentication with automatic token refresh:
  • Pre-request script checks token expiration and refreshes if needed
  • Test script handles 401 responses by refreshing tokens automatically
  • Bearer token inheritance for all authenticated endpoints
  • No-auth override for public endpoints (health, login, registration, password reset)

Testing Recommendations
- Test complete password reset flow: request → email → reset → login
- Test company registration: account creation → email verification → company setup → approval
- Verify email links resolve to correct domain (not temp-mail.org)
- Test token refresh automation in Postman collection

Email Verification Flow Fixes (Latest)
- 24-hour tokenized verification links:
  • Backend generates a token stored on the user with an expiry 24h from issuance
  • Email link now includes token+email: /verify-email?token=...&email=...&forCompany=1
  • PATCH /email-verification requires { email, token } and enforces expiry/validity
  • Email templates updated to say “expires in 24 hours”
- Frontend verification page:
  • Reads token/email from URL, calls PATCH, then redirects to /login?next=/company/setup (company flow)
  • Provides a “Resend verification email” action on error
- Service hooks:
  • users.hooks.js allows internal service patches to persist system fields (token/expiry) while still restricting external patches
- Additional frontend cleanups:
  • Fixed React Hook dependency warnings; escaped apostrophes; ensured proper Suspense boundaries for useSearchParams
  • Replaced static Modal.info where appropriate to avoid context warnings

Build and Deployment Readiness
- All ESLint errors resolved for production builds
- Proper error handling for duplicate company registration numbers
- Modal context warnings eliminated using Ant Design's useModal hook
- Frontend builds successfully with Turbopack and passes all linting checks

Current Company Registration and Approval Flow (Working)
1. /register-company → create account with email/password (role=company)
2. Verification email sent with a 24h link: /verify-email?token=...&email=...&forCompany=1
3. Click link → email verified → redirect to /login?next=/company/setup
4. Sign in:
   • If no submission yet → forced to /company/setup to complete company details and upload SSM Superform
   • After submitting (pending admin approval) → login is blocked with a modal and redirect to /company/pending-approval
5. After admin approves → login succeeds; CompanyStatusGate continues to nag for missing profile fields (logo, description, industry, address, PIC name/email/phone, website) until completed
6. Global enforcement via CompanyStatusGate:
   • No company and no pending submission → force /company/setup
   • Pending submission or unapproved company → force /company/pending-approval
   • Approved → allow normal navigation; show occasional “Complete your company profile” modal if required fields are missing



Continuation (Job Listing Management, Company Admin Flows, Status-Based Actions)

Company Job Listing Management System
- Comprehensive job listing creation wizard implemented:
  • Multi-step form: Job Details → Project Details → Onboarding Materials → Publish Settings
  • Draft/Submit for Approval functionality with backend status transitions
  • File upload support for onboarding materials (general and job-specific)
  • PIC (Person In Charge) details integrated into job listings
  • Expiry date management with automatic calculations

Status-Based Company Admin Actions
- Draft listings (status = 0):
  • "Continue editing" and "View" buttons on company profile cards
  • Edit page with "Discard changes?" confirmation modal on cancel
  • Save as draft or submit for approval options

- Pending approval listings (status = 1):
  • View job listing details, project details, and onboarding materials
  • PIC-only editing capability (name, phone, email) while pending
  • Backend enforcement prevents editing other fields during pending status
  • "Edit PIC" quick action on cards with auto-opening modal
  • PIC update notifications sent to admins
  • Visual indicators: "PIC updated" tags and timestamps

- Active listings (status = 2):
  • View all details and materials
  • "Close job" functionality from detail page and card quick actions
  • Confirmation modal with explanation of public visibility removal
  • Auto-redirect to Past tab after closing

- Closed/Past listings (status = 3):
  • View-only access to job listing and project details
  • No edit actions available
  • Public URLs show "Job unavailable" message

Company Profile Enhancements
- Extended job tabs: Draft, Pending, Active, Past (with counts)
- List/grid view toggle with pagination
- Deep-linkable tabs via URL parameters (?tab=past)
- Company-specific job detail routing (/company/jobs/[id] vs public /jobs/[id])
- Role-based card actions and visibility

Backend Job Management Features
- Status transition validation and authorization
- PIC update tracking with picUpdatedAt field
- Notification system for status changes and PIC updates
- Admin approval/rejection workflows
- Company close job functionality
- Role-based access control for job visibility

Job Expiry and Renewal System
- Automatic expiry warnings (7 days before expiration)
- Company renewal request workflow
- Admin approval required for renewals (Option A implementation)
- Background scheduler for auto-expiry and notifications
- Renewal request management in admin dashboard

Admin Management Tools
- Admin dashboard with key metrics and quick access panels
- Renewal requests management page with server-side filtering
- Company verification management
- Job listing approval workflows
- Notification system for admin actions

Technical Implementation Details
- Integer-based status enums with centralized mapping (constants.js)
- Server-side filtering for admin endpoints to improve performance
- Real-time notifications with type-based routing
- File upload integration with object storage (IPServerOne S3)
- Comprehensive error handling and user feedback
- Mobile-responsive design with Ant Design components

Current Development Status
- All major company admin flows implemented and tested
- Job listing lifecycle management complete
- Admin tools functional with proper authorization
- Notification system operational
- Ready for production deployment with existing infrastructure



Continuation (Enhanced Development Environment and Project Configuration)

MCP Setup and Project Context
- Comprehensive project configuration established for enhanced AI assistance
- Project structure documentation with technology stack definitions
- Development workflow configurations and design system specifications
- Enhanced package scripts for testing, code generation, and development utilities

Technology Stack Details
- Frontend: Next.js 15.5.3 with Ant Design 5.27.4 and TanStack Query 5.89.0
- Backend: FeathersJS 5.0.35 with MongoDB/Mongoose 8.18.1 and Redis 5.8.2
- Authentication: FeathersJS native JWT authentication
- Storage: IPServerOne S3-compatible object storage
- Testing: Cypress for E2E/component testing, Jest 30.1.3 for unit testing
- Deployment: Manual deployment to 103.209.156.198 from major-change-sebas branch

Development Tools and Helpers
- Component generator for React components (scripts/dev-helpers.js)
- Service generator for FeathersJS services
- Enhanced package.json scripts for testing and development workflows
- Design system documentation (frontend/design-system.md)
- Cypress configuration for comprehensive testing setup

Code Standards and Architecture
- ES module syntax (import/export) enforced across backend
- Integer enum status fields (0,1,2,3) with central constants mapping
- FeathersJS-native authentication only (no Express routes)
- API endpoint standardization: /authentication for auth
- Microservices architecture with RESTful API and Socket.IO real-time features

Design System Guidelines
- Ant Design as primary UI framework with CSS-in-JS theming
- Mobile-first responsive design approach
- WCAG 2.1 AA accessibility compliance target
- Consistent component patterns and layout structures
- Custom theming and brand integration capabilities

Development Workflow Enhancements
- Parallel tool execution for maximum efficiency
- Structured task management for complex development work
- Package manager enforcement (prefer yarn, avoid manual package.json edits)
- Testing-first approach with comprehensive test coverage
- Code generation utilities for faster development cycles

Project Context Integration
- Real-time codebase indexing for accurate context retrieval
- Framework-specific assistance with Next.js 15 and FeathersJS 5
- Design pattern recommendations aligned with Ant Design best practices
- Performance optimization guidance for React/Node.js stack
- Deployment and infrastructure guidance for production readiness




Continuation (Company Application Management Workflow)

Overview
- Company admins can view and manage applications submitted to their job listings.
- Visibility: A company can only access applications where application.companyId = their company._id. Students see only their own applications. Admins see all.

Company Admin View (per application)
- Job details (title, project timeline, PIC, location, salary range)
- Intern application information (full application PDF + structured fields)
  • Candidate statement
  • Application validity (validityUntil)
  • Personal information (from application.form)
  • Internship details
  • Course information
  • Assignment information

Application Status (integer enums; see backend/src/constants/enums.js)
- 0 = NEW (submitted)
- 1 = SHORTLISTED
- 2 = INTERVIEW_SCHEDULED (optional step)
- 3 = PENDING_ACCEPTANCE (offer sent; waiting for applicant)
- 4 = ACCEPTED (aka Hired)
- 5 = REJECTED
- 6 = WITHDRAWN (by applicant)
- 7 = NOT_ATTENDING (interview no-show)

Rejection Attribution and Reason
- When status becomes REJECTED, capture:
  • rejection.by: 'company' | 'applicant' | 'system'
  • rejection.reason: non-empty string explaining why (required for 'company')
  • rejectedAt: timestamp
- Auto-rejections set an appropriate reason (see rules below).

Lifecycle and Actions (performed via PATCH /applications/:id with { action, ...payload })
- Company → 'shortlist' when status=NEW → status=SHORTLISTED
- Company → 'sendOffer' when status in [SHORTLISTED, INTERVIEW_SCHEDULED]
  • Payload: { title, notes, validUntil?, letterKey? }
  • System stores offer: { sentAt, validUntil, title, notes, letterKey }
  • Status auto→ PENDING_ACCEPTANCE
- Company → 'reject' when status in [NEW, SHORTLISTED, INTERVIEW_SCHEDULED, PENDING_ACCEPTANCE]
  • Payload: { reason } (mandatory)
  • Status → REJECTED; rejection.by='company'
- Student → 'acceptOffer' when status=PENDING_ACCEPTANCE
  • Status → ACCEPTED (Hired)
  • Auto-create EmploymentRecord linked to application; status initially ONGOING (or UPCOMING until startDate, then ONGOING)
  • Auto-send onboarding guide to candidate
- Student → 'declineOffer' when status=PENDING_ACCEPTANCE
  • Status → REJECTED; rejection.by='applicant'
- Student → 'withdraw' when status in [NEW, SHORTLISTED, INTERVIEW_SCHEDULED, PENDING_ACCEPTANCE]
  • Status → WITHDRAWN

Validity Rules and Automation
- Application validity (application.validityUntil)
  • If no company action occurs before validityUntil, system auto-rejects
    – Status → REJECTED; rejection.by='company'; reason='Expired: no action within validity'
- Offer validity (application.offer.validUntil)
  • If the candidate does not accept by this date, system auto-rejects
    – Status → REJECTED; rejection.by='applicant'; reason='Offer expired without acceptance'
- Scheduler responsibility
  • Background job scans for expired applications/offers and applies the above transitions daily/hourly.

Documents and Storage
- Application PDF is generated and stored (applications/<id>.pdf); available to company admins.
- Offer letter upload: store in object storage; save key as application.offer.letterKey.

Notifications
- On key transitions, send notifications to the other party:
  • application_created, application_shortlisted, interview_scheduled/cancelled, application_rejected,
    offer_sent, offer_accepted, offer_declined, application_withdrawn
- On offer acceptance, also send onboarding guide to the applicant.

Employment Record on Hire
- When an offer is accepted, create EmploymentRecord linked to { applicationId, jobListingId, userId, companyId }.
- Initial status: ONGOING (or set UPCOMING and auto-switch to ONGOING on the job start date).
- Required onboarding documents may be seeded (e.g., contract, NDA).

Frontend Notes
- Company dashboard should surface a tab/filter for NEW applications and an application detail view matching the information list above.
- Provide actions as buttons with confirmations and required inputs (e.g., rejection reason, offer validity picker, file upload for offer letter).
- Show validity countdowns for both application and offer phases.



Continuation (Search Profiles service, Role‑based Home, Titles/Favicon)

Overview
- Implemented a dedicated Feathers service for saved search profiles instead of embedding under /users. Resource: /search-profiles
- Rationale: separation of concerns, per-resource RBAC, evolvable schema for different kinds (intern vs company), clean analytics, and simple upsert semantics
- Frontend now uses role-based homepage:
  • Company users see Interns search (filters + list/grid results)
  • Students see existing Jobs + Companies sections

Backend – Search Profiles
- Model: backend/src/models/search-profiles.model.js
  • Fields: userId (owner), kind ('intern' | 'company'), optional name, filters {}
  • Unique index: (userId, kind) → one profile per kind per user (can be relaxed later)
  • Filters schema covers both kinds; unused keys are simply omitted
- Service: backend/src/services/search-profiles/search-profiles.service.js
  • Auth: JWT required
  • find: returns only current user’s profiles, optional ?kind
  • create: upsert by kind (idempotent save)
  • get/patch/remove: owner or admin
- Registration: backend/src/services/index.js → app.configure(searchProfiles)
- OpenAPI: backend/openapi.yaml
  • Paths: /search-profiles (GET, POST), /search-profiles/{id} (GET, PATCH, DELETE)
  • Schemas: SearchProfileFilters, SearchProfile
- Postman: backend/docs/postman/SearchProfiles.postman_collection.json with examples for both kinds

Frontend – Usage and Wiring
- Company (searching interns)
  • Save profile: POST /search-profiles { kind: 'intern', filters: { fieldOfStudy, preferredStartDate, preferredEndDate, locations[], salaryRange{min,max} } }
  • Home UI: company sees Intern filters + results powered by /programme-candidates; card component: components/InternCard.js
- Student (searching companies/jobs)
  • Save profile: POST /search-profiles { kind: 'company', filters: { keyword, nature, location, salaryRange{min,max}, sort } }
  • Home UI: on load, auto-applies saved profile (GET /search-profiles?kind=company) to prefill filters
  • Code: components/HomeContent.js (studentSearchProfileQuery + useEffect prefill)

Titles and Favicon
- Title template: frontend/app/layout.js → metadata.title = { default: "JobFinder", template: "%s | JobFinder" }
- Home page title: frontend/app/page.js → export const metadata = { title: "Home" } (renders "Home | JobFinder")
- Favicon: frontend/public/favicon.svg referenced via metadata.icons.icon = "/favicon.svg"

Notes / Next Steps
- Optional: Auto-apply company’s saved intern search profile on load (GET /search-profiles?kind=intern)
- Optional: Add a simple “Manage Search Profile” page under both user and company menus
- Future: To support multiple saved profiles per kind, drop the unique index and add name + isDefault; update service and UI accordingly
- Consider unifying Postman entries by also adding /search-profiles to the main Job Finder API collection
