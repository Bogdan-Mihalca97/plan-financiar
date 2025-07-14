
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FamilyMembersList from '../FamilyMembersList';

// Mock the family context
const mockRemoveMember = jest.fn();
const mockFamilyContext = {
  currentFamily: { id: 'test-family', name: 'Test Family' },
  familyMembers: [
    {
      id: '1',
      family_group_id: 'test-family',
      user_id: 'user-1',
      role: 'admin',
      joined_at: '2023-01-01',
      email: 'admin@test.com',
      first_name: 'John',
      last_name: 'Doe',
      is_creator: true,
    },
    {
      id: '2',
      family_group_id: 'test-family',
      user_id: 'user-2',
      role: 'member',
      joined_at: '2023-01-02',
      email: 'member@test.com',
      first_name: 'Jane',
      last_name: 'Smith',
      is_creator: false,
    },
  ],
  familyInvitations: [],
  pendingInvitations: [],
  isCreator: true,
  createFamily: jest.fn(),
  inviteMember: jest.fn(),
  acceptInvitation: jest.fn(),
  declineInvitation: jest.fn(),
  removeMember: mockRemoveMember,
  leaveFamily: jest.fn(),
  loading: false,
  refreshFamily: jest.fn(),
};

jest.mock('@/contexts/FamilyContext', () => ({
  useFamily: () => mockFamilyContext,
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: jest.fn(),
});

describe('FamilyMembersList', () => {
  beforeEach(() => {
    mockRemoveMember.mockReset();
    (window.confirm as jest.Mock).mockReset();
  });

  it('should render family members list', () => {
    render(<FamilyMembersList />);
    
    expect(screen.getByText(/membri familie \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('admin@test.com')).toBeInTheDocument();
    expect(screen.getByText('member@test.com')).toBeInTheDocument();
  });

  it('should show admin badge for administrators', () => {
    render(<FamilyMembersList />);
    
    expect(screen.getByText('Administrator')).toBeInTheDocument();
    expect(screen.getByText('Membru')).toBeInTheDocument();
  });

  it('should allow admin to remove regular members', async () => {
    const user = userEvent.setup();
    (window.confirm as jest.Mock).mockReturnValue(true);
    
    render(<FamilyMembersList />);
    
    const removeButtons = screen.getAllByText(/elimină/i);
    expect(removeButtons).toHaveLength(1); // Only one remove button for the member
    
    await user.click(removeButtons[0]);
    
    await waitFor(() => {
      expect(mockRemoveMember).toHaveBeenCalledWith('2');
    });
  });

  it('should not show remove button for admins', () => {
    render(<FamilyMembersList />);
    
    // Should only have one remove button (for the member, not the admin)
    const removeButtons = screen.getAllByText(/elimină/i);
    expect(removeButtons).toHaveLength(1);
  });

  it('should show empty state when no members', () => {
    const emptyContext = {
      ...mockFamilyContext,
      familyMembers: [],
    };

    jest.doMock('@/contexts/FamilyContext', () => ({
      useFamily: () => emptyContext,
    }));

    render(<FamilyMembersList />);
    
    expect(screen.getByText(/nu există membri în această familie încă/i)).toBeInTheDocument();
  });
});
