/**
 * Utility functions for Puppeteer e2e testing
 * These helper functions make it easier to write and maintain tests
 */

import puppeteer, { Browser, Page, PuppeteerLaunchOptions, ElementHandle } from 'puppeteer';

/**
 * Browser configuration options
 * You can customize these based on your testing needs
 */
const getBrowserOptions = (): PuppeteerLaunchOptions => {
  // Check environment variable to determine if browser should be visible
  const isHeadless = process.env.HEADLESS !== 'false';

  return {
    // Headless mode configuration based on latest Puppeteer docs
    // headless: false = visible browser window
    // headless: true or 'new' = no visible window (faster)
    headless: isHeadless ? 'new' : false,

    // Show DevTools when browser is visible (great for learning!)
    devtools: !isHeadless,

    // Slow down operations when browser is visible (easier to follow)
    slowMo: isHeadless ? 0 : 100,

    // Browser window size
    defaultViewport: {
      width: 1280,
      height: 720,
    },

    // Additional Chrome arguments for stability and compatibility
    args: [
      '--no-sandbox',          // Required in some CI environments
      '--disable-dev-shm-usage', // Overcome limited resource problems
      '--disable-extensions',     // Disable browser extensions
      '--disable-gpu',           // Disable GPU acceleration
      '--disable-background-timer-throttling', // Prevent background throttling
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=TranslateUI', // Disable translate popup
      '--disable-ipc-flooding-protection', // Prevent IPC flooding protection
      // When visible, start with a reasonable window size
      ...(!isHeadless ? ['--start-maximized'] : []),
    ],

    // Ignore default arguments that might interfere
    ignoreDefaultArgs: ['--disable-extensions'],

    // Timeout for browser launch
    timeout: 60000, // 60 seconds
  };
};

/**
 * Creates a new browser instance
 * @returns Promise<Browser> - The browser instance
 */
export async function createBrowser(): Promise<Browser> {
  console.log('[BROWSER] Launching browser...');
  const browser = await puppeteer.launch(getBrowserOptions());
  console.log('[BROWSER] Browser launched successfully');
  return browser;
}

/**
 * Creates a new page with common configurations
 * @param browser - The browser instance
 * @returns Promise<Page> - The page instance
 */
export async function createPage(browser: Browser): Promise<Page> {
  const page = await browser.newPage();

  // Set a user agent (some sites block headless browsers)
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

  // Enable request interception if you need to modify requests
  // await page.setRequestInterception(true);

  // Set up console logging from the page (helpful for debugging)
  page.on('console', (msg) => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      console.log(`📄 Page ${type}:`, msg.text());
    }
  });

  // Log page errors
  page.on('pageerror', (error) => {
    console.error('📄 Page error:', error.message);
  });

  return page;
}

/**
 * Navigates to a URL and waits for the page to load
 * @param page - The page instance
 * @param url - The URL to navigate to
 * @param waitUntil - When to consider navigation successful
 */
export async function navigateToPage(
  page: Page,
  url: string,
  waitUntil: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2' = 'networkidle2'
): Promise<void> {
  console.log(`🔗 Navigating to: ${url}`);

  try {
    await page.goto(url, {
      waitUntil,
      timeout: 30000 // 30 second timeout
    });
    console.log(`✅ Successfully loaded: ${url}`);
  } catch (error) {
    console.error(`❌ Failed to load: ${url}`, error);
    throw error;
  }
}

/**
 * Waits for an element to appear on the page
 * @param page - The page instance
 * @param selector - CSS selector for the element
 * @param timeout - Maximum time to wait in milliseconds
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout: number = 10000
): Promise<void> {
  console.log(`⏳ Waiting for element: ${selector}`);

  try {
    await page.waitForSelector(selector, { timeout });
    console.log(`✅ Element found: ${selector}`);
  } catch (error) {
    console.error(`❌ Element not found: ${selector}`);
    throw error;
  }
}

/**
 * Takes a screenshot for debugging purposes
 * @param page - The page instance
 * @param name - Name for the screenshot file
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `screenshot-${name}-${timestamp}.png`;

  try {
    await page.screenshot({
      path: `e2e/screenshots/${filename}`,
      fullPage: true
    });
    console.log(`📸 Screenshot saved: ${filename}`);
  } catch (error) {
    console.error(`❌ Failed to take screenshot: ${filename}`, error);
  }
}

/**
 * Fills out a form field
 * @param page - The page instance
 * @param selector - CSS selector for the input field
 * @param value - Value to enter
 */
export async function fillField(page: Page, selector: string, value: string): Promise<void> {
  console.log(`✏️  Filling field ${selector} with: ${value}`);

  // Clear the field first
  await page.click(selector, { clickCount: 3 }); // Triple click to select all
  await page.keyboard.press('Backspace'); // Delete selected content

  // Type the new value
  await page.type(selector, value);
}

/**
 * Clicks an element and waits for navigation if it occurs
 * @param page - The page instance
 * @param selector - CSS selector for the element to click
 * @param waitForNavigation - Whether to wait for navigation after click
 */
export async function clickElement(
  page: Page,
  selector: string,
  waitForNavigation: boolean = false
): Promise<void> {
  console.log(`👆 Clicking element: ${selector}`);

  if (waitForNavigation) {
    // Wait for both the click and potential navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click(selector)
    ]);
  } else {
    await page.click(selector);
  }

  console.log(`✅ Clicked: ${selector}`);
}

/**
 * Gets text content from an element
 * @param page - The page instance
 * @param selector - CSS selector for the element
 * @returns Promise<string> - The text content
 */
export async function getElementText(page: Page, selector: string): Promise<string> {
  const element = await page.$(selector);
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }

  const text = await page.evaluate(el => el.textContent || '', element);
  console.log(`📝 Text from ${selector}: "${text}"`);
  return text.trim();
}

/**
 * Checks if an element exists on the page
 * @param page - The page instance
 * @param selector - CSS selector for the element
 * @returns Promise<boolean> - Whether the element exists
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  const element = await page.$(selector);
  const exists = element !== null;
  console.log(`🔍 Element ${selector} exists: ${exists}`);
  return exists;
}

/**
 * Waits for a specific amount of time
 * @param ms - Milliseconds to wait
 */
export async function wait(ms: number): Promise<void> {
  console.log(`⏸️  Waiting ${ms}ms...`);
  await new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Finds an element by its text content
 * @param page - The page instance
 * @param text - Text to search for
 * @param selector - CSS selector to limit search scope (default: '*')
 * @returns Promise<boolean> - Whether an element with the text was found
 */
export async function findElementByText(
  page: Page,
  text: string,
  selector: string = '*'
): Promise<boolean> {
  console.log(`🔍 Searching for text "${text}" in ${selector} elements...`);

  const found = await page.evaluate((searchText, searchSelector) => {
    const elements = document.querySelectorAll(searchSelector);

    for (const element of elements) {
      if (element.textContent && element.textContent.includes(searchText)) {
        return true;
      }
    }
    return false;
  }, text, selector);

  console.log(`${found ? '✅' : '❌'} Text "${text}" ${found ? 'found' : 'not found'}`);
  return found;
}

/**
 * Gets all elements that contain specific text
 * @param page - The page instance
 * @param text - Text to search for
 * @param selector - CSS selector to limit search scope (default: '*')
 * @returns Promise<string[]> - Array of text content from matching elements
 */
export async function getElementsByText(
  page: Page,
  text: string,
  selector: string = '*'
): Promise<string[]> {
  console.log(`🔍 Getting all elements containing "${text}"...`);

  const matchingTexts = await page.evaluate((searchText, searchSelector) => {
    const elements = document.querySelectorAll(searchSelector);
    const matches: string[] = [];

    for (const element of elements) {
      if (element.textContent && element.textContent.includes(searchText)) {
        matches.push(element.textContent.trim());
      }
    }
    return matches;
  }, text, selector);

  console.log(`📋 Found ${matchingTexts.length} elements containing "${text}"`);
  return matchingTexts;
}

/**
 * Clicks on an element that contains specific text
 * @param page - The page instance
 * @param text - Text to search for
 * @param selector - CSS selector to limit search scope (default: 'a, button')
 * @param waitForNavigation - Whether to wait for navigation after click
 */
export async function clickElementByText(
  page: Page,
  text: string,
  selector: string = 'a, button',
  waitForNavigation: boolean = false
): Promise<void> {
  console.log(`👆 Clicking element containing "${text}"...`);

  // First, find the element with the text
  const elementHandle = await page.evaluateHandle((searchText, searchSelector) => {
    const elements = document.querySelectorAll(searchSelector);

    for (const element of elements) {
      if (element.textContent && element.textContent.includes(searchText)) {
        return element;
      }
    }
    return null;
  }, text, selector);

  if (!elementHandle || !elementHandle.asElement()) {
    throw new Error(`No clickable element found containing text: "${text}"`);
  }

  if (waitForNavigation) {
    // Wait for both the click and potential navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      elementHandle.asElement()!.click()
    ]);
  } else {
    await elementHandle.asElement()!.click();
  }

  console.log(`✅ Clicked element containing: "${text}"`);
}
