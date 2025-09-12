# Job Finder Platform - Deployment Guide

## 📋 Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Database Configuration](#database-configuration)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Email Service Setup](#email-service-setup)
8. [SSL Certificate Setup](#ssl-certificate-setup)
9. [Monitoring & Logging](#monitoring--logging)
10. [Performance Optimization](#performance-optimization)
11. [Security Considerations](#security-considerations)
12. [Backup & Recovery](#backup--recovery)

---

## 🌐 Deployment Overview

### Architecture Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Hosting   │    │   App Server    │    │  Database Host  │
│   (Vercel/AWS)  │    │   (AWS/GCP)     │    │  (MongoDB Atlas)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Deployment Options

#### Option 1: Cloud Platform (Recommended)
- **Frontend**: Vercel, Netlify, or AWS Amplify
- **Backend**: AWS EC2, Google Cloud Run, or Heroku
- **Database**: MongoDB Atlas
- **Email**: SendGrid or AWS SES

#### Option 2: Self-Hosted
- **Server**: Ubuntu/CentOS server with Docker
- **Database**: Self-hosted MongoDB with replica sets
- **Reverse Proxy**: Nginx with SSL termination
- **Email**: Self-hosted mail server or SMTP relay

#### Option 3: Containerized (Docker)
- **Orchestration**: Docker Compose or Kubernetes
- **Container Registry**: Docker Hub or AWS ECR
- **Load Balancer**: Nginx or cloud load balancer
- **Monitoring**: Prometheus and Grafana

---

## 📋 Prerequisites

### System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **MongoDB**: v5.0 or higher
- **Git**: Latest version
- **SSL Certificate**: For HTTPS (Let's Encrypt recommended)

### Development Tools
- **Code Editor**: VS Code or similar
- **Terminal**: Bash, Zsh, or PowerShell
- **Docker**: For containerized deployment (optional)
- **PM2**: For process management (Node.js apps)

### Cloud Accounts (if using cloud services)
- **MongoDB Atlas**: Database hosting
- **Vercel/Netlify**: Frontend hosting
- **AWS/GCP**: Backend hosting
- **SendGrid**: Email service
- **Cloudflare**: CDN and DNS (optional)

---

## 🔧 Environment Setup

### Production Environment Variables

#### Backend (.env)
```env
# Application
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobfinder?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=7d

# Email Configuration (SendGrid)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
EMAIL_FROM=noreply@yourdomain.com

# File Upload
UPLOAD_PATH=/var/uploads
MAX_FILE_SIZE=10485760

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/jobfinder/app.log

# Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure-admin-password
```

#### Frontend (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_FRONTEND_URL=https://yourdomain.com

# Application
NEXT_PUBLIC_APP_NAME=Job Finder
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=production

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_HOTJAR_ID=1234567

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_CHAT=false
```

---

## 🗄️ Database Configuration

### MongoDB Atlas Setup (Recommended)

1. **Create MongoDB Atlas Account**
   ```bash
   # Visit https://www.mongodb.com/cloud/atlas
   # Sign up for free tier or paid plan
   ```

2. **Create Cluster**
   - Choose cloud provider (AWS, GCP, Azure)
   - Select region closest to your users
   - Configure cluster tier based on needs

3. **Database Configuration**
   ```javascript
   // Database name: jobfinder
   // Collections will be created automatically
   
   // Recommended indexes
   db.users.createIndex({ "email": 1 }, { unique: true })
   db.users.createIndex({ "role": 1 })
   db.jobs.createIndex({ "companyId": 1 })
   db.jobs.createIndex({ "status": 1 })
   db.applications.createIndex({ "candidateId": 1, "jobId": 1 })
   ```

4. **Security Configuration**
   - Enable authentication
   - Create database user with appropriate permissions
   - Configure IP whitelist or VPC peering
   - Enable encryption at rest

### Self-Hosted MongoDB

1. **Installation**
   ```bash
   # Ubuntu/Debian
   wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   
   # Start MongoDB
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

2. **Configuration**
   ```yaml
   # /etc/mongod.conf
   storage:
     dbPath: /var/lib/mongodb
     journal:
       enabled: true
   
   systemLog:
     destination: file
     logAppend: true
     path: /var/log/mongodb/mongod.log
   
   net:
     port: 27017
     bindIp: 127.0.0.1
   
   security:
     authorization: enabled
   
   replication:
     replSetName: "rs0"
   ```

3. **Security Setup**
   ```javascript
   // Create admin user
   use admin
   db.createUser({
     user: "admin",
     pwd: "secure-password",
     roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase"]
   })
   
   // Create application user
   use jobfinder
   db.createUser({
     user: "jobfinder",
     pwd: "app-password",
     roles: ["readWrite"]
   })
   ```

---

## 🚀 Backend Deployment

### Option 1: AWS EC2 Deployment

1. **Launch EC2 Instance**
   ```bash
   # Choose Ubuntu 20.04 LTS
   # Instance type: t3.medium or higher
   # Configure security groups (ports 22, 80, 443, 5000)
   ```

2. **Server Setup**
   ```bash
   # Connect to instance
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install nginx -y
   ```

3. **Application Deployment**
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/job-finder.git
   cd job-finder/backend
   
   # Install dependencies
   npm ci --only=production
   
   # Create environment file
   sudo nano .env
   # Add production environment variables
   
   # Create PM2 ecosystem file
   cat > ecosystem.config.js << EOF
   module.exports = {
     apps: [{
       name: 'job-finder-api',
       script: 'src/index.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 5000
       },
       error_file: '/var/log/pm2/err.log',
       out_file: '/var/log/pm2/out.log',
       log_file: '/var/log/pm2/combined.log',
       time: true
     }]
   }
   EOF
   
   # Start application
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

4. **Nginx Configuration**
   ```nginx
   # /etc/nginx/sites-available/job-finder-api
   server {
       listen 80;
       server_name api.yourdomain.com;
   
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   # Enable site
   sudo ln -s /etc/nginx/sites-available/job-finder-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Option 2: Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   # backend/Dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   
   EXPOSE 5000
   
   USER node
   
   CMD ["node", "src/index.js"]
   ```

2. **Docker Compose**
   ```yaml
   # docker-compose.yml
   version: '3.8'
   
   services:
     api:
       build: ./backend
       ports:
         - "5000:5000"
       environment:
         - NODE_ENV=production
         - MONGODB_URI=${MONGODB_URI}
         - JWT_SECRET=${JWT_SECRET}
       volumes:
         - ./uploads:/app/uploads
       restart: unless-stopped
   
     nginx:
       image: nginx:alpine
       ports:
         - "80:80"
         - "443:443"
       volumes:
         - ./nginx.conf:/etc/nginx/nginx.conf
         - ./ssl:/etc/ssl
       depends_on:
         - api
       restart: unless-stopped
   ```

3. **Deploy with Docker**
   ```bash
   # Build and start services
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   
   # Update application
   docker-compose pull
   docker-compose up -d
   ```

---

## 🎨 Frontend Deployment

### Option 1: Vercel Deployment (Recommended)

1. **Vercel Setup**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy from project directory
   cd frontend
   vercel
   ```

2. **Environment Variables**
   ```bash
   # Add environment variables in Vercel dashboard
   # Or use Vercel CLI
   vercel env add NEXT_PUBLIC_API_URL production
   vercel env add NEXT_PUBLIC_FRONTEND_URL production
   ```

3. **Custom Domain**
   ```bash
   # Add custom domain
   vercel domains add yourdomain.com
   vercel alias your-project-url.vercel.app yourdomain.com
   ```

### Option 2: AWS S3 + CloudFront

1. **Build Application**
   ```bash
   cd frontend
   npm run build
   npm run export
   ```

2. **S3 Setup**
   ```bash
   # Create S3 bucket
   aws s3 mb s3://your-domain-frontend
   
   # Upload files
   aws s3 sync out/ s3://your-domain-frontend --delete
   
   # Configure bucket for static hosting
   aws s3 website s3://your-domain-frontend --index-document index.html
   ```

3. **CloudFront Distribution**
   ```json
   {
     "Origins": [{
       "DomainName": "your-domain-frontend.s3.amazonaws.com",
       "Id": "S3-your-domain-frontend",
       "S3OriginConfig": {
         "OriginAccessIdentity": ""
       }
     }],
     "DefaultCacheBehavior": {
       "TargetOriginId": "S3-your-domain-frontend",
       "ViewerProtocolPolicy": "redirect-to-https"
     }
   }
   ```

### Option 3: Self-Hosted with Nginx

1. **Build and Deploy**
   ```bash
   # Build application
   cd frontend
   npm run build
   npm run export
   
   # Copy to web server
   sudo cp -r out/* /var/www/html/
   ```

2. **Nginx Configuration**
   ```nginx
   # /etc/nginx/sites-available/job-finder-frontend
   server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/html;
       index index.html;
   
       location / {
           try_files $uri $uri/ /index.html;
       }
   
       location /api {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   
       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

---

## 📧 Email Service Setup

### SendGrid Configuration (Recommended)

1. **SendGrid Account Setup**
   ```bash
   # Sign up at https://sendgrid.com
   # Create API key with Mail Send permissions
   # Verify sender identity
   ```

2. **DNS Configuration**
   ```dns
   # Add CNAME records for domain authentication
   s1._domainkey.yourdomain.com CNAME s1.domainkey.u1234567.wl123.sendgrid.net
   s2._domainkey.yourdomain.com CNAME s2.domainkey.u1234567.wl123.sendgrid.net
   ```

3. **Environment Variables**
   ```env
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=SG.your-api-key-here
   EMAIL_FROM=noreply@yourdomain.com
   ```

### AWS SES Configuration

1. **AWS SES Setup**
   ```bash
   # Configure AWS CLI
   aws configure
   
   # Verify email domain
   aws ses verify-domain-identity --domain yourdomain.com
   ```

2. **DNS Records**
   ```dns
   # Add TXT record for domain verification
   _amazonses.yourdomain.com TXT "verification-token"
   
   # Add MX record for bounce handling
   yourdomain.com MX 10 feedback-smtp.region.amazonses.com
   ```

3. **Environment Variables**
   ```env
   EMAIL_SERVICE=ses
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_REGION=us-east-1
   EMAIL_FROM=noreply@yourdomain.com
   ```

---

## 🔒 SSL Certificate Setup

### Let's Encrypt with Certbot

1. **Install Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Obtain Certificate**
   ```bash
   # For Nginx
   sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
   
   # For standalone (if not using Nginx)
   sudo certbot certonly --standalone -d yourdomain.com
   ```

3. **Auto-renewal**
   ```bash
   # Test renewal
   sudo certbot renew --dry-run
   
   # Add to crontab
   echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
   ```

### CloudFlare SSL

1. **CloudFlare Setup**
   - Add domain to CloudFlare
   - Update nameservers
   - Enable SSL/TLS encryption

2. **SSL Configuration**
   ```nginx
   # Nginx configuration for CloudFlare
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;
   
       # CloudFlare SSL
       ssl_certificate /path/to/cloudflare.crt;
       ssl_certificate_key /path/to/cloudflare.key;
   
       # Security headers
       add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
       add_header X-Frame-Options DENY always;
       add_header X-Content-Type-Options nosniff always;
   }
   ```

---

## 📊 Monitoring & Logging

### Application Monitoring

1. **PM2 Monitoring**
   ```bash
   # Monitor processes
   pm2 monit
   
   # View logs
   pm2 logs
   
   # Restart application
   pm2 restart job-finder-api
   ```

2. **System Monitoring**
   ```bash
   # Install monitoring tools
   sudo apt install htop iotop nethogs
   
   # Monitor system resources
   htop
   iotop
   nethogs
   ```

### Logging Configuration

1. **Application Logs**
   ```javascript
   // backend/src/utils/logger.js
   const winston = require('winston');
   
   const logger = winston.createLogger({
     level: process.env.LOG_LEVEL || 'info',
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.errors({ stack: true }),
       winston.format.json()
     ),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' }),
       new winston.transports.Console({
         format: winston.format.simple()
       })
     ]
   });
   ```

2. **Log Rotation**
   ```bash
   # Install logrotate
   sudo apt install logrotate
   
   # Configure log rotation
   cat > /etc/logrotate.d/job-finder << EOF
   /var/log/job-finder/*.log {
       daily
       missingok
       rotate 52
       compress
       delaycompress
       notifempty
       create 644 ubuntu ubuntu
   }
   EOF
   ```

### Health Checks

1. **Application Health Check**
   ```javascript
   // backend/src/routes/health.js
   app.get('/health', (req, res) => {
     res.json({
       status: 'healthy',
       timestamp: new Date().toISOString(),
       uptime: process.uptime(),
       memory: process.memoryUsage()
     });
   });
   ```

2. **Database Health Check**
   ```javascript
   app.get('/health/database', async (req, res) => {
     try {
       await mongoose.connection.db.admin().ping();
       res.json({ status: 'healthy', database: 'connected' });
     } catch (error) {
       res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
     }
   });
   ```

---

## ⚡ Performance Optimization

### Backend Optimization

1. **Database Optimization**
   ```javascript
   // Add database indexes
   db.users.createIndex({ "email": 1 }, { unique: true })
   db.jobs.createIndex({ "companyId": 1, "status": 1 })
   db.applications.createIndex({ "candidateId": 1, "status": 1 })
   
   // Use aggregation pipelines for complex queries
   const pipeline = [
     { $match: { status: 'active' } },
     { $lookup: { from: 'companies', localField: 'companyId', foreignField: '_id', as: 'company' } },
     { $limit: 20 }
   ];
   ```

2. **Caching Strategy**
   ```javascript
   // Install Redis
   npm install redis
   
   // Implement caching
   const redis = require('redis');
   const client = redis.createClient();
   
   const cacheMiddleware = (duration) => {
     return async (req, res, next) => {
       const key = req.originalUrl;
       const cached = await client.get(key);
       
       if (cached) {
         return res.json(JSON.parse(cached));
       }
       
       res.sendResponse = res.json;
       res.json = (body) => {
         client.setex(key, duration, JSON.stringify(body));
         res.sendResponse(body);
       };
       
       next();
     };
   };
   ```

### Frontend Optimization

1. **Build Optimization**
   ```javascript
   // next.config.js
   module.exports = {
     experimental: {
       optimizeCss: true,
       optimizeImages: true,
     },
     images: {
       domains: ['yourdomain.com'],
       formats: ['image/webp', 'image/avif'],
     },
     compress: true,
     poweredByHeader: false,
   };
   ```

2. **Code Splitting**
   ```javascript
   // Dynamic imports for code splitting
   import dynamic from 'next/dynamic';
   
   const DynamicComponent = dynamic(() => import('../components/HeavyComponent'), {
     loading: () => <p>Loading...</p>,
     ssr: false
   });
   ```

---

*This deployment guide covers the essential steps for deploying the Job Finder platform. For specific cloud provider instructions or advanced configurations, please refer to the respective documentation.*
