const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3100';
const SCREENSHOTS_DIR = './screenshots';
const VIEWPORT = { width: 1920, height: 1080 };

const pages = [
  { name: 'homepage', url: '/', description: 'Homepage with featured products' },
  { name: 'products', url: '/products', description: 'Products catalog page' },
  { name: 'cart', url: '/cart', description: 'Shopping cart page' },
  { name: 'about', url: '/about', description: 'About page' },
  { name: 'contact', url: '/contact', description: 'Contact form page' },
  { name: 'account', url: '/account', description: 'Account/login page' },
  { name: 'checkout', url: '/checkout', description: 'Checkout page' },
];

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

class VisualTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = [];
  }

  async init() {
    console.log('🚀 Starting visual testing...');
    this.browser = await puppeteer.launch({
      headless: true, // Run in headless mode for server environments
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process'
      ]
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport(VIEWPORT);
    
    // Set up request/response monitoring
    this.page.on('requestfailed', (request) => {
      console.log(`❌ Request failed: ${request.url()}`);
    });
    
    this.page.on('response', (response) => {
      if (response.status() >= 400) {
        console.log(`❌ HTTP ${response.status()}: ${response.url()}`);
      }
    });
    
    // Set up console monitoring
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`❌ Console error: ${msg.text()}`);
      }
    });
  }

  async testPage(pageConfig) {
    const { name, url, description } = pageConfig;
    console.log(`\n📄 Testing ${name}: ${description}`);
    
    try {
      // Navigate to page
      const response = await this.page.goto(`${BASE_URL}${url}`, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      
      if (!response.ok()) {
        throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
      }
      
      // Wait for page to fully load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Take screenshot
      const screenshotPath = path.join(SCREENSHOTS_DIR, `${name}.png`);
      await this.page.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });
      
      // Check for common issues
      const issues = await this.checkPageIssues();
      
      // Get page metrics
      const metrics = await this.getPageMetrics();
      
      const result = {
        name,
        url,
        description,
        status: 'success',
        screenshot: screenshotPath,
        issues,
        metrics,
        timestamp: new Date().toISOString()
      };
      
      this.results.push(result);
      
      console.log(`✅ ${name} - Screenshot saved: ${screenshotPath}`);
      if (issues.length > 0) {
        console.log(`⚠️  Found ${issues.length} issues:`);
        issues.forEach(issue => console.log(`   - ${issue}`));
      }
      
    } catch (error) {
      console.log(`❌ ${name} - Error: ${error.message}`);
      
      // Take screenshot even on error
      try {
        const errorScreenshotPath = path.join(SCREENSHOTS_DIR, `${name}_error.png`);
        await this.page.screenshot({ 
          path: errorScreenshotPath, 
          fullPage: true 
        });
      } catch (screenshotError) {
        console.log(`❌ Could not take error screenshot: ${screenshotError.message}`);
      }
      
      this.results.push({
        name,
        url,
        description,
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async checkPageIssues() {
    const issues = [];
    
    try {
      // Check for missing images
      const brokenImages = await this.page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.filter(img => !img.complete || img.naturalWidth === 0).length;
      });
      
      if (brokenImages > 0) {
        issues.push(`${brokenImages} broken images found`);
      }
      
      // Check for empty elements that should have content
      const emptyElements = await this.page.evaluate(() => {
        const selectors = ['h1', 'h2', 'h3', 'p', 'button', 'a'];
        let empty = 0;
        selectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            if (el.textContent.trim() === '' && !el.querySelector('svg') && !el.querySelector('img')) {
              empty++;
            }
          });
        });
        return empty;
      });
      
      if (emptyElements > 0) {
        issues.push(`${emptyElements} empty elements found`);
      }
      
      // Check for console errors
      const consoleErrors = await this.page.evaluate(() => {
        return window.console.errors || [];
      });
      
      if (consoleErrors.length > 0) {
        issues.push(`${consoleErrors.length} console errors`);
      }
      
      // Check for missing alt attributes on images
      const imagesWithoutAlt = await this.page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.filter(img => !img.alt || img.alt.trim() === '').length;
      });
      
      if (imagesWithoutAlt > 0) {
        issues.push(`${imagesWithoutAlt} images missing alt attributes`);
      }
      
      // Check for layout issues (horizontal overflow only)
      const layoutIssues = await this.page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        let overflowCount = 0;
        elements.forEach(el => {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          
          // Only check for horizontal overflow (right side)
          // Exclude elements that are intentionally hidden or positioned off-screen
          if (rect.right > window.innerWidth + 5 && // Add 5px tolerance for rounding
              style.display !== 'none' && 
              style.visibility !== 'hidden' && 
              style.position !== 'absolute' &&
              rect.width > 0 && 
              rect.height > 0) {
            overflowCount++;
          }
        });
        return overflowCount;
      });
      
      if (layoutIssues > 0) {
        issues.push(`${layoutIssues} elements with horizontal overflow`);
      }
      
    } catch (error) {
      issues.push(`Error checking page issues: ${error.message}`);
    }
    
    return issues;
  }

  async getPageMetrics() {
    try {
      const metrics = await this.page.evaluate(() => {
        const performance = window.performance;
        const navigation = performance.getEntriesByType('navigation')[0];
        
        return {
          loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
          domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
          firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        };
      });
      
      return metrics;
    } catch (error) {
      return { error: error.message };
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      viewport: VIEWPORT,
      results: this.results,
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.status === 'success').length,
        failed: this.results.filter(r => r.status === 'error').length,
        totalIssues: this.results.reduce((sum, r) => sum + (r.issues?.length || 0), 0)
      }
    };
    
    // Save report to file
    const reportPath = path.join(SCREENSHOTS_DIR, 'visual-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📊 Visual Testing Report`);
    console.log(`========================`);
    console.log(`Total pages tested: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Total issues found: ${report.summary.totalIssues}`);
    console.log(`Report saved: ${reportPath}`);
    
    // Generate HTML report
    await this.generateHTMLReport(report);
  }

  async generateHTMLReport(report) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Visual Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: #e3f2fd; padding: 15px; border-radius: 8px; text-align: center; }
        .page-result { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 8px; }
        .success { border-left: 4px solid #4caf50; }
        .error { border-left: 4px solid #f44336; }
        .issues { background: #fff3cd; padding: 10px; border-radius: 4px; margin: 10px 0; }
        .screenshot { max-width: 300px; border: 1px solid #ddd; border-radius: 4px; }
        .issue { color: #856404; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Visual Test Report</h1>
        <p>Generated: ${report.timestamp}</p>
        <p>Base URL: ${report.baseUrl}</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>${report.summary.total}</h3>
            <p>Pages Tested</p>
        </div>
        <div class="metric">
            <h3>${report.summary.passed}</h3>
            <p>Passed</p>
        </div>
        <div class="metric">
            <h3>${report.summary.failed}</h3>
            <p>Failed</p>
        </div>
        <div class="metric">
            <h3>${report.summary.totalIssues}</h3>
            <p>Total Issues</p>
        </div>
    </div>
    
    <h2>Test Results</h2>
    ${report.results.map(result => `
        <div class="page-result ${result.status}">
            <h3>${result.name} - ${result.description}</h3>
            <p><strong>URL:</strong> ${result.url}</p>
            <p><strong>Status:</strong> ${result.status}</p>
            
            ${result.error ? `<p><strong>Error:</strong> ${result.error}</p>` : ''}
            
            ${result.issues && result.issues.length > 0 ? `
                <div class="issues">
                    <h4>Issues Found:</h4>
                    ${result.issues.map(issue => `<div class="issue">• ${issue}</div>`).join('')}
                </div>
            ` : ''}
            
            ${result.screenshot ? `
                <div>
                    <h4>Screenshot:</h4>
                    <img src="${path.basename(result.screenshot)}" alt="${result.name} screenshot" class="screenshot">
                </div>
            ` : ''}
            
            ${result.metrics ? `
                <div>
                    <h4>Performance Metrics:</h4>
                    <p>Load Time: ${result.metrics.loadTime}ms</p>
                    <p>DOM Content Loaded: ${result.metrics.domContentLoaded}ms</p>
                    <p>First Paint: ${result.metrics.firstPaint}ms</p>
                    <p>First Contentful Paint: ${result.metrics.firstContentfulPaint}ms</p>
                </div>
            ` : ''}
        </div>
    `).join('')}
</body>
</html>`;
    
    const htmlPath = path.join(SCREENSHOTS_DIR, 'visual-test-report.html');
    fs.writeFileSync(htmlPath, html);
    console.log(`HTML report saved: ${htmlPath}`);
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.init();
      
      for (const pageConfig of pages) {
        await this.testPage(pageConfig);
      }
      
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ Visual testing failed:', error);
    } finally {
      await this.close();
    }
  }
}

// Run the visual tests
const tester = new VisualTester();
tester.run().catch(console.error);