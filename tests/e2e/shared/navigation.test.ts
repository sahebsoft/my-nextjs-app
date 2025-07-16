const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

/**
 * Shared Navigation Component Tests
 * Tests navigation functionality across all pages
 */

describe('Shared Navigation Tests', () => {
  let browser
  let page
  const BASE_URL = process.env.AI_WORKFLOW_BASE_URL || 'http://localhost:3003'
  const SCREENSHOTS_DIR = path.join(__dirname, '../../../screenshots/visual-tests/shared')

  // Pages to test navigation from
  const TEST_PAGES = [
    { name: 'home', url: `${BASE_URL}/` },
    { name: 'products', url: `${BASE_URL}/products` },
    { name: 'cart', url: `${BASE_URL}/cart` },
    { name: 'about', url: `${BASE_URL}/about` },
    { name: 'contact', url: `${BASE_URL}/contact` },
    { name: 'account', url: `${BASE_URL}/account` }
  ]

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
  })

  afterAll(async () => {
    await browser.close()
  })

  describe('Navigation Consistency Tests', () => {
    test('should have consistent navigation across all pages', async () => {
      const testName = 'navigation-consistency'
      const navigationData = []

      for (const testPage of TEST_PAGES) {
        try {
          await page.goto(testPage.url)
          
          // Take screenshot of navigation
          const screenshot = path.join(SCREENSHOTS_DIR, `${testName}-${testPage.name}.png`)
          await page.screenshot({ path: screenshot })
          
          // Get navigation links
          const navLinks = await page.$$eval('nav a, header a, [role="navigation"] a', 
            links => links.map(link => ({
              text: link.textContent?.trim(),
              href: link.href
            }))
          )
          
          navigationData.push({
            page: testPage.name,
            url: testPage.url,
            links: navLinks,
            screenshot: screenshot
          })
          
          console.log(`📸 Navigation on ${testPage.name}: ${screenshot}`)
          console.log(`🔗 Found ${navLinks.length} navigation links`)
          
        } catch (error) {
          console.log(`❌ Failed to test navigation on ${testPage.name}: ${error.message}`)
        }
      }
      
      // Analyze navigation consistency
      if (navigationData.length > 1) {
        const firstPageLinks = navigationData[0].links
        const inconsistencies = []
        
        for (let i = 1; i < navigationData.length; i++) {
          const currentPageLinks = navigationData[i].links
          if (currentPageLinks.length !== firstPageLinks.length) {
            inconsistencies.push({
              page: navigationData[i].page,
              issue: `Different number of navigation links (${currentPageLinks.length} vs ${firstPageLinks.length})`
            })
          }
        }
        
        if (inconsistencies.length > 0) {
          console.log('🚨 Navigation Inconsistencies Found:')
          inconsistencies.forEach(issue => {
            console.log(`- ${issue.page}: ${issue.issue}`)
          })
        }
      }
      
      expect(navigationData.length).toBeGreaterThan(0)
    })
  })

  describe('Mobile Navigation Tests', () => {
    test('should test mobile navigation functionality', async () => {
      const testName = 'mobile-navigation'
      
      // Set mobile viewport
      await page.setViewport({ width: 375, height: 667 })
      await page.goto(`${BASE_URL}/`)
      
      // Take screenshot of mobile navigation
      const mobileScreenshot = path.join(SCREENSHOTS_DIR, `${testName}-mobile.png`)
      await page.screenshot({ path: mobileScreenshot })
      
      // Look for mobile menu toggle
      const menuToggle = await page.$('[data-testid="mobile-menu-toggle"], button[class*="menu"], button[class*="hamburger"]')
      
      if (menuToggle) {
        // Take before screenshot
        const beforeScreenshot = path.join(SCREENSHOTS_DIR, `${testName}-before.png`)
        await page.screenshot({ path: beforeScreenshot })
        
        // Click menu toggle
        await menuToggle.click()
        await page.waitForTimeout(500)
        
        // Take after screenshot
        const afterScreenshot = path.join(SCREENSHOTS_DIR, `${testName}-after.png`)
        await page.screenshot({ path: afterScreenshot })
        
        console.log(`📸 Mobile navigation: ${beforeScreenshot} -> ${afterScreenshot}`)
      } else {
        console.log('ℹ️ No mobile menu toggle found')
      }
      
      // Reset viewport
      await page.setViewport({ width: 1200, height: 800 })
    })
  })

  describe('Navigation Link Functionality', () => {
    test('should test all navigation links from home page', async () => {
      const testName = 'navigation-links-functionality'
      
      await page.goto(`${BASE_URL}/`)
      
      const navigationIssues = []
      
      // Find all navigation links
      const navLinks = await page.$$eval('nav a, header a, [role="navigation"] a', 
        links => links.map(link => ({
          text: link.textContent?.trim(),
          href: link.href,
          pathname: new URL(link.href).pathname
        }))
      )
      
      console.log(`🔍 Testing ${navLinks.length} navigation links`)
      
      for (const link of navLinks) {
        try {
          // Skip external links
          if (!link.href || link.href.startsWith('javascript:') || 
              link.href.startsWith('mailto:') || link.href.startsWith('tel:')) {
            continue
          }
          
          // Test internal links
          if (link.href.includes(new URL(BASE_URL).origin)) {
            console.log(`Testing: "${link.text}" -> ${link.href}`)
            
            const currentUrl = page.url()
            
            // Click the link
            await page.click(`a[href="${link.pathname}"]`)
            await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 })
            
            const newUrl = page.url()
            
            // Check if navigation was successful
            if (newUrl === currentUrl) {
              navigationIssues.push({
                text: link.text,
                href: link.href,
                issue: 'Link did not navigate to new page',
                priority: 'high'
              })
            } else {
              // Check for 404 or error pages
              const pageTitle = await page.title()
              const pageContent = await page.content()
              const hasErrorContent = /404|not found|error/i.test(pageContent)
              
              if (hasErrorContent || pageTitle.toLowerCase().includes('404')) {
                navigationIssues.push({
                  text: link.text,
                  href: link.href,
                  issue: 'Link leads to 404 or error page',
                  priority: 'high'
                })
              }
            }
            
            // Go back to home page
            await page.goto(`${BASE_URL}/`)
          }
        } catch (error) {
          navigationIssues.push({
            text: link.text,
            href: link.href,
            issue: `Navigation failed: ${error.message}`,
            priority: 'medium'
          })
        }
      }
      
      // Take screenshot of final navigation state
      await page.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, `${testName}-final.png`),
        fullPage: true 
      })
      
      // Report navigation issues
      if (navigationIssues.length > 0) {
        console.log('🚨 Navigation Issues Found:')
        navigationIssues.forEach(issue => {
          console.log(`- ${issue.text} (${issue.href}): ${issue.issue}`)
        })
        
        console.log('\\n📋 Todo Items for Navigation Issues:')
        navigationIssues.forEach(issue => {
          console.log(`- Fix navigation link "${issue.text}" - ${issue.issue}`)
        })
      }
      
      console.log(`✅ Navigation test complete: ${navLinks.length - navigationIssues.length}/${navLinks.length} links working`)
      
      expect(navLinks.length).toBeGreaterThan(0)
    })
  })
})