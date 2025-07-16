import { NextRequest, NextResponse } from 'next/server'
import { ProductModel } from '@/lib/models'
import { validateData, ProductSchema } from '@/lib/validation'
import { runMigrations, seedInitialData } from '@/lib/migrate'

export async function GET(request: NextRequest) {
  console.log('📦 Products API called')
  
  try {
    // Ensure database is initialized
    await runMigrations()
    await seedInitialData()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    
    // Build filters object
    const filters = {
      category: category || undefined,
      search: search || undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined
    }
    
    // Get products from database
    const products = await ProductModel.findAll(filters)
    
    // Format products for response
    const formattedProducts = products.map(product => ({
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
      reviews: product.review_count
    }))
    
    // Log the API call for AI testing analysis
    console.log(`📊 Products API: Retrieved ${formattedProducts.length} products`, {
      category,
      search,
      minPrice,
      maxPrice,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json({
      success: true,
      products: formattedProducts,
      total: formattedProducts.length,
      timestamp: new Date().toISOString(),
      filters: {
        category,
        search,
        minPrice,
        maxPrice
      }
    })
  } catch (error) {
    console.error('❌ Products API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch products',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await runMigrations()
    
    const body = await request.json()
    console.log('📦 Creating new product:', body)
    
    // Validate input data
    const validation = validateData(ProductSchema, body)
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      }, { status: 400 })
    }
    
    const { name, description, price, category, stock, image } = validation.data
    
    // Create slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    
    // Map category to category_id (simplified)
    const categoryMap = { electronics: 1, home: 2, sports: 3 }
    const categoryId = categoryMap[category as keyof typeof categoryMap] || 1
    
    // Create product in database
    const newProduct = await ProductModel.create({
      name,
      slug,
      description,
      price,
      category_id: categoryId,
      stock_quantity: stock || 0,
      image_url: image || '/api/placeholder/300/200',
      features: [],
      rating: 0,
      review_count: 0,
      status: 'active'
    } as any)
    
    console.log(`✅ Product created successfully: ${newProduct.name}`)
    
    return NextResponse.json({
      success: true,
      product: {
        id: newProduct.id,
        name: newProduct.name,
        price: newProduct.price,
        description: newProduct.description,
        category,
        stock: newProduct.stock_quantity,
        image: newProduct.image_url,
        rating: newProduct.rating,
        reviews: newProduct.review_count
      },
      message: 'Product created successfully'
    }, { status: 201 })
    
  } catch (error) {
    console.error('❌ Error creating product:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create product',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
