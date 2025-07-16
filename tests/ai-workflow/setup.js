// Setup for AI Workflow tests
const { spawn } = require('child_process');

// Global timeout for all AI workflow tests
jest.setTimeout(600000); // 10 minutes

let devServer = null;

// Global setup - start dev server
beforeAll(async () => {
  // Check if server is already running
  const isRunning = await checkServerHealth('http://localhost:3001');
  
  if (!isRunning) {
    console.log('Starting Next.js development server for AI workflow tests...');
    devServer = spawn('pnpm', ['dev'], {
      stdio: 'pipe',
      detached: false
    });

    // Wait for server to be ready
    await waitForServer('http://localhost:3001', 60000);
    console.log('Development server ready for AI workflow tests');
  } else {
    console.log('Development server already running');
  }
});

// Global teardown
afterAll(async () => {
  if (devServer) {
    console.log('Shutting down development server...');
    devServer.kill();
    
    // Wait a bit for graceful shutdown
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
});

async function checkServerHealth(url) {
  try {
    const { spawn } = require('child_process');
    const curl = spawn('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', url]);
    
    return new Promise((resolve) => {
      let output = '';
      curl.stdout.on('data', (data) => {
        output += data.toString();
      });

      curl.on('close', (code) => {
        resolve(output === '200');
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        curl.kill();
        resolve(false);
      }, 5000);
    });
  } catch (error) {
    return false;
  }
}

async function waitForServer(url, timeout = 60000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const isReady = await checkServerHealth(url);
    if (isReady) {
      return true;
    }
    
    // Wait 1 second before next check
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error(`Server not ready after ${timeout}ms`);
}