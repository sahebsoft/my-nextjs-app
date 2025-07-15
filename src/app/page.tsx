'use client'

import { useState, useEffect } from 'react'
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
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Simulate API call
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        setProducts(FEATURED_PRODUCTS)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 mb-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to AI Store
          </h1>
          <p className="text-xl mb-6">
            Discover amazing products while our AI testing system learns how to test this application automatically!
          </p>
          <Link 
            href="/products" 
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Search Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Search Products</h2>
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search for products..."
        />
      </section>

      {/* Featured Products */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="bg-gray-300 h-48 rounded mb-4"></div>
                <div className="bg-gray-300 h-4 rounded mb-2"></div>
                <div className="bg-gray-300 h-4 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No products found matching "{searchTerm}"</p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-blue-600 hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Call to Action */}
      <section className="mt-12 bg-gray-100 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Explore More?</h2>
        <p className="text-gray-600 mb-6">
          Check out our full product catalog, create an account, or contact us for support.
        </p>
        <div className="space-x-4">
          <Link 
            href="/products" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            View All Products
          </Link>
          <Link 
            href="/contact" 
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors inline-block"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  )
}
