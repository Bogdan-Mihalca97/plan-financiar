
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FamilyMembersList from '../FamilyMembersList';

const mockRemoveMember = jest.fn();
const mockFamilyMembers = [
  {
    id: 'member1',
    family_group_id: 'family1',
    user_id: 'user1',
    role: 'admin',
    joined_at: '2024-01-01',
    email: 'admin@example.com',
    first_name: 'John',
    last_name: 'Doe',
    is_creator: true,
  },
  {
    id: 'member2',
    family_group_id: 'family1',
    user_id: 'user2',
    role: 'member',
    joined_at: '2024-01-02',
    email: 'member@example.com',
    first_name: 'Jane',
    last_name: 'Smith',
    is_creator: false,
  },
];

jest.mock('@/contexts/FamilyContext', () => ({
  useFamily: () => ({
    familyMembers: mockFamilyMembers,
    isCreator: true,
    removeMember: mockRemoveMember,
  }),
}));

// Mock the tooltip components
jest.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('FamilyMembersList', () => {
  beforeEach(() => {
    mockRemoveMember.mockReset();
    // Mock window.confirm
    Object.defineProperty(window, 'confirm', {
      writable: true,
      value: jest.fn(() => true),
    });
  });

  it('should display all family members', () => {
    render(<FamilyMembersList />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('member@example.com')).toBeInTheDocument();
  });

  it('should show member roles correctly', () => {
    render(<FamilyMembersList />);
    
    expect(screen.getByText('Administrator')).toBeInTheDocument();
    expect(screen.getByText('Membru')).toBeInTheDocument();
  });

  it('should allow admin to remove regular members', async () => {
    const user = userEvent.setup();
    render(<FamilyMembersList />);
    
    const removeButtons = screen.getAllByText(/elimină/i);
    expect(removeButtons).toHaveLength(1); // Only one remove button (for non-admin member)
    
    await user.click(removeButtons[0]);
    
    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith(
        'Ești sigur că vrei să elimini acest membru din familie?'
      );
      expect(mockRemoveMember).toHaveBeenCalledWith('member2');
    });
  });

  it('should display member count correctly', () => {
    render(<FamilyMembersList />);
    
    expect(screen.getByText('Membri Familie (2)')).toBeInTheDocument();
  });

  it('should show empty state when no members', () => {
    jest.doMock('@/contexts/FamilyContext', () => ({
      useFamily: () => ({
        familyMembers: [],
        isCreator: true,
        removeMember: mockRemoveMember,
      }),
    }));
    
    render(<FamilyMembersList />);
    
    expect(screen.getByText(/nu există membri în această familie încă/i)).toBeInTheDocument();
  });
});
