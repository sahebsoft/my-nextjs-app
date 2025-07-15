// Jest configuration specifically for End-to-End testing
// This separates e2e tests from unit tests and configures the environment for browser testing

module.exports = {
  // Tell Jest this is for e2e testing - helps with organization
  displayName: 'E2E Tests',
  
  // Look for test files in the e2e directory with these patterns
  testMatch: ['<rootDir>/e2e/**/*.test.{js,ts}'],
  
  // Use ts-jest to handle TypeScript files
  preset: 'ts-jest',
  
  // Set up the test environment for Node.js (since Puppeteer runs in Node)
  testEnvironment: 'node',
  
  // Global setup and teardown files
  // setupFilesAfterEnv runs before each test file
  setupFilesAfterEnv: ['<rootDir>/e2e/setup.ts'],
  
  // Global setup runs once before all tests
  globalSetup: '<rootDir>/e2e/global-setup.ts',
  
  // Global teardown runs once after all tests
  globalTeardown: '<rootDir>/e2e/global-teardown.ts',
  
  // Increase timeout for e2e tests (they take longer than unit tests)
  testTimeout: 30000,
  
  // Transform configuration for TypeScript
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // Verbose output to see which tests are running
  verbose: true,
};
