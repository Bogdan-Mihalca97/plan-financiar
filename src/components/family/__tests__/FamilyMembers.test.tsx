import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FamilyMembersList } from '../FamilyMembersList';
import { FamilyContext } from '@/contexts/FamilyContext';

// Mock the FamilyContext
const mockFamilyContextValue = {
  familyMembers: [
    { id: '1', user_id: '1', family_group_id: '1', role: 'admin', joined_at: '2024-01-01', first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com' },
    { id: '2', user_id: '2', family_group_id: '1', role: 'member', joined_at: '2024-01-01', first_name: 'Jane', last_name: 'Doe', email: 'jane.doe@example.com' },
  ],
  currentFamily: { id: '1', name: 'Doe Family', created_by: '1', created_at: '2024-01-01', updated_at: '2024-01-01' },
  isCreator: true,
  removeMember: vi.fn(),
  leaveFamily: vi.fn(),
  loading: false,
  familyInvitations: [],
  pendingInvitations: [],
  createFamily: vi.fn(),
  inviteMember: vi.fn(),
  acceptInvitation: vi.fn(),
  declineInvitation: vi.fn(),
  refreshFamily: vi.fn(),
};

describe('FamilyMembersList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the family members list', () => {
    render(
      <FamilyContext.Provider value={mockFamilyContextValue}>
        <FamilyMembersList />
      </FamilyContext.Provider>
    );

    expect(screen.getByText('Membrii Familie')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
  });

  it('displays "No members" message when familyMembers array is empty', () => {
    const emptyFamilyContextValue = {
      ...mockFamilyContextValue,
      familyMembers: [],
    };

    render(
      <FamilyContext.Provider value={emptyFamilyContextValue}>
        <FamilyMembersList />
      </FamilyContext.Provider>
    );

    expect(screen.getByText('Nu există membri în această familie.')).toBeInTheDocument();
  });

  it('calls removeMember when the current user is the creator and clicks on Remove', async () => {
    render(
      <FamilyContext.Provider value={mockFamilyContextValue}>
        <FamilyMembersList />
      </FamilyContext.Provider>
    );

    const removeButton = screen.getAllByText('Elimină')[0];
    removeButton.click();

    await waitFor(() => {
      expect(mockFamilyContextValue.removeMember).toHaveBeenCalled();
    });
  });

  it('does not render Remove button when the current user is not the creator', () => {
    const notCreatorContextValue = {
      ...mockFamilyContextValue,
      isCreator: false,
    };

    render(
      <FamilyContext.Provider value={notCreatorContextValue}>
        <FamilyMembersList />
      </FamilyContext.Provider>
    );

    const removeButton = screen.queryByText('Elimină');
    expect(removeButton).toBeNull();
  });
});
