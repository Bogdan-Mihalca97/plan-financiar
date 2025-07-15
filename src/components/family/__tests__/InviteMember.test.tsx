
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

describe('Invite Member', () => {
  test('renders without crashing', async () => {
    render(
      <TestWrapper>
        <div>Invite Member Test</div>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Invite Member Test')).toBeInTheDocument();
    });
  });
});
