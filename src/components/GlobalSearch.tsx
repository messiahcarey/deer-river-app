'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  type: 'person' | 'faction' | 'location' | 'page'
  title: string
  description: string
  href: string
  icon: string
  color: string
}

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Handle search
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    
    // Simulate search delay
    const timeoutId = setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'person' as const,
          title: 'Alara Veylinor',
          description: 'Human, Aspiring archer',
          href: '/people/alara-veylinor',
          icon: '👤',
          color: 'primary'
        },
        {
          id: '2',
          type: 'faction' as const,
          title: 'Original Residents',
          description: 'The founding families of Deer River',
          href: '/factions/original-residents',
          icon: '🏛️',
          color: 'danger'
        },
        {
          id: '3',
          type: 'location' as const,
          title: 'Tobren Veylinor\'s Manor',
          description: 'Noble residence in Deer River',
          href: '/map',
          icon: '🏠',
          color: 'success'
        },
        {
          id: '4',
          type: 'page' as const,
          title: 'People Management',
          description: 'Manage citizens and their relationships',
          href: '/people',
          icon: '👥',
          color: 'primary'
        }
      ].filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description.toLowerCase().includes(query.toLowerCase())
      )
      
      setResults(mockResults)
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      router.push(results[selectedIndex].href)
      onClose()
    }
  }

  // Handle result click
  const handleResultClick = (href: string) => {
    router.push(href)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="flex items-start justify-center pt-20 px-4">
        <div 
          className="w-full max-w-2xl bg-white rounded-2xl shadow-large border border-primary-100 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="p-6 border-b border-secondary-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search people, factions, locations..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-12 pr-4 py-3 text-lg border-0 focus:ring-0 focus:outline-none placeholder-secondary-400"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-secondary-400 hover:text-secondary-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center text-secondary-500">
                <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Searching...
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result.href)}
                    className={`w-full px-6 py-4 text-left hover:bg-primary-50 transition-colors duration-200 flex items-center space-x-4 ${
                      index === selectedIndex ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                      result.color === 'primary' ? 'bg-primary-100 text-primary-600' :
                      result.color === 'danger' ? 'bg-danger-100 text-danger-600' :
                      result.color === 'success' ? 'bg-success-100 text-success-600' :
                      result.color === 'warning' ? 'bg-warning-100 text-warning-600' :
                      result.color === 'accent' ? 'bg-accent-100 text-accent-600' :
                      'bg-secondary-100 text-secondary-600'
                    }`}>
                      {result.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-secondary-800 truncate">
                        {result.title}
                      </div>
                      <div className="text-sm text-secondary-500 truncate">
                        {result.description}
                      </div>
                    </div>
                    <div className="text-xs text-secondary-400 uppercase font-medium">
                      {result.type}
                    </div>
                  </button>
                ))}
              </div>
            ) : query ? (
              <div className="p-6 text-center text-secondary-500">
                <div className="text-4xl mb-2">🔍</div>
                <div className="font-medium">No results found</div>
                <div className="text-sm">Try searching for people, factions, or locations</div>
              </div>
            ) : (
              <div className="p-6 text-center text-secondary-500">
                <div className="text-4xl mb-2">⚡</div>
                <div className="font-medium">Quick Search</div>
                <div className="text-sm">Search across all data in Deer River</div>
              </div>
            )}
          </div>

          {/* Keyboard Shortcuts */}
          <div className="px-6 py-3 bg-secondary-50 border-t border-secondary-100">
            <div className="flex items-center justify-center space-x-6 text-xs text-secondary-500">
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 bg-white rounded border border-secondary-200">↑↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 bg-white rounded border border-secondary-200">Enter</kbd>
                <span>Select</span>
              </div>
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 bg-white rounded border border-secondary-200">Esc</kbd>
                <span>Close</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
