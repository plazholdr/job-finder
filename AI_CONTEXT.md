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
