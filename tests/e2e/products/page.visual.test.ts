const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

/**
 * Products Listing Page Visual Screenshot Tests
 * Tests the product listing page functionality and visual states
 */

describe('Products Listing Page Visual Tests', () => {
  let browser
  let page
  const BASE_URL = process.env.AI_WORKFLOW_BASE_URL || 'http://localhost:3003'
  const PRODUCTS_URL = `${BASE_URL}/products`
  const SCREENSHOTS_DIR = path.join(__dirname, '../../../screenshots/visual-tests/products')

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    // Create screenshots directory if it doesn't exist
    if (!fs.existsSync(SCREENSHOTS_DIR)) {
      fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
    }
    
    page = await browser.newPage()
    await page.setViewport({ width: 1200, height: 800 })
    await page.goto(PRODUCTS_URL)
    
    // Wait for products to load (they have 800ms delay)
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
  })

  afterAll(async () => {
    await browser.close()
  })

  describe('Page Load Visual Changes', () => {
    test('should visually load products listing page', async () => {
      const testName = 'products-listing-load'
      
      // Take screenshot of loaded page
      const screenshot = path.join(SCREENSHOTS_DIR, `${testName}.png`)
      await page.screenshot({ path: screenshot, fullPage: true })
      
      // Check basic page elements
      const title = await page.title()
      expect(title).toBeTruthy()
      
      console.log(`📸 Products listing loaded: ${screenshot}`)
    })

    test('should show product grid layout', async () => {
      const testName = 'product-grid-layout'
      
      // Take screenshot of product grid
      const screenshot = path.join(SCREENSHOTS_DIR, `${testName}.png`)
      await page.screenshot({ path: screenshot })
      
      console.log(`📸 Product grid captured: ${screenshot}`)
    })
  })

  describe('Product Card Interactions', () => {
    test('should test product card hover states', async () => {
      const testName = 'product-card-hover'
      
      // Find product cards
      const productCards = await page.$$('[data-testid="product-card"], .product-card, [class*="product"]')
      
      if (productCards.length > 0) {
        const firstCard = productCards[0]
        
        // Take before screenshot
        const beforeScreenshot = path.join(SCREENSHOTS_DIR, `${testName}-before.png`)
        await page.screenshot({ path: beforeScreenshot })
        
        // Hover over product card
        await firstCard.hover()
        
        // Take after screenshot
        const afterScreenshot = path.join(SCREENSHOTS_DIR, `${testName}-after.png`)
        await page.screenshot({ path: afterScreenshot })
        
        console.log(`📸 Product card hover: ${beforeScreenshot} -> ${afterScreenshot}`)
      } else {
        console.log('ℹ️ No product cards found on products page')
      }
    })

    test('should test product card click navigation', async () => {
      const testName = 'product-card-click'
      
      // Find product cards
      const productCards = await page.$$('[data-testid="product-card"], .product-card, [class*="product"]')
      
      if (productCards.length > 0) {
        const firstCard = productCards[0]
        
        // Take before screenshot
        const beforeScreenshot = path.join(SCREENSHOTS_DIR, `${testName}-before.png`)
        await page.screenshot({ path: beforeScreenshot })
        
        const currentUrl = page.url()
        
        // Click product card (click on the "View Details" link)
        const viewDetailsLink = await firstCard.$('a[href*="/products/"]')
        if (viewDetailsLink) {
          await viewDetailsLink.click()
          await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 })
        } else {
          // Fallback: click the whole card
          await firstCard.click()
          await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 })
        }
        
        const newUrl = page.url()
        
        // Take after screenshot
        const afterScreenshot = path.join(SCREENSHOTS_DIR, `${testName}-after.png`)
        await page.screenshot({ path: afterScreenshot })
        
        console.log(`📸 Product card click: ${beforeScreenshot} -> ${afterScreenshot}`)
        console.log(`🔗 Navigation: ${currentUrl} -> ${newUrl}`)
        
        // Go back
        await page.goBack()
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 })
      } else {
        console.log('ℹ️ No product cards found on products page')
      }
    })
  })

  describe('Filtering and Search', () => {
    test('should test category filtering', async () => {
      const testName = 'category-filtering'
      
      // Look for category filters (they're buttons in the sidebar)
      const categoryFilters = await page.$$('aside button')
      
      if (categoryFilters.length > 0) {
        const firstFilter = categoryFilters[0]
        
        // Take before screenshot
        const beforeScreenshot = path.join(SCREENSHOTS_DIR, `${testName}-before.png`)
        await page.screenshot({ path: beforeScreenshot })
        
        // Click filter
        await firstFilter.click()
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait for filter to apply
        
        // Take after screenshot
        const afterScreenshot = path.join(SCREENSHOTS_DIR, `${testName}-after.png`)
        await page.screenshot({ path: afterScreenshot })
        
        console.log(`📸 Category filtering: ${beforeScreenshot} -> ${afterScreenshot}`)
      } else {
        console.log('ℹ️ No category filters found on products page')
      }
    })

    test('should test search functionality', async () => {
      const testName = 'product-search'
      
      // Look for search input
      const searchInput = await page.$('input[type="search"], input[placeholder*="search" i]')
      
      if (searchInput) {
        // Take before screenshot
        const beforeScreenshot = path.join(SCREENSHOTS_DIR, `${testName}-before.png`)
        await page.screenshot({ path: beforeScreenshot })
        
        // Type in search
        await searchInput.type('test product')
        await page.keyboard.press('Enter')
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Take after screenshot
        const afterScreenshot = path.join(SCREENSHOTS_DIR, `${testName}-after.png`)
        await page.screenshot({ path: afterScreenshot })
        
        console.log(`📸 Product search: ${beforeScreenshot} -> ${afterScreenshot}`)
      } else {
        console.log('ℹ️ No search functionality found on products page')
      }
    })
  })
})