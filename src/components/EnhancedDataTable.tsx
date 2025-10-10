'use client'

import { useState, useMemo, useCallback } from 'react'
import { ChevronUpIcon, ChevronDownIcon, FunnelIcon, XMarkIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline'

interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
  filterable?: boolean
  filterType?: 'text' | 'select' | 'multiselect' | 'date' | 'number'
  filterOptions?: Array<{ value: string; label: string }>
  render?: (value: any, row: T) => React.ReactNode
  width?: string
  hidden?: boolean
}

interface EnhancedDataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (row: T) => void
  onRowSelect?: (row: T, selected: boolean) => void
  onBulkAction?: (selectedRows: T[], action: string) => void
  selectedRows?: T[]
  selectable?: boolean
  searchable?: boolean
  pagination?: boolean
  pageSize?: number
  sortable?: boolean
  filterable?: boolean
  exportable?: boolean
  className?: string
}

export default function EnhancedDataTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  onRowSelect,
  onBulkAction,
  selectedRows = [],
  selectable = false,
  searchable = true,
  pagination = true,
  pageSize = 25,
  sortable = true,
  filterable = true,
  exportable = true,
  className = ''
}: EnhancedDataTableProps<T>) {
  // State management
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof T | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [showFilters, setShowFilters] = useState(false)
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({})
  const [pageSizeState, setPageSizeState] = useState(pageSize)

  // Initialize column visibility
  useState(() => {
    const initialVisibility: Record<string, boolean> = {}
    columns.forEach(col => {
      initialVisibility[String(col.key)] = !col.hidden
    })
    setColumnVisibility(initialVisibility)
  })

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = data

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(row =>
        columns.some(col => {
          const value = row[col.key]
          return value && String(value).toLowerCase().includes(searchTerm.toLowerCase())
        })
      )
    }

    // Apply filters
    Object.entries(filters).forEach(([key, filterValue]) => {
      if (filterValue && filterValue.length > 0) {
        filtered = filtered.filter(row => {
          const value = row[key as keyof T]
          if (Array.isArray(filterValue)) {
            return filterValue.includes(String(value))
          }
          return String(value).toLowerCase().includes(String(filterValue).toLowerCase())
        })
      }
    })

    return filtered
  }, [data, searchTerm, filters, columns])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      const comparison = String(aValue).localeCompare(String(bValue))
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredData, sortField, sortDirection])

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData

    const startIndex = (currentPage - 1) * pageSizeState
    const endIndex = startIndex + pageSizeState
    return sortedData.slice(startIndex, endIndex)
  }, [sortedData, currentPage, pageSizeState, pagination])

  // Handle sorting
  const handleSort = useCallback((field: keyof T) => {
    if (!sortable) return

    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }, [sortField, sortable])

  // Handle filter change
  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setCurrentPage(1) // Reset to first page when filtering
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({})
    setSearchTerm('')
    setCurrentPage(1)
  }, [])

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  // Handle page size change
  const handlePageSizeChange = useCallback((size: number) => {
    setPageSizeState(size)
    setCurrentPage(1)
  }, [])

  // Handle select all
  const handleSelectAll = useCallback((checked: boolean) => {
    if (onRowSelect) {
      paginatedData.forEach(row => onRowSelect(row, checked))
    }
  }, [paginatedData, onRowSelect])

  // Handle export
  const handleExport = useCallback(() => {
    const csvContent = [
      columns.map(col => col.label).join(','),
      ...paginatedData.map(row =>
        columns.map(col => {
          const value = row[col.key]
          return value ? String(value).replace(/,/g, ';') : ''
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'data-export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }, [paginatedData, columns])

  // Get sort icon
  const getSortIcon = (field: keyof T) => {
    if (sortField !== field) {
      return <ArrowsUpDownIcon className="w-4 h-4 text-secondary-400" />
    }
    return sortDirection === 'asc' 
      ? <ChevronUpIcon className="w-4 h-4 text-primary-600" />
      : <ChevronDownIcon className="w-4 h-4 text-primary-600" />
  }

  // Calculate pagination info
  const totalPages = Math.ceil(filteredData.length / pageSizeState)
  const startItem = (currentPage - 1) * pageSizeState + 1
  const endItem = Math.min(currentPage * pageSizeState, filteredData.length)

  return (
    <div className={`bg-white rounded-2xl shadow-soft border border-primary-100 ${className}`}>
      {/* Table Header with Controls */}
      <div className="p-6 border-b border-secondary-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {searchable && (
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>
            )}

            {filterable && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center px-4 py-2 rounded-xl border transition-colors ${
                    showFilters 
                      ? 'bg-primary-100 border-primary-300 text-primary-700' 
                      : 'bg-white border-secondary-200 text-secondary-600 hover:bg-primary-50'
                  }`}
                >
                  <FunnelIcon className="w-4 h-4 mr-2" />
                  Filters
                  {Object.values(filters).some(f => f && f.length > 0) && (
                    <span className="ml-2 px-2 py-1 bg-primary-500 text-white text-xs rounded-full">
                      {Object.values(filters).filter(f => f && f.length > 0).length}
                    </span>
                  )}
                </button>

                {(Object.values(filters).some(f => f && f.length > 0) || searchTerm) && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center px-4 py-2 rounded-xl border border-secondary-200 text-secondary-600 hover:bg-secondary-50 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4 mr-2" />
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {exportable && (
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 rounded-xl border border-secondary-200 text-secondary-600 hover:bg-secondary-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
            )}

            <div className="text-sm text-secondary-500">
              {startItem}-{endItem} of {filteredData.length}
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-secondary-50 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {columns.filter(col => col.filterable).map(col => (
                <div key={String(col.key)}>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    {col.label}
                  </label>
                  {col.filterType === 'multiselect' ? (
                    <select
                      multiple
                      value={filters[String(col.key)] || []}
                      onChange={(e) => handleFilterChange(String(col.key), Array.from(e.target.selectedOptions, option => option.value))}
                      className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {col.filterOptions?.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={col.filterType === 'number' ? 'number' : 'text'}
                      value={filters[String(col.key)] || ''}
                      onChange={(e) => handleFilterChange(String(col.key), e.target.value)}
                      placeholder={`Filter by ${col.label.toLowerCase()}`}
                      className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary-50">
            <tr>
              {selectable && (
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-primary-600 bg-white border-secondary-300 rounded focus:ring-primary-500"
                  />
                </th>
              )}
              {columns.filter(col => columnVisibility[String(col.key)]).map(col => (
                <th
                  key={String(col.key)}
                  className={`px-6 py-4 text-left text-sm font-medium text-secondary-700 ${col.width || ''}`}
                >
                  <button
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    className={`flex items-center gap-2 hover:text-primary-600 transition-colors ${
                      col.sortable === false ? 'cursor-default' : 'cursor-pointer'
                    }`}
                    disabled={col.sortable === false}
                  >
                    {col.label}
                    {col.sortable !== false && getSortIcon(col.key)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100">
            {paginatedData.map((row, index) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={`hover:bg-primary-50 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                } ${selectedRows.some(r => r.id === row.id) ? 'bg-primary-50' : ''}`}
              >
                {selectable && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.some(r => r.id === row.id)}
                      onChange={(e) => onRowSelect?.(row, e.target.checked)}
                      className="w-4 h-4 text-primary-600 bg-white border-secondary-300 rounded focus:ring-primary-500"
                    />
                  </td>
                )}
                {columns.filter(col => columnVisibility[String(col.key)]).map(col => (
                  <td key={String(col.key)} className="px-6 py-4 text-sm text-secondary-900">
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] || '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-secondary-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-secondary-600">Show:</label>
                <select
                  value={pageSizeState}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="px-3 py-1 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-secondary-600">per page</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-secondary-200 rounded-lg text-sm hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        currentPage === page
                          ? 'bg-primary-500 text-white'
                          : 'border border-secondary-200 hover:bg-secondary-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
                {totalPages > 5 && (
                  <>
                    <span className="px-2 text-secondary-400">...</span>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        currentPage === totalPages
                          ? 'bg-primary-500 text-white'
                          : 'border border-secondary-200 hover:bg-secondary-50'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-secondary-200 rounded-lg text-sm hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
