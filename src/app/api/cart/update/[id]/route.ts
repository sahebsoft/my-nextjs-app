import { NextRequest, NextResponse } from 'next/server'
import { CartModel } from '@/lib/models'
import { runMigrations } from '@/lib/migrate'
import { z } from 'zod'

const updateCartSchema = z.object({
  quantity: z.number().min(0).max(100)
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await runMigrations()
    
    const itemId = parseInt(params.id)
    
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateCartSchema.parse(body)
    
    const success = await CartModel.updateQuantity(itemId, validatedData.quantity)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Item not found or could not be updated' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error updating cart item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}