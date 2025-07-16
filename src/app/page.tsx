'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import ProductCard from './components/ProductCard'
import SearchBar from './components/SearchBar'

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
]

export default function HomePage() {
  const [products, setProducts] = useState<typeof FEATURED_PRODUCTS>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // 🤖 AI FIX: Debounced search for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchTerm])

  // 🤖 AI FIX: Enhanced error handling and loading states
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate API delay with potential errors
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate occasional network errors for testing
          if (Math.random() > 0.95) {
            reject(new Error('Network connection failed'))
          } else {
            resolve(undefined)
          }
        }, 1000)
      })
      
      setProducts(FEATURED_PRODUCTS)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setError(error instanceof Error ? error.message : 'Failed to load products. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // 🤖 AI FIX: Optimized filtering with memoization
  const filteredProducts = useMemo(() => {
    if (!debouncedSearchTerm) return products
    
    return products.filter(product =>
      product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  }, [products, debouncedSearchTerm])

  // 🤖 AI FIX: Enhanced retry functionality
  const handleRetry = useCallback(() => {
    fetchProducts()
  }, [fetchProducts])

  // 🤖 AI FIX: Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" role="status" aria-label="Loading products">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
          <div className="bg-gray-300 h-48 rounded mb-4" aria-hidden="true"></div>
          <div className="space-y-2">
            <div className="bg-gray-300 h-4 rounded w-3/4" aria-hidden="true"></div>
            <div className="bg-gray-300 h-4 rounded w-1/2" aria-hidden="true"></div>
            <div className="bg-gray-300 h-6 rounded w-1/4 mt-4" aria-hidden="true"></div>
          </div>
        </div>
      ))}
      <span className="sr-only">Loading products, please wait...</span>
    </div>
  )

  // 🤖 AI FIX: Enhanced error state component
  const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200" role="alert">
      <div className="mb-4">
        <svg className="w-16 h-16 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-red-800 mb-2">Oops! Something went wrong</h3>
      <p className="text-red-600 mb-6">{error}</p>
      <button 
        onClick={onRetry}
        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        aria-label="Retry loading products"
      >
        Try Again
      </button>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 🤖 AI FIX: Enhanced hero section with accessibility */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 mb-12" role="banner">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to AI Store
          </h1>
          <p className="text-xl mb-6">
            Discover amazing products while our AI testing system learns how to test this application automatically!
          </p>
          <Link 
            href="/products" 
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
            aria-describedby="shop-now-description"
          >
            Shop Now
          </Link>
          <span id="shop-now-description" className="sr-only">
            Browse our complete product catalog
          </span>
        </div>
      </section>

      {/* 🤖 AI FIX: Enhanced search section with accessibility */}
      <section className="mb-8" role="search" aria-labelledby="search-heading">
        <h2 id="search-heading" className="text-2xl font-bold mb-4">Search Products</h2>
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search for products..."
        />
        
        {/* 🤖 AI FIX: Live search results indicator */}
        {debouncedSearchTerm && (
          <div className="mt-2 text-gray-600" aria-live="polite" role="status">
            {filteredProducts.length === 0 
              ? `No products found for "${debouncedSearchTerm}"`
              : `Showing ${filteredProducts.length} product${filteredProducts.length === 1 ? '' : 's'} for "${debouncedSearchTerm}"`
            }
          </div>
        )}
      </section>

      {/* 🤖 AI FIX: Enhanced featured products section */}
      <section role="main" aria-labelledby="products-heading">
        <h2 id="products-heading" className="text-2xl font-bold mb-6">Featured Products</h2>
        
        {error ? (
          <ErrorState error={error} onRetry={handleRetry} />
        ) : loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="mb-4">
                  <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-500 text-lg mb-4">No products found matching "{debouncedSearchTerm}"</p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  aria-label="Clear search to view all products"
                >
                  Clear search to view all products
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 🤖 AI FIX: Enhanced call to action section */}
      <section className="mt-12 bg-gray-100 rounded-lg p-8 text-center" role="complementary" aria-labelledby="cta-heading">
        <h2 id="cta-heading" className="text-2xl font-bold mb-4">Ready to Explore More?</h2>
        <p className="text-gray-600 mb-6">
          Check out our full product catalog, create an account, or contact us for support.
        </p>
        <div className="space-x-4">
          <Link 
            href="/products" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="View complete product catalog"
          >
            View All Products
          </Link>
          <Link 
            href="/contact" 
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors inline-block focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Contact customer support"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  )
}
