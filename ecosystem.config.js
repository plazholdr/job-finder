module.exports = {
  apps: [
    {
      name: 'job-finder-backend-staging',
      cwd: '/home/ubuntu/job-finder-staging/backend',
      script: 'npm',
      args: 'start'
    },
    {
      name: 'job-finder-frontend-staging',
      cwd: '/home/ubuntu/job-finder-staging/frontend',
      script: 'npm',
      args: 'start -- -p 4000'
    },
    {
      name: 'job-finder-backend-prod',
      cwd: '/home/ubuntu/job-finder-production/backend',
      script: 'npm',
      args: 'start'
    },
    {
      name: 'job-finder-frontend-prod',
      cwd: '/home/ubuntu/job-finder-production/frontend',
      script: 'npm',
      args: 'start -- -p 3000'
    }
  ]
};

