# CI/CD Quick Reference

## 🚀 Deployment Commands

### Normal Deployment

```bash
# Deploy to staging
git push origin staging

# Deploy to production
git push origin production
```

### Emergency Rollback

1. **GitHub UI**: Actions → "Rollback Deployment" → Run workflow
2. **SSH Direct**:

```bash
# Production
ssh -i jobfinderopenssh.pem ubuntu@103.209.156.198
cd /home/ubuntu/job-finder
git reset --hard <previous-commit-sha>
docker-compose down && docker-compose up -d

# Staging
cd /home/ubuntu/job-finder-staging
git reset --hard <previous-commit-sha>
docker-compose -f docker-compose.staging-final.yml down
docker-compose -f docker-compose.staging-final.yml up -d
```

## 📊 Workflow Triggers

| Branch       | Workflow               | Duration  | Purpose                       |
| ------------ | ---------------------- | --------- | ----------------------------- |
| `feature/*`  | dev-checks             | 3-5 min   | Quick validation              |
| `staging`    | ci + deploy-staging    | 10-15 min | Full test + staging deploy    |
| `production` | ci + deploy-production | 10-15 min | Full test + production deploy |

## 🔄 Rollback Options

### Automatic Rollback

- ✅ Deployment failure
- ✅ Health check failure
- ✅ Container startup failure

### Manual Rollback

- 🎯 GitHub Actions UI
- 🎯 Specify commit SHA
- 🎯 Choose environment

## 🌐 Environment URLs

- **Production**: https://jobfinder.saino365.com/api/
- **Staging**: https://staging.saino365.com/api/

## 📁 Server Paths

- **Production**: `/home/ubuntu/job-finder`
- **Staging**: `/home/ubuntu/job-finder-staging`
- **Backups**: `/home/ubuntu/backups/`

## ⚡ Quick Checks

```bash
# Check deployment status
curl -f https://jobfinder.saino365.com/api/

# Check containers
docker-compose ps

# Check logs
docker-compose logs -f

# Check backups
ls -la /home/ubuntu/backups/
```

## 🚨 Emergency Procedures

### If Production is Down

1. **Immediate**: Manual rollback via GitHub Actions
2. **Alternative**: SSH rollback using backup
3. **Monitor**: Health check endpoints
4. **Verify**: API functionality

### If Rollback Fails

1. Check backup integrity
2. Verify server access
3. Manual container restart
4. Contact team if needed

## 📞 Key Commands

```bash
# Server access
ssh -i jobfinderopenssh.pem ubuntu@103.209.156.198

# Container management
docker-compose down
docker-compose up -d
docker-compose logs

# Git operations
git fetch origin
git reset --hard origin/production
git log --oneline -10

# Health checks
curl -f https://jobfinder.saino365.com/api/
curl -f https://staging.saino365.com/api/
```
