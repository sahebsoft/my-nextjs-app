// Advanced Puppeteer Configuration for AI Screenshot Analysis
// File: puppeteer-ai-analyzer.js

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class PuppeteerAIAnalyzer {
    constructor() {
        this.browser = null;
        this.screenshotDir = './screenshots';
        this.analysisResults = [];
    }

    async initialize() {
        // Create screenshots directory
        await fs.mkdir(this.screenshotDir, { recursive: true });

        // Launch browser with optimal settings for testing
        this.browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--window-size=1920,1080'
            ],
            defaultViewport: {
                width: 1920,
                height: 1080,
                deviceScaleFactor: 1
            }
        });

        console.log('🚀 Puppeteer initialized for AI analysis');
    }

    async captureAndAnalyzePage(url, testId) {
        const page = await this.browser.newPage();
        const analysis = {
            testId,
            url,
            timestamp: new Date(),
            screenshots: {},
            elements: {},
            accessibility: {},
            performance: {},
            responsiveness: {},
            errors: []
        };

        try {
            // Set up monitoring
            await this.setupPageMonitoring(page, analysis);

            // Navigate to page
            console.log(`📸 Analyzing page: ${url}`);
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            // Wait for dynamic content
            await page.waitForTimeout(2000);

            // Capture multiple screenshot variants for comprehensive analysis
            analysis.screenshots = await this.captureMultipleScreenshots(page, testId);

            // Extract detailed element information
            analysis.elements = await this.extractDetailedElements(page);

            // Perform accessibility analysis
            analysis.accessibility = await this.performAccessibilityAnalysis(page);

            // Test responsive behavior
            analysis.responsiveness = await this.testResponsiveness(page, testId);

            // Capture performance metrics
            analysis.performance = await this.capturePerformanceMetrics(page);

            // AI-specific data extraction
            analysis.aiAnalysisData = await this.extractAIAnalysisData(page);

        } catch (error) {
            analysis.errors.push({
                type: 'page-analysis-error',
                message: error.message,
                stack: error.stack
            });
        } finally {
            await page.close();
        }

        this.analysisResults.push(analysis);
        return analysis;
    }

    async setupPageMonitoring(page, analysis) {
        // Monitor console errors
        page.on('console', msg => {
            if (msg.type() === 'error') {
                analysis.errors.push({
                    type: 'console-error',
                    message: msg.text(),
                    location: msg.location()
                });
            }
        });

        // Monitor failed requests
        page.on('requestfailed', request => {
            analysis.errors.push({
                type: 'request-failed',
                url: request.url(),
                failure: request.failure().errorText,
                method: request.method()
            });
        });

        // Monitor page errors
        page.on('pageerror', error => {
            analysis.errors.push({
                type: 'page-error',
                message: error.message,
                stack: error.stack
            });
        });
    }

    async captureMultipleScreenshots(page, testId) {
        const screenshots = {};
        const timestamp = Date.now();

        try {
            // Full page screenshot
            screenshots.fullPage = await this.captureScreenshot(page, testId, 'full-page', {
                fullPage: true,
                type: 'png'
            });

            // Viewport screenshot
            screenshots.viewport = await this.captureScreenshot(page, testId, 'viewport', {
                fullPage: false,
                type: 'png'
            });

            // High quality screenshot for AI analysis
            screenshots.aiAnalysis = await this.captureScreenshot(page, testId, 'ai-analysis', {
                fullPage: true,
                type: 'png',
                quality: 100
            });

            // Mobile viewport simulation
            await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2 });
            screenshots.mobile = await this.captureScreenshot(page, testId, 'mobile', {
                fullPage: true,
                type: 'png'
            });

            // Tablet viewport simulation
            await page.setViewport({ width: 768, height: 1024, deviceScaleFactor: 2 });
            screenshots.tablet = await this.captureScreenshot(page, testId, 'tablet', {
                fullPage: true,
                type: 'png'
            });

            // Reset to desktop viewport
            await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

        } catch (error) {
            console.error('Screenshot capture error:', error);
        }

        return screenshots;
    }

    async captureScreenshot(page, testId, variant, options) {
        const filename = `${testId}-${variant}-${Date.now()}.png`;
        const filepath = path.join(this.screenshotDir, filename);

        await page.screenshot({
            path: filepath,
            ...options
        });

        return {
            filename,
            filepath,
            timestamp: new Date(),
            variant,
            options
        };
    }

    async extractDetailedElements(page) {
        return await page.evaluate(() => {
            const elements = {};

            // Interactive elements for AI analysis
            elements.interactive = Array.from(document.querySelectorAll('a, button, input, select, textarea, [onclick], [role="button"]'))
                .map(el => ({
                    tag: el.tagName,
                    type: el.type,
                    text: el.textContent?.trim().substring(0, 200),
                    href: el.href,
                    id: el.id,
                    className: el.className,
                    role: el.getAttribute('role'),
                    ariaLabel: el.getAttribute('aria-label'),
                    boundingBox: el.getBoundingClientRect(),
                    visible: el.offsetParent !== null,
                    disabled: el.disabled,
                    placeholder: el.placeholder
                }));

            // Form elements
            elements.forms = Array.from(document.querySelectorAll('form'))
                .map(form => ({
                    action: form.action,
                    method: form.method,
                    inputs: Array.from(form.querySelectorAll('input, select, textarea')).map(input => ({
                        name: input.name,
                        type: input.type,
                        required: input.required,
                        placeholder: input.placeholder,
                        value: input.value
                    }))
                }));

            // Navigation elements
            elements.navigation = Array.from(document.querySelectorAll('nav a, [role="navigation"] a'))
                .map(link => ({
                    text: link.textContent?.trim(),
                    href: link.href,
                    active: link.classList.contains('active') || link.getAttribute('aria-current') === 'page'
                }));

            // Images for alt text analysis
            elements.images = Array.from(document.querySelectorAll('img'))
                .map(img => ({
                    src: img.src,
                    alt: img.alt,
                    title: img.title,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    loading: img.loading,
                    hasAlt: Boolean(img.alt)
                }));

            // Headings structure
            elements.headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
                .map(heading => ({
                    level: parseInt(heading.tagName.charAt(1)),
                    text: heading.textContent?.trim(),
                    id: heading.id
                }));

            return elements;
        });
    }

    async performAccessibilityAnalysis(page) {
        return await page.evaluate(() => {
            const accessibility = {
                issues: [],
                score: 0
            };

            // Check for missing alt attributes
            const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
            if (imagesWithoutAlt.length > 0) {
                accessibility.issues.push({
                    type: 'missing-alt-text',
                    count: imagesWithoutAlt.length,
                    severity: 'medium'
                });
            }

            // Check for heading hierarchy
            const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
                .map(h => parseInt(h.tagName.charAt(1)));

            let previousLevel = 0;
            for (const level of headings) {
                if (level > previousLevel + 1) {
                    accessibility.issues.push({
                        type: 'heading-hierarchy-skip',
                        severity: 'medium',
                        description: `Heading level ${level} follows h${previousLevel}`
                    });
                }
                previousLevel = level;
            }

            // Check for form labels
            const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
            if (inputsWithoutLabels.length > 0) {
                accessibility.issues.push({
                    type: 'missing-form-labels',
                    count: inputsWithoutLabels.length,
                    severity: 'high'
                });
            }

            // Calculate basic accessibility score
            const totalChecks = 10;
            const issueCount = accessibility.issues.length;
            accessibility.score = Math.max(0, ((totalChecks - issueCount) / totalChecks) * 100);

            return accessibility;
        });
    }

    async testResponsiveness(page, testId) {
        const breakpoints = [
            { name: 'mobile', width: 375, height: 667 },
            { name: 'tablet', width: 768, height: 1024 },
            { name: 'desktop', width: 1920, height: 1080 }
        ];

        const responsiveness = {
            breakpoints: {},
            issues: []
        };

        for (const breakpoint of breakpoints) {
            await page.setViewport({
                width: breakpoint.width,
                height: breakpoint.height,
                deviceScaleFactor: 1
            });

            await page.waitForTimeout(1000); // Allow for responsive adjustments

            const analysis = await page.evaluate((bp) => {
                // Check for horizontal scrollbar
                const hasHorizontalScroll = document.documentElement.scrollWidth > window.innerWidth;

                // Check for overflowing elements
                const overflowingElements = Array.from(document.querySelectorAll('*'))
                    .filter(el => el.scrollWidth > el.clientWidth)
                    .length;

                return {
                    breakpoint: bp.name,
                    viewportSize: { width: window.innerWidth, height: window.innerHeight },
                    hasHorizontalScroll,
                    overflowingElements,
                    devicePixelRatio: window.devicePixelRatio
                };
            }, breakpoint);

            responsiveness.breakpoints[breakpoint.name] = analysis;

            if (analysis.hasHorizontalScroll) {
                responsiveness.issues.push({
                    breakpoint: breakpoint.name,
                    type: 'horizontal-scroll',
                    severity: 'medium'
                });
            }
        }

        // Reset to desktop
        await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

        return responsiveness;
    }

    async capturePerformanceMetrics(page) {
        return await page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');

            return {
                loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
                firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
                resourceCount: performance.getEntriesByType('resource').length,
                transferSize: navigation.transferSize,
                encodedBodySize: navigation.encodedBodySize
            };
        });
    }

    async extractAIAnalysisData(page) {
        return await page.evaluate(() => {
            // Extract data specifically useful for AI analysis
            return {
                pageTitle: document.title,
                metaDescription: document.querySelector('meta[name="description"]')?.content,
                lang: document.documentElement.lang,
                charset: document.characterSet,

                // Content structure for AI understanding
                contentStructure: {
                    paragraphs: document.querySelectorAll('p').length,
                    lists: document.querySelectorAll('ul, ol').length,
                    tables: document.querySelectorAll('table').length,
                    sections: document.querySelectorAll('section, article, aside').length
                },

                // Interactive elements summary
                interactionPoints: {
                    buttons: document.querySelectorAll('button').length,
                    links: document.querySelectorAll('a[href]').length,
                    forms: document.querySelectorAll('form').length,
                    inputs: document.querySelectorAll('input, textarea, select').length
                },

                // Visual elements
                visualElements: {
                    images: document.querySelectorAll('img').length,
                    videos: document.querySelectorAll('video').length,
                    canvases: document.querySelectorAll('canvas').length,
                    svgs: document.querySelectorAll('svg').length
                },

                // Layout information
                layout: {
                    hasHeader: Boolean(document.querySelector('header, [role="banner"]')),
                    hasFooter: Boolean(document.querySelector('footer, [role="contentinfo"]')),
                    hasNavigation: Boolean(document.querySelector('nav, [role="navigation"]')),
                    hasSidebar: Boolean(document.querySelector('aside, [role="complementary"]'))
                }
            };
        });
    }

    async generateAnalysisReport() {
        const report = {
            summary: {
                totalPages: this.analysisResults.length,
                totalScreenshots: this.analysisResults.reduce((sum, result) =>
                    sum + Object.keys(result.screenshots).length, 0),
                totalErrors: this.analysisResults.reduce((sum, result) =>
                    sum + result.errors.length, 0),
                averagePerformance: this.calculateAveragePerformance()
            },
            results: this.analysisResults,
            timestamp: new Date()
        };

        // Save report to file
        const reportPath = path.join(this.screenshotDir, 'analysis-report.json');
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

        console.log(`📊 Analysis report saved to: ${reportPath}`);
        return report;
    }

    calculateAveragePerformance() {
        if (this.analysisResults.length === 0) return {};

        const totals = this.analysisResults.reduce((acc, result) => {
            const perf = result.performance;
            return {
                loadTime: acc.loadTime + (perf.loadTime || 0),
                domContentLoaded: acc.domContentLoaded + (perf.domContentLoaded || 0),
                firstPaint: acc.firstPaint + (perf.firstPaint || 0)
            };
        }, { loadTime: 0, domContentLoaded: 0, firstPaint: 0 });

        const count = this.analysisResults.length;
        return {
            averageLoadTime: totals.loadTime / count,
            averageDomContentLoaded: totals.domContentLoaded / count,
            averageFirstPaint: totals.firstPaint / count
        };
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            console.log('🧹 Browser closed and cleanup completed');
        }
    }
}

// Usage example
async function runAIAnalysis() {
    const analyzer = new PuppeteerAIAnalyzer();

    try {
        await analyzer.initialize();

        // Analyze multiple pages
        const pages = ['/', '/about', '/contact', '/products'];

        for (const page of pages) {
            await analyzer.captureAndAnalyzePage(`http://localhost:3000${page}`, `page-${page.replace('/', 'home')}`);
        }

        // Generate comprehensive report
        const report = await analyzer.generateAnalysisReport();
        console.log('Analysis complete!', report.summary);

    } finally {
        await analyzer.cleanup();
    }
}

module.exports = { PuppeteerAIAnalyzer };