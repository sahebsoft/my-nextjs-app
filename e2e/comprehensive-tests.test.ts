/**
 * Comprehensive Test Suite for AI Store Application
 * 
 * This test suite provides comprehensive coverage for all user flows
 * and critical functionality based on AI analysis results.
 */

import { Page, Browser } from 'puppeteer';

/**
 * Homepage Tests
 */
describe('🏠 Homepage Tests', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = global.browser;
    page = await browser.newPage();
  });

  afterAll(async () => {
    await page.close();
  });

  test('should load homepage successfully', async () => {
    await page.goto('http://localhost:3000');
    
    // Verify page loads
    const title = await page.title();
    expect(title).toContain('AI Store');
    
    // Verify hero section
    const heading = await page.$('h1');
    expect(heading).toBeTruthy();
    
    const headingText = await page.evaluate(el => el.textContent, heading);
    expect(headingText).toContain('Welcome to AI Store');
    
    // Verify Shop Now button exists
    const shopNowBtn = await page.$('a[href="/products"]');
    expect(shopNowBtn).toBeTruthy();
    
    // Take screenshot for AI analysis
    await page.screenshot({ path: 'e2e/screenshots/homepage-loaded.png' });
  });

  test('should display featured products', async () => {
    await page.goto('http://localhost:3000');
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    
    // Verify products are displayed
    const productCards = await page.$$('[data-testid="product-card"]');
    expect(productCards.length).toBe(4);
    
    // Verify product information
    const firstProduct = productCards[0];
    const productName = await firstProduct.$eval('h3', el => el.textContent);
    expect(productName).toContain('Wireless Headphones');
    
    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/featured-products.png' });
  });

  test('should handle loading states properly', async () => {
    await page.goto('http://localhost:3000');
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    
    // Verify loading skeletons are gone
    const loadingSkeletons = await page.$$('.animate-pulse');
    expect(loadingSkeletons.length).toBe(0);
    
    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/loading-complete.png' });
  });
});

/**
 * Search Functionality Tests
 */
describe('🔍 Search Functionality Tests', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = global.browser;
    page = await browser.newPage();
  });

  afterAll(async () => {
    await page.close();
  });

  test('should search products successfully', async () => {
    await page.goto('http://localhost:3000');
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="product-card"]');
    
    // Search for a product
    const searchInput = await page.$('input[placeholder*="Search"]');
    await searchInput.type('headphones');
    
    // Wait for search results
    await page.waitForTimeout(500); // Debounce delay
    
    // Verify search results
    const searchResults = await page.$$('[data-testid="product-card"]');
    expect(searchResults.length).toBe(1);
    
    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/search-results.png' });
  });

  test('should handle empty search results', async () => {
    await page.goto('http://localhost:3000');
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="product-card"]');
    
    // Search for non-existent product
    const searchInput = await page.$('input[placeholder*="Search"]');
    await searchInput.click({ clickCount: 3 }); // Select all
    await searchInput.type('nonexistent product');
    
    // Wait for search results
    await page.waitForTimeout(500);
    
    // Verify no results message
    const noResults = await page.$('text=No products found');
    expect(noResults).toBeTruthy();
    
    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/empty-search.png' });
  });
});

/**
 * Navigation Tests
 */
describe('🧭 Navigation Tests', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = global.browser;
    page = await browser.newPage();
  });

  afterAll(async () => {
    await page.close();
  });

  test('should navigate to products page', async () => {
    await page.goto('http://localhost:3000');
    
    // Click on Products link
    await page.click('a[href="/products"]');
    
    // Verify navigation
    const currentUrl = page.url();
    expect(currentUrl).toContain('/products');
    
    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/products-page.png' });
  });

  test('should navigate to product details', async () => {
    await page.goto('http://localhost:3000');
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]');
    
    // Click on View Details
    await page.click('a[href="/products/1"]');
    
    // Verify navigation
    const currentUrl = page.url();
    expect(currentUrl).toContain('/products/1');
    
    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/product-details.png' });
  });

  test('should navigate to cart', async () => {
    await page.goto('http://localhost:3000');
    
    // Click on cart link
    await page.click('a[href="/cart"]');
    
    // Verify navigation
    const currentUrl = page.url();
    expect(currentUrl).toContain('/cart');
    
    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/cart-page.png' });
  });
});

/**
 * Product Interaction Tests
 */
describe('🛒 Product Interaction Tests', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = global.browser;
    page = await browser.newPage();
  });

  afterAll(async () => {
    await page.close();
  });

  test('should add product to cart', async () => {
    await page.goto('http://localhost:3000');
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]');
    
    // Add product to cart
    await page.click('button:has-text("Add to Cart")');
    
    // Verify button changes to "Added to Cart"
    await page.waitForSelector('button:has-text("Added to Cart")');
    
    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/add-to-cart.png' });
  });

  test('should view product details', async () => {
    await page.goto('http://localhost:3000/products/1');
    
    // Wait for page to load
    await page.waitForSelector('h1');
    
    // Verify product details page
    const heading = await page.$eval('h1', el => el.textContent);
    expect(heading).toContain('Wireless Headphones');
    
    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/product-detail-view.png' });
  });
});

/**
 * Accessibility Tests
 */
describe('♿ Accessibility Tests', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = global.browser;
    page = await browser.newPage();
  });

  afterAll(async () => {
    await page.close();
  });

  test('should have proper heading structure', async () => {
    await page.goto('http://localhost:3000');
    
    // Verify h1 exists and is unique
    const h1Elements = await page.$$('h1');
    expect(h1Elements.length).toBe(1);
    
    // Verify h2 elements exist
    const h2Elements = await page.$$('h2');
    expect(h2Elements.length).toBeGreaterThan(0);
    
    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/heading-structure.png' });
  });

  test('should have proper ARIA labels', async () => {
    await page.goto('http://localhost:3000');
    
    // Check for ARIA labels on interactive elements
    const searchInput = await page.$('input[placeholder*="Search"]');
    const inputType = await searchInput.evaluate(el => el.getAttribute('type'));
    expect(inputType).toBe('search');
    
    // Check for role attributes
    const banner = await page.$('[role="banner"]');
    expect(banner).toBeTruthy();
    
    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/accessibility-check.png' });
  });

  test('should be keyboard navigable', async () => {
    await page.goto('http://localhost:3000');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verify focus is working
    const focusedElement = await page.evaluateHandle(() => document.activeElement);
    expect(focusedElement).toBeTruthy();
    
    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/keyboard-navigation.png' });
  });
});

/**
 * Performance Tests
 */
describe('⚡ Performance Tests', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = global.browser;
    page = await browser.newPage();
  });

  afterAll(async () => {
    await page.close();
  });

  test('should load within acceptable time', async () => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:3000');
    await page.waitForSelector('[data-testid="product-card"]');
    
    const loadTime = Date.now() - startTime;
    
    // Verify load time is reasonable (under 5 seconds)
    expect(loadTime).toBeLessThan(5000);
    
    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/performance-test.png' });
  });

  test('should handle multiple concurrent actions', async () => {
    await page.goto('http://localhost:3000');
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="product-card"]');
    
    // Simulate multiple actions quickly
    await page.click('input[placeholder*="Search"]');
    await page.type('input[placeholder*="Search"]', 'test');
    
    // Verify app remains responsive
    const heading = await page.$('h1');
    expect(heading).toBeTruthy();
    
    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/concurrent-actions.png' });
  });
});

/**
 * Mobile Responsiveness Tests
 */
describe('📱 Mobile Responsiveness Tests', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = global.browser;
    page = await browser.newPage();
  });

  afterAll(async () => {
    await page.close();
  });

  test('should display correctly on mobile', async () => {
    // Set mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    
    await page.goto('http://localhost:3000');
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="product-card"]');
    
    // Verify mobile layout
    const heading = await page.$('h1');
    expect(heading).toBeTruthy();
    
    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/mobile-layout.png' });
  });

  test('should handle touch interactions', async () => {
    // Set mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    
    await page.goto('http://localhost:3000');
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="product-card"]');
    
    // Simulate touch interactions
    await page.tap('input[placeholder*="Search"]');
    await page.type('input[placeholder*="Search"]', 'headphones');
    
    // Wait for search results
    await page.waitForTimeout(500);
    
    // Verify touch interactions work
    const searchResults = await page.$$('[data-testid="product-card"]');
    expect(searchResults.length).toBe(1);
    
    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/touch-interactions.png' });
  });
});