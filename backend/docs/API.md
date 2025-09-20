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
- Redis: `REDIS_URI` (compose sets `redis://redis:6379` in container)

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

## Roadmap (to be added next)
- Companies service and KYC verification (manual admin approval with SSM Superform doc upload)
- Invites service with gated fields logic for student profiles
- Shortlists (company→students) and Favorites (student→companies)
- Messaging (threads/messages) with notifications
- Notifications service (admin/company/student) and real-time channels
- Extended search filters and saved search profiles

As each service is added, both this document and the Postman collection will be updated with request/response examples and testing notes.

