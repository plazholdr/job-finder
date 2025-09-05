#!/bin/bash

# Function to check if Docker is running
check_docker() {
  if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker and try again."
    exit 1
  fi
}

# Function to display help
show_help() {
  echo "Usage: ./run.sh [OPTION]"
  echo "Options:"
  echo "  start       Start the application in development mode"
  echo "  stop        Stop the application"
  echo "  restart     Restart the application"
  echo "  logs        Show logs"
  echo "  help        Show this help message"
}

# Check if Docker is running
check_docker

# Process command line arguments
case "$1" in
  start)
    echo "Starting Job Finder application..."
    docker-compose up -d
    echo "Application started. Frontend: http://localhost:3000, Backend: http://localhost:3030"
    echo "Additional services:"
    echo "  - MongoDB: mongodb://localhost:27017"
    echo "  - Redis: redis://localhost:6379"
    echo "  - Mailhog UI: http://localhost:8025"
    echo "  - MinIO Console: http://localhost:9001 (login: minioadmin/minioadmin)"
    ;;
  stop)
    echo "Stopping Job Finder application..."
    docker-compose down
    echo "Application stopped."
    ;;
  restart)
    echo "Restarting Job Finder application..."
    docker-compose down
    docker-compose up -d
    echo "Application restarted."
    ;;
  logs)
    echo "Showing logs..."
    docker-compose logs -f
    ;;
  help|*)
    show_help
    ;;
esac
