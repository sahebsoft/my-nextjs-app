import { NextRequest, NextResponse } from 'next/server'

// Mock products database
const PRODUCTS = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 199.99,
    image: "/api/placeholder/300/200",
    description: "High-quality wireless headphones with noise cancellation",
    category: "electronics",
    stock: 50,
    rating: 4.5,
    reviews: 128
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 299.99,
    image: "/api/placeholder/300/200",
    description: "Feature-rich smartwatch with health monitoring",
    category: "electronics",
    stock: 30,
    rating: 4.7,
    reviews: 89
  },
  {
    id: 3,
    name: "Coffee Maker",
    price: 89.99,
    image: "/api/placeholder/300/200",
    description: "Automatic coffee maker with programmable settings",
    category: "home",
    stock: 25,
    rating: 4.3,
    reviews: 156
  },
  {
    id: 4,
    name: "Running Shoes",
    price: 129.99,
    image: "/api/placeholder/300/200",
    description: "Comfortable running shoes with excellent support",
    category: "sports",
    stock: 75,
    rating: 4.6,
    reviews: 203
  },
  {
    id: 5,
    name: "Laptop Computer",
    price: 1299.99,
    image: "/api/placeholder/300/200",
    description: "High-performance laptop for work and gaming",
    category: "electronics",
    stock: 15,
    rating: 4.8,
    reviews: 67
  },
  {
    id: 6,
    name: "Kitchen Blender",
    price: 79.99,
    image: "/api/placeholder/300/200",
    description: "Powerful blender for smoothies and food preparation",
    category: "home",
    stock: 40,
    rating: 4.2,
    reviews: 94
  },
  {
    id: 7,
    name: "Yoga Mat",
    price: 39.99,
    image: "/api/placeholder/300/200",
    description: "Non-slip yoga mat for comfortable workouts",
    category: "sports",
    stock: 100,
    rating: 4.4,
    reviews: 178
  },
  {
    id: 8,
    name: "Smartphone",
    price: 899.99,
    image: "/api/placeholder/300/200",
    description: "Latest smartphone with advanced camera features",
    category: "electronics",
    stock: 20,
    rating: 4.9,
    reviews: 312
  },
  {
    id: 9,
    name: "Air Fryer",
    price: 149.99,
    image: "/api/placeholder/300/200",
    description: "Healthy cooking with hot air circulation technology",
    category: "home",
    stock: 35,
    rating: 4.5,
    reviews: 145
  },
  {
    id: 10,
    name: "Tennis Racket",
    price: 179.99,
    image: "/api/placeholder/300/200",
    description: "Professional tennis racket for competitive play",
    category: "sports",
    stock: 18,
    rating: 4.7,
    reviews: 76
  }
]

export async function GET(request: NextRequest) {
  console.log('📦 Products API called')
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Get query parameters
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  
  let filteredProducts = [...PRODUCTS]
  
  // Apply filters
  if (category && category !== 'all') {
    filteredProducts = filteredProducts.filter(product => product.category === category)
  }
  
  if (search) {
    filteredProducts = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase())
    )
  }
  
  if (minPrice) {
    filteredProducts = filteredProducts.filter(product => product.price >= parseFloat(minPrice))
  }
  
  if (maxPrice) {
    filteredProducts = filteredProducts.filter(product => product.price <= parseFloat(maxPrice))
  }
  
  // Log the API call for AI testing analysis
  console.log(`📊 Products API: Retrieved ${filteredProducts.length} products`, {
    category,
    search,
    minPrice,
    maxPrice,
    timestamp: new Date().toISOString()
  })
  
  return NextResponse.json({
    success: true,
    products: filteredProducts,
    total: filteredProducts.length,
    timestamp: new Date().toISOString(),
    filters: {
      category,
      search,
      minPrice,
      maxPrice
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📦 Creating new product:', body)
    
    // Simulate creating a new product
    const newProduct = {
      id: PRODUCTS.length + 1,
      ...body,
      stock: body.stock || 0,
      rating: 0,
      reviews: 0,
      createdAt: new Date().toISOString()
    }
    
    // In a real app, you'd save to a database
    console.log(`✅ Product created successfully: ${newProduct.name}`)
    
    return NextResponse.json({
      success: true,
      product: newProduct,
      message: 'Product created successfully'
    }, { status: 201 })
    
  } catch (error) {
    console.error('❌ Error creating product:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create product',
      message: error.message
    }, { status: 500 })
  }
}
