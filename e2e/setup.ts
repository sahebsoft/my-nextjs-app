/**
 * Setup file that runs before each test file
 * This configures Jest and sets up common test utilities
 */

// Extend Jest's expect with custom matchers if needed
// You can add custom assertions here

// Set longer timeout for individual tests
// E2E tests often need more time than the default 5 seconds
jest.setTimeout(30000);

// Global error handling for unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
});

// You can add global test utilities here
// For example, a function to wait for elements to appear

global.waitFor = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Log when tests start and end (helpful for debugging)
beforeEach(() => {
  console.log(`🧪 Starting test: ${expect.getState().currentTestName}`);
});

afterEach(() => {
  console.log(`✅ Completed test: ${expect.getState().currentTestName}`);
});

// Export empty object to make this a module
export { };
