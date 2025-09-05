# CI/CD Workflow Documentation

## Overview

This project uses a production-ready CI/CD pipeline with automatic rollback capabilities and environment-specific workflows.

## Workflow Structure

### 1. **Development Checks** (`dev-checks.yml`)

- **Triggers**: All branches except `staging`, `production`, `master`
- **Purpose**: Lightweight checks for development branches
- **Includes**:
  - Linting (frontend & backend)
  - Type checking
  - Unit tests only
  - Build verification
- **Duration**: ~3-5 minutes
- **Use Case**: Feature development, bug fixes

### 2. **Continuous Integration** (`ci.yml`)

- **Triggers**: `staging`, `production` branches
- **Purpose**: Full testing suite before deployment
- **Includes**:
  - Complete linting
  - Full test suite (unit + integration)
  - Build verification
  - Database/Redis integration tests
- **Duration**: ~8-12 minutes
- **Use Case**: Pre-deployment validation

### 3. **Staging Deployment** (`deploy-staging.yml`)

- **Triggers**: Push to `staging` branch
- **Features**:
  - Automatic backup creation
  - Health checks
  - Automatic rollback on failure
  - Manual trigger available
- **URL**: https://staging.saino365.com
- **Use Case**: Testing in production-like environment

### 4. **Production Deployment** (`deploy-production.yml`)

- **Triggers**: Push to `production` branch
- **Features**:
  - Automatic backup creation
  - Health checks
  - Automatic rollback on failure
  - Manual trigger available
- **URL**: https://jobfinder.saino365.com
- **Use Case**: Live production deployment

### 5. **Rollback Workflow** (`rollback.yml`)

- **Triggers**: Manual only (GitHub Actions UI)
- **Options**:
  - Choose environment (staging/production)
  - Specify commit SHA or use previous deployment
- **Features**:
  - Backup before rollback
  - Health check verification
  - Full deployment process

## Branch Strategy

```
master (main)
├── feature/your-feature-name    → Triggers: dev-checks.yml
├── bugfix/issue-description     → Triggers: dev-checks.yml
├── staging                      → Triggers: ci.yml + deploy-staging.yml
└── production                   → Triggers: ci.yml + deploy-production.yml
```

## Deployment Flow

### Normal Flow

1. **Development**: Work on feature branches
   - Automatic dev checks run on push
   - Quick feedback (3-5 minutes)

2. **Staging**: Merge to staging branch
   - Full CI pipeline runs
   - Automatic deployment to staging
   - Health checks verify deployment

3. **Production**: Merge staging to production
   - Full CI pipeline runs
   - Automatic deployment to production
   - Health checks verify deployment

### Failure Scenarios

#### Automatic Rollback Triggers

- Deployment script failure
- Health check failure (API not responding)
- Docker container startup failure

#### Manual Rollback

- Use GitHub Actions UI
- Go to "Actions" → "Rollback Deployment"
- Select environment and target commit
- Monitor rollback progress

## Safety Features

### 1. **Backup System**

- Automatic backup before every deployment
- Stored in `/home/ubuntu/backups/` with timestamp
- Used for rollback operations

### 2. **Health Checks**

- 30-second wait after deployment
- API endpoint verification
- Automatic rollback if health check fails

### 3. **Rollback Verification**

- Health check after rollback
- Ensures system is functional after rollback

## Usage Examples

### Deploying a Feature

```bash
# 1. Create feature branch
git checkout -b feature/new-awesome-feature

# 2. Develop and push (triggers dev-checks)
git push origin feature/new-awesome-feature

# 3. Create PR to staging
# 4. Merge to staging (triggers CI + staging deployment)

# 5. Test on staging environment
# 6. Create PR from staging to production
# 7. Merge to production (triggers CI + production deployment)
```

### Manual Rollback

1. Go to GitHub → Actions
2. Select "Rollback Deployment"
3. Click "Run workflow"
4. Choose:
   - Environment: staging/production
   - Commit SHA: (optional, defaults to previous)
5. Click "Run workflow"

### Emergency Rollback

If production is down:

1. Immediate manual rollback via GitHub Actions
2. Or SSH to server and use backup:

```bash
cd /home/ubuntu/job-finder
# Find latest backup
ls -la /home/ubuntu/backups/
# Restore from backup
cp -r /home/ubuntu/backups/job-finder-YYYYMMDD-HHMMSS/* .
docker-compose down && docker-compose up -d
```

## Monitoring

### Key URLs to Monitor

- **Production**: https://jobfinder.saino365.com/api/
- **Staging**: https://staging.saino365.com/api/

### GitHub Actions

- Monitor workflow runs in GitHub Actions tab
- Check deployment logs for issues
- Review rollback logs if needed

## Best Practices

1. **Always test on staging first**
2. **Monitor health checks after deployment**
3. **Keep rollback workflow ready for emergencies**
4. **Review backup retention policy regularly**
5. **Test rollback procedure periodically**

## Troubleshooting

### Common Issues

1. **Health check timeout**: Increase wait time or check server resources
2. **Rollback failure**: Check backup integrity and server access
3. **CI failure**: Review logs and fix issues before redeployment

### Emergency Contacts

- Check server logs: `docker-compose logs`
- Monitor resources: `htop`, `df -h`
- Database status: Check MongoDB/Redis containers
