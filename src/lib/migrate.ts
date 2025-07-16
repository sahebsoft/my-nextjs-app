import { getPool } from './database'
import fs from 'fs'
import path from 'path'

export async function runMigrations() {
  const pool = getPool()
  
  try {
    // Create migrations table if it doesn't exist
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    const migrationsDir = path.join(process.cwd(), 'src/lib/migrations')
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort()

    for (const file of migrationFiles) {
      // Check if migration already executed
      const [existing] = await pool.execute(
        'SELECT id FROM migrations WHERE filename = ?',
        [file]
      ) as any[]

      if (existing.length === 0) {
        console.log(`Running migration: ${file}`)
        
        // Read and execute migration file
        const migrationPath = path.join(migrationsDir, file)
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
        
        // Split by semicolon and execute each statement
        const statements = migrationSQL
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0)

        for (const statement of statements) {
          await pool.execute(statement)
        }

        // Record migration as executed
        await pool.execute(
          'INSERT INTO migrations (filename) VALUES (?)',
          [file]
        )

        console.log(`Migration completed: ${file}`)
      } else {
        console.log(`Migration already executed: ${file}`)
      }
    }

    console.log('All migrations completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

export async function seedInitialData() {
  const pool = getPool()
  
  try {
    // Check if categories already exist
    const [categories] = await pool.execute('SELECT COUNT(*) as count FROM categories') as any[]
    
    if (categories[0].count === 0) {
      console.log('Seeding initial categories...')
      
      await pool.execute(`
        INSERT INTO categories (name, slug, description) VALUES
        ('Electronics', 'electronics', 'Electronic devices and gadgets'),
        ('Home & Kitchen', 'home', 'Home appliances and kitchen essentials'),
        ('Sports & Fitness', 'sports', 'Sports equipment and fitness gear')
      `)
    }

    // Check if products already exist
    const [products] = await pool.execute('SELECT COUNT(*) as count FROM products') as any[]
    
    if (products[0].count === 0) {
      console.log('Seeding initial products...')
      
      // Get category IDs
      const [electronicsCategory] = await pool.execute(
        'SELECT id FROM categories WHERE slug = ?', 
        ['electronics']
      ) as any[]
      const [homeCategory] = await pool.execute(
        'SELECT id FROM categories WHERE slug = ?', 
        ['home']
      ) as any[]
      const [sportsCategory] = await pool.execute(
        'SELECT id FROM categories WHERE slug = ?', 
        ['sports']
      ) as any[]

      const electronicsId = electronicsCategory[0].id
      const homeId = homeCategory[0].id
      const sportsId = sportsCategory[0].id

      await pool.execute(`
        INSERT INTO products (name, slug, description, price, category_id, stock_quantity, image_url, features, rating, review_count) VALUES
        ('Wireless Headphones', 'wireless-headphones', 'High-quality wireless headphones with noise cancellation', 199.99, ?, 50, '/api/placeholder/300/200', JSON_ARRAY('Active Noise Cancellation', '30-hour battery life', 'Bluetooth 5.0 connectivity', 'Fast charging', 'Premium leather ear cushions'), 4.5, 128),
        ('Smart Watch', 'smart-watch', 'Feature-rich smartwatch with health monitoring', 299.99, ?, 30, '/api/placeholder/300/200', JSON_ARRAY('Health monitoring', 'GPS tracking', 'Water resistant', 'Multiple sports modes'), 4.2, 89),
        ('Coffee Maker', 'coffee-maker', 'Automatic coffee maker with programmable settings', 89.99, ?, 25, '/api/placeholder/300/200', JSON_ARRAY('Programmable brewing', '12-cup capacity', 'Auto shut-off', 'Permanent filter'), 4.0, 156),
        ('Running Shoes', 'running-shoes', 'Comfortable running shoes with excellent support', 129.99, ?, 40, '/api/placeholder/300/200', JSON_ARRAY('Breathable mesh', 'Cushioned sole', 'Lightweight design', 'Durable construction'), 4.3, 203),
        ('Laptop Computer', 'laptop-computer', 'High-performance laptop for work and gaming', 1299.99, ?, 15, '/api/placeholder/300/200', JSON_ARRAY('Intel i7 processor', '16GB RAM', '512GB SSD', 'Dedicated graphics'), 4.6, 67),
        ('Kitchen Blender', 'kitchen-blender', 'Powerful blender for smoothies and food preparation', 79.99, ?, 35, '/api/placeholder/300/200', JSON_ARRAY('1000W motor', 'Multiple speed settings', 'BPA-free pitcher', 'Easy cleanup'), 4.1, 124),
        ('Yoga Mat', 'yoga-mat', 'Non-slip yoga mat for comfortable workouts', 39.99, ?, 60, '/api/placeholder/300/200', JSON_ARRAY('Non-slip surface', 'Eco-friendly material', 'Easy to clean', 'Portable design'), 4.4, 178),
        ('Smartphone', 'smartphone', 'Latest smartphone with advanced camera features', 899.99, ?, 20, '/api/placeholder/300/200', JSON_ARRAY('Advanced camera', '5G connectivity', 'Long battery life', 'Water resistant'), 4.5, 95),
        ('Air Fryer', 'air-fryer', 'Healthy cooking with hot air circulation technology', 149.99, ?, 28, '/api/placeholder/300/200', JSON_ARRAY('Oil-free cooking', 'Digital controls', 'Easy cleanup', 'Multiple presets'), 4.2, 142),
        ('Tennis Racket', 'tennis-racket', 'Professional tennis racket for competitive play', 179.99, ?, 18, '/api/placeholder/300/200', JSON_ARRAY('Carbon fiber frame', 'Perfect balance', 'Comfortable grip', 'Professional grade'), 4.3, 56)
      `, [electronicsId, electronicsId, homeId, sportsId, electronicsId, homeId, sportsId, electronicsId, homeId, sportsId])
    }

    // Insert sample users if none exist
    const [users] = await pool.execute('SELECT COUNT(*) as count FROM users') as any[]
    if (users[0].count === 0) {
      console.log('📝 Seeding users...')
      
      // Hash the demo passwords
      const { hashPassword } = await import('./auth')
      const demoPasswordHash = await hashPassword('password123')
      const adminPasswordHash = await hashPassword('admin123')
      
      await pool.execute(`
        INSERT INTO users (email, password_hash, first_name, last_name, status) VALUES
        (?, ?, 'Demo', 'User', 'active'),
        (?, ?, 'Admin', 'User', 'active')
      `, ['demo@example.com', demoPasswordHash, 'admin@example.com', adminPasswordHash])
      
      console.log('✅ Demo users created: demo@example.com/password123, admin@example.com/admin123')
    }

    console.log('Initial data seeding completed')
  } catch (error) {
    console.error('Seeding failed:', error)
    throw error
  }
}