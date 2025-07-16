# AI-Driven Visual Testing Development Workflow

## Overview

This document outlines the AI-driven visual testing workflow that enables autonomous development and testing of web applications through screenshot analysis and automated problem detection. The workflow follows a **discovery-first approach** where AI analyzes application screenshots to understand the interface before generating targeted test cases.

## Core Concept - Discovery-First Testing

The enhanced workflow follows a 3-step AI-centric approach:

### **Step 1: Discovery Phase** (`page.discover.visual.ts`)
- Generate comprehensive screenshots of all pages and components
- Capture different states (desktop, mobile, various data conditions)
- Create visual inventory of the entire application
- **Purpose**: Let AI understand the application structure through visual analysis

### **Step 2: Analysis & Test Generation** (`page.workflow.visual.ts`)
- AI analyzes discovery screenshots to understand UI patterns and interactions
- Generate targeted test cases for each page based on visual understanding
- Create tests that capture before/after screenshots for each user action
- **Purpose**: AI-driven test case generation based on visual comprehension

### **Step 3: Problem Detection & Resolution**
- AI analyzes before/after screenshot pairs to identify issues
- Generate todo lists for all detected problems
- Implement fixes based on visual analysis findings
- **Purpose**: AI-powered problem detection through image comparison

**Key Philosophy**: "Running the test is actually for generating screenshots, the real test is by analyzing images using AI"

## Enhanced Workflow Steps

### 1. Discovery Phase - Visual Application Mapping

**Objective**: Generate comprehensive screenshots of all application pages and states for AI analysis.

**Implementation**: Create `page.discover.visual.ts` tests that systematically capture the entire application.

**Discovery Test Structure**:
```typescript
// tests/e2e/discovery/page.discover.visual.ts
describe('Application Discovery - Visual Mapping', () => {
  let browser: Browser
  let page: Page
  
  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: true })
    page = await browser.newPage()
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
          await page.waitForLoadState('networkidle')
          
          // Capture full page
          await page.screenshot({
            path: `screenshots/discovery/${name}-${viewportName}-full.png`,
            fullPage: true
          })
          
          // Capture above-the-fold
          await page.screenshot({
            path: `screenshots/discovery/${name}-${viewportName}-viewport.png`,
            fullPage: false
          })
          
          // Capture different states if applicable
          if (name === 'products') {
            // Capture with search
            await page.fill('[data-testid="search-input"]', 'laptop')
            await page.screenshot({
              path: `screenshots/discovery/${name}-${viewportName}-search.png`,
              fullPage: true
            })
            
            // Capture with filter
            await page.click('[data-testid="electronics-filter"]')
            await page.screenshot({
              path: `screenshots/discovery/${name}-${viewportName}-filtered.png`,
              fullPage: true
            })
          }
          
          if (name === 'cart') {
            // Capture empty cart
            await page.screenshot({
              path: `screenshots/discovery/${name}-${viewportName}-empty.png`,
              fullPage: true
            })
            
            // Add item and capture with items
            await page.goto('http://localhost:3000/products/1')
            await page.click('[data-testid="add-to-cart"]')
            await page.goto('http://localhost:3000/cart')
            await page.screenshot({
              path: `screenshots/discovery/${name}-${viewportName}-with-items.png`,
              fullPage: true
            })
          }
        })
      })
    })
  })
})
```

### 2. AI Analysis & Test Generation Phase

**Objective**: AI analyzes discovery screenshots to understand application structure and generate targeted test cases.

**Process**:
1. **Visual Analysis**: AI examines all discovery screenshots to identify:
   - Interactive elements (buttons, forms, links)
   - State changes (loading, success, error states)
   - Data flow patterns
   - User interaction opportunities

2. **Test Case Generation**: Based on visual analysis, create `page.workflow.visual.ts` tests that:
   - Target specific user interactions identified in screenshots
   - Capture before/after states for each action
   - Test critical user journeys
   - Validate visual feedback and state changes

**Generated Test Structure**:
```typescript
// tests/e2e/products/page.workflow.visual.ts
describe('Products Page - AI Generated Workflow Tests', () => {
  let browser: Browser
  let page: Page
  
  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: true })
    page = await browser.newPage()
    await page.goto('http://localhost:3000/products')
  })
  
  test('should visually test search functionality', async () => {
    // Capture before state
    await page.screenshot({
      path: 'screenshots/workflow/products-search-before.png',
      fullPage: true
    })
    
    // Perform search action
    await page.fill('[data-testid="search-input"]', 'laptop')
    await page.press('[data-testid="search-input"]', 'Enter')
    await page.waitForLoadState('networkidle')
    
    // Capture after state
    await page.screenshot({
      path: 'screenshots/workflow/products-search-after.png',
      fullPage: true
    })
  })
  
  test('should visually test category filtering', async () => {
    // Capture before state
    await page.screenshot({
      path: 'screenshots/workflow/products-filter-before.png',
      fullPage: true
    })
    
    // Apply category filter
    await page.click('[data-testid="electronics-filter"]')
    await page.waitForLoadState('networkidle')
    
    // Capture after state
    await page.screenshot({
      path: 'screenshots/workflow/products-filter-after.png',
      fullPage: true
    })
  })
  
  test('should visually test add to cart from product listing', async () => {
    // Navigate to product and capture before state
    await page.goto('http://localhost:3000/products/1')
    await page.screenshot({
      path: 'screenshots/workflow/add-to-cart-before.png',
      fullPage: true
    })
    
    // Add to cart action
    await page.click('[data-testid="add-to-cart"]')
    await page.waitForTimeout(1000) // Wait for state update
    
    // Capture after state
    await page.screenshot({
      path: 'screenshots/workflow/add-to-cart-after.png',
      fullPage: true
    })
  })
})
```

### 3. AI-Powered Problem Detection & Todo Generation

**Objective**: AI analyzes before/after screenshot pairs to detect issues and generate actionable todo items.

**Analysis Process**:
```typescript
// lib/ai-screenshot-analyzer.ts
export async function analyzeScreenshotPairs(beforePath: string, afterPath: string) {
  const problems = []
  
  // AI analyzes the before/after screenshots and identifies issues like:
  // - Elements that should have changed but didn't
  // - Loading states that persist
  // - Visual inconsistencies
  // - Missing feedback to user actions
  // - Layout problems
  // - State management issues
  
  return problems.map(problem => ({
    content: problem.description,
    status: 'pending',
    priority: problem.severity,
    id: `detected-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    page: problem.page,
    section: problem.section,
    screenshots: {
      before: beforePath,
      after: afterPath
    }
  }))
}
```

**Integration with Test Suite**:
```typescript
// Enhanced workflow test with AI analysis
test('should detect issues through AI screenshot analysis', async () => {
  const beforeScreenshot = 'screenshots/workflow/search-before.png'
  const afterScreenshot = 'screenshots/workflow/search-after.png'
  
  // Capture screenshots (as shown above)
  
  // AI analysis of screenshot pair
  const detectedProblems = await analyzeScreenshotPairs(beforeScreenshot, afterScreenshot)
  
  // Generate todo items for detected problems
  if (detectedProblems.length > 0) {
    console.log('🔍 AI Detected Issues:')
    detectedProblems.forEach(problem => {
      console.log(`- ${problem.content} (${problem.priority})`)
    })
    
    // Update todo list with AI-detected problems
    await updateTodoList(detectedProblems)
  }
})
```

### 4. Setup Visual Testing Infrastructure

Create the testing structure:

```bash
# Create directories
mkdir -p tests/e2e screenshots/visual-tests

# Install dependencies
npm install --save-dev jest puppeteer @types/jest @types/puppeteer
```

### 2. Configure Testing Environment

**jest.config.js**
```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 30000,
  maxWorkers: 1
}
```

**jest.setup.js**
```javascript
process.env.NODE_ENV = 'test'
```

### 3. Create Visual Test Suite

**Key Components:**
- **Before/After Screenshot Capture** - Document visual state changes
- **Functional Verification** - Test actual behavior changes
- **Multi-Device Testing** - Desktop and mobile viewports
- **User Journey Mapping** - Complete interaction flows

**Example Test Structure:**
```typescript
describe('Visual Testing Suite', () => {
  let browser: Browser
  let page: Page
  
  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: true })
    page = await browser.newPage()
    await page.goto('http://localhost:3000/products/1')
  })
  
  test('should visually show cart count changes', async () => {
    // Capture before state
    const beforeScreenshot = 'cart-count-before.png'
    await page.screenshot({ path: beforeScreenshot })
    
    // Perform action
    await page.click('[data-testid="add-to-cart"]')
    
    // Capture after state  
    const afterScreenshot = 'cart-count-after.png'
    await page.screenshot({ path: afterScreenshot })
    
    // Verify functional change
    const cartCount = await page.textContent('[data-testid="cart-count"]')
    expect(cartCount).toBe('1')
  })
})
```

### 4. Implement Screenshot Analysis

**Analysis Categories:**
- **State Changes** - Elements that should update
- **Loading States** - Skeleton to content transitions
- **User Feedback** - Button states, notifications
- **Data Flow** - Information propagation across components
- **Responsive Behavior** - Layout adaptations

**Example Analysis Process:**
```typescript
// Analyze screenshots for problems
const problems = await analyzeScreenshots([
  'before.png',
  'after.png'
])

// Generate todo items for each problem
const todos = problems.map(problem => ({
  content: problem.description,
  status: 'pending',
  priority: problem.severity
}))
```

### 5. Navigation Link Testing

**Automated Navigation Verification:**
Test all navigation links on each page to ensure they work correctly and add broken links to the todo list.

**Navigation Test Implementation:**
```typescript
async function testNavigationLinks(page: Page, currentUrl: string) {
  const navigationIssues = []
  
  // Find all navigation links
  const navLinks = await page.$$eval('nav a, header a, [role="navigation"] a', 
    links => links.map(link => ({
      text: link.textContent?.trim(),
      href: link.href,
      selector: link.tagName + (link.id ? `#${link.id}` : '') + (link.className ? `.${link.className.split(' ').join('.')}` : '')
    }))
  )
  
  console.log(`🔍 Found ${navLinks.length} navigation links to test`)
  
  for (const link of navLinks) {
    try {
      // Skip external links and javascript: links
      if (!link.href || link.href.startsWith('javascript:') || 
          link.href.startsWith('mailto:') || link.href.startsWith('tel:')) {
        continue
      }
      
      // Test internal links
      if (link.href.includes(new URL(currentUrl).origin)) {
        console.log(`Testing nav link: "${link.text}" -> ${link.href}`)
        
        // Click the link
        await page.click(`a[href="${new URL(link.href).pathname}"]`)
        
        // Wait for navigation
        await page.waitForLoadState('networkidle')
        
        // Check if we successfully navigated
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
          const hasErrorContent = await page.locator('text=/404|not found|error/i').count() > 0
          
          if (hasErrorContent || pageTitle.toLowerCase().includes('404')) {
            navigationIssues.push({
              text: link.text,
              href: link.href,
              issue: 'Link leads to 404 or error page',
              priority: 'high'
            })
          }
        }
        
        // Go back to original page
        await page.goBack()
        await page.waitForLoadState('networkidle')
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
  
  return navigationIssues
}
```

**Integration with Visual Tests:**
```typescript
describe('Page Navigation Testing', () => {
  test('should verify all navigation links work correctly', async () => {
    const currentUrl = page.url()
    const navigationIssues = await testNavigationLinks(page, currentUrl)
    
    // Take screenshot of navigation state
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, 'navigation-state.png'),
      fullPage: true 
    })
    
    // Log navigation issues for todo list
    if (navigationIssues.length > 0) {
      console.log('🚨 Navigation Issues Found:')
      navigationIssues.forEach(issue => {
        console.log(`- ${issue.text} (${issue.href}): ${issue.issue}`)
      })
      
      // Add to todo list
      const todoItems = navigationIssues.map(issue => ({
        content: `Fix navigation link "${issue.text}" - ${issue.issue}`,
        status: 'pending',
        priority: issue.priority,
        id: `nav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }))
      
      // Update todo list with navigation issues
      await updateTodoList(todoItems)
    }
    
    // Test should not fail but report issues
    expect(navigationIssues.length).toBe(0)
  })
})
```

### 6. Problem Detection Patterns

**Common Issues to Detect:**
- Cart count not updating after adding items
- Loading states showing indefinitely  
- Mock data instead of real content
- Image selection not changing main image
- Form validation not showing errors
- Mobile layout breaking on small screens
- **Navigation links not working or leading to 404s**
- **Missing pages referenced in navigation**
- **Broken internal routing**

**Analysis Questions:**
1. Do interactive elements provide visual feedback?
2. Are loading states transitioning to content?
3. Is data flowing correctly between components?
4. Are error states properly displayed?
5. Does the layout work on different screen sizes?
6. **Do all navigation links work correctly?**
7. **Are there any 404 or broken page errors?**
8. **Is the routing configuration complete?**

### 6. Autonomous Fix Implementation

**Fix Process:**
1. **Identify Root Cause** - Analyze code for the underlying issue
2. **Implement Solution** - Update application code (not tests)
3. **Verify Integration** - Ensure fix works with existing architecture
4. **Test Validation** - Re-run visual tests to confirm resolution

**Key Principle:** Fix the application to meet test expectations, not the reverse.

### 7. State Management Integration

**Cart Example:**
```typescript
// Context for global state
const CartContext = createContext<CartContextType | undefined>(undefined)

// Provider component
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  
  const addToCart = (product: Product, quantity: number) => {
    // Update state logic
  }
  
  return (
    <CartContext.Provider value={{ items, addToCart }}>
      {children}
    </CartContext.Provider>
  )
}
```

### 8. Visual Verification Checklist

**Before/After Comparisons:**
- [ ] Cart badge updates with correct count
- [ ] Button states change (Add to Cart → Added to Cart!)
- [ ] Loading skeletons transition to content
- [ ] Product images change when thumbnails clicked
- [ ] Form errors appear when validation fails
- [ ] Mobile layout adapts properly

### 9. Enhanced Testing Commands

**Discovery Phase:**
```bash
# Run discovery tests to generate screenshots for all pages
npm test -- tests/e2e/discovery/page.discover.visual.ts

# Run discovery for specific page
npm test -- --testNamePattern="Discovery.*home"
npm test -- --testNamePattern="Discovery.*products"
```

**Workflow Phase:**
```bash
# Run AI-generated workflow tests
npm test -- --testNamePattern="workflow.visual"

# Run workflow tests for specific page
npm test -- tests/e2e/home/page.workflow.visual.ts
npm test -- tests/e2e/products/page.workflow.visual.ts
```

**Run Tests by Page:**
```bash
# Test specific page (includes both discovery and workflow)
npm test -- --selectProjects=home
npm test -- --selectProjects=products
npm test -- --selectProjects=cart
npm test -- --selectProjects=account
npm test -- --selectProjects=about
npm test -- --selectProjects=contact

# Test shared components (navigation, etc.)
npm test -- --selectProjects=shared
```

**Run All Visual Tests:**
```bash
npm test -- tests/e2e/
```

**Run Specific Test Types:**
```bash
# Discovery tests only
npm test -- --testNamePattern="discover"

# Workflow tests only
npm test -- --testNamePattern="workflow"

# Navigation tests across all pages
npm test -- --testNamePattern="navigation"

# Form tests only  
npm test -- --testNamePattern="form"
```

**Start Development Server:**
```bash
npm run dev
```

**Discovery-First Workflow:**
```bash
# 1. Run discovery tests to generate comprehensive screenshots
npm test -- tests/e2e/discovery/page.discover.visual.ts

# 2. AI analyzes discovery screenshots to understand application
# (AI analysis step - generates workflow tests)

# 3. Run AI-generated workflow tests to capture before/after states
npm test -- --testNamePattern="workflow.visual"

# 4. AI analyzes before/after screenshots for problems
# (AI analysis step - generates todo items)

# 5. Fix identified issues in application code
# (Development step)

# 6. Re-run workflow tests to verify fixes
npm test -- --testNamePattern="workflow.visual"
```

**Page-Specific Discovery Workflow:**
```bash
# 1. Run discovery for specific page
npm test -- --testNamePattern="Discovery.*products"

# 2. AI analyzes page screenshots to generate workflow tests
# (AI analysis step)

# 3. Run workflow tests for the page
npm test -- tests/e2e/products/page.workflow.visual.ts

# 4. AI analyzes before/after screenshots for issues
# (AI analysis step)

# 5. Fix identified issues
# (Development step)

# 6. Re-run workflow tests to verify fixes
npm test -- tests/e2e/products/page.workflow.visual.ts
```

**Full Application Discovery Workflow:**
```bash
# 1. Run discovery for all pages
npm test -- tests/e2e/discovery/page.discover.visual.ts

# 2. AI analyzes all discovery screenshots
# (AI analysis step - generates all workflow tests)

# 3. Run all workflow tests
npm test -- --testNamePattern="workflow.visual"

# 4. AI analyzes all before/after screenshot pairs
# (AI analysis step - generates comprehensive todo list)

# 5. Fix identified issues prioritized by severity
# (Development step)

# 6. Re-run all workflow tests to verify fixes
npm test -- --testNamePattern="workflow.visual"
```

**Todo List Management by Page:**
```bash
# View todos for specific page
npm test -- --selectProjects=home --verbose

# View todos for all navigation issues
npm test -- --selectProjects=shared --testNamePattern="navigation"

# View todos for specific feature
npm test -- --testNamePattern="cart" --verbose
```

## Enhanced Test Structure

**Mirror App Structure in Tests:**
Organize tests to match your app folder structure for better maintainability and clarity.

```
project/
├── tests/
│   └── e2e/
│       ├── home/
│       │   ├── page.visual.test.ts
│       │   └── navigation.test.ts
│       ├── products/
│       │   ├── page.visual.test.ts
│       │   ├── [id]/
│       │   │   ├── page.visual.test.ts
│       │   │   └── interactions.test.ts
│       │   └── category.test.ts
│       ├── cart/
│       │   ├── page.visual.test.ts
│       │   └── checkout.test.ts
│       ├── account/
│       │   ├── page.visual.test.ts
│       │   └── auth.test.ts
│       ├── about/
│       │   └── page.visual.test.ts
│       ├── contact/
│       │   ├── page.visual.test.ts
│       │   └── form.test.ts
│       └── shared/
│           ├── navigation.test.ts
│           └── components.test.ts
├── screenshots/
│   └── visual-tests/
│       ├── home/
│       │   ├── page-load.png
│       │   └── hero-section.png
│       ├── products/
│       │   ├── listing-page.png
│       │   └── [id]/
│       │       ├── product-details.png
│       │       ├── add-to-cart-before.png
│       │       └── add-to-cart-after.png
│       ├── cart/
│       │   ├── empty-cart.png
│       │   └── cart-with-items.png
│       └── shared/
│           ├── navigation-mobile.png
│           └── navigation-desktop.png
├── src/
│   ├── app/
│   │   ├── (pages)/
│   │   │   ├── page.tsx                 # Home
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   ├── account/
│   │   │   │   └── page.tsx
│   │   │   ├── cart/
│   │   │   │   └── page.tsx
│   │   │   ├── contact/
│   │   │   │   └── page.tsx
│   │   │   └── products/
│   │   │       ├── page.tsx
│   │   │       └── [id]/
│   │   │           └── page.tsx
│   │   ├── components/
│   │   ├── contexts/
│   │   └── api/
│   └── lib/
├── jest.config.js
├── jest.setup.js
└── AI-VISUAL-TESTING-WORKFLOW.md
```

**Enhanced Test File Naming Convention:**
- `page.discover.visual.ts` - Discovery phase screenshot generation
- `page.workflow.visual.ts` - AI-generated workflow tests with before/after screenshots
- `navigation.test.ts` - Navigation-specific tests  
- `interactions.test.ts` - Complex user interactions
- `form.test.ts` - Form validation and submission
- `components.test.ts` - Reusable component tests

## Page-Organized Todo List Structure

**Organize todos by page sections for better project management:**

```typescript
// Enhanced todo structure with page organization
interface PageTodoList {
  home: TodoItem[]
  products: {
    listing: TodoItem[]
    details: TodoItem[]
    category: TodoItem[]
  }
  cart: TodoItem[]
  account: TodoItem[]
  about: TodoItem[]
  contact: TodoItem[]
  shared: {
    navigation: TodoItem[]
    components: TodoItem[]
    api: TodoItem[]
  }
}

// Example organized todo structure
const todos: PageTodoList = {
  home: [
    {
      id: "home-1",
      content: "Fix hero section image not loading on mobile",
      status: "pending",
      priority: "high",
      page: "home",
      section: "hero"
    },
    {
      id: "home-2", 
      content: "Implement search functionality in header",
      status: "in_progress",
      priority: "medium",
      page: "home",
      section: "search"
    }
  ],
  
  products: {
    listing: [
      {
        id: "products-listing-1",
        content: "Add product filtering by category",
        status: "pending", 
        priority: "high",
        page: "products",
        section: "listing"
      },
      {
        id: "products-listing-2",
        content: "Fix pagination not working on mobile",
        status: "pending",
        priority: "medium", 
        page: "products",
        section: "listing"
      }
    ],
    
    details: [
      {
        id: "products-details-1",
        content: "Fix cart count not updating when items are added",
        status: "completed",
        priority: "high",
        page: "products/[id]",
        section: "cart-interaction"
      },
      {
        id: "products-details-2",
        content: "Fix product image selection to actually change the main image",
        status: "completed", 
        priority: "high",
        page: "products/[id]",
        section: "image-gallery"
      }
    ],
    
    category: [
      {
        id: "products-category-1",
        content: "Create category filtering page",
        status: "pending",
        priority: "medium",
        page: "products",
        section: "category"
      }
    ]
  },
  
  cart: [
    {
      id: "cart-1",
      content: "Fix cart page showing only skeleton content instead of actual product information",
      status: "completed",
      priority: "high", 
      page: "cart",
      section: "display"
    },
    {
      id: "cart-2",
      content: "Add checkout flow implementation",
      status: "pending",
      priority: "high",
      page: "cart", 
      section: "checkout"
    }
  ],
  
  account: [
    {
      id: "account-1",
      content: "Fix navigation link 'Account' - Link leads to 404 or error page",
      status: "pending",
      priority: "high",
      page: "account",
      section: "navigation"
    },
    {
      id: "account-2",
      content: "Implement user authentication flow",
      status: "pending",
      priority: "high",
      page: "account",
      section: "auth"
    }
  ],
  
  about: [
    {
      id: "about-1", 
      content: "Fix navigation link 'About' - Link leads to 404 or error page",
      status: "pending",
      priority: "high",
      page: "about",
      section: "navigation"
    },
    {
      id: "about-2",
      content: "Create about page content and layout",
      status: "pending",
      priority: "medium",
      page: "about",
      section: "content"
    }
  ],
  
  contact: [
    {
      id: "contact-1",
      content: "Fix navigation link 'Contact' - Link leads to 404 or error page", 
      status: "pending",
      priority: "high",
      page: "contact",
      section: "navigation"
    },
    {
      id: "contact-2",
      content: "Implement contact form validation",
      status: "pending",
      priority: "medium",
      page: "contact",
      section: "form"
    }
  ],
  
  shared: {
    navigation: [
      {
        id: "nav-1",
        content: "Fix navigation link 'Home' - Link leads to 404 or error page",
        status: "pending",
        priority: "high",
        page: "shared",
        section: "navigation"
      },
      {
        id: "nav-2", 
        content: "Fix navigation link 'Products' - Link leads to 404 or error page",
        status: "pending",
        priority: "high",
        page: "shared",
        section: "navigation"
      }
    ],
    
    components: [
      {
        id: "comp-1",
        content: "Implement proper cart state management across the application",
        status: "completed",
        priority: "high",
        page: "shared",
        section: "components"
      },
      {
        id: "comp-2",
        content: "Add loading state transitions for better UX",
        status: "pending",
        priority: "low",
        page: "shared", 
        section: "components"
      }
    ],
    
    api: [
      {
        id: "api-1",
        content: "Add timeout handling for failed data loads",
        status: "pending",
        priority: "medium",
        page: "shared",
        section: "api"
      },
      {
        id: "api-2",
        content: "Add error handling and fallbacks when data fails to load",
        status: "pending",
        priority: "medium",
        page: "shared",
        section: "api"
      }
    ]
  }
}
```

**Todo Management Functions:**
```typescript
// Get todos by page
function getTodosByPage(page: string): TodoItem[] {
  return todos[page] || []
}

// Get todos by priority across all pages
function getTodosByPriority(priority: string): TodoItem[] {
  const allTodos = []
  // Flatten all todos from all pages
  Object.values(todos).forEach(pageSection => {
    if (Array.isArray(pageSection)) {
      allTodos.push(...pageSection.filter(todo => todo.priority === priority))
    } else {
      Object.values(pageSection).forEach(section => {
        allTodos.push(...section.filter(todo => todo.priority === priority))
      })
    }
  })
  return allTodos
}

// Get todos by status
function getTodosByStatus(status: string): TodoItem[] {
  // Similar implementation for status filtering
}

// Add todo to specific page section
function addTodoToPage(pageId: string, section: string, todo: TodoItem): void {
  if (todos[pageId]) {
    if (Array.isArray(todos[pageId])) {
      todos[pageId].push(todo)
    } else {
      todos[pageId][section].push(todo)
    }
  }
}
```

## Benefits

1. **Autonomous Development** - AI can identify and fix issues without manual intervention
2. **Visual Regression Prevention** - Catches UI problems before they reach users
3. **Comprehensive Coverage** - Tests both functional and visual aspects
4. **User-Centric Testing** - Focuses on actual user experience
5. **Continuous Improvement** - Iterative problem detection and resolution

## Best Practices

1. **Test Real User Interactions** - Click buttons, fill forms, navigate pages
2. **Capture Complete Journeys** - Multi-step user flows
3. **Include Edge Cases** - Error states, empty states, loading states
4. **Mobile-First Testing** - Responsive design verification
5. **Performance Monitoring** - Loading time analysis
6. **Accessibility Checking** - Screen reader compatibility

## Extension Points

- **Cross-Browser Testing** - Chrome, Firefox, Safari
- **Performance Metrics** - Core Web Vitals tracking
- **Accessibility Testing** - WCAG compliance
- **API Integration** - Backend service testing
- **Deployment Verification** - Production environment validation

## Implementation Notes

- Use `maxWorkers: 1` in Jest to avoid race conditions
- Implement proper timeouts for async operations
- Clean up browser instances after tests
- Use data-testid attributes for reliable element selection
- Store screenshots in version control for regression analysis

This workflow enables rapid, autonomous development where AI can identify problems through visual analysis and implement fixes automatically, creating a self-improving development cycle.