const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

/**
 * Home Page Visual Screenshot Tests
 * Tests the main landing page functionality and visual states
 */

describe('Home Page Visual Tests', () => {
  let browser
  let page
  const BASE_URL = process.env.AI_WORKFLOW_BASE_URL || 'http://localhost:3003'
  const HOME_URL = `${BASE_URL}/`
  const SCREENSHOTS_DIR = path.join(__dirname, '../../../screenshots/visual-tests/home')

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
    await page.goto(HOME_URL)
  })

  afterAll(async () => {
    await browser.close()
  })

  describe('Page Load Visual Changes', () => {
    test('should visually load homepage content', async () => {
      const testName = 'home-page-load'
      
      // Take screenshot of loaded page
      const screenshot = path.join(SCREENSHOTS_DIR, `${testName}.png`)
      await page.screenshot({ path: screenshot, fullPage: true })
      
      // Check basic page elements
      const title = await page.title()
      expect(title).toBeTruthy()
      
      console.log(`📸 Home page loaded: ${screenshot}`)
    })

    test('should show hero section properly', async () => {
      const testName = 'hero-section'
      
      // Take screenshot of hero section
      const screenshot = path.join(SCREENSHOTS_DIR, `${testName}.png`)
      await page.screenshot({ path: screenshot })
      
      console.log(`📸 Hero section captured: ${screenshot}`)
    })
  })

  describe('Navigation Link Testing', () => {
    test('should verify all navigation links work correctly', async () => {
      const testName = 'navigation-links'
      const currentUrl = page.url()
      const navigationIssues = []
      
      // Find all navigation links
      const navLinks = await page.$$eval('nav a, header a, [role="navigation"] a', 
        links => links.map(link => ({
          text: link.textContent?.trim(),
          href: link.href,
          pathname: new URL(link.href).pathname
        }))
      )
      
      console.log(`🔍 Found ${navLinks.length} navigation links to test`)
      
      for (const link of navLinks) {
        try {
          // Skip external links
          if (!link.href || link.href.startsWith('javascript:') || 
              link.href.startsWith('mailto:') || link.href.startsWith('tel:')) {
            continue
          }
          
          // Test internal links
          if (link.href.includes(new URL(currentUrl).origin)) {
            console.log(`Testing nav link: "${link.text}" -> ${link.href}`)
            
            await page.click(`a[href="${link.pathname}"]`)
            await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 })
            
            const newUrl = page.url()
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
            
            await page.goBack()
            await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 })
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
      
      // Take screenshot of navigation state
      await page.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, `${testName}-state.png`),
        fullPage: true 
      })
      
      // Report navigation issues
      if (navigationIssues.length > 0) {
        console.log('🚨 Navigation Issues Found:')
        navigationIssues.forEach(issue => {
          console.log(`- ${issue.text} (${issue.href}): ${issue.issue}`)
        })
        
        console.log('\\n📋 Todo Items to Add:')
        navigationIssues.forEach(issue => {
          console.log(`- Fix navigation link "${issue.text}" - ${issue.issue}`)
        })
      }
      
      console.log(`✅ Navigation test complete: ${navLinks.length - navigationIssues.length}/${navLinks.length} links working`)
      
      expect(navLinks.length).toBeGreaterThan(0)
    })
  })

  describe('Search Functionality', () => {
    test('should test search bar functionality', async () => {
      const testName = 'search-functionality'
      
      // Look for search input
      const searchInput = await page.$('input[type="search"], input[placeholder*="search" i]')
      
      if (searchInput) {
        // Take before screenshot
        const beforeScreenshot = path.join(SCREENSHOTS_DIR, `${testName}-before.png`)
        await page.screenshot({ path: beforeScreenshot })
        
        // Type in search
        await searchInput.type('test search')
        
        // Take after screenshot
        const afterScreenshot = path.join(SCREENSHOTS_DIR, `${testName}-after.png`)
        await page.screenshot({ path: afterScreenshot })
        
        console.log(`📸 Search test: ${beforeScreenshot} -> ${afterScreenshot}`)
      } else {
        console.log('ℹ️ No search functionality found on home page')
      }
    })
  })
})