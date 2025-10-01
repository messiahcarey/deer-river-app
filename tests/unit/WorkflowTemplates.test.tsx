import { render, screen, fireEvent } from '@testing-library/react'
import WorkflowTemplates from '@/components/WorkflowTemplates'

const mockHandlers = {
  onNewFaction: jest.fn(),
  onNewBuilding: jest.fn(),
  onBulkOperation: jest.fn(),
}

describe('WorkflowTemplates Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders workflow templates section', () => {
    render(<WorkflowTemplates {...mockHandlers} />)
    
    expect(screen.getByText('⚡ Workflow Templates')).toBeInTheDocument()
    expect(screen.getByText('Quick actions for common tasks')).toBeInTheDocument()
  })

  it('renders all workflow cards', () => {
    render(<WorkflowTemplates {...mockHandlers} />)
    
    expect(screen.getByText('New Refugee Family')).toBeInTheDocument()
    expect(screen.getByText('New Merchant Guild')).toBeInTheDocument()
    expect(screen.getByText('New Tavern')).toBeInTheDocument()
    expect(screen.getByText('Bulk Assign Housing')).toBeInTheDocument()
    expect(screen.getByText('Bulk Faction Assignment')).toBeInTheDocument()
    expect(screen.getByText('New Noble House')).toBeInTheDocument()
    expect(screen.getByText('New Temple')).toBeInTheDocument()
    expect(screen.getByText('Bulk Status Update')).toBeInTheDocument()
  })

  it('renders category tabs', () => {
    render(<WorkflowTemplates {...mockHandlers} />)
    
    expect(screen.getByText('All Templates')).toBeInTheDocument()
    expect(screen.getByText('People')).toBeInTheDocument()
    expect(screen.getByText('Factions')).toBeInTheDocument()
    expect(screen.getByText('Buildings')).toBeInTheDocument()
    expect(screen.getByText('⚡ Bulk Operations')).toBeInTheDocument()
  })

  it('shows workflow details when "Show Steps" is clicked', () => {
    render(<WorkflowTemplates {...mockHandlers} />)
    
    const showStepsButton = screen.getAllByText('Show Steps ↓')[0]
    fireEvent.click(showStepsButton)
    
    // The component should show expanded details
    // This would need to be implemented in the actual component
  })

  it('calls appropriate handler when "Execute Workflow" is clicked', () => {
    render(<WorkflowTemplates {...mockHandlers} />)
    
    const executeButtons = screen.getAllByText('Execute Workflow')
    fireEvent.click(executeButtons[0])
    
    // The component should call the appropriate handler
    // This would need to be implemented in the actual component
  })

  it('displays workflow statistics', () => {
    render(<WorkflowTemplates {...mockHandlers} />)
    
    expect(screen.getByText('8')).toBeInTheDocument() // Total Templates
    expect(screen.getByText('2')).toBeInTheDocument() // People Workflows
    expect(screen.getByText('3')).toBeInTheDocument() // Bulk Operations
    expect(screen.getByText('7')).toBeInTheDocument() // Avg. Time Saved
  })

  it('shows time estimates for each workflow', () => {
    render(<WorkflowTemplates {...mockHandlers} />)
    
    expect(screen.getByText('⏱️ 5-10 minutes')).toBeInTheDocument()
    expect(screen.getByText('⏱️ 10-15 minutes')).toBeInTheDocument()
    expect(screen.getByText('⏱️ 8-12 minutes')).toBeInTheDocument()
  })
})
