/**
 * Global setup for e2e tests
 * This file runs ONCE before all tests start
 * It's responsible for starting the Next.js development server
 */

import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

// Store the server process globally so we can kill it later
let serverProcess: ChildProcess | null = null;

/**
 * Waits for the Next.js server to be ready by checking if it responds to requests
 * @param url - The URL to check (default: http://localhost:3000)
 * @param timeout - Maximum time to wait in milliseconds
 */
async function waitForServer(url: string = 'http://localhost:3000', timeout: number = 60000): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      // Try to fetch the homepage
      const response = await fetch(url);
      if (response.ok) {
        console.log('✅ Next.js server is ready!');
        return;
      }
    } catch (error) {
      // Server not ready yet, wait and try again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  throw new Error(`Server did not start within ${timeout}ms`);
}

/**
 * Global setup function - runs before all tests
 */
export default async function globalSetup() {
  console.log('🚀 Starting Next.js server for e2e tests...');
  
  try {
    // Start the Next.js development server
    // 'npm run dev' starts the server on port 3000
    serverProcess = spawn('npm', ['run', 'dev'], {
      // Detach the process so it doesn't inherit our stdio
      stdio: 'pipe',
      // On Windows, we need shell: true to run npm commands
      shell: process.platform === 'win32'
    });

    // Handle server process errors
    serverProcess.on('error', (error) => {
      console.error('❌ Failed to start server:', error);
      throw error;
    });

    // Log server output (helpful for debugging)
    serverProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Ready') || output.includes('started server')) {
        console.log('📝 Server output:', output.trim());
      }
    });

    serverProcess.stderr?.on('data', (data) => {
      const output = data.toString();
      // Only log errors, not warnings
      if (output.includes('Error') || output.includes('error')) {
        console.error('🔥 Server error:', output.trim());
      }
    });

    // Wait for the server to be ready
    await waitForServer();
    
    // Store the process ID so we can kill it in global teardown
    const pidFile = path.join(__dirname, 'server.pid');
    await fs.writeFile(pidFile, serverProcess.pid?.toString() || '');
    
    console.log('✨ Setup complete! Tests can now run.');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    
    // Clean up if setup fails
    if (serverProcess) {
      serverProcess.kill();
    }
    
    throw error;
  }
}
