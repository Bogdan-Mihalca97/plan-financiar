
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AddTransactionForm from '@/components/transactions/AddTransactionForm';

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

describe('AddTransactionForm Integration', () => {
  test('renders form correctly', async () => {
    render(
      <TestWrapper>
        <AddTransactionForm isOpen={true} onClose={jest.fn()} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/adaugă tranzacție/i)).toBeInTheDocument();
    });
  });
});
