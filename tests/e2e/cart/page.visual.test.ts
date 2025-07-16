const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

/**
 * Cart Page Visual Screenshot Tests
 * Tests the shopping cart page functionality and visual states
 */

describe('Cart Page Visual Tests', () => {
  let browser
  let page
  const BASE_URL = process.env.AI_WORKFLOW_BASE_URL || 'http://localhost:3003'
  const CART_URL = `${BASE_URL}/cart`
  const SCREENSHOTS_DIR = path.join(__dirname, '../../../screenshots/visual-tests/cart')

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
    await page.goto(CART_URL)
  })

  afterAll(async () => {
    await browser.close()
  })

  describe('Page Load Visual Changes', () => {
    test('should visually load cart page', async () => {
      const testName = 'cart-page-load'
      
      // Take screenshot of loaded page
      const screenshot = path.join(SCREENSHOTS_DIR, `${testName}.png`)
      await page.screenshot({ path: screenshot, fullPage: true })
      
      // Check basic page elements
      const title = await page.title()
      expect(title).toBeTruthy()
      
      console.log(`📸 Cart page loaded: ${screenshot}`)
    })

    test('should show empty cart state', async () => {
      const testName = 'empty-cart-state'
      
      // Take screenshot of empty cart
      const screenshot = path.join(SCREENSHOTS_DIR, `${testName}.png`)
      await page.screenshot({ path: screenshot })
      
      console.log(`📸 Empty cart state captured: ${screenshot}`)
    })
  })

  describe('Cart Item Management', () => {
    test('should test quantity update functionality', async () => {
      const testName = 'quantity-update'
      
      // Look for quantity controls
      const quantityControls = await page.$$('[data-testid="quantity-control"], .quantity-control, [class*="quantity"]')
      
      if (quantityControls.length > 0) {
        // Take before screenshot
        const beforeScreenshot = path.join(SCREENSHOTS_DIR, `${testName}-before.png`)
        await page.screenshot({ path: beforeScreenshot })
        
        // Try to click quantity increase
        const increaseBtn = await page.$('button[data-testid="quantity-increase"], button[class*="increase"]')
        if (increaseBtn) {
          await increaseBtn.click()
          await page.waitForTimeout(1000)
        }
        
        // Take after screenshot
        const afterScreenshot = path.join(SCREENSHOTS_DIR, `${testName}-after.png`)
        await page.screenshot({ path: afterScreenshot })
        
        console.log(`📸 Quantity update: ${beforeScreenshot} -> ${afterScreenshot}`)
      } else {
        console.log('ℹ️ No quantity controls found - cart may be empty')
      }
    })

    test('should test item removal functionality', async () => {
      const testName = 'item-removal'
      
      // Look for remove buttons
      const removeButtons = await page.$$('[data-testid="remove-item"], button[class*="remove"]')
      
      if (removeButtons.length > 0) {
        // Take before screenshot
        const beforeScreenshot = path.join(SCREENSHOTS_DIR, `${testName}-before.png`)
        await page.screenshot({ path: beforeScreenshot })
        
        // Click remove button
        await removeButtons[0].click()
        await page.waitForTimeout(1000)
        
        // Take after screenshot
        const afterScreenshot = path.join(SCREENSHOTS_DIR, `${testName}-after.png`)
        await page.screenshot({ path: afterScreenshot })
        
        console.log(`📸 Item removal: ${beforeScreenshot} -> ${afterScreenshot}`)
      } else {
        console.log('ℹ️ No remove buttons found - cart may be empty')
      }
    })
  })

  describe('Checkout Process', () => {
    test('should test checkout button states', async () => {
      const testName = 'checkout-button'
      
      // Look for checkout button
      const checkoutBtn = await page.$('[data-testid="checkout-btn"], button[class*="checkout"]')
      
      if (checkoutBtn) {
        // Take before screenshot
        const beforeScreenshot = path.join(SCREENSHOTS_DIR, `${testName}-before.png`)
        await page.screenshot({ path: beforeScreenshot })
        
        // Click checkout button
        await checkoutBtn.click()
        await page.waitForTimeout(1000)
        
        // Take after screenshot
        const afterScreenshot = path.join(SCREENSHOTS_DIR, `${testName}-after.png`)
        await page.screenshot({ path: afterScreenshot })
        
        console.log(`📸 Checkout button: ${beforeScreenshot} -> ${afterScreenshot}`)
      } else {
        console.log('ℹ️ No checkout button found')
      }
    })

    test('should test promo code functionality', async () => {
      const testName = 'promo-code'
      
      // Look for promo code input
      const promoInput = await page.$('input[placeholder*="promo" i], input[placeholder*="code" i]')
      
      if (promoInput) {
        // Take before screenshot
        const beforeScreenshot = path.join(SCREENSHOTS_DIR, `${testName}-before.png`)
        await page.screenshot({ path: beforeScreenshot })
        
        // Type promo code
        await promoInput.type('SAVE10')
        
        // Click apply button
        const applyBtn = await page.$('button[data-testid="apply-promo"], button[class*="apply"]')
        if (applyBtn) {
          await applyBtn.click()
          await page.waitForTimeout(1000)
        }
        
        // Take after screenshot
        const afterScreenshot = path.join(SCREENSHOTS_DIR, `${testName}-after.png`)
        await page.screenshot({ path: afterScreenshot })
        
        console.log(`📸 Promo code: ${beforeScreenshot} -> ${afterScreenshot}`)
      } else {
        console.log('ℹ️ No promo code input found')
      }
    })
  })
})