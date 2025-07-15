import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { productId, quantity } = await request.json()

    // 🤖 AI FIX: Validate input data
    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'Invalid product ID or quantity' },
        { status: 400 }
      )
    }

    // 🤖 AI FIX: Simulate cart functionality with proper response
    const cartItem = {
      id: Date.now().toString(),
      productId,
      quantity,
      addedAt: new Date().toISOString()
    }

    // In a real app, this would save to a database
    console.log('Product added to cart:', cartItem)

    return NextResponse.json({
      success: true,
      message: 'Product added to cart successfully',
      cartItem
    })

  } catch (error) {
    console.error('Cart API error:', error)
    return NextResponse.json(
      { error: 'Failed to add product to cart' },
      { status: 500 }
    )
  }
}
