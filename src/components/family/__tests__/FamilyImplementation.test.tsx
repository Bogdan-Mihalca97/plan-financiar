import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FamilyProvider, useFamily } from '@/contexts/FamilyContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Mock the Supabase client and its methods
vi.mock('@/integrations/supabase/client', () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    })),
  };
  return { supabase: mockSupabase };
});

describe('FamilyContext Implementation Details', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default values when no user is authenticated', async () => {
    (supabase.auth.getUser as vi.Mock).mockResolvedValue({ data: { user: null }, error: null });

    const { result } = render(
      <AuthProvider>
        <FamilyProvider>
          <TestComponent />
        </FamilyProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.currentFamily).toBeNull();
      expect(result.current.familyMembers).toEqual([]);
      expect(result.current.familyInvitations).toEqual([]);
      expect(result.current.pendingInvitations).toEqual([]);
      expect(result.current.isCreator).toBe(false);
    });
  });

  it('loads family data when a user is authenticated', async () => {
    const mockUser = { id: 'user-id', email: 'test@example.com' };
    const mockUserProfile = { id: 'user-id', first_name: 'Test', last_name: 'User' };
    const mockFamilyGroup = { id: 'family-id', name: 'Test Family', created_by: 'user-id', created_at: '', updated_at: '' };
    const mockFamilyMembership = { family_group_id: 'family-id', role: 'admin', family_groups: mockFamilyGroup };
    const mockFamilyMembers = [{ user_id: 'user-id', role: 'admin', profiles: mockUserProfile }];

    (supabase.auth.getUser as vi.Mock).mockResolvedValue({ data: { user: mockUser }, error: null });
    (supabase.from as vi.Mock).mockImplementation((table) => {
      switch (table) {
        case 'family_memberships':
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: mockFamilyMembership, error: null }),
          };
        case 'profiles':
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockUserProfile, error: null }),
          };
        default:
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
            insert: vi.fn().mockResolvedValue({ data: null, error: null }),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
          };
      }
    });

    const { result } = render(
      <AuthProvider value={{ isAuthenticated: true, user: mockUser, userProfile: mockUserProfile, loading: false }}>
        <FamilyProvider>
          <TestComponent />
        </FamilyProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.currentFamily).toEqual(mockFamilyGroup);
      expect(result.current.familyMembers).toEqual(expect.arrayContaining([
        expect.objectContaining({
          user_id: mockUser.id,
          role: 'admin',
          first_name: mockUserProfile.first_name,
          last_name: mockUserProfile.last_name,
        }),
      ]));
      expect(result.current.isCreator).toBe(true);
    });
  });

  it('handles errors when loading family data', async () => {
    const mockUser = { id: 'user-id', email: 'test@example.com' };
    const mockUserProfile = { id: 'user-id', first_name: 'Test', last_name: 'User' };
    const mockError = new Error('Failed to load family data');

    (supabase.auth.getUser as vi.Mock).mockResolvedValue({ data: { user: mockUser }, error: null });
    (supabase.from as vi.Mock).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockRejectedValue(mockError),
    }));

    const { result } = render(
      <AuthProvider value={{ isAuthenticated: true, user: mockUser, userProfile: mockUserProfile, loading: false }}>
        <FamilyProvider>
          <TestComponent />
        </FamilyProvider>
      </AuthProvider>
    );

    // Wait for the loading state to be false after the attempted data load
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Optionally, check if the error handling updates the state in a way that's testable
    // For example, if you have an error state variable, you can check if it's set
  });

  it('allows creating a family', async () => {
    const mockUser = { id: 'user-id', email: 'test@example.com' };
    const mockUserProfile = { id: 'user-id', first_name: 'Test', last_name: 'User' };
    const mockFamilyName = 'New Family';

    (supabase.auth.getUser as vi.Mock).mockResolvedValue({ data: { user: mockUser }, error: null });
    (supabase.from as vi.Mock).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockResolvedValue({ data: { id: 'new-family-id' }, error: null }), // Mock insert to return a family ID
    }));

    const { result } = render(
      <AuthProvider value={{ isAuthenticated: true, user: mockUser, userProfile: mockUserProfile, loading: false }}>
        <FamilyProvider>
          <TestComponent />
        </FamilyProvider>
      </AuthProvider>
    );

    // Call the createFamily function
    await result.current.createFamily(mockFamilyName);

    // Assert that supabase.from('family_groups').insert was called with the correct arguments
    expect(supabase.from).toHaveBeenCalledWith('family_groups');
    expect(supabase.from('family_groups').insert).toHaveBeenCalledWith([{
      name: mockFamilyName,
      created_by: mockUser.id,
    }]);
  });

  it('allows inviting a member', async () => {
    const mockUser = { id: 'user-id', email: 'test@example.com' };
    const mockUserProfile = { id: 'user-id', first_name: 'Test', last_name: 'User' };
    const mockFamilyGroup = { id: 'family-id', name: 'Test Family', created_by: 'user-id', created_at: '', updated_at: '' };
    const mockFamilyMembership = { family_group_id: 'family-id', role: 'admin', family_groups: mockFamilyGroup };
    const inviteEmail = 'invite@example.com';

    (supabase.auth.getUser as vi.Mock).mockResolvedValue({ data: { user: mockUser }, error: null });
    (supabase.from as vi.Mock).mockImplementation((table) => {
      switch (table) {
        case 'family_memberships':
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: mockFamilyMembership, error: null }),
          };
        case 'profiles':
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockUserProfile, error: null }),
          };
        default:
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
            insert: vi.fn().mockResolvedValue({ data: null, error: null }),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
          };
      }
    });

    const { result } = render(
      <AuthProvider value={{ isAuthenticated: true, user: mockUser, userProfile: mockUserProfile, loading: false }}>
        <FamilyProvider>
          <TestComponent />
        </FamilyProvider>
      </AuthProvider>
    );

    // Call the inviteMember function
    await result.current.inviteMember(inviteEmail);

    expect(supabase.from).toHaveBeenCalledWith('family_invitations');
    expect(supabase.from('family_invitations').insert).toHaveBeenCalledWith([{
      email: inviteEmail,
      family_group_id: mockFamilyGroup.id,
      invited_by: mockUser.id,
      status: 'pending',
      expires_at: expect.any(String), // You might want to mock Date to test this accurately
    }]);
  });

  // Mock component to access context values
  const TestComponent: React.FC = () => {
    const familyContext = useFamily();
    return <>{/* Render nothing */}</>;
  };
});
