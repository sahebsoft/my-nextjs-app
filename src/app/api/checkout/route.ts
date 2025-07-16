import { NextRequest, NextResponse } from 'next/server'
import { CartModel, ProductModel } from '@/lib/models'
import { validateData, CheckoutSchema } from '@/lib/validation'
import { runMigrations } from '@/lib/migrate'
import { query } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    await runMigrations()
    
    const body = await request.json()
    console.log('🛒 Processing checkout:', body)

    // Validate input data
    const validation = validateData(CheckoutSchema, body)
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      }, { status: 400 })
    }

    const { sessionId, userId, shippingAddress, billingAddress, paymentMethod } = validation.data

    // Get cart items
    const cartItems = await CartModel.getItems(userId, sessionId)
    if (cartItems.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Cart is empty'
      }, { status: 400 })
    }

    // Calculate order totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const shipping = subtotal > 100 ? 0 : 9.99
    const tax = subtotal * 0.08 // 8% tax
    const total = subtotal + shipping + tax

    // Validate stock availability
    for (const item of cartItems) {
      const product = await ProductModel.findById(item.product_id)
      if (!product || product.stock_quantity < item.quantity) {
        return NextResponse.json({
          success: false,
          error: `Insufficient stock for ${product?.name || 'product'}`,
          productId: item.product_id
        }, { status: 400 })
      }
    }

    // Generate order number
    const orderNumber = `ORDER-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Create order
    const orderResult = await query(
      `INSERT INTO orders (user_id, order_number, subtotal, tax_amount, shipping_amount, total_amount, 
       payment_method, shipping_address, billing_address, status, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')`,
      [
        userId || null,
        orderNumber,
        subtotal,
        tax,
        shipping,
        total,
        paymentMethod,
        JSON.stringify(shippingAddress),
        JSON.stringify(billingAddress)
      ]
    ) as any

    const orderId = orderResult.insertId

    // Create order items and update stock
    for (const item of cartItems) {
      // Add order item
      await query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price, product_snapshot)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          (item as any).product_name,
          item.quantity,
          item.price,
          item.price * item.quantity,
          JSON.stringify({
            name: (item as any).product_name,
            price: item.price,
            image_url: (item as any).image_url
          })
        ]
      )

      // Update product stock
      await ProductModel.updateStock(item.product_id, item.quantity)
    }

    // Clear cart
    await CartModel.clearCart(userId, sessionId)

    console.log(`✅ Order created successfully: ${orderNumber}`)

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: orderId,
        orderNumber,
        total,
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Checkout error:', error)
    return NextResponse.json({
      success: false,
      error: 'Checkout processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}