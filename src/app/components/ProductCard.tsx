'use client'

import Link from 'next/link'
import { useState } from 'react'

interface Product {
  id: number
  name: string
  price: number
  image: string
  description: string
  category: string
}

interface ProductCardProps {
  product: Product
  index?: number
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [addedToCart, setAddedToCart] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageRetryCount, setImageRetryCount] = useState(0)
  const [imageSrc, setImageSrc] = useState(product.image)

  const handleAddToCart = async () => {
    try {
      setError(null)
      setAddedToCart(true)
      
      // Get or create session ID
      let sessionId = localStorage.getItem('sessionId')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('sessionId', sessionId)
      }
      
      // 🤖 AI FIX: Enhanced error handling for API calls
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        console.log('Product added to cart successfully')
        
        // Trigger a custom event to update cart count in navigation
        window.dispatchEvent(new CustomEvent('cart-updated', {
          detail: { count: result.cartCount }
        }))
        
        // Reset the button after 2 seconds
        setTimeout(() => {
          setAddedToCart(false)
        }, 2000)
      } else {
        throw new Error(result.error || 'Failed to add product to cart')
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
      setError('Unable to add to cart. Please try again.')
      setAddedToCart(false)
      
      // 🤖 AI FIX: Auto-clear error after 3 seconds
      setTimeout(() => {
        setError(null)
      }, 3000)
    }
  }

  // 🤖 AI FIX: Enhanced image error handling with retry logic
  const handleImageError = () => {
    console.log(`Image failed to load for product ${product.id}, attempt ${imageRetryCount + 1}`)
    
    if (imageRetryCount < 3) {
      // Retry loading the image with a slight delay
      setTimeout(() => {
        setImageRetryCount(prev => prev + 1)
        setImageSrc(`${product.image}?retry=${imageRetryCount + 1}&t=${Date.now()}`)
        setIsImageLoading(true)
        setError(null)
      }, 1000 * (imageRetryCount + 1)) // Exponential backoff
    } else {
      setIsImageLoading(false)
      setError('Image temporarily unavailable')
      
      // Fall back to a basic placeholder
      setImageSrc(`data:image/svg+xml,${encodeURIComponent(`
        <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f3f4f6"/>
          <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6b7280" font-family="Arial" font-size="14">
            ${product.name}
          </text>
        </svg>
      `)}`)
    }
  }

  return (
    <article 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 w-full max-w-sm mx-auto"
      role="article"
      aria-labelledby={`product-${product.id}-name`}
      aria-describedby={`product-${product.id}-description`}
      data-testid="product-card"
    >
      {/* Product Image */}
      <div className="relative h-48 bg-gray-200">
        {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" aria-label="Loading product image"></div>
          </div>
        )}
        
        {/* 🤖 AI FIX: Enhanced accessibility with proper alt text and retry logic */}
        <img
          src={imageSrc}
          alt={`${product.name} - ${product.description}. Price: $${Number(product.price).toFixed(2)}`}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isImageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          loading={index < 2 ? "eager" : "lazy"}
          onLoad={() => {
            setIsImageLoading(false)
            setError(null)
            console.log(`✅ Image loaded successfully for product ${product.id}`)
          }}
          onError={handleImageError}
        />
        
        {/* Category Badge */}
        <div className="absolute top-2 left-2">
          <span 
            className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full"
            aria-label={`Product category: ${product.category}`}
          >
            {product.category}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* 🤖 AI FIX: Proper heading hierarchy and accessibility */}
        <h3 
          id={`product-${product.id}-name`}
          className="text-lg font-semibold text-gray-800 mb-2 overflow-hidden break-words"
        >
          {product.name}
        </h3>
        
        <p 
          id={`product-${product.id}-description`}
          className="text-gray-600 text-sm mb-3 line-clamp-2 overflow-hidden break-words"
        >
          {product.description}
        </p>
        
        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <span 
            className="text-2xl font-bold text-blue-600"
            aria-label={`Price: ${Number(product.price)} dollars`}
          >
            ${Number(product.price).toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">
            Free shipping
          </span>
        </div>

        {/* 🤖 AI FIX: Enhanced error display */}
        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm" role="alert">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleAddToCart}
            disabled={addedToCart}
            className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              addedToCart
                ? 'bg-green-600 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            aria-label={`Add ${product.name} to shopping cart`}
            aria-describedby={addedToCart ? `product-${product.id}-cart-success` : undefined}
          >
            {addedToCart ? (
              <span className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span id={`product-${product.id}-cart-success`}>Added to Cart</span>
              </span>
            ) : (
              'Add to Cart'
            )}
          </button>
          
          <Link
            href={`/products/${product.id}`}
            className="block w-full py-2 px-4 text-center border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label={`View detailed information about ${product.name}`}
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  )
}
