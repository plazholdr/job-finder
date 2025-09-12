#!/bin/bash

# PM2 Management Commands for Job Finder

echo "=== Job Finder PM2 Management ==="
echo ""

case $1 in
  "status")
    echo "Current PM2 Status:"
    pm2 status
    ;;
  "logs")
    if [ -z "$2" ]; then
      echo "All application logs:"
      pm2 logs --lines 20
    else
      echo "Logs for $2:"
      pm2 logs $2 --lines 20
    fi
    ;;
  "restart-staging")
    echo "Restarting staging environment..."
    pm2 restart job-finder-backend-staging job-finder-frontend-staging
    ;;
  "restart-production")
    echo "Restarting production environment..."
    pm2 restart job-finder-backend-prod job-finder-frontend-prod
    ;;
  "restart-all")
    echo "Restarting all applications..."
    pm2 restart all
    ;;
  "stop-staging")
    echo "Stopping staging environment..."
    pm2 stop job-finder-backend-staging job-finder-frontend-staging
    ;;
  "stop-production")
    echo "Stopping production environment..."
    pm2 stop job-finder-backend-prod job-finder-frontend-prod
    ;;
  "start-staging")
    echo "Starting staging environment..."
    pm2 start job-finder-backend-staging job-finder-frontend-staging
    ;;
  "start-production")
    echo "Starting production environment..."
    pm2 start job-finder-backend-prod job-finder-frontend-prod
    ;;
  "monit")
    echo "Opening PM2 monitoring..."
    pm2 monit
    ;;
  "save")
    echo "Saving PM2 configuration..."
    pm2 save
    ;;
  *)
    echo "Usage: $0 {status|logs [app-name]|restart-staging|restart-production|restart-all|stop-staging|stop-production|start-staging|start-production|monit|save}"
    echo ""
    echo "Examples:"
    echo "  $0 status                    # Show current status"
    echo "  $0 logs                      # Show all logs"
    echo "  $0 logs job-finder-backend-staging  # Show specific app logs"
    echo "  $0 restart-staging           # Restart staging environment"
    echo "  $0 restart-production        # Restart production environment"
    echo "  $0 monit                     # Open monitoring dashboard"
    ;;
esac
