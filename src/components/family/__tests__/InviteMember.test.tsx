
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InviteMemberForm from '../InviteMemberForm';

// Mock the family context
const mockInviteMember = jest.fn();
const mockFamilyContext = {
  currentFamily: { id: 'test-family', name: 'Test Family' },
  familyMembers: [],
  familyInvitations: [],
  pendingInvitations: [],
  isCreator: true,
  createFamily: jest.fn(),
  inviteMember: mockInviteMember,
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

describe('InviteMemberForm', () => {
  beforeEach(() => {
    mockInviteMember.mockReset();
  });

  it('should render invite form for family creator', () => {
    render(<InviteMemberForm />);
    
    expect(screen.getByText(/invită membru nou/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /trimite invitația/i })).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    render(<InviteMemberForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /trimite invitația/i });
    
    await user.type(emailInput, 'invalid-email');
    
    // Button should be disabled for invalid email
    expect(submitButton).toBeDisabled();
    
    await user.clear(emailInput);
    await user.type(emailInput, 'valid@example.com');
    
    // Button should be enabled for valid email
    expect(submitButton).not.toBeDisabled();
  });

  it('should send invitation when form is submitted', async () => {
    const user = userEvent.setup();
    render(<InviteMemberForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /trimite invitația/i });
    
    await user.type(emailInput, 'newmember@example.com');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockInviteMember).toHaveBeenCalledWith('newmember@example.com');
    });
  });

  it('should not render for non-creators', () => {
    // Override the mock for this test
    jest.doMock('@/contexts/FamilyContext', () => ({
      useFamily: () => ({
        ...mockFamilyContext,
        isCreator: false,
      }),
    }));
    
    const { container } = render(<InviteMemberForm />);
    expect(container.firstChild).toBeNull();
  });
});
