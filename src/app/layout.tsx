import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from './components/Navigation'
import { CartProvider } from './contexts/CartContext'
import { AuthProvider } from './contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Store - Test Application',
  description: 'E-commerce app for AI-driven testing demonstrations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body className={`${inter.className} overflow-x-hidden`}>
        <AuthProvider>
          <CartProvider>
            <Navigation />
            <main className="min-h-screen bg-gray-50 overflow-x-hidden">
              {children}
            </main>
            <footer className="bg-gray-800 text-white p-6 mt-12">
              <div className="container mx-auto text-center px-4">
                <p className="text-sm sm:text-base">&copy; 2024 AI Store. Built for AI testing demonstrations.</p>
              </div>
            </footer>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
