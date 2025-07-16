#!/usr/bin/env ts-node

// AI Workflow Command Line Interface
// Production-ready script to run the complete AI testing workflow

import { startAIDevelopmentWorkflow } from '../src/lib/ai-workflow-orchestrator';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface Config {
  baseUrl: string;
  port: number;
  timeout: number;
  verbose: boolean;
}

class AIWorkflowCLI {
  private config: Config;
  private devServerProcess: any = null;

  constructor(options: Partial<Config> = {}) {
    this.config = {
      baseUrl: options.baseUrl || 'http://localhost:3001',
      port: options.port || 3001,
      timeout: options.timeout || 300000, // 5 minutes
      verbose: options.verbose || false
    };
  }

  async run(): Promise<void> {
    console.log('🚀 Starting AI-Driven Development Workflow...\n');
    
    try {
      // Check if server is already running
      const isServerRunning = await this.checkServerHealth();
      
      if (!isServerRunning) {
        console.log('⚠️  Development server not detected, please start it manually with: pnpm dev');
        process.exit(1);
      }

      console.log('✅ Development server is running\n');

      // Start the AI workflow
      await this.runWorkflow();

    } catch (error) {
      console.error('❌ Workflow failed:', error);
      process.exit(1);
    }
  }

  private async checkServerHealth(): Promise<boolean> {
    try {
      const { spawn } = require('child_process');
      const curl = spawn('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', this.config.baseUrl]);
      
      return new Promise((resolve) => {
        let output = '';
        curl.stdout.on('data', (data: Buffer) => {
          output += data.toString();
        });

        curl.on('close', (code: number) => {
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

  private async runWorkflow(): Promise<void> {
    console.log('🤖 Initializing AI Testing Orchestrator...\n');

    const startTime = Date.now();
    
    // Set timeout for the entire workflow
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Workflow timed out after ${this.config.timeout / 1000} seconds`));
      }, this.config.timeout);
    });

    try {
      await Promise.race([
        startAIDevelopmentWorkflow(this.config.baseUrl),
        timeoutPromise
      ]);

      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);
      
      console.log(`\n✅ AI Development Workflow completed successfully!`);
      console.log(`⏱️  Total duration: ${duration} seconds`);
      console.log(`📊 Check the screenshots/ directory for detailed analysis results`);
      console.log(`📋 Review the analysis-report.json file for comprehensive insights\n`);

    } catch (error) {
      throw error;
    }
  }

  private log(message: string): void {
    if (this.config.verbose) {
      console.log(`[${new Date().toISOString()}] ${message}`);
    }
  }
}

// Parse command line arguments
function parseArgs(): Partial<Config> {
  const args = process.argv.slice(2);
  const config: Partial<Config> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--url':
      case '-u':
        config.baseUrl = args[i + 1];
        i++;
        break;
      case '--port':
      case '-p':
        config.port = parseInt(args[i + 1]);
        i++;
        break;
      case '--timeout':
      case '-t':
        config.timeout = parseInt(args[i + 1]) * 1000; // Convert to milliseconds
        i++;
        break;
      case '--verbose':
      case '-v':
        config.verbose = true;
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
    }
  }

  return config;
}

function showHelp(): void {
  console.log(`
AI Workflow CLI - Autonomous Next.js Testing and Development

Usage: npx ts-node scripts/run-ai-workflow.ts [options]

Options:
  -u, --url <url>        Base URL for testing (default: http://localhost:3001)
  -p, --port <port>      Port number (default: 3001)
  -t, --timeout <sec>    Timeout in seconds (default: 300)
  -v, --verbose          Enable verbose logging
  -h, --help             Show this help message

Examples:
  npx ts-node scripts/run-ai-workflow.ts
  npx ts-node scripts/run-ai-workflow.ts --url http://localhost:3000 --verbose
  npx ts-node scripts/run-ai-workflow.ts --timeout 600 --port 3000
  `);
}

// Main execution
async function main() {
  const config = parseArgs();
  const cli = new AIWorkflowCLI(config);
  
  process.on('SIGINT', () => {
    console.log('\n⚠️  Workflow interrupted by user');
    process.exit(1);
  });

  process.on('SIGTERM', () => {
    console.log('\n⚠️  Workflow terminated');
    process.exit(1);
  });

  await cli.run();
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { AIWorkflowCLI };