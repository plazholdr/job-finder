# Database Setup - MongoDB Atlas

## Overview
The application has been configured to use MongoDB Atlas instead of a local MongoDB instance.

## MongoDB Atlas Configuration

### Connection String
```
mongodb+srv://aaronriang99:<db_password>@cluster0.mm8mypo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### Database Names by Environment
- **Development**: `job-finder`
- **Staging**: `job-finder-staging`
- **UAT**: `job-finder-uat`
- **Production**: `job-finder-production`

## Setup Instructions

### 1. Set Your Database Password

You need to replace `<db_password>` with your actual MongoDB Atlas password in the environment files:

**Option A: Update the .env files directly**
- Edit `backend/.env.development` 
- Edit `backend/.env.staging`
- Edit `backend/.env.uat`
- Edit `backend/.env.production`

**Option B: Create a local .env file**
- Create `backend/.env` with your actual password
- Add: `MONGODB_URI=mongodb+srv://aaronriang99:YOUR_ACTUAL_PASSWORD@cluster0.mm8mypo.mongodb.net/job-finder?retryWrites=true&w=majority&appName=Cluster0`

### 2. MongoDB Atlas Setup Checklist

Ensure your MongoDB Atlas cluster is configured correctly:

- [ ] Cluster is running and accessible
- [ ] Database user `aaronriang99` exists with appropriate permissions
- [ ] Network access is configured (IP whitelist includes your development environment)
- [ ] Connection string is correct

### 3. Test the Connection

To test the database connection:

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already done)
npm install

# Start the backend server
npm run dev
```

The server should start without database connection errors.

### 4. Docker Compose Changes

The `docker-compose.yml` has been updated:
- Local MongoDB service is commented out
- Backend service now uses MongoDB Atlas
- MongoDB data volume is no longer needed

### 5. Environment Variables

Each environment now uses a separate database:
- Development: Uses `job-finder` database
- Staging: Uses `job-finder-staging` database  
- UAT: Uses `job-finder-uat` database
- Production: Uses `job-finder-production` database

This ensures data isolation between environments.

## Security Notes

- Never commit your actual database password to version control
- Use environment variables or secure secret management in production
- Consider using different MongoDB Atlas users for different environments
- Regularly rotate database passwords

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Check network access settings in MongoDB Atlas
   - Ensure your IP is whitelisted

2. **Authentication Failed**
   - Verify username and password are correct
   - Check user permissions in MongoDB Atlas

3. **Database Not Found**
   - MongoDB will create the database automatically when first accessed
   - Ensure the database name in the connection string is correct

### Support

If you encounter issues:
1. Check MongoDB Atlas logs
2. Verify connection string format
3. Test connection using MongoDB Compass or mongo shell
