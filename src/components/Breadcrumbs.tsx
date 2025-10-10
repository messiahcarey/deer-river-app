'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const pathname = usePathname()
  
  // Auto-generate breadcrumbs from pathname if not provided
  const autoItems: BreadcrumbItem[] = items || (() => {
    const segments = (pathname || '').split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ]
    
    let currentPath = ''
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === segments.length - 1
      
      // Convert segment to readable label
      let label = segment
      if (segment === 'people') label = 'People'
      else if (segment === 'factions') label = 'Factions'
      else if (segment === 'map') label = 'Map'
      else if (segment === 'import') label = 'Import'
      else if (segment === 'admin') label = 'Admin'
      else if (segment === 'analytics') label = 'Analytics'
      else if (segment === 'events') label = 'Events'
      else if (segment === 'resources') label = 'Resources'
      else {
        // Capitalize first letter
        label = segment.charAt(0).toUpperCase() + segment.slice(1)
      }
      
      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
        current: isLast
      })
    })
    
    return breadcrumbs
  })()

  if (autoItems.length <= 1) return null

  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-2 md:space-x-4">
        {autoItems.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 text-secondary-400 mx-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="inline-flex items-center px-3 py-1 text-sm font-medium text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg ${
                  item.current 
                    ? 'text-primary-700 bg-primary-100' 
                    : 'text-secondary-500'
                }`}
                aria-current={item.current ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
