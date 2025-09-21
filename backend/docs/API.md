## Job Finder API Documentation (FeathersJS v5)

This document covers the currently implemented endpoints in the repository. As new services are added (companies, verifications, invites, messaging, etc.), this document and the Postman collection will be updated accordingly.

### Base URL
- Local (Docker/Desktop or dev): `http://localhost:3030`

### Authentication
- Strategy: Local (email/password) issuing JWT access token (default 15m) and refresh token (7d, stored in Redis)
- Header: `Authorization: Bearer <accessToken>`

### Health
- GET `/health` → 200 OK
  - Response: `{ status, timestamp, uptime }`

---

## Auth

### POST `/authentication` (login)
Body
```
{
  "strategy": "local",
  "email": "user@example.com",
  "password": "Passw0rd!"
}
```
Response 201
```
{
  "accessToken": "<JWT>",
  "refreshToken": "<JWT>",
  "authentication": { ... },
  "user": { _id, email, role, ... }
}
```
Notes
- Collection tests store `accessToken`, `refreshToken`, `userId`, `role` and decode access token exp to `tokenExpiresAt`.

### POST `/refresh-token`
Body
```
{ "refreshToken": "<JWT>" }
```
Response 201
```
{ "accessToken": "<JWT>", "refreshToken": "<JWT>", "user": { ... } }
```
Notes
- Redis holds refresh tokens under `refresh_token:<userId>:<tokenId>` for 7 days.

---

## Users Service
Path: `/users`

Schema (excerpt)
- `_id: ObjectId`
- `email: string (unique)`
- `password: string (hashed)`
- `role: enum('student','company','admin')`
- `profile`: { firstName, lastName, phone, avatar, bio, location{city,state,country} }
- `internProfile`: { university, major, graduationYear, gpa, skills[], resume, portfolio, linkedIn, github, preferences{jobTypes[],locations[],industries[],salaryRange{min,max}} }
- `companyProfile`: { companyName, industry, companySize, website, description, logo, address{street,city,state,country,zipCode} }
- status: `isEmailVerified, isActive, lastLogin`

Security & Hooks
- `create`: public; requires `email`, `password`, `role` (password hashed)
- `find/get`: `authenticate('jwt')`
- `patch/remove`: `authenticate('jwt')`, users update/delete self; admin can update/delete any
- `after`: `protect('password')` never returned

Endpoints

- POST `/users` (register)
  - Student example body:
```
{ "email":"student1@example.com", "password":"Passw0rd!", "role":"student",
  "profile": {"firstName":"Ali","lastName":"Bin Abu"} }
```
  - Company admin example body:
```
{ "email":"company1@example.com", "password":"Passw0rd!", "role":"company",
  "companyProfile": {"companyName":"Acme Sdn Bhd"} }
```

- GET `/users/:id` (requires JWT)
  - Returns user (password stripped)

- GET `/users?role=student` (requires JWT)
  - Standard Feathers query params apply (pagination, filters)

- PATCH `/users/:id` (requires JWT)
```
{ "profile": { "bio": "Hello world" } }
```
  - External providers can only patch their own user (unless admin)

---

## Upload Service
Path: `/upload`

Features
- S3-compatible storage via multer-s3 using env vars (bucket, endpoint, keys). Returns file metadata and signed URL.

Security
- `create` and `remove` require JWT.

Endpoints

- POST `/upload` (multipart/form-data)
  - Fields: `resume`, `avatar`, `logo`, `portfolio[]`, `document[]`
  - Example (Postman form-data): key `resume` type `File` src `{{resumePath}}`
  - Response:
```
{
  "message": "Files uploaded successfully",
  "files": {
    "resume": [ { "key", "originalName", "size", "mimetype", "url", "signedUrl" } ],
    ...
  }
}
```

- GET `/upload/:key` → returns temporary signed URL and public URL for a stored key

- DELETE `/upload/:key` → deletes object

---

## Environment & Running
- Docker Desktop recommended
- `cd backend && docker compose up -d`
- Health: `curl http://localhost:3030/health`

### Auth configuration
- JWT access: `JWT_SECRET`, `JWT_EXPIRES_IN` (default 15m)
- JWT refresh: `JWT_REFRESH_SECRET` optional, else fallback to `JWT_SECRET`; `JWT_REFRESH_EXPIRES_IN` default 7d
- Redis: `REDIS_URI` (compose sets `redis://redis:6379` in container). For local dev without Redis set `REDIS_DISABLED=true`.

### Storage configuration
- `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL`

---

## Postman Setup
Files:
- Collection: `backend/docs/postman/JobFinder.postman_collection.json`
- Environment: `backend/docs/postman/JobFinder.postman_environment.json`

Steps:
1) Import environment and set `email`, `password`, and optional `resumePath`.
2) Register a user (if needed) via `Users / POST /users`.
3) Run `Auth / POST /authentication` to store tokens in environment.
4) Call secured endpoints; collection uses bearer `{{accessToken}}`.
5) When access token expires, call `Auth / POST /refresh-token`.

---

## MongoDB (Atlas)
- Set MONGODB_URI in backend/.env to your Atlas connection string. The code prefers env MONGODB_URI over config.
- Example: mongodb+srv://USER:PASS@cluster0.tffyagz.mongodb.net/jobfinder?retryWrites=true&w=majority&appName=Cluster0

## Companies Service
Path: `/companies`
- POST /companies (company user only): create company profile (verifiedStatus=pending)
  Body: { name, registrationNumber?, industry?, size?, website?, address?, picName?, picPhone?, picEmail? }
- GET /companies/:id (JWT)
- PATCH /companies/:id (owner or admin)
- FIND /companies (JWT)

## Company Verifications (KYC)
Path: `/company-verifications`
- POST (company owner): { companyId, documents: [ { type:'SSM_SUPERFORM', fileKey } ] }
- FIND (admin sees all; owner sees own)
- GET (owner or admin)
- PATCH /:id (admin): { action: 'approve' | 'reject', rejectionReason? }
  - Also updates related company.verifiedStatus


## Job Listings
Path: `/job-listings`
- POST (company): create a job listing. Include `submitForApproval=true` to immediately set status to pending approval; otherwise it is saved as draft.
- GET `/job-listings` (JWT): Students see ACTIVE listings; companies see their own; admins see all.
- GET `/job-listings/:id` (JWT)
- PATCH `/job-listings/:id`
  - Company actions: normal field updates on draft/pending; `submitForApproval=true`; `close=true` when active
  - Admin actions: `approve=true` (sets status=active and computes expiresAt=publishAt+30 days), `reject=true` (back to draft)

Status enum (integer):
- 0 = draft
- 1 = pending_approval
- 2 = active
- 3 = closed

Notifications:
- On submit: notify admins (job_submitted)
- On approve: notify company owner (job approved)
- On reject: notify company owner (job rejected)
- On close: notify company owner (job closed)

## Invites (Gated Access)
Path: `/invites`
- POST (verified company): { type:'profile_access'|'interview', userId, message? }
- PATCH /:id (student target): { status:'accepted'|'declined' }
- FIND (company sees its own; student sees theirs)

Gating logic
- Companies viewing `/users` only see public fields for students unless there is an accepted invite; private fields (phone, GPA, resume, portfolio) are masked.

## Notifications
Path: `/notifications`
- FIND (recipient only; admin can access all)
- PATCH /:id { isRead:true } (recipient or admin)
- Created automatically by other services.
  - Company KYC: kyc_submitted (admins), kyc_review_required (admins), kyc_approved / kyc_rejected (owner)
  - Companies: company_submitted (admins), company_submission_received (owner), company_approved / company_rejected (owner)
  - Jobs: job_submitted (admins), job approved/rejected/closed (owner)
  - Invites/Messages: invite_sent, invite_accepted, message
- Real-time: clients connected join `users/<userId>` channel and receive events

## Admin Monitoring
Path: `/admin/monitoring`
- GET `/admin/monitoring/overview` (admin): returns aggregate counts and 10 most recent job listings
- GET `/admin/monitoring?type=pending_jobs` (admin): pending job listings to review
- GET `/admin/monitoring?type=pending_companies` (admin): companies awaiting verification

## Shortlists
Path: `/shortlists` (company only)
- POST { userId, note? }
- FIND (company’s own)
- DELETE /:id (owner)


## Student Internship Profile
- Update via `PATCH /users/:id` (self):
  - `internProfile.preferences` supports `jobTypes`, `locations`, `industries`, `preferredDuration`, `salaryRange{min,max}`
  - `internProfile.languages`: [string]
  - `internProfile.courses`: [{ courseId, courseName, courseDescription }]
  - `internProfile.assignments`: [{ title, natureOfAssignment, methodology, description }]

## Favorites
Path: `/favorites` (student)
- POST { companyId }
- FIND (user’s own)
- DELETE /:id (owner)

## Threads & Messages
- Threads `/threads`
  - POST { companyId, userId } → returns existing or creates a thread
  - FIND (participant only)
- Messages `/messages`
  - POST { threadId, body, attachments? } (participant only)
  - FIND ?threadId=... (participant only)

The Postman collection has corresponding folders. Update backend/docs/postman collection when adding fields.

