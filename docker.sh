#!/bin/bash

# Docker Development Scripts for Timesheet App

echo "🐳 Timesheet App Docker Management"
echo "================================="

case "$1" in
  "dev")
    echo "🚀 Starting development environment..."
    docker-compose -f docker-compose.dev.yml up --build
    ;;
  "prod")
    echo "🏭 Starting production environment..."
    docker-compose -f docker-compose.prod.yml up --build -d
    ;;
  "stop")
    echo "⏹️  Stopping all containers..."
    docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.prod.yml down
    docker-compose down
    ;;
  "clean")
    echo "🧹 Cleaning up Docker resources..."
    docker-compose down -v --remove-orphans
    docker system prune -f
    ;;
  "logs")
    echo "📋 Showing logs..."
    if [ "$2" = "prod" ]; then
      docker-compose -f docker-compose.prod.yml logs -f
    else
      docker-compose -f docker-compose.dev.yml logs -f
    fi
    ;;
  "shell")
    echo "🐚 Opening shell in app container..."
    if [ "$2" = "prod" ]; then
      docker-compose -f docker-compose.prod.yml exec timesheet-prod sh
    else
      docker-compose -f docker-compose.dev.yml exec timesheet-dev sh
    fi
    ;;
  "db-reset")
    echo "🗄️  Resetting database..."
    if [ "$2" = "prod" ]; then
      docker-compose -f docker-compose.prod.yml exec timesheet-prod npx prisma db push --force-reset
    else
      docker-compose -f docker-compose.dev.yml exec timesheet-dev npx prisma db push --force-reset
    fi
    ;;
  "build")
    echo "🔨 Building images..."
    if [ "$2" = "prod" ]; then
      docker-compose -f docker-compose.prod.yml build
    else
      docker-compose -f docker-compose.dev.yml build
    fi
    ;;
  *)
    echo "Usage: $0 {dev|prod|stop|clean|logs|shell|db-reset|build} [prod]"
    echo ""
    echo "Commands:"
    echo "  dev      - Start development environment"
    echo "  prod     - Start production environment"
    echo "  stop     - Stop all containers"
    echo "  clean    - Clean up Docker resources"
    echo "  logs     - Show container logs"
    echo "  shell    - Open shell in app container"
    echo "  db-reset - Reset database (dangerous!)"
    echo "  build    - Build Docker images"
    echo ""
    echo "Examples:"
    echo "  $0 dev           # Start development"
    echo "  $0 logs prod     # Show production logs"
    echo "  $0 shell         # Open development shell"
    exit 1
    ;;
esac
