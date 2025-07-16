import { Browser, Page } from 'puppeteer'
import puppeteer from 'puppeteer'
import path from 'path'
import fs from 'fs'

const SCREENSHOTS_DIR = path.join(process.cwd(), 'screenshots/discovery')

describe('Application Discovery - Visual Mapping', () => {
  let browser: Browser
  let page: Page
  
  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: true })
    page = await browser.newPage()
    
    // Ensure screenshots directory exists
    if (!fs.existsSync(SCREENSHOTS_DIR)) {
      fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
    }
  })
  
  afterAll(async () => {
    await browser.close()
  })
  
  const pages = [
    { name: 'home', url: '/' },
    { name: 'products', url: '/products' },
    { name: 'product-details', url: '/products/1' },
    { name: 'cart', url: '/cart' },
    { name: 'account', url: '/account' },
    { name: 'about', url: '/about' },
    { name: 'contact', url: '/contact' }
  ]
  
  const viewports = [
    { name: 'desktop', width: 1920, height: 1080 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 }
  ]
  
  pages.forEach(({ name, url }) => {
    describe(`Discovery: ${name} page`, () => {
      viewports.forEach(({ name: viewportName, width, height }) => {
        test(`should capture ${name} page on ${viewportName}`, async () => {
          await page.setViewport({ width, height })
          await page.goto(`http://localhost:3000${url}`)
          
          // Wait for page to load
          try {
            await page.waitForSelector('body', { timeout: 10000 })
            await page.waitForLoadState('networkidle', { timeout: 15000 })
          } catch (error) {
            console.log(`⚠️  Timeout waiting for ${name} page to load, capturing anyway`)
          }
          
          // Capture full page
          await page.screenshot({
            path: path.join(SCREENSHOTS_DIR, `${name}-${viewportName}-full.png`),
            fullPage: true
          })
          
          // Capture above-the-fold viewport
          await page.screenshot({
            path: path.join(SCREENSHOTS_DIR, `${name}-${viewportName}-viewport.png`),
            fullPage: false
          })
          
          console.log(`📸 Captured ${name} page on ${viewportName}`)
          
          // Capture different states if applicable
          if (name === 'products') {
            try {
              // Capture with search if search input exists
              const searchInput = await page.$('[data-testid="search-input"]')
              if (searchInput) {
                await page.fill('[data-testid="search-input"]', 'test product')
                await page.keyboard.press('Enter')
                await page.waitForTimeout(2000)
                await page.screenshot({
                  path: path.join(SCREENSHOTS_DIR, `${name}-${viewportName}-search.png`),
                  fullPage: true
                })
                console.log(`📸 Captured ${name} search state on ${viewportName}`)
              }
              
              // Reset and capture with filter if filter exists
              await page.goto(`http://localhost:3000${url}`)
              await page.waitForTimeout(1000)
              
              const electronicsFilter = await page.$('[data-testid="electronics-filter"]')
              if (electronicsFilter) {
                await page.click('[data-testid="electronics-filter"]')
                await page.waitForTimeout(2000)
                await page.screenshot({
                  path: path.join(SCREENSHOTS_DIR, `${name}-${viewportName}-filtered.png`),
                  fullPage: true
                })
                console.log(`📸 Captured ${name} filtered state on ${viewportName}`)
              }
            } catch (error) {
              console.log(`⚠️  Error capturing ${name} additional states: ${error.message}`)
            }
          }
          
          if (name === 'cart') {
            try {
              // Capture empty cart state
              await page.screenshot({
                path: path.join(SCREENSHOTS_DIR, `${name}-${viewportName}-empty.png`),
                fullPage: true
              })
              console.log(`📸 Captured ${name} empty state on ${viewportName}`)
              
              // Add item to cart and capture with items
              await page.goto('http://localhost:3000/products/1')
              await page.waitForTimeout(1000)
              
              const addToCartButton = await page.$('[data-testid="add-to-cart"]')
              if (addToCartButton) {
                await page.click('[data-testid="add-to-cart"]')
                await page.waitForTimeout(1000)
                await page.goto('http://localhost:3000/cart')
                await page.waitForTimeout(2000)
                await page.screenshot({
                  path: path.join(SCREENSHOTS_DIR, `${name}-${viewportName}-with-items.png`),
                  fullPage: true
                })
                console.log(`📸 Captured ${name} with items state on ${viewportName}`)
              }
            } catch (error) {
              console.log(`⚠️  Error capturing ${name} cart states: ${error.message}`)
            }
          }
          
          if (name === 'product-details') {
            try {
              // Capture product details in different states
              await page.screenshot({
                path: path.join(SCREENSHOTS_DIR, `${name}-${viewportName}-initial.png`),
                fullPage: true
              })
              
              // Try to interact with image thumbnails if they exist
              const thumbnails = await page.$$('[data-testid="thumbnail"]')
              if (thumbnails.length > 1) {
                await thumbnails[1].click()
                await page.waitForTimeout(1000)
                await page.screenshot({
                  path: path.join(SCREENSHOTS_DIR, `${name}-${viewportName}-image-changed.png`),
                  fullPage: true
                })
                console.log(`📸 Captured ${name} image changed state on ${viewportName}`)
              }
            } catch (error) {
              console.log(`⚠️  Error capturing ${name} product detail states: ${error.message}`)
            }
          }
        })
      })
    })
  })
  
  // Generate discovery summary after all tests
  afterAll(async () => {
    console.log('\n🔍 DISCOVERY PHASE COMPLETE')
    console.log('Generated screenshots for AI analysis:')
    
    const screenshotFiles = fs.readdirSync(SCREENSHOTS_DIR)
    screenshotFiles.forEach(file => {
      console.log(`  - ${file}`)
    })
    
    console.log(`\n📊 Total screenshots captured: ${screenshotFiles.length}`)
    console.log('🤖 Ready for AI analysis and workflow test generation')
  })
})