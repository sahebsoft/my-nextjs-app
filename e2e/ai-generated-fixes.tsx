/**
 * AI-Generated Fixes and Improvements - Complete Implementation
 * 
 * This file contains the specific code improvements identified by the AI analysis
 * These should be implemented in your actual application files
 */

import React, { useState, useEffect, useMemo } from 'react';

// =============================================================================
// 1. ACCESSIBILITY FIXES
// =============================================================================

/**
 * File: src/app/components/ProductCard.tsx
 * Fix: Add proper alt attributes and accessibility features
 */
export const ImprovedProductCard = ({ product, index }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
      role="article"
      aria-label={`Product: ${product.name}`}
    >
      {/* FIXED: Added proper alt text and loading optimization */}
      <img
        src={product.image}
        alt={`${product.name} - ${product.description}. Price: $${product.price}`}
        width={300}
        height={200}
        loading={index < 2 ? "eager" : "lazy"} // Prioritize first 2 images
        className="w-full h-48 object-cover rounded mb-4"
        onError={(e) => {
          e.currentTarget.src = '/api/placeholder/300/200?text=Image+Not+Available';
          e.currentTarget.alt = `${product.name} - Image not available`;
        }}
      />
      
      {/* FIXED: Added proper heading hierarchy */}
      <h3 className="text-xl font-semibold mb-2 text-gray-800">
        {product.name}
      </h3>
      
      <p className="text-gray-600 mb-4">
        {product.description}
      </p>
      
      {/* FIXED: Added semantic pricing with screen reader support */}
      <div className="flex justify-between items-center">
        <span 
          className="text-2xl font-bold text-blue-600"
          aria-label={`Price: ${product.price} dollars`}
        >
          ${product.price}
        </span>
        
        {/* FIXED: Added accessible action button */}
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={`Add ${product.name} to cart`}
          onClick={() => console.log(`Added ${product.name} to cart`)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

/**
 * File: src/app/components/SearchBar.tsx  
 * Fix: Enhanced search accessibility and functionality
 */
export const ImprovedSearchBar = ({ searchTerm, onSearchChange, placeholder }) => {
  const searchId = 'product-search';
  
  return (
    <div className="relative" role="search" aria-label="Product search">
      {/* FIXED: Added proper labeling and ARIA attributes */}
      <label htmlFor={searchId} className="sr-only">
        Search products by name or description
      </label>
      
      <input
        id={searchId}
        type="search"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        aria-describedby="search-help"
        autoComplete="off"
      />
      
      {/* FIXED: Added search help text */}
      <div id="search-help" className="sr-only">
        Type to search through available products. Results will filter automatically.
      </div>
      
      {/* FIXED: Added clear button with accessibility */}
      {searchTerm && (
        <button
          onClick={() => onSearchChange('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label="Clear search"
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

// =============================================================================
// 2. PERFORMANCE OPTIMIZATIONS
// =============================================================================

/**
 * Enhanced loading skeleton component
 */
const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="bg-gray-300 h-48 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="bg-gray-300 h-4 rounded w-3/4"></div>
          <div className="bg-gray-300 h-4 rounded w-1/2"></div>
          <div className="bg-gray-300 h-6 rounded w-1/4 mt-4"></div>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Enhanced error handling component
 */
const ErrorState = ({ error, onRetry }) => (
  <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
    <div className="mb-4">
      <svg className="w-16 h-16 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-red-800 mb-2">Oops! Something went wrong</h3>
    <p className="text-red-600 mb-6">{error}</p>
    <button 
      onClick={onRetry}
      className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
    >
      Try Again
    </button>
  </div>
);

/**
 * File: src/app/page.tsx
 * Fix: Enhanced loading states and error handling
 */
export const ImprovedHomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Mock products data
  const FEATURED_PRODUCTS = [
    {
      id: 1,
      name: "Wireless Headphones",
      price: 199.99,
      image: "/api/placeholder/300/200",
      description: "High-quality wireless headphones with noise cancellation",
      category: "electronics"
    },
    {
      id: 2,
      name: "Smart Watch",
      price: 299.99,
      image: "/api/placeholder/300/200",
      description: "Feature-rich smartwatch with health monitoring",
      category: "electronics"
    },
    {
      id: 3,
      name: "Coffee Maker",
      price: 89.99,
      image: "/api/placeholder/300/200",
      description: "Automatic coffee maker with programmable settings",
      category: "home"
    },
    {
      id: 4,
      name: "Running Shoes",
      price: 129.99,
      image: "/api/placeholder/300/200",
      description: "Comfortable running shoes with excellent support",
      category: "sports"
    }
  ];

  // FIXED: Enhanced error handling and loading states
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API delay with better error handling
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simulate occasional network errors for testing
            if (Math.random() > 0.95) {
              reject(new Error('Network error - please check your connection'));
            } else {
              resolve();
            }
          }, 1000);
        });
        
        setProducts(FEATURED_PRODUCTS);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setError(error.message || 'Failed to load products. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // FIXED: Optimized search filtering with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredProducts = useMemo(() => {
    if (!debouncedSearchTerm) return products;
    
    return products.filter(product =>
      product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [products, debouncedSearchTerm]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Re-trigger the useEffect
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* FIXED: Enhanced hero section with better accessibility */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 mb-12" role="banner">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to AI Store
          </h1>
          <p className="text-xl mb-6">
            Discover amazing products while our AI testing system learns how to test this application automatically!
          </p>
          <a 
            href="/products" 
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
            aria-describedby="shop-now-description"
          >
            Shop Now
          </a>
          <span id="shop-now-description" className="sr-only">
            Browse our full product catalog
          </span>
        </div>
      </section>

      {/* FIXED: Enhanced search section */}
      <section className="mb-8" role="search" aria-label="Product search">
        <h2 className="text-2xl font-bold mb-4">Search Products</h2>
        <ImprovedSearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search for products..."
        />
        
        {/* FIXED: Search results indicator */}
        {debouncedSearchTerm && (
          <p className="mt-2 text-gray-600" aria-live="polite">
            {filteredProducts.length === 0 
              ? `No products found for "${debouncedSearchTerm}"`
              : `Showing ${filteredProducts.length} product${filteredProducts.length === 1 ? '' : 's'} for "${debouncedSearchTerm}"`
            }
          </p>
        )}
      </section>

      {/* FIXED: Enhanced featured products section */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        
        {error ? (
          <ErrorState error={error} onRetry={handleRetry} />
        ) : loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <ImprovedProductCard key={product.id} product={product} index={index} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="mb-4">
                  <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg mb-4">No products found matching "{debouncedSearchTerm}"</p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                >
                  Clear search to view all products
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* FIXED: Enhanced call to action section */}
      <section className="mt-12 bg-gray-100 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Explore More?</h2>
        <p className="text-gray-600 mb-6">
          Check out our full product catalog, create an account, or contact us for support.
        </p>
        <div className="space-x-4">
          <a 
            href="/products" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            View All Products
          </a>
          <a 
            href="/contact" 
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors inline-block focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
};

// =============================================================================
// 3. SEO AND META IMPROVEMENTS
// =============================================================================

/**
 * File: src/app/layout.tsx
 * Fix: Enhanced SEO and meta tags
 */
export const improvedMetadata = {
  title: 'AI Store - Discover Amazing Products with AI-Powered Shopping',
  description: 'Shop the latest electronics, home goods, sports equipment and more. Experience AI-powered product recommendations and seamless online shopping.',
  keywords: 'ecommerce, online shopping, AI recommendations, electronics, home goods, sports equipment, wireless headphones, smart watch, coffee maker, running shoes',
  authors: [{ name: 'AI Store Team' }],
  creator: 'AI Store',
  publisher: 'AI Store',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'AI Store - Discover Amazing Products',
    description: 'Shop the latest products with AI-powered recommendations and seamless online shopping experience.',
    url: 'https://ai-store.com',
    siteName: 'AI Store',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Store - Your AI-Powered Shopping Destination',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Store - Discover Amazing Products',
    description: 'Shop with AI-powered recommendations',
    creator: '@aistore',
    images: ['/twitter-image.jpg'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

// =============================================================================
// 4. PERFORMANCE OPTIMIZATIONS
// =============================================================================

/**
 * File: next.config.js
 * Fix: Enhanced Next.js configuration for performance
 */
export const improvedNextConfig = {
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  images: {
    domains: ['api.placeholder.com', 'images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
  compress: true,
  swcMinify: true,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

// =============================================================================
// 5. ADDITIONAL TEST UTILITIES
// =============================================================================

/**
 * Enhanced test utilities for the AI testing system
 */
export const testUtils = {
  /**
   * Wait for element with better error handling
   */
  waitForElementWithTimeout: async (page, selector, timeout = 5000) => {
    try {
      return await page.waitForSelector(selector, { timeout });
    } catch (error) {
      throw new Error(`Element '${selector}' not found within ${timeout}ms`);
    }
  },

  /**
   * Take screenshot with metadata
   */
  takeScreenshotWithMetadata: async (page, name, metadata = {}) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `ai-${name}-${timestamp}.png`;
    
    await page.screenshot({
      path: `e2e/screenshots/${filename}`,
      fullPage: true,
    });
    
    // Save metadata
    const metadataFile = `e2e/screenshots/${filename}.json`;
    const fullMetadata = {
      timestamp: new Date().toISOString(),
      url: page.url(),
      viewport: await page.viewport(),
      ...metadata
    };
    
    require('fs').writeFileSync(metadataFile, JSON.stringify(fullMetadata, null, 2));
    
    return filename;
  },

  /**
   * Measure performance metrics
   */
  measurePerformance: async (page) => {
    return await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      return {
        navigation: navigation ? {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          firstByte: navigation.responseStart - navigation.fetchStart,
          dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcpConnect: navigation.connectEnd - navigation.connectStart,
        } : null,
        paint: paint.map(p => ({ name: p.name, time: p.startTime })),
        memory: (performance as any).memory ? {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
          limit: (performance as any).memory.jsHeapSizeLimit,
        } : null,
        timing: performance.now(),
      };
    });
  },

  /**
   * Check accessibility basics
   */
  checkBasicAccessibility: async (page) => {
    return await page.evaluate(() => {
      const results = {
        hasTitle: !!document.title && document.title.length > 0,
        hasLang: !!document.documentElement.lang,
        hasMainLandmark: !!document.querySelector('main, [role="main"]'),
        headingStructure: Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(h => ({
          level: parseInt(h.tagName[1]),
          text: h.textContent?.trim().substring(0, 50)
        })),
        imagesWithoutAlt: Array.from(document.querySelectorAll('img:not([alt])')).length,
        linksWithoutText: Array.from(document.querySelectorAll('a')).filter(a => 
          !a.textContent?.trim() && !a.getAttribute('aria-label') && !a.getAttribute('title')
        ).length,
        formElementsWithoutLabels: Array.from(document.querySelectorAll('input, textarea, select')).filter(el =>
          !el.labels?.length && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')
        ).length,
      };
      
      return results;
    });
  }
};

export default {
  ImprovedProductCard,
  ImprovedSearchBar,
  ImprovedHomePage,
  LoadingSkeleton,
  ErrorState,
  improvedMetadata,
  improvedNextConfig,
  testUtils
};
