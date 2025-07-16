-- Initial schema for AI Store

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role ENUM('user', 'admin') DEFAULT 'user',
  status ENUM('active', 'pending', 'blocked') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP NULL
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  parent_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  cost_price DECIMAL(10, 2),
  sku VARCHAR(100) UNIQUE,
  stock_quantity INT DEFAULT 0,
  category_id INT,
  image_url VARCHAR(500),
  images JSON,
  features JSON,
  specifications JSON,
  status ENUM('active', 'inactive', 'out_of_stock') DEFAULT 'active',
  weight DECIMAL(8, 2),
  dimensions JSON,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_category (category_id),
  INDEX idx_status (status),
  INDEX idx_price (price)
);

-- Shopping cart table
CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  session_id VARCHAR(255),
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_cart_item (user_id, product_id),
  UNIQUE KEY unique_session_item (session_id, product_id),
  INDEX idx_user (user_id),
  INDEX idx_session (session_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  shipping_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_id VARCHAR(255),
  shipping_address JSON,
  billing_address JSON,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_order_number (order_number)
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100),
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  product_snapshot JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_order (order_id),
  INDEX idx_product (product_id)
);

-- Contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  urgency ENUM('low', 'medium', 'high') DEFAULT 'medium',
  status ENUM('new', 'in_progress', 'resolved', 'closed') DEFAULT 'new',
  response TEXT,
  responded_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_urgency (urgency),
  INDEX idx_email (email)
);

-- Search logs table
CREATE TABLE IF NOT EXISTS search_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  session_id VARCHAR(255),
  query_text VARCHAR(500) NOT NULL,
  results_count INT DEFAULT 0,
  clicked_product_id INT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (clicked_product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_query (query_text),
  INDEX idx_user (user_id),
  INDEX idx_session (session_id)
);

-- Sessions table for authentication
CREATE TABLE IF NOT EXISTS user_sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id INT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_expires (expires_at)
);