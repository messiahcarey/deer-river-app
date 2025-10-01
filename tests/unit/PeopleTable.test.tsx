import { render, screen, fireEvent } from '@testing-library/react'
import PeopleTable from '@/components/PeopleTable'

const mockPeople = [
  {
    id: '1',
    name: 'John Doe',
    species: 'Human',
    occupation: 'Blacksmith',
    status: 'present',
    livesAtId: 'loc1',
    worksAtId: 'loc2',
    householdId: 'house1',
    household: { id: 'house1', name: 'Doe Family' },
    memberships: [
      {
        id: 'mem1',
        factionId: 'faction1',
        faction: { id: 'faction1', name: 'Merchants', color: '#4AE24A' },
        role: 'Member',
        isPrimary: true,
      },
    ],
  },
  {
    id: '2',
    name: 'Jane Smith',
    species: 'Half-elf',
    occupation: 'Innkeeper',
    status: 'present',
    livesAtId: 'loc2',
    worksAtId: 'loc2',
    householdId: 'house2',
    household: { id: 'house2', name: 'Smith Family' },
    memberships: [],
  },
]

const mockProps = {
  people: mockPeople,
  selectedPeople: [],
  onPersonSelect: jest.fn(),
  onEditPerson: jest.fn(),
  getSortIcon: jest.fn(() => <span>↕️</span>),
  handleSort: jest.fn(),
}

describe('PeopleTable Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders people table with data', () => {
    render(<PeopleTable {...mockProps} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Human')).toBeInTheDocument()
    expect(screen.getByText('Half-elf')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<PeopleTable {...mockProps} />)
    
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Species')).toBeInTheDocument()
    expect(screen.getByText('Occupation')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Faction')).toBeInTheDocument()
  })

  it('handles person selection', () => {
    render(<PeopleTable {...mockProps} />)
    
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])
    
    expect(mockProps.onPersonSelect).toHaveBeenCalledWith('1', expect.any(Object))
  })

  it('handles edit person click', () => {
    render(<PeopleTable {...mockProps} />)
    
    const editButtons = screen.getAllByText('Edit')
    fireEvent.click(editButtons[0])
    
    expect(mockProps.onEditPerson).toHaveBeenCalledWith(mockPeople[0])
  })

  it('displays faction information', () => {
    render(<PeopleTable {...mockProps} />)
    
    expect(screen.getByText('Merchants')).toBeInTheDocument()
    expect(screen.getByText('No faction')).toBeInTheDocument()
  })

  it('handles sorting when header is clicked', () => {
    render(<PeopleTable {...mockProps} />)
    
    const nameHeader = screen.getByText('Name')
    fireEvent.click(nameHeader)
    
    expect(mockProps.handleSort).toHaveBeenCalledWith('name')
  })

  it('shows sort icons', () => {
    render(<PeopleTable {...mockProps} />)
    
    // The getSortIcon function should be called for each sortable column
    expect(mockProps.getSortIcon).toHaveBeenCalled()
  })

  it('handles empty people list', () => {
    render(<PeopleTable {...mockProps} people={[]} />)
    
    expect(screen.getByText('Name')).toBeInTheDocument() // Headers should still be visible
  })

  it('displays household information', () => {
    render(<PeopleTable {...mockProps} />)
    
    expect(screen.getByText('Doe Family')).toBeInTheDocument()
    expect(screen.getByText('Smith Family')).toBeInTheDocument()
  })
})
