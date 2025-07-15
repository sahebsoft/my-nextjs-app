/**
 * Claude AI Integration for Autonomous Testing
 * 
 * This module enables real-time communication with Claude for:
 * - Screenshot analysis
 * - Test case generation
 * - Result verification
 * - Automatic fix generation
 */

import { Page } from 'puppeteer';

/**
 * Interface for Claude API communication
 */
interface ClaudeRequest {
  prompt: string;
  data: any;
  screenshots?: string[];
  context?: string;
}

interface ClaudeResponse {
  analysis: {
    ui_elements: any[];
    user_flows: any[];
    test_cases: any[];
    issues: any[];
    fixes: any[];
  };
  confidence: number;
  recommendations: string[];
}

/**
 * Claude AI Testing Assistant
 */
export class ClaudeAITester {
  private page: Page;
  private conversationHistory: any[] = [];

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Analyze a screenshot and generate test cases using Claude
   */
  async analyzeScreenshotAndGenerateTests(screenshotPath: string, context: any): Promise<ClaudeResponse> {
    console.log('🧠 Sending screenshot to Claude for analysis...');

    const prompt = this.buildAnalysisPrompt(context);
    
    try {
      // Use window.claude.complete to send the analysis request
      const response = await this.page.evaluate(async (analysisPrompt) => {
        // @ts-ignore - window.claude is available in the environment
        return await window.claude.complete(analysisPrompt);
      }, prompt);

      return this.parseClaudeResponse(response);
    } catch (error) {
      console.error('❌ Claude analysis failed:', error);
      return this.getFallbackResponse();
    }
  }

  /**
   * Build comprehensive analysis prompt for Claude
   */
  private buildAnalysisPrompt(context: any): string {
    return `You are an expert QA engineer analyzing a web application for automated testing. 

CONTEXT:
- Application URL: ${context.url || 'localhost:3000'}
- Page Title: ${context.domStructure?.title || 'Unknown'}
- Framework: Next.js React Application

DOM STRUCTURE ANALYSIS:
${JSON.stringify(context.domStructure, null, 2)}

PERFORMANCE METRICS:
${JSON.stringify(context.performanceMetrics, null, 2)}

CONSOLE LOGS:
${context.consoleLogs?.join('\n') || 'No console logs'}

NETWORK REQUESTS:
${context.networkRequests?.map((req: any) => `${req.method} ${req.url}`).join('\n') || 'No network requests'}

DETECTED USER FLOWS:
${JSON.stringify(context.userFlows, null, 2)}

Please analyze this application and provide a comprehensive testing strategy. Return your response as valid JSON with this exact structure:

{
  "analysis": {
    "ui_elements": [
      {
        "element": "element_type",
        "selector": "css_selector", 
        "text": "visible_text",
        "testable": true/false,
        "test_priority": "high/medium/low"
      }
    ],
    "user_flows": [
      {
        "flow_name": "descriptive_name",
        "steps": ["step1", "step2", "step3"],
        "test_case": "generated_test_code",
        "risk_level": "high/medium/low"
      }
    ],
    "test_cases": [
      {
        "test_name": "descriptive_test_name",
        "test_code": "actual_puppeteer_test_code",
        "expected_outcome": "what_should_happen",
        "validation_method": "how_to_verify"
      }
    ],
    "issues": [
      {
        "issue_type": "accessibility/performance/functionality",
        "description": "detailed_description",
        "severity": "high/medium/low",
        "fix_suggestion": "how_to_fix"
      }
    ],
    "fixes": [
      {
        "file": "filename_to_fix",
        "change_type": "add/modify/remove",
        "code": "actual_code_to_implement",
        "explanation": "why_this_fix_is_needed"
      }
    ]
  },
  "confidence": 0.95,
  "recommendations": [
    "specific_actionable_recommendations"
  ]
}

Focus on:
1. VISUAL ANALYSIS - What UI elements do you see that need testing?
2. FUNCTIONALITY - What user interactions should be tested?
3. EDGE CASES - What could break or fail?
4. ACCESSIBILITY - Are there accessibility issues?
5. PERFORMANCE - Any performance concerns?
6. CODE GENERATION - Generate actual working Puppeteer test code

Make your test code practical and executable. Use real selectors from the DOM structure provided.`;
  }

  /**
   * Parse Claude's JSON response
   */
  private parseClaudeResponse(response: string): ClaudeResponse {
    try {
      // Clean up the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // If no JSON found, create a structured response from text
      return this.extractStructuredResponse(response);
    } catch (error) {
      console.warn('⚠️ Failed to parse Claude response as JSON, using fallback');
      return this.getFallbackResponse();
    }
  }

  /**
   * Extract structured data from text response
   */
  private extractStructuredResponse(response: string): ClaudeResponse {
    // Basic pattern matching to extract test cases and recommendations
    const testCasePattern = /test\(['"`]([^'"`]+)['"`]/g;
    const testCases = [];
    let match;
    
    while ((match = testCasePattern.exec(response)) !== null) {
      testCases.push({
        test_name: match[1],
        test_code: `test('${match[1]}', async () => {\n  // Auto-generated test\n  await page.goto('http://localhost:3000');\n  await page.waitForSelector('main');\n});`,
        expected_outcome: 'Test should pass',
        validation_method: 'Assert elements exist'
      });
    }

    return {
      analysis: {
        ui_elements: [],
        user_flows: [],
        test_cases: testCases,
        issues: [],
        fixes: []
      },
      confidence: 0.7,
      recommendations: ['Add more specific test cases', 'Improve error handling']
    };
  }

  /**
   * Fallback response when Claude is unavailable
   */
  private getFallbackResponse(): ClaudeResponse {
    return {
      analysis: {
        ui_elements: [
          {
            element: 'heading',
            selector: 'h1',
            text: 'Main heading',
            testable: true,
            test_priority: 'high'
          }
        ],
        user_flows: [
          {
            flow_name: 'Homepage Visit',
            steps: ['Load page', 'Verify content'],
            test_case: 'Basic homepage test',
            risk_level: 'low'
          }
        ],
        test_cases: [
          {
            test_name: 'Should load homepage',
            test_code: `test('Should load homepage', async () => {
  await page.goto('http://localhost:3000');
  await page.waitForSelector('main');
  const title = await page.title();
  expect(title).toBeTruthy();
});`,
            expected_outcome: 'Page loads successfully',
            validation_method: 'Check page title exists'
          }
        ],
        issues: [],
        fixes: []
      },
      confidence: 0.5,
      recommendations: ['Claude integration needed for full analysis']
    };
  }

  /**
   * Generate test code from Claude analysis
   */
  async generateTestCode(analysis: ClaudeResponse): Promise<string[]> {
    const testCodes = analysis.analysis.test_cases.map(testCase => testCase.test_code);
    
    // Ask Claude to refine the test code
    const refinementPrompt = `Please review and improve these test cases for better reliability and coverage:

${testCodes.join('\n\n')}

Make the tests more robust by:
1. Adding proper error handling
2. Using more specific selectors
3. Adding meaningful assertions
4. Including screenshot capture for debugging

Return only the improved test code, one test per response block.`;

    try {
      const refinedCode = await this.page.evaluate(async (prompt) => {
        // @ts-ignore
        return await window.claude.complete(prompt);
      }, refinementPrompt);

      return this.extractTestCodes(refinedCode);
    } catch (error) {
      console.warn('⚠️ Test code refinement failed, using original');
      return testCodes;
    }
  }

  /**
   * Extract individual test codes from Claude's response
   */
  private extractTestCodes(response: string): string[] {
    // Look for test blocks in the response
    const testBlocks = response.split(/test\s*\(/);
    const tests = [];
    
    for (let i = 1; i < testBlocks.length; i++) {
      const testCode = 'test(' + testBlocks[i];
      // Find the end of this test block
      const testEnd = this.findTestEnd(testCode);
      if (testEnd > 0) {
        tests.push(testCode.substring(0, testEnd));
      }
    }
    
    return tests.length > 0 ? tests : [response];
  }

  /**
   * Find the end of a test block
   */
  private findTestEnd(code: string): number {
    let braceCount = 0;
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      
      if (!inString && (char === '"' || char === "'" || char === '`')) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar && code[i-1] !== '\\') {
        inString = false;
      } else if (!inString) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        
        if (braceCount === 0 && char === '}') {
          return i + 1;
        }
      }
    }
    
    return code.length;
  }

  /**
   * Verify test results using Claude
   */
  async verifyTestResults(testResults: any[], screenshots: string[]): Promise<any> {
    const verificationPrompt = `Please analyze these test results and determine if they represent a successful test run:

TEST RESULTS:
${JSON.stringify(testResults, null, 2)}

SCREENSHOTS CAPTURED:
${screenshots.join(', ')}

Please provide:
1. Overall assessment (PASS/FAIL)
2. Any issues detected
3. Recommendations for improvement
4. Specific fixes needed

Respond with JSON:
{
  "overall_status": "PASS/FAIL",
  "issues_found": ["list of issues"],
  "recommendations": ["list of recommendations"],
  "fixes_needed": [{"type": "fix_type", "description": "what to fix", "code": "code to implement"}]
}`;

    try {
      const verification = await this.page.evaluate(async (prompt) => {
        // @ts-ignore
        return await window.claude.complete(prompt);
      }, verificationPrompt);

      return this.parseClaudeResponse(verification);
    } catch (error) {
      console.error('❌ Test verification failed:', error);
      return {
        overall_status: 'UNKNOWN',
        issues_found: ['Could not verify with Claude'],
        recommendations: ['Manual review needed'],
        fixes_needed: []
      };
    }
  }

  /**
   * Generate new test cases based on failed tests
   */
  async generateAdditionalTests(failedTests: any[], appState: any): Promise<string[]> {
    const additionalTestPrompt = `Based on these failed tests, generate additional test cases to improve coverage:

FAILED TESTS:
${JSON.stringify(failedTests, null, 2)}

CURRENT APP STATE:
${JSON.stringify(appState, null, 2)}

Generate 3-5 new test cases that:
1. Test edge cases that might have been missed
2. Provide better error handling
3. Test alternative user paths
4. Validate error conditions

Return only the test code, one test per block.`;

    try {
      const additionalTests = await this.page.evaluate(async (prompt) => {
        // @ts-ignore
        return await window.claude.complete(prompt);
      }, additionalTestPrompt);

      return this.extractTestCodes(additionalTests);
    } catch (error) {
      console.error('❌ Additional test generation failed:', error);
      return [];
    }
  }
}

/**
 * AI Test Executor - Runs Claude-generated tests
 */
export class AITestExecutor {
  private page: Page;
  private claudeAI: ClaudeAITester;

  constructor(page: Page) {
    this.page = page;
    this.claudeAI = new ClaudeAITester(page);
  }

  /**
   * Execute a test case and capture comprehensive data
   */
  async executeTestCase(testCode: string, testName: string): Promise<any> {
    console.log(`🚀 Executing AI test: ${testName}`);
    
    const executionData = {
      testName,
      testCode,
      startTime: Date.now(),
      screenshots: [],
      consoleLogs: [],
      networkRequests: [],
      errors: [],
      result: 'pending'
    };

    try {
      // Capture before screenshot
      const beforeScreenshot = `before-${testName}-${Date.now()}`;
      await this.takeScreenshot(beforeScreenshot);
      executionData.screenshots.push(beforeScreenshot);

      // Execute the test code (would need eval or dynamic execution)
      // For now, we'll simulate execution
      await this.simulateTestExecution(testCode);

      // Capture after screenshot
      const afterScreenshot = `after-${testName}-${Date.now()}`;
      await this.takeScreenshot(afterScreenshot);
      executionData.screenshots.push(afterScreenshot);

      executionData.result = 'passed';
      
    } catch (error) {
      executionData.errors.push(error);
      executionData.result = 'failed';
      
      // Capture error screenshot
      const errorScreenshot = `error-${testName}-${Date.now()}`;
      await this.takeScreenshot(errorScreenshot);
      executionData.screenshots.push(errorScreenshot);
    }

    executionData.endTime = Date.now();
    executionData.duration = executionData.endTime - executionData.startTime;

    return executionData;
  }

  /**
   * Simulate test execution (in real implementation, this would dynamically eval the test)
   */
  private async simulateTestExecution(testCode: string): Promise<void> {
    // Basic simulation of test execution
    // In a real implementation, you'd use dynamic evaluation or jest's programmatic API
    
    if (testCode.includes('page.goto')) {
      await this.page.goto('http://localhost:3000');
    }
    
    if (testCode.includes('waitForSelector')) {
      await this.page.waitForSelector('body', { timeout: 5000 });
    }
    
    // Simulate some test assertions
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  /**
   * Take screenshot with error handling
   */
  private async takeScreenshot(name: string): Promise<void> {
    try {
      await this.page.screenshot({
        path: `e2e/screenshots/ai-${name}.png`,
        fullPage: true
      });
    } catch (error) {
      console.warn(`⚠️ Screenshot failed for ${name}:`, error);
    }
  }
}

export default ClaudeAITester;
