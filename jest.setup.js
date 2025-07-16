// Jest setup file for AI-driven visual testing workflow
process.env.NODE_ENV = 'test'

// Global test configuration
global.AI_WORKFLOW_BASE_URL = process.env.AI_WORKFLOW_BASE_URL || 'http://localhost:3003'

// Console output helpers for test reporting
global.logVisualTest = (testName, beforeScreenshot, afterScreenshot) => {
  console.log(`📸 Visual test complete: ${testName}`)
  console.log(`📸 Before: ${beforeScreenshot}`)
  console.log(`📸 After: ${afterScreenshot}`)
}

global.logNavigationIssues = (issues) => {
  if (issues.length > 0) {
    console.log('🚨 Navigation Issues Found:')
    issues.forEach(issue => {
      console.log(`- ${issue.text} (${issue.href}): ${issue.issue}`)
    })
    
    console.log('\\n📋 Todo Items to Add:')
    issues.forEach(issue => {
      console.log(`- Fix navigation link "${issue.text}" - ${issue.issue}`)
    })
  }
}

// Test timeout configuration
jest.setTimeout(30000)

// Suppress console warnings for cleaner test output
const originalWarn = console.warn
console.warn = (message) => {
  if (message.includes('deprecated') || message.includes('warning')) {
    return
  }
  originalWarn(message)
}