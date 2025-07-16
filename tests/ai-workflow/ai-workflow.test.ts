/**
 * AI Workflow E2E Test Suite
 * Tests the complete AI-driven development and testing workflow
 */

import { AITestingOrchestrator } from '../../src/lib/ai-workflow-orchestrator';
import { PuppeteerAIAnalyzer } from '../../src/lib/puppeteer-ai-analyzer';
import { promises as fs } from 'fs';
import path from 'path';

describe('AI Workflow E2E Tests', () => {
  const baseUrl = 'http://localhost:3001';
  let orchestrator: AITestingOrchestrator;
  let screenshotDir: string;
  let logDir: string;

  beforeAll(async () => {
    screenshotDir = path.resolve('./screenshots');
    logDir = path.resolve('./logs');
    
    // Ensure directories exist
    await fs.mkdir(screenshotDir, { recursive: true });
    await fs.mkdir(logDir, { recursive: true });
  });

  beforeEach(() => {
    orchestrator = new AITestingOrchestrator(baseUrl);
  });

  afterEach(async () => {
    // Cleanup after each test
    if (orchestrator) {
      await orchestrator.cleanup();
    }
  });

  describe('Puppeteer AI Analyzer', () => {
    test('should initialize Puppeteer browser successfully', async () => {
      const analyzer = new PuppeteerAIAnalyzer();
      
      await expect(analyzer.initialize()).resolves.not.toThrow();
      await analyzer.cleanup();
    });

    test('should capture and analyze home page', async () => {
      const analyzer = new PuppeteerAIAnalyzer();
      await analyzer.initialize();

      const result = await analyzer.captureAndAnalyzePage(`${baseUrl}/`, 'home-test');

      expect(result).toBeDefined();
      expect(result.testId).toBe('home-test');
      expect(result.url).toBe(`${baseUrl}/`);
      expect(result.screenshots).toBeDefined();
      expect(result.elements).toBeDefined();
      expect(result.accessibility).toBeDefined();
      expect(result.performance).toBeDefined();

      // Check that screenshots were created
      expect(Object.keys(result.screenshots)).toContain('fullPage');
      expect(Object.keys(result.screenshots)).toContain('mobile');
      expect(Object.keys(result.screenshots)).toContain('tablet');

      await analyzer.cleanup();
    });

    test('should detect interactive elements', async () => {
      const analyzer = new PuppeteerAIAnalyzer();
      await analyzer.initialize();

      const result = await analyzer.captureAndAnalyzePage(`${baseUrl}/`, 'elements-test');

      expect(result.elements.interactive).toBeDefined();
      expect(Array.isArray(result.elements.interactive)).toBe(true);
      
      // Should find navigation links
      const links = result.elements.interactive.filter(el => el.tag === 'A');
      expect(links.length).toBeGreaterThan(0);

      await analyzer.cleanup();
    });

    test('should perform accessibility analysis', async () => {
      const analyzer = new PuppeteerAIAnalyzer();
      await analyzer.initialize();

      const result = await analyzer.captureAndAnalyzePage(`${baseUrl}/`, 'accessibility-test');

      expect(result.accessibility).toBeDefined();
      expect(result.accessibility.score).toBeGreaterThanOrEqual(0);
      expect(result.accessibility.score).toBeLessThanOrEqual(100);
      expect(Array.isArray(result.accessibility.issues)).toBe(true);

      await analyzer.cleanup();
    });

    test('should test responsive design', async () => {
      const analyzer = new PuppeteerAIAnalyzer();
      await analyzer.initialize();

      const result = await analyzer.captureAndAnalyzePage(`${baseUrl}/`, 'responsive-test');

      expect(result.responsiveness).toBeDefined();
      expect(result.responsiveness.breakpoints).toBeDefined();
      expect(result.responsiveness.breakpoints.mobile).toBeDefined();
      expect(result.responsiveness.breakpoints.tablet).toBeDefined();
      expect(result.responsiveness.breakpoints.desktop).toBeDefined();

      await analyzer.cleanup();
    });
  });

  describe('AI Testing Orchestrator', () => {
    test('should start workflow and discover routes', async () => {
      // Mock console.log to capture logs
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (...args: any[]) => {
        logs.push(args.join(' '));
        originalLog(...args);
      };

      try {
        await orchestrator.startWorkflow();

        // Check that workflow completed
        expect(logs.some(log => log.includes('AI Development Workflow completed'))).toBe(true);
        
        // Check that routes were discovered
        expect(logs.some(log => log.includes('Discovered new route'))).toBe(true);

      } finally {
        console.log = originalLog;
      }
    }, 300000); // 5 minute timeout

    test('should generate comprehensive report', async () => {
      await orchestrator.startWorkflow();

      // Check if analysis report was generated
      const reportPath = path.join(screenshotDir, 'analysis-report.json');
      const reportExists = await fs.access(reportPath).then(() => true).catch(() => false);
      expect(reportExists).toBe(true);

      if (reportExists) {
        const reportContent = await fs.readFile(reportPath, 'utf-8');
        const report = JSON.parse(reportContent);

        expect(report.summary).toBeDefined();
        expect(report.summary.totalPages).toBeGreaterThan(0);
        expect(report.results).toBeDefined();
        expect(Array.isArray(report.results)).toBe(true);
      }
    }, 300000);

    test('should test all existing pages', async () => {
      const expectedPages = ['/', '/about', '/products', '/contact', '/account'];
      
      await orchestrator.startWorkflow();

      // Check if screenshots exist for each page
      const screenshotFiles = await fs.readdir(screenshotDir);
      
      for (const page of expectedPages) {
        const pageId = page === '/' ? 'home' : page.replace('/', '');
        const hasScreenshots = screenshotFiles.some(file => 
          file.includes(pageId) || file.includes('route-test')
        );
        expect(hasScreenshots).toBe(true);
      }
    }, 300000);

    test('should detect and log bugs', async () => {
      // This test will naturally find any bugs in the application
      await orchestrator.startWorkflow();

      // Check if log files were created
      const logFiles = await fs.readdir(logDir);
      expect(logFiles.length).toBeGreaterThan(0);

      // Check if any log file contains bug reports
      for (const logFile of logFiles) {
        if (logFile.includes('.log')) {
          const logContent = await fs.readFile(path.join(logDir, logFile), 'utf-8');
          // Just verify logs were written, bugs may or may not exist
          expect(logContent.length).toBeGreaterThan(0);
        }
      }
    }, 300000);
  });

  describe('Integration Tests', () => {
    test('should test complete workflow with all pages', async () => {
      const startTime = Date.now();
      
      await orchestrator.startWorkflow();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Workflow should complete within reasonable time
      expect(duration).toBeLessThan(300000); // 5 minutes
      
      // Verify outputs exist
      const screenshotFiles = await fs.readdir(screenshotDir);
      const logFiles = await fs.readdir(logDir);
      
      expect(screenshotFiles.length).toBeGreaterThan(0);
      expect(logFiles.length).toBeGreaterThan(0);
      
      // Verify analysis report
      const reportPath = path.join(screenshotDir, 'analysis-report.json');
      const reportExists = await fs.access(reportPath).then(() => true).catch(() => false);
      expect(reportExists).toBe(true);

    }, 600000); // 10 minute timeout

    test('should handle error gracefully', async () => {
      // Test with invalid URL to trigger error handling
      const invalidOrchestrator = new AITestingOrchestrator('http://localhost:9999');
      
      await expect(invalidOrchestrator.startWorkflow()).rejects.toThrow();
      
      // Ensure cleanup still happens
      await invalidOrchestrator.cleanup();
    });

    test('should create proper file structure', async () => {
      await orchestrator.startWorkflow();

      // Check directory structure
      const screenshotExists = await fs.access(screenshotDir).then(() => true).catch(() => false);
      const logExists = await fs.access(logDir).then(() => true).catch(() => false);
      
      expect(screenshotExists).toBe(true);
      expect(logExists).toBe(true);

      // Check file types
      const screenshotFiles = await fs.readdir(screenshotDir);
      const hasImages = screenshotFiles.some(file => file.endsWith('.png'));
      const hasReport = screenshotFiles.some(file => file.endsWith('.json'));
      
      expect(hasImages).toBe(true);
      expect(hasReport).toBe(true);

    }, 300000);
  });
});