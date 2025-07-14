import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import InviteMemberForm from '../InviteMemberForm';
import { FamilyContext } from '@/contexts/FamilyContext';
import { useToast } from '@/hooks/use-toast';

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

describe('InviteMemberForm', () => {
  const mockInviteMember = vi.fn();
  const mockIsCreator = true;

  const renderComponent = () =>
    render(
      <FamilyContext.Provider value={{ inviteMember: mockInviteMember, isCreator: mockIsCreator } as any}>
        <InviteMemberForm />
      </FamilyContext.Provider>
    );

  beforeEach(() => {
    mockInviteMember.mockClear();
    (useToast as any).mockClear();
  });

  it('renders correctly when user is a creator', () => {
    renderComponent();
    expect(screen.getByText('Invită Membru Nou')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('adresa@email.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trimite Invitația' })).toBeInTheDocument();
  });

  it('does not render when user is not a creator', () => {
    const mockNotCreator = false;
    render(
      <FamilyContext.Provider value={{ inviteMember: mockInviteMember, isCreator: mockNotCreator } as any}>
        <InviteMemberForm />
      </FamilyContext.Provider>
    );
    expect(screen.queryByText('Invită Membru Nou')).toBeNull();
  });

  it('calls inviteMember with the correct email when the form is submitted', async () => {
    renderComponent();
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Trimite Invitația' });

    vi.spyOn(emailInput, 'value', 'get').mockReturnValue('test@example.com');
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));

    submitButton.click();

    await waitFor(() => {
      expect(mockInviteMember).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('displays an error toast for invalid email', async () => {
    renderComponent();
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Trimite Invitația' });
  
    vi.spyOn(emailInput, 'value', 'get').mockReturnValue('invalid-email');
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
  
    submitButton.click();
  
    await waitFor(() => {
      const { toast } = useToast();
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        title: "Eroare",
        description: "Te rugăm să introduci o adresă de email validă",
        variant: "destructive",
      }));
    });
  });
});
