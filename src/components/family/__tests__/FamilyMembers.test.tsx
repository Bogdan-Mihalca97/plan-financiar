
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FamilyMembersList from '@/components/family/FamilyMembersList';

// Mock Supabase
jest.mock('@/integrations/supabase/client');

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('FamilyMembers', () => {
  test('renders members list correctly', async () => {
    render(
      <TestWrapper>
        <FamilyMembersList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/membri familie/i)).toBeInTheDocument();
    });
  });
});
