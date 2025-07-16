import { NextRequest, NextResponse } from 'next/server'
import { ProductModel } from '@/lib/models'
import { runMigrations, seedInitialData } from '@/lib/migrate'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await runMigrations()
    await seedInitialData()
    
    const productId = parseInt(params.id)
    
    if (isNaN(productId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid product ID'
      }, { status: 400 })
    }
    
    const product = await ProductModel.findById(productId)
    
    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 })
    }
    
    // Format product for response
    const formattedProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      description: product.description,
      category: product.category_id === 1 ? 'electronics' : 
                product.category_id === 2 ? 'home' : 
                product.category_id === 3 ? 'sports' : 'other',
      stock: product.stock_quantity,
      rating: product.rating,
      reviews: product.review_count,
      inStock: product.stock_quantity > 0,
      features: product.features || [],
      status: product.status
    }
    
    return NextResponse.json({
      success: true,
      product: formattedProduct
    })
    
  } catch (error) {
    console.error('❌ Product detail API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch product',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}