module.exports = {
  apps: [
    // Production Backend (Sebastian Branch - env=production)
    {
      name: 'job-finder-backend-prod',
      script: 'src/index.js',
      cwd: '/home/ubuntu/job-finder-production/backend',
      env: {
        NODE_ENV: 'production',
  PORT: 3030,
  FRONTEND_URL: 'http://jobfinder.saino365.com'
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: '/home/ubuntu/logs/job-finder-backend-prod-error.log',
      out_file: '/home/ubuntu/logs/job-finder-backend-prod-out.log',
      log_file: '/home/ubuntu/logs/job-finder-backend-prod.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    },

    // Production Frontend (Sebastian Branch - env=production)
    {
      name: 'job-finder-frontend-prod',
      script: 'npm',
  args: 'run start',
      cwd: '/home/ubuntu/job-finder-production/frontend',
      env: {
        NODE_ENV: 'production',
  PORT: 3000,
  BACKEND_URL: 'http://jobfinder.saino365.com/api',
  NEXT_PUBLIC_API_URL: 'http://jobfinder.saino365.com/api'
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: '/home/ubuntu/logs/job-finder-frontend-prod-error.log',
      out_file: '/home/ubuntu/logs/job-finder-frontend-prod-out.log',
      log_file: '/home/ubuntu/logs/job-finder-frontend-prod.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    },

    // Staging Backend (Aaron Branch - env=staging)
    {
      name: 'job-finder-backend-staging',
      script: 'src/index.js',
      cwd: '/home/ubuntu/job-finder-staging/backend',
      env: {
        NODE_ENV: 'staging',
        PORT: 4030
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: '/home/ubuntu/logs/job-finder-backend-staging-error.log',
      out_file: '/home/ubuntu/logs/job-finder-backend-staging-out.log',
      log_file: '/home/ubuntu/logs/job-finder-backend-staging.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    },

    // Staging Frontend (Aaron Branch - env=staging)
    {
      name: 'job-finder-frontend-staging',
      script: 'npm',
      args: 'run dev',
      cwd: '/home/ubuntu/job-finder-staging/frontend',
      env: {
        NODE_ENV: 'staging',
        PORT: 4000
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: '/home/ubuntu/logs/job-finder-frontend-staging-error.log',
      out_file: '/home/ubuntu/logs/job-finder-frontend-staging-out.log',
      log_file: '/home/ubuntu/logs/job-finder-frontend-staging.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
