import { query, queryOne } from './database'

export interface User {
  id: number
  email: string
  first_name?: string
  last_name?: string
  role: 'user' | 'admin'
  status: 'active' | 'pending' | 'blocked'
  created_at: Date
  updated_at: Date
  email_verified: boolean
}

export interface Product {
  id: number
  name: string
  slug: string
  description?: string
  price: number
  cost_price?: number
  sku?: string
  stock_quantity: number
  category_id?: number
  image_url?: string
  images?: string[]
  features?: string[]
  specifications?: Record<string, any>
  status: 'active' | 'inactive' | 'out_of_stock'
  weight?: number
  dimensions?: Record<string, number>
  rating: number
  review_count: number
  created_at: Date
  updated_at: Date
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  image_url?: string
  parent_id?: number
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface CartItem {
  id: number
  user_id?: number
  session_id?: string
  product_id: number
  quantity: number
  price: number
  created_at: Date
  updated_at: Date
}

export interface ContactSubmission {
  id: number
  name: string
  email: string
  subject: string
  message: string
  urgency: 'low' | 'medium' | 'high'
  status: 'new' | 'in_progress' | 'resolved' | 'closed'
  response?: string
  responded_at?: Date
  created_at: Date
  updated_at: Date
}

export interface Order {
  id: number
  user_id?: number
  order_number: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  subtotal: number
  tax_amount: number
  shipping_amount: number
  discount_amount: number
  total_amount: number
  currency: string
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method?: string
  payment_id?: string
  shipping_address: any
  billing_address: any
  notes?: string
  created_at: Date
  updated_at: Date
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  product_name: string
  product_sku?: string
  quantity: number
  unit_price: number
  total_price: number
  product_snapshot: any
  created_at: Date
}

// Product model functions
export class ProductModel {
  static async findAll(filters: {
    category?: string
    search?: string
    minPrice?: number
    maxPrice?: number
    status?: string
  } = {}): Promise<Product[]> {
    let sql = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE 1=1
    `
    const params: any[] = []

    if (filters.category && filters.category !== 'all') {
      sql += ' AND c.slug = ?'
      params.push(filters.category)
    }

    if (filters.search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)'
      const searchTerm = `%${filters.search}%`
      params.push(searchTerm, searchTerm)
    }

    if (filters.minPrice !== undefined) {
      sql += ' AND p.price >= ?'
      params.push(filters.minPrice)
    }

    if (filters.maxPrice !== undefined) {
      sql += ' AND p.price <= ?'
      params.push(filters.maxPrice)
    }

    if (filters.status) {
      sql += ' AND p.status = ?'
      params.push(filters.status)
    } else {
      sql += ' AND p.status = "active"'
    }

    sql += ' ORDER BY p.name ASC'

    return await query<Product>(sql, params)
  }

  static async findById(id: number): Promise<Product | null> {
    return await queryOne<Product>(
      'SELECT * FROM products WHERE id = ? AND status = "active"',
      [id]
    )
  }

  static async findBySlug(slug: string): Promise<Product | null> {
    return await queryOne<Product>(
      'SELECT * FROM products WHERE slug = ? AND status = "active"',
      [slug]
    )
  }

  static async create(data: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const result = await query(
      `INSERT INTO products (name, slug, description, price, cost_price, sku, stock_quantity, 
       category_id, image_url, images, features, specifications, status, weight, dimensions, rating, review_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name, data.slug, data.description, data.price, data.cost_price, data.sku,
        data.stock_quantity, data.category_id, data.image_url, 
        JSON.stringify(data.images), JSON.stringify(data.features), 
        JSON.stringify(data.specifications), data.status, data.weight,
        JSON.stringify(data.dimensions), data.rating, data.review_count
      ]
    ) as any

    return (await this.findById(result.insertId))!
  }

  static async updateStock(id: number, quantity: number): Promise<boolean> {
    const result = await query(
      'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?',
      [quantity, id, quantity]
    ) as any

    return result.affectedRows > 0
  }
}

// Cart model functions
export class CartModel {
  static async findByUser(userId: number): Promise<(CartItem & { product: Product })[]> {
    return await query<CartItem & { product: Product }>(
      `SELECT ci.*, p.name as product_name, p.price as product_price, p.image_url, p.stock_quantity
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`,
      [userId]
    )
  }

  static async findBySession(sessionId: string): Promise<(CartItem & { product: Product })[]> {
    return await query<CartItem & { product: Product }>(
      `SELECT ci.*, p.name as product_name, p.price as product_price, p.image_url, p.stock_quantity
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.session_id = ?`,
      [sessionId]
    )
  }

  static async getItems(userId?: number, sessionId?: string): Promise<(CartItem & { product: Product })[]> {
    if (userId) {
      return await this.findByUser(userId)
    } else if (sessionId) {
      return await this.findBySession(sessionId)
    } else {
      return []
    }
  }

  static async addItem(data: {
    userId?: number
    sessionId?: string
    productId: number
    quantity: number
    price: number
  }): Promise<CartItem> {
    // Check if item already exists
    let existingItem
    if (data.userId) {
      existingItem = await queryOne(
        'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
        [data.userId, data.productId]
      )
    } else {
      existingItem = await queryOne(
        'SELECT * FROM cart_items WHERE session_id = ? AND product_id = ?',
        [data.sessionId, data.productId]
      )
    }

    if (existingItem) {
      // Update quantity
      const result = await query(
        'UPDATE cart_items SET quantity = quantity + ?, updated_at = NOW() WHERE id = ?',
        [data.quantity, (existingItem as any).id]
      )
      return (await queryOne('SELECT * FROM cart_items WHERE id = ?', [(existingItem as any).id]))!
    } else {
      // Insert new item
      const result = await query(
        'INSERT INTO cart_items (user_id, session_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)',
        [data.userId || null, data.sessionId || null, data.productId, data.quantity, data.price]
      ) as any

      return (await queryOne('SELECT * FROM cart_items WHERE id = ?', [result.insertId]))!
    }
  }

  static async removeItem(id: number): Promise<boolean> {
    const result = await query('DELETE FROM cart_items WHERE id = ?', [id]) as any
    return result.affectedRows > 0
  }

  static async updateQuantity(id: number, quantity: number): Promise<boolean> {
    if (quantity <= 0) {
      return await this.removeItem(id)
    }
    
    const result = await query(
      'UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?',
      [quantity, id]
    ) as any
    
    return result.affectedRows > 0
  }

  static async clearCart(userId?: number, sessionId?: string): Promise<boolean> {
    if (userId) {
      const result = await query('DELETE FROM cart_items WHERE user_id = ?', [userId]) as any
      return result.affectedRows >= 0
    } else if (sessionId) {
      const result = await query('DELETE FROM cart_items WHERE session_id = ?', [sessionId]) as any
      return result.affectedRows >= 0
    }
    return false
  }

  static async getItemCount(userId?: number, sessionId?: string): Promise<number> {
    if (userId) {
      const result = await queryOne<{ total: number }>(
        'SELECT COALESCE(SUM(quantity), 0) as total FROM cart_items WHERE user_id = ?',
        [userId]
      )
      return result?.total || 0
    } else if (sessionId) {
      const result = await queryOne<{ total: number }>(
        'SELECT COALESCE(SUM(quantity), 0) as total FROM cart_items WHERE session_id = ?',
        [sessionId]
      )
      return result?.total || 0
    }
    return 0
  }
}

// Contact model functions
export class ContactModel {
  static async create(data: Omit<ContactSubmission, 'id' | 'created_at' | 'updated_at' | 'status' | 'response' | 'responded_at'>): Promise<ContactSubmission> {
    const result = await query(
      'INSERT INTO contact_submissions (name, email, subject, message, urgency) VALUES (?, ?, ?, ?, ?)',
      [data.name, data.email, data.subject, data.message, data.urgency]
    ) as any

    return (await queryOne('SELECT * FROM contact_submissions WHERE id = ?', [result.insertId]))!
  }

  static async findAll(filters: { status?: string; urgency?: string } = {}): Promise<ContactSubmission[]> {
    let sql = 'SELECT * FROM contact_submissions WHERE 1=1'
    const params: any[] = []

    if (filters.status) {
      sql += ' AND status = ?'
      params.push(filters.status)
    }

    if (filters.urgency) {
      sql += ' AND urgency = ?'
      params.push(filters.urgency)
    }

    sql += ' ORDER BY created_at DESC'

    return await query<ContactSubmission>(sql, params)
  }

  static async getAnalytics(): Promise<{
    totalSubmissions: number
    averageResponseTime: string
  }> {
    const total = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM contact_submissions'
    )

    return {
      totalSubmissions: total?.count || 0,
      averageResponseTime: '24 hours' // Simplified for now
    }
  }
}

// Order model functions
export class OrderModel {
  static async findAll(userId?: number): Promise<Order[]> {
    if (userId) {
      return await query<Order>(
        'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      )
    }
    return await query<Order>(
      'SELECT * FROM orders ORDER BY created_at DESC'
    )
  }

  static async findById(id: number): Promise<Order | null> {
    return await queryOne<Order>(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    )
  }

  static async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return await queryOne<Order>(
      'SELECT * FROM orders WHERE order_number = ?',
      [orderNumber]
    )
  }

  static async findWithItems(id: number): Promise<(Order & { items: OrderItem[] }) | null> {
    const order = await this.findById(id)
    if (!order) return null

    const items = await query<OrderItem>(
      'SELECT * FROM order_items WHERE order_id = ?',
      [id]
    )

    return { ...order, items }
  }

  static async updateStatus(id: number, status: Order['status']): Promise<boolean> {
    const result = await query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    ) as any

    return result.affectedRows > 0
  }

  static async updatePaymentStatus(id: number, paymentStatus: Order['payment_status'], paymentId?: string): Promise<boolean> {
    const result = await query(
      'UPDATE orders SET payment_status = ?, payment_id = ?, updated_at = NOW() WHERE id = ?',
      [paymentStatus, paymentId || null, id]
    ) as any

    return result.affectedRows > 0
  }

  static async getOrdersByUser(userId: number): Promise<Order[]> {
    return await query<Order>(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    )
  }

  static async getOrderStats(): Promise<{
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
    pendingOrders: number
  }> {
    const stats = await queryOne<{
      totalOrders: number
      totalRevenue: number
      averageOrderValue: number
      pendingOrders: number
    }>(
      `SELECT 
        COUNT(*) as totalOrders,
        COALESCE(SUM(total_amount), 0) as totalRevenue,
        COALESCE(AVG(total_amount), 0) as averageOrderValue,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingOrders
       FROM orders`
    )

    return stats || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0, pendingOrders: 0 }
  }
}

// Category model functions
export class CategoryModel {
  static async findAll(): Promise<Category[]> {
    return await query<Category>(
      'SELECT * FROM categories WHERE is_active = true ORDER BY name ASC'
    )
  }

  static async findById(id: number): Promise<Category | null> {
    return await queryOne<Category>(
      'SELECT * FROM categories WHERE id = ? AND is_active = true',
      [id]
    )
  }

  static async findBySlug(slug: string): Promise<Category | null> {
    return await queryOne<Category>(
      'SELECT * FROM categories WHERE slug = ? AND is_active = true',
      [slug]
    )
  }
}