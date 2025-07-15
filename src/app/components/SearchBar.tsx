'use client'

import { useState } from 'react'

interface SearchBarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  placeholder?: string
}

export default function SearchBar({ searchTerm, onSearchChange, placeholder = "Search..." }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (searchTerm.trim()) {
      try {
        // Call our search API
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
        }
      } catch (error) {
        console.error('Search API call failed:', error)
      }
    }
  }

  const handleClear = () => {
    onSearchChange('')
  }

  return (
    <form onSubmit={handleSubmit} className="relative max-w-md mx-auto">
      <div className={`relative flex items-center transition-all duration-200 ${
        isFocused ? 'scale-105' : 'scale-100'
      }`}>
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <svg 
            className="w-5 h-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
            isFocused 
              ? 'border-blue-500 shadow-lg' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        />

        {/* Clear Button */}
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Suggestions */}
      {searchTerm && isFocused && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-2">
            <div className="text-sm text-gray-500 mb-2">Search suggestions:</div>
            {['Wireless headphones', 'Smart watch', 'Coffee maker', 'Running shoes'].
              filter(suggestion => suggestion.toLowerCase().includes(searchTerm.toLowerCase())).
              map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSearchChange(suggestion)}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                >
                  {suggestion}
                </button>
              ))
            }
          </div>
        </div>
      )}
    </form>
  )
}
