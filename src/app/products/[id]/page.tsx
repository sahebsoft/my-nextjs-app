'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '../../contexts/CartContext'

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  features?: string[];
  stock?: number;
  status?: string;
}

export default function ProductDetailPage() {
  const params = useParams()
  const productId = parseInt(params.id as string)
  const { addToCart } = useCart()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)


  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/products/${productId}`)
        const data = await response.json()
        
        if (data.success) {
          setProduct(data.product)
        } else {
          console.error('Failed to load product:', data.error)
          setProduct(null)
        }
      } catch (error) {
        console.error('Failed to load product:', error)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      loadProduct()
    }
  }, [productId])

  // Add to cart
  const handleAddToCart = async () => {
    if (!product) return

    setAddingToCart(true)
    
    try {
      // Add to cart using context
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      }, quantity)

      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 3000)
    } catch (error) {
      console.error('Add to cart failed:', error)
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-300 rounded-lg animate-pulse h-96"></div>
            <div className="space-y-4">
              <div className="bg-gray-300 h-8 rounded animate-pulse"></div>
              <div className="bg-gray-300 h-6 rounded animate-pulse w-1/2"></div>
              <div className="bg-gray-300 h-4 rounded animate-pulse"></div>
              <div className="bg-gray-300 h-4 rounded animate-pulse w-3/4"></div>
              <div className="bg-gray-300 h-12 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <Link 
            href="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-blue-600">Products</Link>
          <span>/</span>
          <Link href={`/products?category=${product.category}`} className="hover:text-blue-600 capitalize">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-gray-800">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={`${product.image}?variant=${selectedImageIndex}`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail images would go here in a real app */}
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index ? 'border-blue-600' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={`${product.image}?variant=${index}`}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${
                        star <= (product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-gray-600">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.inStock 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Price */}
            <div>
              <span className="text-4xl font-bold text-blue-600 price" data-testid="product-price">
                ${parseFloat(product.price.toString()).toFixed(2)}
              </span>
              <span className="text-gray-500 ml-2">Free shipping on orders over $100</span>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Features */}
            {product.features && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                  Quantity:
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock || addingToCart}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                    addedToCart
                      ? 'bg-green-600 text-white'
                      : product.inStock && !addingToCart
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                >
                  {addingToCart ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding to Cart...
                    </span>
                  ) : addedToCart ? (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Added to Cart!
                    </span>
                  ) : (
                    'Add to Cart'
                  )}
                </button>

                <Link
                  href="/cart"
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  View Cart
                </Link>
              </div>
            </div>

            {/* Additional Info */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h1.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H15a2 2 0 012 2v2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V10a2 2 0 00-2-2H7a2 2 0 00-2 2z" />
                </svg>
                Free shipping on orders over $100
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                30-day money-back guarantee
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure checkout with SSL encryption
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <RelatedProducts currentProduct={product} />
      </div>
    </div>
  )
}

interface RelatedProductsProps {
  currentProduct: Product
}

function RelatedProducts({ currentProduct }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const response = await fetch(`/api/products?category=${currentProduct.category}`)
        const data = await response.json()
        
        if (data.success) {
          // Filter out current product and limit to 3
          const filtered = data.products
            .filter((p: Product) => p.id !== currentProduct.id)
            .slice(0, 3)
          setRelatedProducts(filtered)
        }
      } catch (error) {
        console.error('Failed to load related products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedProducts()
  }, [currentProduct.category, currentProduct.id])

  if (loading) {
    return (
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Related Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-300 rounded-lg animate-pulse h-80"></div>
          ))}
        </div>
      </div>
    )
  }

  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Related Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedProducts.map(relatedProduct => (
          <Link 
            key={relatedProduct.id}
            href={`/products/${relatedProduct.id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <img
              src={relatedProduct.image}
              alt={relatedProduct.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-2">{relatedProduct.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{relatedProduct.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-blue-600">
                  ${parseFloat(relatedProduct.price.toString()).toFixed(2)}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {relatedProduct.category}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}