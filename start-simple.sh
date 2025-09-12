#!/bin/bash

echo "🚀 Starting Job Finder Application (Simple Mode)"
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the job-finder root directory"
    exit 1
fi

# Function to handle cleanup
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "📦 Installing dependencies..."

# Install root dependencies
echo "   Installing root dependencies..."
npm install --silent

# Install backend dependencies
echo "   Installing backend dependencies..."
cd backend
npm install --silent
cd ..

# Install frontend dependencies
echo "   Installing frontend dependencies..."
cd frontend
npm install --silent
cd ..

echo ""
echo "🔧 Setting up environment..."

# Create backend .env.local if it doesn't exist
if [ ! -f backend/.env.local ]; then
    echo "   Creating backend .env.local..."
    cat > backend/.env.local << 'EOF'
NODE_ENV=development
PORT=3030
HOST=localhost

# Database - Using MongoDB Atlas (you can change this to local MongoDB if you have it)
MONGODB_URI=mongodb+srv://aaronriang99:aaronriang99@cluster0.mm8mypo.mongodb.net/job-finder?retryWrites=true&w=majority&appName=Cluster0

# Redis (optional - will work without it)
REDIS_URI=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# App
APP_NAME=Job Finder API
APP_VERSION=1.0.0

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
EOF
fi

# Create frontend .env.local if it doesn't exist
if [ ! -f frontend/.env.local ]; then
    echo "   Creating frontend .env.local..."
    cat > frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3030
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_NAME=Job Finder
EOF
fi

echo ""
echo "🎯 Starting services..."
echo ""
echo "📝 Note: This will start the backend and frontend without Docker."
echo "   Using MongoDB Atlas for the database."
echo ""
echo "🔗 Services will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3030"
echo "   Health:   http://localhost:3030/health"
echo ""

# Start backend
echo "🔧 Starting backend..."
cd backend
NODE_ENV=development npm run dev &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
echo "   Waiting for backend to start..."
sleep 5

# Test backend health
echo "   Testing backend health..."
if curl -s http://localhost:3030/health > /dev/null; then
    echo "   ✅ Backend is running!"
else
    echo "   ⚠️  Backend might still be starting..."
fi

# Start frontend
echo "🎨 Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Services started!"
echo ""
echo "🌐 Open your browser and go to: http://localhost:3000"
echo ""
echo "🧪 You can test the authentication by:"
echo "   1. Registering a new account"
echo "   2. Logging in with your credentials"
echo "   3. Getting redirected to the appropriate dashboard"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
