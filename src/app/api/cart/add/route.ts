import { NextRequest, NextResponse } from 'next/server'

// In-memory cart storage (in real app, use database/session)
let cartItems = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, quantity = 1 } = body
    
    console.log('🛒 Add to cart request:', { productId, quantity })
    
    // Validate required fields
    if (!productId) {
      return NextResponse.json({
        success: false,
        error: 'Product ID is required'
      }, { status: 400 })
    }
    
    if (quantity < 1) {
      return NextResponse.json({
        success: false,
        error: 'Quantity must be at least 1'
      }, { status: 400 })
    }
    
    // Simulate checking product availability
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(item => item.productId === productId)
    
    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cartItems[existingItemIndex].quantity += quantity
      cartItems[existingItemIndex].updatedAt = new Date().toISOString()
      
      console.log(`📦 Updated cart item: Product ${productId}, New quantity: ${cartItems[existingItemIndex].quantity}`)
    } else {
      // Add new item to cart
      const cartItem = {
        id: cartItems.length + 1,
        productId,
        quantity,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
      
      cartItems.push(cartItem)
      console.log(`➕ Added new cart item: Product ${productId}, Quantity: ${quantity}`)
    }
    
    // Calculate cart summary
    const cartSummary = {
      totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      uniqueProducts: cartItems.length,
      lastUpdated: new Date().toISOString()
    }
    
    console.log(`✅ Cart updated successfully: ${cartSummary.totalItems} items, ${cartSummary.uniqueProducts} unique products`)
    
    return NextResponse.json({
      success: true,
      message: 'Product added to cart successfully',
      cartItem: {
        productId,
        quantity: existingItemIndex > -1 ? cartItems[existingItemIndex].quantity : quantity
      },
      cartSummary,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Add to cart error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to add product to cart',
      message: error.message
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  console.log('🛒 Cart contents requested')
  
  // Calculate cart analytics
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const uniqueProducts = cartItems.length
  
  // Group by product ID for analytics
  const productAnalytics = cartItems.reduce((acc, item) => {
    acc[item.productId] = (acc[item.productId] || 0) + item.quantity
    return acc
  }, {})
  
  const cartData = {
    items: cartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      addedAt: item.addedAt,
      updatedAt: item.updatedAt
    })),
    summary: {
      totalItems,
      uniqueProducts,
      lastUpdated: cartItems.length > 0 ? Math.max(...cartItems.map(item => new Date(item.updatedAt).getTime())) : null
    },
    analytics: {
      productDistribution: productAnalytics,
      averageQuantityPerProduct: uniqueProducts > 0 ? totalItems / uniqueProducts : 0
    }
  }
  
  console.log(`📊 Cart analytics: ${totalItems} items, ${uniqueProducts} unique products`)
  
  return NextResponse.json({
    success: true,
    cart: cartData,
    timestamp: new Date().toISOString()
  })
}
