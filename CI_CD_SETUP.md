# 🚀 CI/CD Pipeline Setup for Job Finder

## 📋 Overview

This document outlines the complete CI/CD automation setup for the Job Finder application with proper branch management and deployment triggers.

## 🌿 Branch Structure

### **Production Branch** (`production`)

- **Purpose**: Live production environment
- **Deploys to**: `https://jobfinder.saino365.com`
- **Trigger**: Push to `production` branch
- **Environment**: Production server (`103.209.156.198`)

### **Staging Branch** (`staging`)

- **Purpose**: Testing and staging environment
- **Deploys to**: `https://staging.saino365.com`
- **Trigger**: Push to `staging` branch
- **Environment**: Staging server (`103.209.156.198`)

### **Development Branch** (`major-change-sebas`)

- **Purpose**: Active development
- **Trigger**: CI checks only (no deployment)
- **Environment**: Local development

## 🚀 Deployment Triggers

### **Automatic Deployment Rules:**

1. **Production Deployment**
   - **Trigger**: Push to `production` branch
   - **Process**: GitHub Actions → SSH → Production Server
   - **Health Check**: Validates `https://jobfinder.saino365.com/api/`

2. **Staging Deployment**
   - **Trigger**: Push to `staging` branch
   - **Process**: GitHub Actions → SSH → Staging Server
   - **Health Check**: Validates `https://staging.saino365.com/api/`

3. **Quality Gates (All Branches)**
   - **Pre-commit**: Husky hooks (ESLint + Prettier)
   - **CI Checks**: Automated on push/PR
   - **Security Scan**: npm audit + Snyk

## 🔧 GitHub Actions Workflows

### **1. Continuous Integration** (`.github/workflows/ci.yml`)

- **Triggers**: Push/PR to any main branch
- **Steps**: Lint → Test → Build → Security Scan
- **Quality Gates**: Must pass before merge

### **2. Production Deployment** (`.github/workflows/deploy-production.yml`)

- **Triggers**: Push to `production` branch
- **Steps**: Build → Deploy → Health Check
- **Target**: Production environment

### **3. Staging Deployment** (`.github/workflows/deploy-staging.yml`)

- **Triggers**: Push to `staging` branch
- **Steps**: Build → Deploy → Health Check
- **Target**: Staging environment

## 🛡️ Quality Gates

### **Pre-commit Hooks (Husky)**

```bash
# Runs before every commit
- ESLint (code quality)
- Prettier (code formatting)
- Type checking
```

### **CI Pipeline Checks**

```bash
# Runs on every push/PR
- Dependency installation
- Linting and formatting
- Unit tests
- Build verification
- Security scanning
```

## 🔐 Required GitHub Secrets

Add these secrets to your GitHub repository:

```bash
PRODUCTION_HOST=103.209.156.198
PRODUCTION_USER=dev
STAGING_HOST=103.209.156.198
STAGING_USER=dev
SSH_PRIVATE_KEY=<your-private-key-content>
SNYK_TOKEN=<optional-security-scanning>
```

## 📝 Deployment Process

### **To Deploy to Staging:**

```bash
git checkout staging
git merge major-change-sebas
git push origin staging
# → Triggers automatic staging deployment
```

### **To Deploy to Production:**

```bash
git checkout production
git merge staging  # Always merge from staging
git push origin production
# → Triggers automatic production deployment
```

## 🎯 Git Workflow Stages

### **Development → Staging → Production**

1. **Development Phase**

   ```bash
   # Work on major-change-sebas branch
   git checkout major-change-sebas
   git add .
   git commit -m "feat: new feature"
   # → Triggers CI checks only
   ```

2. **Staging Phase**

   ```bash
   # Merge to staging for testing
   git checkout staging
   git merge major-change-sebas
   git push origin staging
   # → Triggers staging deployment
   ```

3. **Production Phase**
   ```bash
   # Merge to production after staging approval
   git checkout production
   git merge staging
   git push origin production
   # → Triggers production deployment
   ```

## 🔄 Deployment Scripts

### **Production Server** (`/home/ubuntu/job-finder/deploy.sh`)

- Pulls latest `production` branch
- Rebuilds Docker containers
- Runs health checks
- Logs deployment status

### **Staging Server** (`/home/ubuntu/job-finder-staging/deploy.sh`)

- Pulls latest `staging` branch
- Rebuilds Docker containers
- Runs health checks
- Logs deployment status

## 📊 Monitoring & Health Checks

### **Automated Health Checks**

- **Production**: `https://jobfinder.saino365.com/api/`
- **Staging**: `https://staging.saino365.com/api/`
- **Frequency**: After every deployment
- **Timeout**: 30 seconds

### **Manual Health Checks**

```bash
# Production
curl -f https://jobfinder.saino365.com/api/

# Staging
curl -f https://staging.saino365.com/api/
```

## 🚨 Rollback Strategy

### **Quick Rollback Commands**

```bash
# Production rollback
ssh dev@103.209.156.198 'cd /home/ubuntu/job-finder && git reset --hard HEAD~1 && ./deploy.sh'

# Staging rollback
ssh dev@103.209.156.198 'cd /home/ubuntu/job-finder-staging && git reset --hard HEAD~1 && ./deploy.sh'
```

## ✅ Setup Checklist

- [x] Branch structure created (`production`, `staging`, `major-change-sebas`)
- [x] Husky pre-commit hooks configured
- [x] GitHub Actions workflows created
- [x] Deployment scripts on server
- [x] SSL certificates configured
- [x] Environment variables updated
- [ ] GitHub secrets configured
- [ ] Team access permissions set
- [ ] Monitoring alerts configured

## 🎉 Benefits

✅ **Automated Deployments**: Zero-downtime deployments
✅ **Quality Assurance**: Pre-commit and CI checks
✅ **Environment Separation**: Clear staging → production flow
✅ **Security**: Automated vulnerability scanning
✅ **Rollback**: Quick recovery from issues
✅ **Monitoring**: Health checks and logging
✅ **SSL**: Secure HTTPS for both environments
