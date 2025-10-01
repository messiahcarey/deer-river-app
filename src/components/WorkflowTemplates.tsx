'use client'

import { useState } from 'react'
import Button from './Button'

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  icon: string
  category: 'people' | 'faction' | 'building' | 'bulk'
  steps: string[]
  estimatedTime: string
  onExecute: () => void
}

interface WorkflowTemplatesProps {
  onNewPerson: () => void
  onNewFaction: () => void
  onNewBuilding: () => void
  onBulkOperation: (operation: string) => void
}

export default function WorkflowTemplates({
  onNewFaction,
  onNewBuilding,
  onBulkOperation
}: WorkflowTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null)

  const templates: WorkflowTemplate[] = [
    {
      id: 'new-refugee-family',
      name: 'New Refugee Family',
      description: 'Create a family of refugees arriving in town',
      icon: '👨‍👩‍👧‍👦',
      category: 'people',
      steps: [
        'Create family head (adult)',
        'Create spouse (adult)',
        'Create children (2-4 people)',
        'Assign to temporary housing',
        'Create "Refugee" faction membership',
        'Add notes about their background'
      ],
      estimatedTime: '5-10 minutes',
      onExecute: () => {
        // This would open a multi-step wizard
        alert('Refugee Family workflow would open a step-by-step wizard')
      }
    },
    {
      id: 'new-merchant-guild',
      name: 'New Merchant Guild',
      description: 'Establish a new merchant guild with members and building',
      icon: '💰',
      category: 'faction',
      steps: [
        'Create guild faction',
        'Create guild hall building',
        'Add guild master (leader)',
        'Add 3-5 guild members',
        'Assign members to guild hall',
        'Set up trade relationships'
      ],
      estimatedTime: '10-15 minutes',
      onExecute: () => {
        onNewFaction()
      }
    },
    {
      id: 'new-tavern',
      name: 'New Tavern',
      description: 'Open a new tavern with staff and customers',
      icon: '🍺',
      category: 'building',
      steps: [
        'Create tavern building',
        'Add tavern keeper (owner)',
        'Add 2-3 staff members',
        'Assign staff to tavern',
        'Create regular customers',
        'Set up faction relationships'
      ],
      estimatedTime: '8-12 minutes',
      onExecute: () => {
        onNewBuilding()
      }
    },
    {
      id: 'bulk-assign-housing',
      name: 'Bulk Assign Housing',
      description: 'Assign multiple people to housing based on criteria',
      icon: '🏠',
      category: 'bulk',
      steps: [
        'Select people without housing',
        'Filter by species, faction, or occupation',
        'Choose housing assignment strategy',
        'Review assignments',
        'Apply changes'
      ],
      estimatedTime: '3-5 minutes',
      onExecute: () => {
        onBulkOperation('assign-housing')
      }
    },
    {
      id: 'bulk-faction-assignment',
      name: 'Bulk Faction Assignment',
      description: 'Assign multiple people to factions based on criteria',
      icon: '🏛️',
      category: 'bulk',
      steps: [
        'Select people without faction',
        'Filter by occupation or species',
        'Choose faction assignment strategy',
        'Review assignments',
        'Apply changes'
      ],
      estimatedTime: '3-5 minutes',
      onExecute: () => {
        onBulkOperation('assign-faction')
      }
    },
    {
      id: 'new-noble-house',
      name: 'New Noble House',
      description: 'Create a noble family with estate and servants',
      icon: '👑',
      category: 'people',
      steps: [
        'Create noble family head',
        'Create spouse and children',
        'Create estate building',
        'Add household servants',
        'Assign to estate',
        'Create noble faction',
        'Set up political relationships'
      ],
      estimatedTime: '15-20 minutes',
      onExecute: () => {
        alert('Noble House workflow would open a comprehensive wizard')
      }
    },
    {
      id: 'new-temple',
      name: 'New Temple',
      description: 'Establish a religious temple with clergy and congregation',
      icon: '⛪',
      category: 'building',
      steps: [
        'Create temple building',
        'Add high priest/priestess',
        'Add 2-4 clergy members',
        'Create congregation members',
        'Assign clergy to temple',
        'Set up religious faction'
      ],
      estimatedTime: '12-18 minutes',
      onExecute: () => {
        onNewBuilding()
      }
    },
    {
      id: 'bulk-status-update',
      name: 'Bulk Status Update',
      description: 'Update status of multiple people (present/absent)',
      icon: '📊',
      category: 'bulk',
      steps: [
        'Select people to update',
        'Choose new status',
        'Add reason for change',
        'Review changes',
        'Apply updates'
      ],
      estimatedTime: '2-3 minutes',
      onExecute: () => {
        onBulkOperation('update-status')
      }
    }
  ]

  const categories = [
    { id: 'all', name: 'All Templates', icon: '📋' },
    { id: 'people', name: 'People', icon: '👥' },
    { id: 'faction', name: 'Factions', icon: '🏛️' },
    { id: 'building', name: 'Buildings', icon: '🏠' },
    { id: 'bulk', name: 'Bulk Operations', icon: '⚡' }
  ]

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory)

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">⚡ Workflow Templates</h3>
        <p className="text-sm text-gray-600">Quick actions for common tasks</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{template.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-900">{template.name}</h4>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>⏱️ {template.estimatedTime}</span>
                <span className="capitalize">{template.category}</span>
              </div>
              
              <button
                onClick={() => setExpandedTemplate(
                  expandedTemplate === template.id ? null : template.id
                )}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {expandedTemplate === template.id ? 'Hide Steps' : 'Show Steps'} ↓
              </button>
            </div>

            {expandedTemplate === template.id && (
              <div className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2">Steps:</h5>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  {template.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            <Button
              onClick={template.onExecute}
              variant="primary"
              size="sm"
              className="w-full"
            >
              Execute Workflow
            </Button>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-600">No templates found for this category</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{templates.length}</div>
            <div className="text-sm text-gray-600">Total Templates</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {templates.filter(t => t.category === 'people').length}
            </div>
            <div className="text-sm text-gray-600">People Workflows</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {templates.filter(t => t.category === 'bulk').length}
            </div>
            <div className="text-sm text-gray-600">Bulk Operations</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(templates.reduce((acc, t) => {
                const time = parseInt(t.estimatedTime.split('-')[0])
                return acc + time
              }, 0) / templates.length)} min
            </div>
            <div className="text-sm text-gray-600">Avg. Time Saved</div>
          </div>
        </div>
      </div>
    </div>
  )
}
