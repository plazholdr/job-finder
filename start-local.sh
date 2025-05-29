#!/bin/bash

echo "🚀 Starting Job Finder Application (Local Mode)"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check if yarn is installed
if ! command -v yarn &> /dev/null; then
    echo "❌ Yarn is not installed. Installing yarn..."
    npm install -g yarn
fi

echo "📦 Installing dependencies..."

# Install root dependencies
echo "   Installing root dependencies..."
yarn install

# Install backend dependencies
echo "   Installing backend dependencies..."
cd backend
yarn install
cd ..

# Install frontend dependencies
echo "   Installing frontend dependencies..."
cd frontend
yarn install
cd ..

echo ""
echo "🔧 Setting up environment..."

# Create local environment files if they don't exist
if [ ! -f backend/.env.local ]; then
    echo "   Creating backend .env.local..."
    cat > backend/.env.local << EOF
NODE_ENV=development
PORT=3030
HOST=localhost

# Database
MONGODB_URI=mongodb://localhost:27017/job-finder

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# App
APP_NAME=Job Finder API
APP_VERSION=1.0.0
EOF
fi

if [ ! -f frontend/.env.local ]; then
    echo "   Creating frontend .env.local..."
    cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3030
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_NAME=Job Finder
EOF
fi

echo ""
echo "🎯 Starting services..."
echo ""
echo "📝 Note: This will start the backend and frontend without Docker."
echo "   You'll need to install and run MongoDB and Redis separately if you want full functionality."
echo ""
echo "🔗 Services will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3030"
echo ""

# Function to handle cleanup
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend
echo "🔧 Starting backend..."
cd backend
yarn dev &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend..."
cd frontend
yarn dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Services started!"
echo ""
echo "🌐 Open your browser and go to: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
