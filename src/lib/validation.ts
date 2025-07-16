import { z } from 'zod'

// Authentication schemas
export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
})

export const RegisterSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name is too long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
})

// Contact form schema
export const ContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(1, 'Subject is required').max(255, 'Subject is too long'),
  message: z.string().min(10, 'Message must be at least 10 characters long').max(1000, 'Message is too long'),
  urgency: z.enum(['low', 'medium', 'high']).default('medium')
})

// Product schema
export const ProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255, 'Product name is too long'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  stock: z.number().int().min(0, 'Stock must be a positive integer').optional().default(0),
  image: z.string().url('Invalid image URL').optional()
})

// Cart item schema
export const CartItemSchema = z.object({
  productId: z.union([z.string(), z.number()]).transform(val => Number(val)),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity cannot exceed 100')
})

// Search schema
export const SearchSchema = z.object({
  query: z.string().min(1, 'Search query cannot be empty').max(500, 'Search query is too long'),
  timestamp: z.string().datetime().optional()
})

// Address schema
export const AddressSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name is too long'),
  address1: z.string().min(1, 'Address line 1 is required').max(255, 'Address is too long'),
  address2: z.string().max(255, 'Address is too long').optional(),
  city: z.string().min(1, 'City is required').max(100, 'City name is too long'),
  state: z.string().min(1, 'State is required').max(100, 'State name is too long'),
  zipCode: z.string().min(1, 'ZIP code is required').max(20, 'ZIP code is too long'),
  country: z.string().min(1, 'Country is required').max(100, 'Country name is too long').default('United States'),
  phone: z.string().min(1, 'Phone number is required').max(20, 'Phone number is too long').optional()
})

// Checkout schema
export const CheckoutSchema = z.object({
  sessionId: z.string().optional(),
  userId: z.number().optional(),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema,
  paymentMethod: z.enum(['stripe', 'paypal', 'demo']).default('demo'),
  promoCode: z.string().max(50, 'Promo code is too long').optional(),
  notes: z.string().max(500, 'Notes are too long').optional()
})

// Order update schema
export const OrderUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  trackingNumber: z.string().max(100, 'Tracking number is too long').optional(),
  notes: z.string().max(500, 'Notes are too long').optional()
})

// Generic ID validation
export const IdSchema = z.union([z.string(), z.number()]).transform(val => {
  const num = Number(val)
  if (isNaN(num) || num <= 0) {
    throw new Error('Invalid ID')
  }
  return num
})

// Validation helper function
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
    return {
      success: false,
      errors: ['Validation failed']
    }
  }
}

// Sanitization helpers
export function sanitizeString(str: string): string {
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000) // Limit length
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export function sanitizeNumber(num: unknown): number | null {
  const parsed = Number(num)
  return isNaN(parsed) ? null : parsed
}