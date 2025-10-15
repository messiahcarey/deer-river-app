'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Breadcrumbs from './Breadcrumbs'
import GlobalSearch from './GlobalSearch'

interface NavigationProps {
  className?: string
}

export default function Navigation({ className = '' }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const pathname = usePathname()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const navigationItems = [
    { name: 'People', href: '/people', icon: '👥', color: 'primary' },
    { name: 'Factions', href: '/factions', icon: '🏛️', color: 'danger' },
    { name: 'Map', href: '/map', icon: '🗺️', color: 'success' },
    { name: 'Resources', href: '/resources', icon: '💰', color: 'warning' },
    { name: 'Demographics', href: '/demographics', icon: '📊', color: 'accent' },
    { name: 'Relationships', href: '/relationships', icon: '🕸️', color: 'secondary' },
    { name: 'Involvement', href: '/involvement', icon: '⚡', color: 'primary' },
    { name: 'Loyalty', href: '/loyalty', icon: '❤️', color: 'danger' },
    { name: 'Events', href: '/events', icon: '📝', color: 'success' },
    { name: 'Analytics', href: '/analytics', icon: '🔍', color: 'secondary' },
    { name: 'Import', href: '/import', icon: '📥', color: 'warning' },
    { name: 'Admin', href: '/admin', icon: '🔧', color: 'accent' },
  ]

  const getColorClasses = (color: string, isActive: boolean) => {
    const baseClasses = 'flex items-center px-4 py-2 rounded-xl transition-all duration-200'
    const activeClasses = isActive ? 'bg-opacity-20 shadow-soft' : 'hover:bg-opacity-10'
    
    switch (color) {
      case 'primary':
        return `${baseClasses} ${activeClasses} ${isActive ? 'bg-primary-500 text-primary-700' : 'text-primary-600 hover:bg-primary-100'}`
      case 'danger':
        return `${baseClasses} ${activeClasses} ${isActive ? 'bg-danger-500 text-danger-700' : 'text-danger-600 hover:bg-danger-100'}`
      case 'success':
        return `${baseClasses} ${activeClasses} ${isActive ? 'bg-success-500 text-success-700' : 'text-success-600 hover:bg-success-100'}`
      case 'warning':
        return `${baseClasses} ${activeClasses} ${isActive ? 'bg-warning-500 text-warning-700' : 'text-warning-600 hover:bg-warning-100'}`
      case 'accent':
        return `${baseClasses} ${activeClasses} ${isActive ? 'bg-accent-500 text-accent-700' : 'text-accent-600 hover:bg-accent-100'}`
      case 'secondary':
        return `${baseClasses} ${activeClasses} ${isActive ? 'bg-secondary-500 text-secondary-700' : 'text-secondary-600 hover:bg-secondary-100'}`
      default:
        return `${baseClasses} ${activeClasses} ${isActive ? 'bg-secondary-500 text-secondary-700' : 'text-secondary-600 hover:bg-secondary-100'}`
    }
  }

  return (
    <>
      {/* Navigation Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-medium border-b border-primary-100' 
          : 'bg-transparent'
      } ${className}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-medium group-hover:scale-105 transition-transform duration-200">
                <span className="text-xl">🏰</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-700 to-accent-700 bg-clip-text text-transparent">
                  Deer River
                </h1>
                <p className="text-xs text-secondary-500">Fantasy Town Manager</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={getColorClasses(item.color, isActive)}
                  >
                    <span className="text-lg mr-2">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Search and Actions */}
            <div className="flex items-center space-x-4">
              {/* Search Button */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Help Link */}
              <a
                href="/help.html"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-secondary-600 hover:text-accent-600 hover:bg-accent-50 rounded-xl transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </a>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-primary-100 shadow-large">
            <div className="container mx-auto px-4 py-4">
              <nav className="grid grid-cols-2 gap-2">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center p-3 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-primary-100 text-primary-700' 
                          : 'text-secondary-600 hover:bg-primary-50 hover:text-primary-600'
                      }`}
                    >
                      <span className="text-xl mr-3">{item.icon}</span>
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Breadcrumbs */}
      <div className="pt-16">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs />
        </div>
      </div>

      {/* Global Search */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
