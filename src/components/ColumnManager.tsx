'use client'

import { useState } from 'react'
import { Cog6ToothIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

interface Column {
  key: string
  label: string
  hidden?: boolean
}

interface ColumnManagerProps {
  columns: Column[]
  onColumnToggle: (columnKey: string, visible: boolean) => void
  onColumnReorder: (fromIndex: number, toIndex: number) => void
  className?: string
}

export default function ColumnManager({
  columns,
  onColumnToggle,
  onColumnReorder,
  className = ''
}: ColumnManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onColumnReorder(draggedIndex, dropIndex)
    }
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 rounded-xl border border-secondary-200 text-secondary-600 hover:bg-secondary-50 transition-colors"
      >
        <Cog6ToothIcon className="w-4 h-4 mr-2" />
        Columns
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-large border border-primary-100 z-20">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-secondary-800 mb-4">
                Manage Columns
              </h3>
              
              <div className="space-y-2">
                {columns.map((column, index) => (
                  <div
                    key={column.key}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                      draggedIndex === index
                        ? 'border-primary-300 bg-primary-50 shadow-medium'
                        : 'border-secondary-200 hover:border-primary-200 hover:bg-primary-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-secondary-400 rounded-full cursor-move" />
                      <span className="text-sm font-medium text-secondary-700">
                        {column.label}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => onColumnToggle(column.key, !column.hidden)}
                      className={`p-1 rounded-lg transition-colors ${
                        column.hidden
                          ? 'text-secondary-400 hover:text-secondary-600'
                          : 'text-primary-600 hover:text-primary-700'
                      }`}
                    >
                      {column.hidden ? (
                        <EyeSlashIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-secondary-100">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      columns.forEach(col => onColumnToggle(col.key, true))
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                  >
                    Show All
                  </button>
                  <button
                    onClick={() => {
                      columns.forEach(col => onColumnToggle(col.key, false))
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors"
                  >
                    Hide All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
