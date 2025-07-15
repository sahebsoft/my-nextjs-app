#!/usr/bin/env node

/**
 * Enhanced AI Testing Runner with Real Claude Integration
 * 
 * This script demonstrates how to run your AI testing system with
 * real-time Claude analysis when available.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🤖 ENHANCED AI-DRIVEN TESTING SYSTEM');
console.log('====================================');

// Check if the AI testing system is properly set up
function verifyAITestingSetup() {
  const requiredFiles = [
    'e2e/ai-autonomous-testing.test.ts',
    'e2e/ai-complete-workflow.test.ts', 
    'e2e/claude-integration-example.test.ts',
    'e2e/utils/claude-ai-tester.ts',
    'e2e/utils/puppeteer-helpers.ts'
  ];

  console.log('🔍 Verifying AI testing setup...');
  
  const missingFiles = requiredFiles.filter(file => {
    const exists = fs.existsSync(path.join(__dirname, file));
    console.log(`${exists ? '✅' : '❌'} ${file}`);
    return !exists;
  });

  if (missingFiles.length > 0) {
    console.error('❌ Missing required AI testing files:', missingFiles);
    process.exit(1);
  }

  console.log('✅ AI testing system is properly configured!');
}

// Check if Next.js development server is running
async function checkServer() {
  console.log('\n🌐 Checking Next.js development server...');
  
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      console.log('✅ Next.js server is running on http://localhost:3000');
      return true;
    }
  } catch (error) {
    console.log('❌ Next.js server is not running');
    console.log('💡 Please start your server with: npm run dev');
    return false;
  }
}

// Run AI tests with enhanced monitoring
function runAITests(testType = 'workflow') {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Starting AI ${testType} testing...`);
    
    const commands = {
      'workflow': ['npm', 'run', 'test:ai:workflow'],
      'autonomous': ['npm', 'run', 'test:ai:autonomous'], 
      'all': ['npm', 'run', 'test:ai'],
      'headless': ['npm', 'run', 'test:ai:headless']
    };

    const command = commands[testType] || commands['workflow'];
    
    const testProcess = spawn(command[0], command.slice(1), {
      stdio: 'inherit',
      shell: true
    });

    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ AI ${testType} testing completed successfully!`);
        resolve(code);
      } else {
        console.error(`\n❌ AI testing failed with exit code ${code}`);
        reject(new Error(`Test failed with code ${code}`));
      }
    });

    testProcess.on('error', (error) => {
      console.error('❌ Failed to start AI testing:', error);
      reject(error);
    });
  });
}

// Display AI testing results
function displayResults() {
  console.log('\n📊 AI TESTING RESULTS SUMMARY');
  console.log('=============================');

  // Check for generated screenshots
  const screenshotsDir = path.join(__dirname, 'e2e', 'screenshots');
  if (fs.existsSync(screenshotsDir)) {
    const screenshots = fs.readdirSync(screenshotsDir)
      .filter(file => file.startsWith('ai-') && file.endsWith('.png'));
    
    console.log(`📸 Screenshots captured: ${screenshots.length}`);
    screenshots.slice(0, 5).forEach(file => {
      console.log(`   • ${file}`);
    });
    if (screenshots.length > 5) {
      console.log(`   • ... and ${screenshots.length - 5} more`);
    }
  }

  // Check for AI reports
  const reportsDir = path.join(__dirname, 'e2e', 'reports');
  if (fs.existsSync(reportsDir)) {
    const reports = fs.readdirSync(reportsDir)
      .filter(file => file.endsWith('.json'));
    
    console.log(`📋 AI analysis reports: ${reports.length}`);
    reports.slice(0, 3).forEach(file => {
      console.log(`   • ${file}`);
    });
  }

  console.log('\n🎯 Next Steps:');
  console.log('1. Review screenshots in e2e/screenshots/');
  console.log('2. Check console output for AI recommendations');
  console.log('3. Implement suggested improvements');
  console.log('4. Re-run tests to verify improvements');
}

// Main execution
async function main() {
  try {
    // Verify setup
    verifyAITestingSetup();
    
    // Check if server is running
    const serverRunning = await checkServer();
    if (!serverRunning) {
      console.log('\n⏳ Starting Next.js development server...');
      const serverProcess = spawn('npm', ['run', 'dev'], {
        detached: true,
        stdio: 'ignore'
      });
      
      console.log('⏳ Waiting for server to start...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Get test type from command line arguments
    const testType = process.argv[2] || 'workflow';
    
    console.log(`\n🎯 Running AI testing mode: ${testType}`);
    console.log('\nAvailable modes:');
    console.log('• workflow  - Complete 6-phase AI workflow (recommended)');
    console.log('• autonomous - Core autonomous testing system');
    console.log('• all       - All AI tests with visible browser');
    console.log('• headless  - Fast headless AI testing');

    // Run the AI tests
    await runAITests(testType);
    
    // Display results
    displayResults();
    
    console.log('\n🎉 AI Testing Session Complete!');
    console.log('================================');
    console.log('Your AI testing system has analyzed your Next.js application,');
    console.log('generated intelligent test cases, and provided recommendations');
    console.log('for improvements. The AI will continue learning and improving');
    console.log('with each test run!');

  } catch (error) {
    console.error('\n❌ AI Testing failed:', error.message);
    process.exit(1);
  }
}

// Handle command line execution
if (require.main === module) {
  main();
}

module.exports = {
  verifyAITestingSetup,
  checkServer,
  runAITests,
  displayResults,
  main
};
