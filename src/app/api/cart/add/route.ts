import { NextRequest, NextResponse } from 'next/server'
import { CartModel, ProductModel } from '@/lib/models'
import { validateData, CartItemSchema } from '@/lib/validation'
import { runMigrations } from '@/lib/migrate'

export async function POST(request: NextRequest) {
  try {
    await runMigrations()
    
    const body = await request.json()
    console.log('🛒 Adding item to cart:', body)

    // Validate input data
    const validation = validateData(CartItemSchema, body)
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      }, { status: 400 })
    }

    const { productId, quantity } = validation.data

    // Check if product exists and has sufficient stock
    console.log('🔍 Looking for product with ID:', productId)
    const product = await ProductModel.findById(productId as number)
    console.log('🔍 Product found:', product)
    if (!product) {
      console.log('❌ Product not found in database')
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 })
    }

    if (product.stock_quantity < quantity) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient stock available',
        available: product.stock_quantity
      }, { status: 400 })
    }

    // Get session ID from headers (simplified session management)
    const sessionId = request.headers.get('x-session-id') || `session_${Date.now()}`
    
    // Add item to cart
    const cartItem = await CartModel.addItem({
      sessionId,
      productId: productId as number,
      quantity,
      price: product.price
    })

    // Get updated cart count
    const cartCount = await CartModel.getItemCount(undefined, sessionId)

    console.log(`✅ Product added to cart successfully: ${product.name} (qty: ${quantity})`)

    return NextResponse.json({
      success: true,
      message: 'Product added to cart successfully',
      cartItem: {
        id: cartItem.id,
        productId: cartItem.product_id,
        quantity: cartItem.quantity,
        price: cartItem.price,
        addedAt: cartItem.created_at
      },
      cartCount,
      sessionId
    })

  } catch (error) {
    console.error('❌ Cart API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to add product to cart',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
