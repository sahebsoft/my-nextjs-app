// AI-Driven Next.js Development & Testing Workflow Implementation
// Based on documentation specs for autonomous testing and bug fixing

import { PuppeteerAIAnalyzer } from './puppeteer-ai-analyzer';

interface TestItem {
  id: string;
  url: string;
  type: 'initial' | 'route-discovery' | 'form-testing' | 'interaction-testing' | 'api-testing';
  priority: number;
  testCases: string[];
}

interface TestResult {
  testId: string;
  url: string;
  screenshot: any;
  elements: any[];
  apiCalls: any[];
  routes: string[];
  performance: Record<string, any>;
  errors: any[];
}

interface Bug {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  url: string;
  status?: string;
}

interface Analysis {
  bugs: Bug[];
  discoveredRoutes: string[];
  hasForm: boolean;
  hasInteractiveElements: boolean;
  hasApiCalls: boolean;
  currentUrl: string;
  recommendations: string[];
  visualIssues?: any;
  performanceIssues?: any;
}

export class AITestingOrchestrator {
  private testQueue: TestItem[] = [];
  private completedTests: any[] = [];
  private discoveredRoutes = new Set<string>();
  private bugs: Bug[] = [];
  private screenshots: any[] = [];
  private testResults: Record<string, any> = {};
  private aiAnalyzer: PuppeteerAIAnalyzer;
  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.aiAnalyzer = new PuppeteerAIAnalyzer();
  }

  async startWorkflow(): Promise<void> {
    console.log("🤖 AI Development Workflow Starting...");

    try {
      // Phase 1: Initialize and analyze project
      await this.initializeProject();

      // Phase 2: Start with home page
      await this.generateInitialTest();

      // Phase 3: Main testing loop
      await this.executeTestingLoop();

      // Phase 4: Generate final report
      await this.generateFinalReport();
    } catch (error) {
      console.error("❌ Workflow failed:", error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  private async initializeProject(): Promise<void> {
    console.log("📁 Initializing project analysis...");

    // Initialize AI analysis engine (Puppeteer)
    await this.aiAnalyzer.initialize();

    // Add home page to discovered routes
    this.discoveredRoutes.add('/');
  }

  private async generateInitialTest(): Promise<void> {
    const homePageTest: TestItem = {
      id: 'home-page-test',
      url: '/',
      type: 'initial',
      priority: 1,
      testCases: [
        'page-load',
        'screenshot-capture',
        'element-discovery',
        'route-discovery',
        'api-call-detection'
      ]
    };

    this.testQueue.push(homePageTest);
    console.log("✅ Initial home page test generated");
  }

  private async executeTestingLoop(): Promise<void> {
    while (this.testQueue.length > 0) {
      const currentTest = this.testQueue.shift()!;
      console.log(`🧪 Executing test: ${currentTest.id}`);

      try {
        // Execute the test
        const testResult = await this.executeTest(currentTest);

        // Analyze results with AI
        const analysis = await this.analyzeTestResults(testResult);

        // Handle bugs if found
        if (analysis.bugs.length > 0) {
          await this.handleBugs(analysis.bugs);
          // Re-run the test after fixes
          this.testQueue.unshift(currentTest);
          continue;
        }

        // Discover new routes/pages
        await this.discoverNewRoutes(analysis);

        // Generate new tests based on discoveries
        await this.generateFollowUpTests(analysis);

        // Mark test as complete
        this.completedTests.push({
          ...currentTest,
          result: testResult,
          analysis: analysis,
          timestamp: new Date()
        });

      } catch (error) {
        console.error(`❌ Test failed: ${currentTest.id}`, error);
        await this.handleTestFailure(currentTest, error);
      }
    }
  }

  private async executeTest(test: TestItem): Promise<TestResult> {
    console.log(`📸 Analyzing page: ${test.url}`);
    
    const fullUrl = `${this.baseUrl}${test.url}`;
    const analysis = await this.aiAnalyzer.captureAndAnalyzePage(fullUrl, test.id);

    // Convert analysis to TestResult format
    const result: TestResult = {
      testId: test.id,
      url: test.url,
      screenshot: analysis.screenshots,
      elements: analysis.elements?.interactive || [],
      apiCalls: [], // Would be populated by network monitoring
      routes: this.extractRoutes(analysis.elements),
      performance: analysis.performance,
      errors: analysis.errors
    };

    return result;
  }

  private extractRoutes(elements: any): string[] {
    if (!elements?.interactive) return [];
    
    return elements.interactive
      .filter((el: any) => el.tag === 'A' && el.href)
      .map((el: any) => {
        try {
          const url = new URL(el.href);
          return url.pathname;
        } catch {
          return el.href.startsWith('/') ? el.href : null;
        }
      })
      .filter((href: string | null) => href !== null) as string[];
  }

  private async analyzeTestResults(testResult: TestResult): Promise<Analysis> {
    const analysis: Analysis = {
      bugs: [],
      discoveredRoutes: testResult.routes,
      hasForm: this.detectForms(testResult.elements),
      hasInteractiveElements: this.detectInteractiveElements(testResult.elements),
      hasApiCalls: testResult.apiCalls.length > 0,
      currentUrl: testResult.url,
      recommendations: []
    };

    // Detect bugs from errors
    analysis.bugs = this.detectBugs(testResult);

    return analysis;
  }

  private detectForms(elements: any[]): boolean {
    return elements.some(el =>
      ['FORM', 'INPUT', 'TEXTAREA', 'SELECT'].includes(el.tag)
    );
  }

  private detectInteractiveElements(elements: any[]): boolean {
    return elements.some(el =>
      ['BUTTON', 'A'].includes(el.tag) || el.onclick
    );
  }

  private detectBugs(testResult: TestResult): Bug[] {
    const bugs: Bug[] = [];

    // Check for errors
    testResult.errors.forEach(error => {
      bugs.push({
        type: 'runtime-error',
        severity: 'high',
        description: typeof error === 'string' ? error : error.message || 'Unknown error',
        url: testResult.url
      });
    });

    // Check for performance issues
    if (testResult.performance?.loadTime > 3000) {
      bugs.push({
        type: 'performance',
        severity: 'medium',
        description: `Page load time exceeds 3 seconds (${testResult.performance.loadTime}ms)`,
        url: testResult.url
      });
    }

    return bugs;
  }

  private async handleBugs(bugs: Bug[]): Promise<void> {
    console.log(`🐛 Found ${bugs.length} bugs, logging for review...`);

    for (const bug of bugs) {
      this.bugs.push({ ...bug, status: 'detected' });
      console.log(`⚠️  Bug detected: ${bug.description} (${bug.severity})`);
    }
  }

  private async handleTestFailure(test: TestItem, error: any): Promise<void> {
    console.error(`❌ Test failure for ${test.id}:`, error.message);
    
    this.bugs.push({
      type: 'test-failure',
      severity: 'high',
      description: `Test execution failed: ${error.message}`,
      url: test.url,
      status: 'test-failed'
    });
  }

  private async discoverNewRoutes(analysis: Analysis): Promise<string[]> {
    const newRoutes = analysis.discoveredRoutes.filter(
      route => !this.discoveredRoutes.has(route)
    );

    newRoutes.forEach(route => {
      this.discoveredRoutes.add(route);
      console.log(`🔍 Discovered new route: ${route}`);
    });

    return newRoutes;
  }

  private async generateFollowUpTests(analysis: Analysis): Promise<void> {
    // Generate tests for newly discovered routes
    for (const route of analysis.discoveredRoutes) {
      if (!this.discoveredRoutes.has(route)) {
        const routeTest: TestItem = {
          id: `route-test-${route.replace(/\//g, '-') || 'root'}`,
          url: route,
          type: 'route-discovery',
          priority: 2,
          testCases: [
            'page-load',
            'screenshot-capture',
            'element-discovery',
            'form-testing',
            'interaction-testing'
          ]
        };
        this.testQueue.push(routeTest);
      }
    }

    // Generate advanced test cases based on analysis
    if (analysis.hasForm) {
      this.testQueue.push(this.generateFormTest(analysis.currentUrl));
    }

    if (analysis.hasInteractiveElements) {
      this.testQueue.push(this.generateInteractionTest(analysis.currentUrl));
    }

    if (analysis.hasApiCalls) {
      this.testQueue.push(this.generateApiTest(analysis.currentUrl));
    }
  }

  private generateFormTest(url: string): TestItem {
    return {
      id: `form-test-${url.replace(/\//g, '-') || 'root'}`,
      url: url,
      type: 'form-testing',
      priority: 3,
      testCases: [
        'form-validation',
        'form-submission',
        'error-handling',
        'success-states'
      ]
    };
  }

  private generateInteractionTest(url: string): TestItem {
    return {
      id: `interaction-test-${url.replace(/\//g, '-') || 'root'}`,
      url: url,
      type: 'interaction-testing',
      priority: 3,
      testCases: [
        'button-clicks',
        'navigation',
        'modal-interactions',
        'responsive-behavior'
      ]
    };
  }

  private generateApiTest(url: string): TestItem {
    return {
      id: `api-test-${url.replace(/\//g, '-') || 'root'}`,
      url: url,
      type: 'api-testing',
      priority: 3,
      testCases: [
        'api-endpoint-testing',
        'error-response-handling',
        'data-validation'
      ]
    };
  }

  private async generateFinalReport(): Promise<any> {
    const report = {
      summary: {
        totalTests: this.completedTests.length,
        totalPages: this.discoveredRoutes.size,
        bugsFound: this.bugs.length,
        bugsFixed: this.bugs.filter(b => b.status === 'fixed').length,
        testCoverage: this.calculateTestCoverage(),
        discoveredRoutes: Array.from(this.discoveredRoutes)
      },
      completedTests: this.completedTests,
      bugs: this.bugs,
      timestamp: new Date()
    };

    console.log("📊 Final Report Generated:");
    console.log(`✅ Tests completed: ${report.summary.totalTests}`);
    console.log(`🔍 Pages discovered: ${report.summary.totalPages}`);
    console.log(`🐛 Bugs found: ${report.summary.bugsFound}`);
    console.log(`📊 Test coverage: ${report.summary.testCoverage}%`);

    // Generate analysis report from Puppeteer analyzer
    await this.aiAnalyzer.generateAnalysisReport();

    return report;
  }

  private calculateTestCoverage(): number {
    if (this.discoveredRoutes.size === 0) return 0;
    const testedPages = new Set(this.completedTests.map(t => t.url));
    return Math.round((testedPages.size / this.discoveredRoutes.size) * 100);
  }

  private async cleanup(): Promise<void> {
    await this.aiAnalyzer.cleanup();
    console.log("🧹 Cleanup completed");
  }
}

// Main entry point
export async function startAIDevelopmentWorkflow(baseUrl?: string): Promise<void> {
  const orchestrator = new AITestingOrchestrator(baseUrl);
  await orchestrator.startWorkflow();
}