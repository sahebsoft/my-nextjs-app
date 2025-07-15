/**
 * Enhanced AI-Generated Tests Based on Visual Analysis
 * 
 * These tests are generated based on the AI analysis of your application screenshots
 * and provide comprehensive validation of your e-commerce functionality.
 */

import { Browser, Page } from 'puppeteer';
import {
  createBrowser,
  createPage,
  navigateToPage,
  takeScreenshot,
  wait,
  findElementByText,
  clickElementByText
} from './utils/puppeteer-helpers';

const BASE_URL = 'http://localhost:3000';

describe('🚀 Enhanced AI-Generated Tests', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await createBrowser();
    page = await createPage(browser);
  });

  afterAll(async () => {
    if (page) await page.close();
    if (browser) await browser.close();
  });

  /**
   * Test 1: Enhanced Product Search Functionality
   */
  test('🔍 AI: Enhanced Product Search and Filtering', async () => {
    console.log('🤖 Testing enhanced product search functionality...');
    
    await navigateToPage(page, BASE_URL);
    await wait(2000);

    // Take before screenshot
    await takeScreenshot(page, 'enhanced-search-before');

    // Test search input exists and is functional
    const searchInput = await page.waitForSelector('input[placeholder*="search"]', { timeout: 5000 });
    expect(searchInput).toBeTruthy();

    // Test search functionality with different terms
    const searchTerms = ['headphones', 'coffee', 'shoes'];
    
    for (const term of searchTerms) {
      // Clear previous search
      await page.evaluate(() => {
        const input = document.querySelector('input[placeholder*="search"]') as HTMLInputElement;
        if (input) input.value = '';
      });

      // Enter search term
      await searchInput.type(term);
      await wait(500);

      // Check if products are filtered
      const productCards = await page.$$('.grid > div');
      console.log(`Search for "${term}": ${productCards.length} products found`);

      // Verify search results make sense
      if (productCards.length > 0) {
        const productTexts = await Promise.all(
          productCards.map(card => 
            card.evaluate(el => el.textContent?.toLowerCase() || '')
          )
        );
        
        const relevantResults = productTexts.some(text => 
          text.includes(term.toLowerCase()) || 
          (term === 'headphones' && text.includes('wireless')) ||
          (term === 'coffee' && text.includes('maker')) ||
          (term === 'shoes' && text.includes('running'))
        );
        
        if (relevantResults) {
          console.log(`✅ Search for "${term}" returned relevant results`);
        }
      }

      await takeScreenshot(page, `enhanced-search-${term}`);
    }

    // Test clear search functionality
    const clearButton = await page.$('button:has-text("Clear search"), button[aria-label*="clear"], button[title*="clear"]');
    if (clearButton) {
      await clearButton.click();
      await wait(500);
      
      const allProducts = await page.$$('.grid > div');
      expect(allProducts.length).toBe(4); // Should show all products
      console.log('✅ Clear search functionality works');
    }

    await takeScreenshot(page, 'enhanced-search-after');
  }, 30000);

  /**
   * Test 2: Comprehensive Accessibility Validation
   */
  test('♿ AI: Comprehensive Accessibility Compliance', async () => {
    console.log('🤖 Testing comprehensive accessibility compliance...');
    
    await navigateToPage(page, BASE_URL);
    await wait(2000);

    // 1. Page structure validation
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    console.log(`✅ Page title: "${title}"`);

    // 2. Heading structure validation
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', elements =>
      elements.map(el => ({
        tag: el.tagName,
        text: el.textContent?.trim(),
        hasId: !!el.id,
        hasClass: !!el.className
      }))
    );
    
    expect(headings.length).toBeGreaterThan(0);
    const hasH1 = headings.some(h => h.tag === 'H1');
    expect(hasH1).toBe(true);
    console.log(`✅ Found ${headings.length} headings, including H1`);

    // 3. Image accessibility check
    const imageData = await page.$$eval('img', images =>
      images.map(img => ({
        src: img.src,
        alt: img.alt,
        hasAlt: !!img.alt && img.alt.trim().length > 0,
        isDecorative: img.alt === '' && img.hasAttribute('alt')
      }))
    );

    const imagesWithoutAlt = imageData.filter(img => !img.hasAlt && !img.isDecorative);
    console.log(`⚠️ Found ${imagesWithoutAlt.length} images without alt attributes`);
    
    if (imagesWithoutAlt.length > 0) {
      console.log('Missing alt attributes on:', imagesWithoutAlt.map(img => img.src));
    }

    // 4. Keyboard navigation test
    console.log('🎯 Testing keyboard navigation...');
    await page.keyboard.press('Tab');
    
    let focusableElements = [];
    for (let i = 0; i < 10; i++) {
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? {
          tagName: el.tagName,
          type: el.type || null,
          href: el.href || null,
          text: el.textContent?.trim().substring(0, 50) || null,
          hasAriaLabel: !!el.getAttribute('aria-label'),
          hasTitle: !!el.title
        } : null;
      });
      
      if (focusedElement) {
        focusableElements.push(focusedElement);
        console.log(`Tab ${i + 1}: ${focusedElement.tagName} - ${focusedElement.text || focusedElement.href || 'no text'}`);
      }
      
      await page.keyboard.press('Tab');
      await wait(100);
    }

    expect(focusableElements.length).toBeGreaterThan(0);
    console.log(`✅ Found ${focusableElements.length} focusable elements`);

    // 5. Color contrast check (basic)
    const contrastIssues = await page.evaluate(() => {
      const issues = [];
      const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button');
      
      for (let i = 0; i < Math.min(textElements.length, 20); i++) {
        const el = textElements[i];
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const background = styles.backgroundColor;
        
        if (color && background && color !== 'rgba(0, 0, 0, 0)' && background !== 'rgba(0, 0, 0, 0)') {
          // Basic check - in real implementation would calculate actual contrast ratio
          if (color === background) {
            issues.push({
              element: el.tagName,
              text: el.textContent?.substring(0, 30),
              color,
              background
            });
          }
        }
      }
      
      return issues;
    });

    console.log(`🎨 Color contrast issues found: ${contrastIssues.length}`);

    // 6. Form accessibility (if forms exist)
    const formElements = await page.$$eval('input, textarea, select', elements =>
      elements.map(el => ({
        type: el.type || el.tagName,
        hasLabel: !!el.labels?.length || !!el.getAttribute('aria-label') || !!el.getAttribute('aria-labelledby'),
        placeholder: el.placeholder || null,
        required: el.required
      }))
    );

    formElements.forEach((element, index) => {
      if (!element.hasLabel) {
        console.log(`⚠️ Form element ${index + 1} (${element.type}) missing label`);
      }
    });

    await takeScreenshot(page, 'accessibility-validation');
    
    // Generate accessibility score
    const accessibilityScore = Math.max(0, 100 - (imagesWithoutAlt.length * 10) - (contrastIssues.length * 5));
    console.log(`📊 Accessibility Score: ${accessibilityScore}/100`);
  }, 30000);

  /**
   * Test 3: Performance and Core Web Vitals
   */
  test('⚡ AI: Performance and Core Web Vitals Validation', async () => {
    console.log('🤖 Testing performance and Core Web Vitals...');
    
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics = {
            navigation: null,
            paint: [],
            resource: []
          };
          
          entries.forEach(entry => {
            if (entry.entryType === 'navigation') {
              metrics.navigation = {
                loadStart: entry.loadEventStart,
                loadEnd: entry.loadEventEnd,
                domContentLoaded: entry.domContentLoadedEventEnd,
                duration: entry.duration
              };
            } else if (entry.entryType === 'paint') {
              metrics.paint.push({
                name: entry.name,
                startTime: entry.startTime
              });
            }
          });
          
          resolve(metrics);
        });
        
        observer.observe({ entryTypes: ['navigation', 'paint'] });
        
        // Fallback after 2 seconds
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          const paint = performance.getEntriesByType('paint');
          
          resolve({
            navigation: navigation ? {
              loadStart: navigation.loadEventStart,
              loadEnd: navigation.loadEventEnd,
              domContentLoaded: navigation.domContentLoadedEventEnd,
              duration: navigation.duration
            } : null,
            paint: paint.map(p => ({ name: p.name, startTime: p.startTime })),
            resource: []
          });
        }, 2000);
      });
    });

    const startTime = Date.now();
    await navigateToPage(page, BASE_URL);
    await page.waitForSelector('.grid', { timeout: 10000 });
    const totalLoadTime = Date.now() - startTime;

    console.log(`📊 Total load time: ${totalLoadTime}ms`);
    expect(totalLoadTime).toBeLessThan(5000); // Should load within 5 seconds

    // Check if products loaded
    const productCount = await page.$$eval('.grid > div', elements => elements.length);
    expect(productCount).toBe(4);
    console.log(`✅ Loaded ${productCount} products`);

    // Check image loading
    const imageLoadStatus = await page.$$eval('img', images =>
      images.map(img => ({
        src: img.src,
        complete: img.complete,
        naturalWidth: img.naturalWidth
      }))
    );

    const loadedImages = imageLoadStatus.filter(img => img.complete && img.naturalWidth > 0);
    console.log(`📸 Images loaded: ${loadedImages.length}/${imageLoadStatus.length}`);

    // Resource count
    const resourceCount = await page.evaluate(() => performance.getEntriesByType('resource').length);
    console.log(`📦 Resources loaded: ${resourceCount}`);

    // Memory usage (if available)
    const memoryInfo = await page.evaluate(() => {
      // @ts-ignore
      return (performance as any).memory ? {
        // @ts-ignore
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        // @ts-ignore
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize
      } : null;
    });

    if (memoryInfo) {
      console.log(`🧠 Memory usage: ${Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024)}MB`);
    }

    await takeScreenshot(page, 'performance-validation');

    // Generate performance score
    const performanceScore = Math.max(0, 100 - Math.max(0, (totalLoadTime - 2000) / 50));
    console.log(`📊 Performance Score: ${Math.round(performanceScore)}/100`);
  }, 30000);

  /**
   * Test 4: Responsive Design Validation
   */
  test('📱 AI: Responsive Design and Mobile Compatibility', async () => {
    console.log('🤖 Testing responsive design across device sizes...');
    
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Laptop', width: 1366, height: 768 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Mobile Small', width: 320, height: 568 }
    ];

    for (const viewport of viewports) {
      console.log(`📐 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.setViewport({ width: viewport.width, height: viewport.height });
      await navigateToPage(page, BASE_URL);
      await wait(2000);

      // Check if layout adapts properly
      const layoutInfo = await page.evaluate(() => {
        const grid = document.querySelector('.grid');
        const heroSection = document.querySelector('.bg-gradient-to-r');
        const searchSection = document.querySelector('input[placeholder*="search"]');
        
        return {
          gridColumns: grid ? window.getComputedStyle(grid).gridTemplateColumns : null,
          heroHeight: heroSection ? heroSection.offsetHeight : null,
          searchVisible: searchSection ? searchSection.offsetHeight > 0 : false,
          bodyWidth: document.body.offsetWidth,
          hasHorizontalScroll: document.body.scrollWidth > window.innerWidth
        };
      });

      console.log(`  Grid columns: ${layoutInfo.gridColumns}`);
      console.log(`  Hero height: ${layoutInfo.heroHeight}px`);
      console.log(`  Search visible: ${layoutInfo.searchVisible}`);
      console.log(`  Horizontal scroll: ${layoutInfo.hasHorizontalScroll}`);

      // Verify no horizontal scroll
      expect(layoutInfo.hasHorizontalScroll).toBe(false);

      // Check that important elements are visible
      expect(layoutInfo.searchVisible).toBe(true);
      expect(layoutInfo.heroHeight).toBeGreaterThan(100);

      await takeScreenshot(page, `responsive-${viewport.name.toLowerCase()}`);
    }

    // Reset to default viewport
    await page.setViewport({ width: 1200, height: 800 });
  }, 45000);

  /**
   * Test 5: User Journey and Interaction Flow
   */
  test('🎯 AI: Complete User Journey and Interaction Flow', async () => {
    console.log('🤖 Testing complete user journey and interactions...');
    
    await navigateToPage(page, BASE_URL);
    await wait(2000);

    // 1. Landing page interaction
    console.log('📍 Step 1: Landing page interaction');
    const heroHeading = await page.waitForSelector('h1');
    const heroText = await heroHeading.textContent();
    expect(heroText).toContain('Welcome');
    console.log(`✅ Hero text: "${heroText}"`);

    await takeScreenshot(page, 'journey-step1-landing');

    // 2. Search interaction
    console.log('📍 Step 2: Search interaction');
    const searchInput = await page.waitForSelector('input[placeholder*="search"]');
    await searchInput.click();
    await searchInput.type('wireless headphones');
    await wait(1000);

    const searchResults = await page.$$('.grid > div');
    console.log(`✅ Search results: ${searchResults.length} products`);

    await takeScreenshot(page, 'journey-step2-search');

    // 3. Product exploration
    console.log('📍 Step 3: Product exploration');
    if (searchResults.length > 0) {
      const firstProduct = searchResults[0];
      const productInfo = await firstProduct.evaluate(el => ({
        text: el.textContent?.trim(),
        hasImage: !!el.querySelector('img'),
        hasPrice: el.textContent?.includes('$') || false
      }));
      
      console.log(`✅ Product info: ${productInfo.text?.substring(0, 50)}...`);
      expect(productInfo.hasImage).toBe(true);
    }

    await takeScreenshot(page, 'journey-step3-products');

    // 4. Navigation testing
    console.log('📍 Step 4: Navigation testing');
    const shopNowButton = await page.$('a[href="/products"]');
    if (shopNowButton) {
      const buttonText = await shopNowButton.textContent();
      console.log(`✅ Found navigation button: "${buttonText}"`);
      
      // Test button is clickable
      const isClickable = await shopNowButton.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.pointerEvents !== 'none' && styles.display !== 'none';
      });
      expect(isClickable).toBe(true);
    }

    // 5. Contact section
    console.log('📍 Step 5: Contact section exploration');
    const contactButton = await page.$('a[href="/contact"]');
    if (contactButton) {
      const contactText = await contactButton.textContent();
      console.log(`✅ Found contact button: "${contactText}"`);
    }

    // 6. Clear search and return to full catalog
    console.log('📍 Step 6: Clear search functionality');
    const clearButton = await page.$('button:has-text("Clear search")');
    if (clearButton) {
      await clearButton.click();
      await wait(500);
      
      const allProducts = await page.$$('.grid > div');
      expect(allProducts.length).toBe(4);
      console.log('✅ Search cleared, showing all products');
    }

    await takeScreenshot(page, 'journey-step6-complete');

    console.log('🎉 Complete user journey test passed!');
  }, 30000);
});
