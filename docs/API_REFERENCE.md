# Job Finder Platform - API Reference

## 📋 Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [User Management](#user-management)
4. [Job & Application Management](#job--application-management)
5. [Company Features](#company-features)
6. [Interview Management](#interview-management)
7. [Offer Management](#offer-management)
8. [Notification System](#notification-system)
9. [Admin Endpoints](#admin-endpoints)
10. [Error Handling](#error-handling)
11. [Rate Limiting](#rate-limiting)

---

## 🌐 API Overview

### Base URL
```
Production: https://api.jobfinder.com
Development: http://localhost:5000
```

### API Version
Current API version: `v1`

### Content Type
All API requests and responses use JSON format:
```
Content-Type: application/json
```

### Response Format
All API responses follow this standard format:
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "timestamp": "2024-01-20T10:30:00Z"
}
```

---

## 🔐 Authentication

### Register User
Create a new user account.

```http
POST /auth/register
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "student",
      "emailVerified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

### Login User
Authenticate user and receive access token.

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "student"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

### Verify Email
Verify user email address.

```http
POST /auth/verify-email
```

**Request Body:**
```json
{
  "token": "verification-token-here"
}
```

### Forgot Password
Request password reset.

```http
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

### Reset Password
Reset user password with token.

```http
POST /auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset-token-here",
  "newPassword": "newSecurePassword123"
}
```

---

## 👤 User Management

### Get Current User Profile
Retrieve authenticated user's profile.

```http
GET /users/profile
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "student",
    "profile": {
      "phone": "+1234567890",
      "bio": "Computer Science student...",
      "skills": ["JavaScript", "Python", "React"]
    }
  }
}
```

### Update User Profile
Update authenticated user's profile.

```http
PUT /users/profile
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "profile": {
    "phone": "+1234567890",
    "bio": "Updated bio...",
    "skills": ["JavaScript", "Python", "React", "Node.js"]
  }
}
```

### Search Users
Search for users (with appropriate permissions).

```http
GET /users/search?q=john&role=student&limit=10
Authorization: Bearer {token}
```

**Query Parameters:**
- `q` (string): Search query
- `role` (string): Filter by user role
- `limit` (number): Number of results (default: 20, max: 100)
- `page` (number): Page number for pagination

---

## 💼 Job & Application Management

### Get Job Listings
Retrieve job listings with filtering options.

```http
GET /jobs?industry=technology&location=remote&type=internship
```

**Query Parameters:**
- `industry` (string): Filter by industry
- `location` (string): Filter by location
- `type` (string): Filter by job type
- `salary_min` (number): Minimum salary
- `salary_max` (number): Maximum salary
- `page` (number): Page number
- `limit` (number): Results per page

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job123",
        "title": "Software Engineering Intern",
        "company": {
          "id": "company123",
          "name": "TechCorp Inc",
          "logo": "https://example.com/logo.png"
        },
        "location": "San Francisco, CA",
        "type": "internship",
        "salary": {
          "min": 25,
          "max": 35,
          "currency": "USD",
          "period": "hour"
        },
        "description": "Join our engineering team...",
        "requirements": ["JavaScript", "React", "Node.js"],
        "postedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

### Get Job Details
Retrieve detailed information about a specific job.

```http
GET /jobs/{jobId}
```

### Create Job Posting
Create a new job posting (company role required).

```http
POST /jobs
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "title": "Software Engineering Intern",
  "description": "Join our engineering team...",
  "requirements": ["JavaScript", "React", "Node.js"],
  "responsibilities": ["Develop features", "Write tests"],
  "location": "San Francisco, CA",
  "type": "internship",
  "duration": 12,
  "salary": {
    "min": 25,
    "max": 35,
    "currency": "USD",
    "period": "hour"
  },
  "applicationDeadline": "2024-03-01T23:59:59Z",
  "startDate": "2024-06-01T00:00:00Z"
}
```

### Submit Job Application
Apply for a job position.

```http
POST /applications
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "jobId": "job123",
  "coverLetter": "I am excited to apply...",
  "resume": "resume-file-url",
  "additionalDocuments": ["portfolio-url", "transcript-url"]
}
```

### Get User Applications
Retrieve applications for authenticated user.

```http
GET /applications?status=applied&page=1&limit=10
Authorization: Bearer {token}
```

### Update Application Status
Update application status (company role required).

```http
PUT /applications/{applicationId}
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "status": "interview",
  "notes": "Moving to interview stage"
}
```

---

## 🏢 Company Features

### Get Company Listings
Retrieve company listings.

```http
GET /companies?industry=technology&size=startup
```

### Get Company Details
Retrieve detailed company information.

```http
GET /companies/{companyId}
```

### Update Company Profile
Update company profile (company role required).

```http
PUT /companies/profile
Authorization: Bearer {token}
```

### Get Universities
Retrieve list of universities.

```http
GET /universities?location=california&type=public
```

### Get University Programs
Retrieve programs for a specific university.

```http
GET /universities/{universityId}/programs?level=undergraduate&faculty=engineering
```

### Get Program Candidates
Retrieve candidates for a specific program.

```http
GET /programs/{programId}/candidates?skills=javascript&location=remote
```

### Send Candidate Invitation
Send invitation to a candidate.

```http
POST /invitations
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "candidateId": "candidate123",
  "jobId": "job123",
  "message": "We would like to invite you...",
  "interviewType": "video"
}
```

---

## 📅 Interview Management

### Get Interviews
Retrieve interviews for user.

```http
GET /interviews?status=scheduled&type=video
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (string): Filter by interview status
- `type` (string): Filter by interview type
- `startDate` (string): Filter by start date
- `endDate` (string): Filter by end date

### Schedule Interview
Schedule a new interview.

```http
POST /interviews
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "candidateId": "candidate123",
  "jobId": "job123",
  "type": "video",
  "scheduledDate": "2024-01-25T14:00:00Z",
  "duration": 60,
  "meetingLink": "https://zoom.us/j/123456789",
  "interviewer": {
    "name": "Sarah Johnson",
    "title": "Engineering Manager",
    "email": "sarah@company.com"
  },
  "agenda": ["Introduction", "Technical questions", "Q&A"]
}
```

### Update Interview
Update interview details.

```http
PUT /interviews/{interviewId}
Authorization: Bearer {token}
```

### Update Interview Status
Update interview status.

```http
PATCH /interviews/{interviewId}/status
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "status": "completed",
  "notes": "Great interview, candidate performed well"
}
```

---

## 💰 Offer Management

### Get Offers
Retrieve offers for user.

```http
GET /offers?status=pending&jobId=job123
Authorization: Bearer {token}
```

### Create Offer
Create a job offer.

```http
POST /offers
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "candidateId": "candidate123",
  "jobId": "job123",
  "position": "Software Engineering Intern",
  "salary": {
    "amount": 30,
    "currency": "USD",
    "period": "hour"
  },
  "employment": {
    "type": "internship",
    "startDate": "2024-06-01T00:00:00Z",
    "duration": 12,
    "workLocation": "hybrid"
  },
  "benefits": ["Health insurance", "Paid time off"],
  "expiresAt": "2024-02-15T23:59:59Z",
  "message": "We are excited to offer you..."
}
```

### Update Offer Status
Update offer status.

```http
PATCH /offers/{offerId}/status
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "status": "accepted",
  "response": "Thank you for the offer, I accept!"
}
```

### Add Offer Negotiation
Add negotiation to an offer.

```http
POST /offers/{offerId}/negotiate
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "message": "Thank you for the offer. I would like to discuss...",
  "proposedChanges": {
    "salary": {
      "amount": 35
    }
  }
}
```

---

## 🔔 Notification System

### Get Notifications
Retrieve user notifications.

```http
GET /notifications?category=application&isRead=false&page=1&limit=20
Authorization: Bearer {token}
```

**Query Parameters:**
- `category` (string): Filter by notification category
- `isRead` (boolean): Filter by read status
- `priority` (string): Filter by priority level
- `page` (number): Page number
- `limit` (number): Results per page

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif123",
        "type": "application_status",
        "title": "Application Update",
        "message": "Your application status has been updated",
        "category": "application",
        "priority": "normal",
        "isRead": false,
        "createdAt": "2024-01-20T10:00:00Z",
        "actionUrl": "/applications/app123",
        "data": {
          "applicationId": "app123",
          "status": "interview"
        }
      }
    ],
    "unreadCount": 5,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "pages": 2
    }
  }
}
```

### Mark Notification as Read
Mark a specific notification as read.

```http
PATCH /notifications/{notificationId}/read
Authorization: Bearer {token}
```

### Mark All Notifications as Read
Mark all notifications as read.

```http
PATCH /notifications/read-all
Authorization: Bearer {token}
```

### Delete Notification
Delete a specific notification.

```http
DELETE /notifications/{notificationId}
Authorization: Bearer {token}
```

---

## 🛡️ Admin Endpoints

### Get All Users
Retrieve all users (admin role required).

```http
GET /admin/users?role=student&status=active&search=john
Authorization: Bearer {token}
```

### Update User Status
Update user account status.

```http
PATCH /admin/users/{userId}/status
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "status": "active",
  "reason": "Account verification completed"
}
```

### Get Pending Companies
Retrieve companies pending verification.

```http
GET /admin/companies/pending
Authorization: Bearer {token}
```

### Verify Company
Update company verification status.

```http
PATCH /admin/companies/{companyId}/verify
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "status": "verified",
  "notes": "All documents verified successfully"
}
```

### Get System Statistics
Retrieve platform statistics.

```http
GET /admin/stats
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "students": 1250,
      "companies": 180,
      "admins": 5,
      "total": 1435
    },
    "verification": {
      "pending": 15,
      "verified": 165
    },
    "activity": {
      "recentRegistrations": 45,
      "activeUsers": 320
    }
  }
}
```

### Get Admin Action Logs
Retrieve admin action logs.

```http
GET /admin/logs?limit=100
Authorization: Bearer {token}
```

---

## ❌ Error Handling

### Error Response Format
All errors follow this standard format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Email format is invalid"
    }
  },
  "timestamp": "2024-01-20T10:30:00Z"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error

### Common Error Codes
- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_REQUIRED` - Authentication token required
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `RESOURCE_NOT_FOUND` - Requested resource not found
- `DUPLICATE_RESOURCE` - Resource already exists
- `RATE_LIMIT_EXCEEDED` - Too many requests

---

## 🚦 Rate Limiting

### Rate Limits
- **Authentication endpoints**: 5 requests per minute
- **General API endpoints**: 100 requests per minute
- **File upload endpoints**: 10 requests per minute
- **Admin endpoints**: 200 requests per minute

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642680000
```

### Rate Limit Exceeded Response
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

---

*This API reference is regularly updated. For the latest information, please refer to the interactive API documentation or contact the development team.*
