/**
 * Global teardown for e2e tests
 * This file runs ONCE after all tests complete
 * It's responsible for stopping the Next.js development server
 */

import { promises as fs } from 'fs';
import path from 'path';

/**
 * Kills a process by PID
 * @param pid - Process ID to kill
 */
function killProcess(pid: number): void {
  try {
    // Kill the process and all its children
    // On Windows, we use taskkill to force kill the process tree
    if (process.platform === 'win32') {
      require('child_process').execSync(`taskkill /f /t /pid ${pid}`, { stdio: 'ignore' });
    } else {
      // On Unix-like systems, kill the process group
      process.kill(-pid, 'SIGTERM');
    }
    console.log(`✅ Successfully killed process ${pid}`);
  } catch (error) {
    console.log(`⚠️  Process ${pid} may have already been terminated`);
  }
}

/**
 * Global teardown function - runs after all tests complete
 */
export default async function globalTeardown() {
  console.log('🧹 Cleaning up after e2e tests...');
  
  try {
    // Read the server process ID from the file we created in setup
    const pidFile = path.join(__dirname, 'server.pid');
    
    try {
      const pidContent = await fs.readFile(pidFile, 'utf-8');
      const pid = parseInt(pidContent.trim(), 10);
      
      if (pid && !isNaN(pid)) {
        console.log(`🛑 Stopping Next.js server (PID: ${pid})...`);
        killProcess(pid);
      }
      
      // Clean up the PID file
      await fs.unlink(pidFile);
      
    } catch (error) {
      console.log('⚠️  Could not read server PID file - server may have already stopped');
    }
    
    // Give the server a moment to shut down gracefully
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✨ Teardown complete!');
    
  } catch (error) {
    console.error('❌ Error during teardown:', error);
    // Don't throw here - we don't want teardown errors to fail the test suite
  }
}
