'use client'

import { useState, useId } from 'react'

interface SearchBarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  placeholder?: string
}

export default function SearchBar({ searchTerm, onSearchChange, placeholder = "Search..." }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 🤖 AI FIX: Generate unique IDs for accessibility
  const searchId = useId()
  const helpTextId = useId()
  const suggestionsId = useId()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (searchTerm.trim()) {
      try {
        setIsLoading(true)
        setError(null)
        
        // 🤖 AI FIX: Enhanced error handling for API calls
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: searchTerm,
            timestamp: new Date().toISOString()
          })
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Search logged:', data)
        } else {
          throw new Error('Search service unavailable')
        }
      } catch (error) {
        console.error('Search API call failed:', error)
        setError('Search temporarily unavailable')
        
        // 🤖 AI FIX: Auto-clear error after 3 seconds
        setTimeout(() => {
          setError(null)
        }, 3000)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleClear = () => {
    onSearchChange('')
    setError(null)
  }

  // 🤖 AI FIX: Enhanced search suggestions with better filtering
  const searchSuggestions = ['Wireless headphones', 'Smart watch', 'Coffee maker', 'Running shoes']
    .filter(suggestion => 
      suggestion.toLowerCase().includes(searchTerm.toLowerCase()) && 
      suggestion.toLowerCase() !== searchTerm.toLowerCase()
    )

  return (
    <div className="relative max-w-md mx-auto" role="search" aria-label="Product search">
      {/* 🤖 AI FIX: Proper form with accessibility labels */}
      <form onSubmit={handleSubmit}>
        <div className={`relative flex items-center transition-all duration-200 ${
          isFocused ? 'scale-105' : 'scale-100'
        }`}>
          {/* 🤖 AI FIX: Hidden label for screen readers */}
          <label htmlFor={searchId} className="sr-only">
            Search products by name, description, or category
          </label>

          {/* Search Icon */}
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" aria-hidden="true"></div>
            ) : (
              <svg 
                className="w-5 h-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            )}
          </div>

          {/* Input Field */}
          <input
            id={searchId}
            type="search"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            autoComplete="off"
            aria-describedby={`${helpTextId} ${error ? `${searchId}-error` : ''}`}
            aria-expanded={isFocused && searchSuggestions.length > 0}
            aria-haspopup="listbox"
            aria-owns={searchSuggestions.length > 0 ? suggestionsId : undefined}
            className={`w-full pl-10 pr-10 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
              error 
                ? 'border-red-500 focus:border-red-500' 
                : isFocused 
                  ? 'border-blue-500 shadow-lg' 
                  : 'border-gray-300 hover:border-gray-400'
            }`}
          />

          {/* Clear Button */}
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label="Clear search input"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* 🤖 AI FIX: Hidden submit button for form accessibility */}
        <button type="submit" className="sr-only">
          Search products
        </button>
      </form>

      {/* 🤖 AI FIX: Help text for screen readers */}
      <div id={helpTextId} className="sr-only">
        Search through our product catalog. Use the arrow keys to navigate suggestions when available.
      </div>

      {/* 🤖 AI FIX: Error message with proper accessibility */}
      {error && (
        <div 
          id={`${searchId}-error`}
          className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      {/* 🤖 AI FIX: Enhanced search suggestions with proper accessibility */}
      {searchTerm && isFocused && searchSuggestions.length > 0 && (
        <div 
          id={suggestionsId}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
          role="listbox"
          aria-label="Search suggestions"
        >
          <div className="p-2">
            <div className="text-sm text-gray-500 mb-2" aria-hidden="true">
              Search suggestions:
            </div>
            {searchSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSearchChange(suggestion)}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded focus:outline-none focus:bg-gray-100"
                role="option"
                aria-selected={false}
                tabIndex={0}
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {suggestion}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
