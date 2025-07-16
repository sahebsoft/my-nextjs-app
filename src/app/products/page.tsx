'use client'

import { useState, useEffect } from 'react'
import ProductCard from '../components/ProductCard'
import SearchBar from '../components/SearchBar'

// Extended products database for the products page
const ALL_PRODUCTS = [
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
  },
  {
    id: 5,
    name: "Laptop Computer",
    price: 1299.99,
    image: "/api/placeholder/300/200",
    description: "High-performance laptop for work and gaming",
    category: "electronics"
  },
  {
    id: 6,
    name: "Kitchen Blender",
    price: 79.99,
    image: "/api/placeholder/300/200",
    description: "Powerful blender for smoothies and food preparation",
    category: "home"
  },
  {
    id: 7,
    name: "Yoga Mat",
    price: 39.99,
    image: "/api/placeholder/300/200",
    description: "Non-slip yoga mat for comfortable workouts",
    category: "sports"
  },
  {
    id: 8,
    name: "Smartphone",
    price: 899.99,
    image: "/api/placeholder/300/200",
    description: "Latest smartphone with advanced camera features",
    category: "electronics"
  },
  {
    id: 9,
    name: "Air Fryer",
    price: 149.99,
    image: "/api/placeholder/300/200",
    description: "Healthy cooking with hot air circulation technology",
    category: "home"
  },
  {
    id: 10,
    name: "Tennis Racket",
    price: 179.99,
    image: "/api/placeholder/300/200",
    description: "Professional tennis racket for competitive play",
    category: "sports"
  }
]

const CATEGORIES = [
  { id: 'all', name: 'All Products', count: ALL_PRODUCTS.length },
  { id: 'electronics', name: 'Electronics', count: ALL_PRODUCTS.filter(p => p.category === 'electronics').length },
  { id: 'home', name: 'Home & Kitchen', count: ALL_PRODUCTS.filter(p => p.category === 'home').length },
  { id: 'sports', name: 'Sports & Fitness', count: ALL_PRODUCTS.filter(p => p.category === 'sports').length }
]

export default function ProductsPage() {
  const [products, setProducts] = useState<typeof ALL_PRODUCTS>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [priceRange, setPriceRange] = useState([0, 1500])

  // Simulate API call to fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Call our products API
        const response = await fetch('/api/products')
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || ALL_PRODUCTS)
        } else {
          setProducts(ALL_PRODUCTS)
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
        setProducts(ALL_PRODUCTS)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
      
      return matchesSearch && matchesCategory && matchesPrice
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">All Products</h1>
        <p className="text-gray-600">
          Discover our complete range of products. Use filters to find exactly what you're looking for.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search products by name or description..."
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                {CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className="float-right text-sm opacity-75">
                      ({category.count})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Sort By</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Price Range</h3>
              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="1500"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Filter Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Active Filters:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Category: {CATEGORIES.find(c => c.id === selectedCategory)?.name}</div>
                <div>Price: ${priceRange[0]} - ${priceRange[1]}</div>
                {searchTerm && <div>Search: "{searchTerm}"</div>}
              </div>
              <button
                onClick={() => {
                  setSelectedCategory('all')
                  setSearchTerm('')
                  setPriceRange([0, 1500])
                  setSortBy('name')
                }}
                className="mt-3 text-blue-600 hover:underline text-sm"
              >
                Clear all filters
              </button>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="lg:w-3/4">
          {/* Results Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">
                {loading ? 'Loading...' : `${filteredAndSortedProducts.length} Products`}
              </h2>
              {searchTerm && (
                <p className="text-gray-600 text-sm">
                  Results for "{searchTerm}"
                </p>
              )}
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="bg-gray-300 h-48 rounded mb-4"></div>
                  <div className="bg-gray-300 h-4 rounded mb-2"></div>
                  <div className="bg-gray-300 h-4 rounded w-2/3 mb-4"></div>
                  <div className="bg-gray-300 h-8 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.1-5.5-2.709" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all')
                  setSearchTerm('')
                  setPriceRange([0, 1500])
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
