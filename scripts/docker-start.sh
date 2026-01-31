#!/bin/bash
set -e

echo "🚀 Starting StageFinder..."

# Stop and remove existing containers
echo "📦 Stopping existing containers..."
docker compose down --remove-orphans 2>/dev/null || true

# Remove old volumes if fresh start is requested
if [ "$1" = "--fresh" ]; then
    echo "🗑️  Removing old volumes for fresh start..."
    docker volume rm stagefinder-app_postgres_data 2>/dev/null || true
    docker volume rm stagefinder-app_uploads_data 2>/dev/null || true
fi

# Build and start services
echo "🔨 Building and starting services..."
docker compose up --build -d

# Wait for database to be ready
echo "⏳ Waiting for database..."
sleep 5

# Run Prisma migrations
echo "🔄 Running database migrations..."
docker compose exec -T app npx prisma migrate deploy 2>/dev/null || \
docker compose exec -T app npx prisma db push --accept-data-loss

echo ""
echo "✅ StageFinder is ready!"
echo ""
echo "🌐 Application: http://localhost:3000"
echo "🗄️  Database: localhost:5433"
echo ""
echo "📝 Useful commands:"
echo "   docker compose logs -f app    # View app logs"
echo "   docker compose logs -f postgres  # View DB logs"
echo "   docker compose down           # Stop all services"
echo ""
