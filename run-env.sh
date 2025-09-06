#!/bin/bash

# Function to display help
show_help() {
  echo "Usage: ./run-env.sh [ENVIRONMENT] [COMMAND]"
  echo ""
  echo "Environments:"
  echo "  dev         Development environment (default)"
  echo "  staging     Staging environment"
  echo "  uat         UAT environment"
  echo "  prod        Production environment"
  echo ""
  echo "Commands:"
  echo "  start       Start the application (default)"
  echo "  stop        Stop the application"
  echo "  restart     Restart the application"
  echo "  logs        Show logs"
  echo ""
  echo "Examples:"
  echo "  ./run-env.sh dev start    Start in development environment"
  echo "  ./run-env.sh staging      Start in staging environment"
  echo "  ./run-env.sh prod stop    Stop production environment"
}

# Default values
ENV="dev"
COMMAND="start"

# Process command line arguments
if [ $# -ge 1 ]; then
  case "$1" in
    dev|development)
      ENV="development"
      ;;
    staging)
      ENV="staging"
      ;;
    uat)
      ENV="uat"
      ;;
    prod|production)
      ENV="production"
      ;;
    help|-h|--help)
      show_help
      exit 0
      ;;
    *)
      echo "Unknown environment: $1"
      show_help
      exit 1
      ;;
  esac
fi

if [ $# -ge 2 ]; then
  COMMAND="$2"
fi

# Set environment variables
export NODE_ENV=$ENV

# Execute command
case "$COMMAND" in
  start)
    echo "Starting application in $ENV environment..."
    
    # Create a .env file that points to the environment-specific file
    echo "NODE_ENV=$ENV" > .env
    
    # Start the application using docker-compose
    docker-compose -f docker-compose.yml -f docker-compose.$ENV.yml up -d
    
    echo "Application started in $ENV environment."
    echo "Frontend: http://localhost:3000"
    echo "Backend: http://localhost:3030"
    ;;
  stop)
    echo "Stopping application in $ENV environment..."
    docker-compose -f docker-compose.yml -f docker-compose.$ENV.yml down
    echo "Application stopped."
    ;;
  restart)
    echo "Restarting application in $ENV environment..."
    docker-compose -f docker-compose.yml -f docker-compose.$ENV.yml down
    docker-compose -f docker-compose.yml -f docker-compose.$ENV.yml up -d
    echo "Application restarted in $ENV environment."
    ;;
  logs)
    echo "Showing logs for $ENV environment..."
    docker-compose -f docker-compose.yml -f docker-compose.$ENV.yml logs -f
    ;;
  *)
    echo "Unknown command: $COMMAND"
    show_help
    exit 1
    ;;
esac
