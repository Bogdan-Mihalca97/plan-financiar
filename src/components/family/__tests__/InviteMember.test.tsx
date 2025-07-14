
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import InviteMemberForm from '@/components/family/InviteMemberForm';

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

describe('InviteMember', () => {
  test('renders invite form correctly', async () => {
    render(
      <TestWrapper>
        <InviteMemberForm />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/invită membru/i)).toBeInTheDocument();
    });
  });
});
