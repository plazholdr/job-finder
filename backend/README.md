# Job Finder Backend API

A modern FeathersJS backend API for a job finder platform with authentication, file uploads, and real-time features.

## 🚀 Features

- **Modern Authentication**: JWT access/refresh tokens with Redis storage
- **User Management**: Role-based access (intern, company, admin)
- **File Upload**: S3-compatible object storage for resumes, avatars, logos
- **Real-time**: Socket.io integration for live updates
- **Security**: Rate limiting, CORS, helmet, input validation
- **Testing**: Jest with MongoDB Memory Server
- **Docker**: Production-ready containerization

## 🛠️ Tech Stack

- **Framework**: FeathersJS v5
- **Database**: MongoDB Atlas
- **Cache/Sessions**: Redis
- **Authentication**: JWT with refresh tokens
- **File Storage**: S3-compatible (IpOneServer)
- **Testing**: Jest + MongoDB Memory Server
- **Package Manager**: Yarn (recommended)

## 📦 Installation

### Prerequisites
- Node.js 18+
- Yarn (recommended) or npm
- MongoDB Atlas account
- Redis instance

### Setup

1. **Install dependencies**:
   ```bash
   yarn install
   ```

2. **Environment Configuration**:
   Copy `.env.example` to `.env` and configure:
   ```bash
   # Database
   MONGODB_URI=your_mongodb_atlas_uri
   REDIS_URI=redis://localhost:6379
   
   # Authentication
   JWT_SECRET=your_secure_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   
   # Object Storage
   S3_ENDPOINT=your_s3_endpoint
   S3_ACCESS_KEY=your_access_key
   S3_SECRET_KEY=your_secret_key
   S3_BUCKET=your_bucket_name
   ```

## 🚀 Development

### Available Scripts

```bash
# Development
yarn dev              # Start development server with hot reload
yarn start            # Start production server

# Testing
yarn test             # Run all tests
yarn test:watch       # Run tests in watch mode
yarn test:coverage    # Run tests with coverage report

# Code Quality
yarn lint             # Run ESLint
yarn lint:fix         # Fix ESLint issues
yarn format           # Format code with Prettier

# Utilities
yarn clean            # Remove node_modules and yarn.lock
yarn fresh            # Clean install (clean + install)
```

### Development Server

```bash
yarn dev
```

Server will start on `http://localhost:3030`

### API Endpoints

- `GET /health` - Health check
- `POST /authentication` - Login
- `POST /users` - Register user
- `POST /refresh-token` - Refresh access token
- `POST /upload` - File upload
- `GET /users` - List users (authenticated)

## 🐳 Docker

### Development with Docker Compose

```bash
# Start all services (API + Redis + Admin interfaces)
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Production Deployment

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d
```

## 🧪 Testing

```bash
# Run all tests
yarn test

# Run specific test file
yarn test test/example.test.js

# Run tests with coverage
yarn test:coverage

# Run tests in watch mode
yarn test:watch
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js              # Main FeathersJS app
│   ├── index.js            # Server entry point
│   ├── authentication.js   # JWT authentication
│   ├── services/           # API services
│   │   ├── users/          # User management
│   │   ├── upload/         # File uploads
│   │   └── refresh-token/  # Token refresh
│   ├── models/             # Database models
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   └── hooks/              # FeathersJS hooks
├── test/                   # Test files
├── config/                 # Environment configs
├── docker-compose.yml      # Development Docker setup
└── Dockerfile              # Production container
```

## 🔐 Authentication

The API uses JWT tokens with refresh token rotation:

1. **Login**: `POST /authentication`
2. **Refresh**: `POST /refresh-token`
3. **Protected routes**: Include `Authorization: Bearer <token>` header

## 📤 File Upload

Upload files to organized S3-compatible storage:

```bash
POST /upload
Content-Type: multipart/form-data

# Supported fields:
- resume (1 file)
- avatar (1 file)  
- logo (1 file)
- portfolio (5 files)
- document (10 files)
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3030` |
| `MONGODB_URI` | MongoDB connection | Required |
| `REDIS_URI` | Redis connection | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_SECRET` | Refresh token secret | Required |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |

## 🚀 Deployment

1. **Build Docker image**:
   ```bash
   docker build -t job-finder-api .
   ```

2. **Run with environment**:
   ```bash
   docker run -p 3030:3030 --env-file .env job-finder-api
   ```

3. **Or use Docker Compose**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## 📊 Monitoring

- **Health Check**: `GET /health`
- **Logs**: Winston logging to files and console
- **Redis Admin**: http://localhost:8082 (development)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📝 License

This project is licensed under the ISC License.
