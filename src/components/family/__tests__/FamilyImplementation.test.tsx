
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FamilyProvider } from '@/contexts/FamilyContext';
import CreateFamilyForm from '../CreateFamilyForm';
import FamilyMembersList from '../FamilyMembersList';

// Mock the family context
const mockCreateFamily = jest.fn();
const mockFamilyContext = {
  currentFamily: null,
  familyMembers: [],
  familyInvitations: [],
  pendingInvitations: [],
  isCreator: false,
  createFamily: mockCreateFamily,
  inviteMember: jest.fn(),
  acceptInvitation: jest.fn(),
  declineInvitation: jest.fn(),
  removeMember: jest.fn(),
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

describe('Family Implementation', () => {
  beforeEach(() => {
    mockCreateFamily.mockReset();
  });

  it('should render create family form when no family exists', () => {
    render(<CreateFamilyForm />);
    
    expect(screen.getByText(/creează familia ta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/numele familiei/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /creează familia/i })).toBeInTheDocument();
  });

  it('should create family when form is submitted', async () => {
    const user = userEvent.setup();
    mockCreateFamily.mockResolvedValue({ id: 'test-family', name: 'Test Family' });
    
    render(<CreateFamilyForm />);
    
    const nameInput = screen.getByLabelText(/numele familiei/i);
    const submitButton = screen.getByRole('button', { name: /creează familia/i });
    
    await user.type(nameInput, 'Test Family');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockCreateFamily).toHaveBeenCalledWith('Test Family');
    });
  });

  it('should render family members list when family exists', () => {
    const mockContextWithFamily = {
      ...mockFamilyContext,
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
      isCreator: true,
    };

    jest.doMock('@/contexts/FamilyContext', () => ({
      useFamily: () => mockContextWithFamily,
    }));

    render(<FamilyMembersList />);
    
    expect(screen.getByText(/membri familie \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('admin@test.com')).toBeInTheDocument();
    expect(screen.getByText('member@test.com')).toBeInTheDocument();
  });
});
