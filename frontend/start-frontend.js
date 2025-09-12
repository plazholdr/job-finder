// Simple frontend startup script
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Job Finder Frontend...');
console.log('📍 Working directory:', process.cwd());

// Start Next.js development server
const nextProcess = spawn('npx', ['next', 'dev', '--port', '3000'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

nextProcess.on('error', (error) => {
  console.error('❌ Failed to start frontend:', error);
  process.exit(1);
});

nextProcess.on('close', (code) => {
  console.log(`Frontend process exited with code ${code}`);
  process.exit(code);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down frontend...');
  nextProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down frontend...');
  nextProcess.kill('SIGINT');
});

console.log('✅ Frontend startup script is running...');
