module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.ts', 
    '**/tests/**/*.test.js',
    '**/tests/**/page.visual.test.ts',
    '**/tests/**/navigation.test.ts',
    '**/tests/**/interactions.test.ts',
    '**/tests/**/form.test.ts',
    '**/tests/**/components.test.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 30000,
  maxWorkers: 1,
  // Organize test runs by page sections
  projects: [
    {
      displayName: 'home',
      testMatch: ['<rootDir>/tests/e2e/home/**/*.test.ts']
    },
    {
      displayName: 'products',
      testMatch: ['<rootDir>/tests/e2e/products/**/*.test.ts']
    },
    {
      displayName: 'cart',
      testMatch: ['<rootDir>/tests/e2e/cart/**/*.test.ts']
    },
    {
      displayName: 'account',
      testMatch: ['<rootDir>/tests/e2e/account/**/*.test.ts']
    },
    {
      displayName: 'about',
      testMatch: ['<rootDir>/tests/e2e/about/**/*.test.ts']
    },
    {
      displayName: 'contact',
      testMatch: ['<rootDir>/tests/e2e/contact/**/*.test.ts']
    },
    {
      displayName: 'shared',
      testMatch: ['<rootDir>/tests/e2e/shared/**/*.test.ts']
    }
  ]
}