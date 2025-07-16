import { NextRequest, NextResponse } from 'next/server'
import { CartModel } from '@/lib/models'
import { runMigrations } from '@/lib/migrate'

export async function DELETE(
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

    const success = await CartModel.removeItem(itemId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Item not found or could not be removed' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing cart item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}